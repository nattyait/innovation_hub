module Api
  module V1
    module Innovation
      class ProjectTopicsController < BaseController
        def index
          project = InnovationProject.find(params[:innovation_project_id])
          topics = project.project_topics.includes(:author)
                          .order(created_at: :desc)
          render json: topics.map { |t| serialize_summary(t) }
        end

        def show
          topic = ProjectTopic.find(params[:id])
          comments = topic.project_topic_comments
                          .top_level
                          .includes(:author, replies: :author)
                          .order(created_at: :asc)
          render json: serialize_detail(topic, comments)
        end

        def create
          project = InnovationProject.find(params[:innovation_project_id])
          topic = project.project_topics.build(
            title: params[:title], body: params[:body], author: current_user
          )
          if topic.save
            PointsService.award(current_user, :project_topic_created, reference: project)
            render json: serialize_summary(topic), status: :created
          else
            render json: { errors: topic.errors.full_messages }, status: :unprocessable_entity
          end
        end

        private

        def serialize_summary(t)
          { id: t.id, title: t.title,
            comment_count: t.project_topic_comments.count,
            author: { id: t.author_id, name: t.author.name, avatar_url: t.author.avatar_url },
            created_at: t.created_at }
        end

        def serialize_detail(topic, comments)
          { id: topic.id, title: topic.title, body: topic.body,
            author: { id: topic.author_id, name: topic.author.name, avatar_url: topic.author.avatar_url },
            created_at: topic.created_at,
            comments: comments.map { |c| serialize_comment(c) } }
        end

        def serialize_comment(c)
          { id: c.id, body: c.body,
            author: { id: c.author_id, name: c.author.name, avatar_url: c.author.avatar_url },
            created_at: c.created_at,
            replies: c.replies.map { |r| serialize_reply(r) } }
        end

        def serialize_reply(r)
          { id: r.id, body: r.body,
            author: { id: r.author_id, name: r.author.name, avatar_url: r.author.avatar_url },
            created_at: r.created_at }
        end
      end
    end
  end
end
