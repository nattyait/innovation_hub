module Api
  module V1
    module Innovation
      class ProjectDiscussionsController < BaseController
        def index
          project = IncubatorProject.kept.find(params[:incubator_project_id])
          discussions = project.project_discussions.includes(:user).order(created_at: :asc)
          render json: discussions.map { |d| serialize(d) }
        end

        def create
          project = IncubatorProject.kept.find(params[:incubator_project_id])
          discussion = project.project_discussions.build(body: params[:body], user: current_user)
          authorize discussion
          if discussion.save
            render json: serialize(discussion), status: :created
          else
            render json: { errors: discussion.errors.full_messages }, status: :unprocessable_entity
          end
        end

        def destroy
          discussion = ProjectDiscussion.find(params[:id])
          authorize discussion
          discussion.destroy
          head :no_content
        end

        private

        def serialize(d)
          { id: d.id, body: d.body, created_at: d.created_at,
            user: { id: d.user_id, name: d.user.name, avatar_url: d.user.avatar_url } }
        end
      end
    end
  end
end
