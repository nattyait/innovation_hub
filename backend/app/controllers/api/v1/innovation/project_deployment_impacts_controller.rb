module Api
  module V1
    module Innovation
      class ProjectDeploymentImpactsController < BaseController
        def create
          dep = ProjectDeployment.find(params[:project_deployment_id])
          return render json: { error: "รายงาน impact แล้ว" }, status: :unprocessable_entity if dep.project_deployment_impact.present?

          impact = dep.build_project_deployment_impact(impact_params.merge(reported_by_user_id: current_user.id))
          if impact.save
            PointsService.award(current_user, :deployment_impact_reported, reference: dep.innovation_project)
            render json: serialize(impact), status: :created
          else
            render json: { errors: impact.errors.full_messages }, status: :unprocessable_entity
          end
        end

        def update
          dep    = ProjectDeployment.find(params[:project_deployment_id])
          impact = dep.project_deployment_impact
          return render json: { error: "Not found" }, status: :not_found unless impact

          if impact.update(impact_params)
            render json: serialize(impact)
          else
            render json: { errors: impact.errors.full_messages }, status: :unprocessable_entity
          end
        end

        private

        def impact_params
          params.permit(:people_affected, :time_saved_hours, :cost_saved_thb, :impact_type, :description, :evidence_url)
        end

        def serialize(imp)
          { id: imp.id, people_affected: imp.people_affected,
            time_saved_hours: imp.time_saved_hours, cost_saved_thb: imp.cost_saved_thb,
            impact_type: imp.impact_type, description: imp.description, evidence_url: imp.evidence_url,
            reported_by: { id: imp.reported_by_user_id, name: imp.reported_by.name } }
        end
      end
    end
  end
end
