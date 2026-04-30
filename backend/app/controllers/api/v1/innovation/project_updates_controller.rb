module Api
  module V1
    module Innovation
      class ProjectUpdatesController < BaseController
        def index
          project = IncubatorProject.kept.find(params[:incubator_project_id])
          updates = project.project_updates.includes(:user).order(created_at: :desc)
          render json: updates.map { |u| serialize_update(u) }
        end

        def create
          project = IncubatorProject.kept.find(params[:incubator_project_id])
          update = project.project_updates.build(update_params.merge(user: current_user))
          authorize update
          if update.save
            render json: serialize_update(update), status: :created
          else
            render json: { errors: update.errors.full_messages }, status: :unprocessable_entity
          end
        end

        private

        def update_params
          params.require(:project_update).permit(:body, :milestone_tag)
        end

        def serialize_update(u)
          { id: u.id, body: u.body, milestone_tag: u.milestone_tag, created_at: u.created_at,
            user: { id: u.user_id, name: u.user.name, avatar_url: u.user.avatar_url } }
        end
      end
    end
  end
end
