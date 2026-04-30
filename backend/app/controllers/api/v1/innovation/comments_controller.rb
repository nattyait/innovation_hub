module Api
  module V1
    module Innovation
      class CommentsController < BaseController
        def index
          idea = Idea.kept.find(params[:idea_id])
          comments = idea.idea_comments.includes(:user).order(created_at: :asc)
          render json: comments.map { |c| serialize_comment(c) }
        end

        def create
          idea = Idea.kept.find(params[:idea_id])
          comment = idea.idea_comments.build(body: params[:body], user: current_user)
          authorize comment
          if comment.save
            render json: serialize_comment(comment), status: :created
          else
            render json: { errors: comment.errors.full_messages }, status: :unprocessable_entity
          end
        end

        def destroy
          comment = IdeaComment.find(params[:id])
          authorize comment
          comment.destroy
          head :no_content
        end

        private

        def serialize_comment(c)
          { id: c.id, body: c.body, created_at: c.created_at,
            user: { id: c.user_id, name: c.user.name, avatar_url: c.user.avatar_url } }
        end
      end
    end
  end
end
