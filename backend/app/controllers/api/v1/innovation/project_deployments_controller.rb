module Api
  module V1
    module Innovation
      class ProjectDeploymentsController < BaseController
        def index
          project = InnovationProject.find(params[:innovation_project_id])
          deployments = project.project_deployments
                               .includes(:assigned_by, :project_deployment_impact)
                               .order(created_at: :asc)
          render json: deployments.map { |d| serialize(d) }
        end

        def create
          project = InnovationProject.find(params[:innovation_project_id])
          unless current_user.sponsor? || current_user.admin?
            return render json: { error: "Sponsor เท่านั้น" }, status: :forbidden
          end
          dep = project.project_deployments.build(
            department_name: params[:department_name],
            assigned_by:     current_user,
            start_date:      params[:start_date],
            end_date:        params[:end_date]
          )
          if dep.save
            render json: serialize(dep), status: :created
          else
            render json: { errors: dep.errors.full_messages }, status: :unprocessable_entity
          end
        end

        def update
          dep = ProjectDeployment.find(params[:id])
          old_status = dep.status
          if dep.update(status: params[:status])
            if dep.adopted? && old_status != "adopted"
              PointsService.award(current_user, :deployment_adopted, reference: dep)
            end
            render json: serialize(dep)
          else
            render json: { errors: dep.errors.full_messages }, status: :unprocessable_entity
          end
        end

        private

        def serialize(d)
          { id: d.id, department_name: d.department_name, status: d.status,
            start_date: d.start_date, end_date: d.end_date,
            overdue: d.end_date && d.end_date < Date.today && d.status == "not_started",
            assigned_by: { id: d.assigned_by_id, name: d.assigned_by.name },
            impact: d.project_deployment_impact ? serialize_impact(d.project_deployment_impact) : nil }
        end

        def serialize_impact(imp)
          { id: imp.id, people_affected: imp.people_affected,
            time_saved_hours: imp.time_saved_hours, cost_saved_thb: imp.cost_saved_thb,
            impact_type: imp.impact_type, description: imp.description,
            reported_by: { id: imp.reported_by_user_id, name: imp.reported_by.name } }
        end
      end
    end
  end
end
