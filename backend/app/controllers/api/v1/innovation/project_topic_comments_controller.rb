module Api
  module V1
    module Innovation
      class ProjectTopicCommentsController < BaseController
        def create
          topic = ProjectTopic.find(params[:topic_id])
          is_reply = params[:parent_id].present?
          comment = topic.project_topic_comments.build(
            body: params[:body], author: current_user,
            parent_id: params[:parent_id].presence
          )
          if comment.save
            action = is_reply ? :project_reply_added : :project_comment_added
            PointsService.award(current_user, action, reference: topic)
            render json: serialize(comment), status: :created
          else
            render json: { errors: comment.errors.full_messages }, status: :unprocessable_entity
          end
        end

        private

        def serialize(c)
          { id: c.id, body: c.body, parent_id: c.parent_id,
            author: { id: c.author_id, name: c.author.name, avatar_url: c.author.avatar_url },
            created_at: c.created_at, replies: [] }
        end
      end
    end
  end
end
