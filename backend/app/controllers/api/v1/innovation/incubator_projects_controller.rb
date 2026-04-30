module Api
  module V1
    module Innovation
      class IncubatorProjectsController < BaseController
        before_action :set_project, only: [:show, :update, :change_status]

        def index
          projects = IncubatorProject.kept.includes(:idea, :project_members, :members)
          projects = projects.active if params[:active].present?
          render json: projects.map { |p| serialize_project(p) }
        end

        def show
          authorize @project
          jira = Jira::BoardService.summary(@project.jira_project_key)
          render json: serialize_project(@project, detailed: true, jira: jira)
        end

        def update
          authorize @project
          if @project.update(project_params)
            render json: serialize_project(@project)
          else
            render json: { errors: @project.errors.full_messages }, status: :unprocessable_entity
          end
        end

        def change_status
          authorize @project, :change_status?
          unless IncubatorProject::STATUSES.include?(params[:status])
            return render json: { error: "Invalid status" }, status: :unprocessable_entity
          end
          @project.update!(status: params[:status])
          render json: serialize_project(@project)
        end

        private

        def set_project
          @project = IncubatorProject.kept.find(params[:id])
        end

        def project_params
          params.require(:incubator_project).permit(:title, :summary, :jira_board_url, :jira_project_key)
        end

        def serialize_project(project, detailed: false, jira: nil)
          base = {
            id: project.id, title: project.title, status: project.status,
            member_count: project.members.count,
            owner: project.owner&.slice(:id, :name, :avatar_url),
            idea: project.idea&.slice(:id, :title),
            created_at: project.created_at
          }
          if detailed
            base[:summary] = project.summary
            base[:jira_board_url] = project.jira_board_url
            base[:jira] = jira
            base[:members] = project.members.map { |m| m.slice(:id, :name, :avatar_url) }
          end
          base
        end
      end
    end
  end
end
