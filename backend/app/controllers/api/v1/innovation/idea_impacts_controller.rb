module Api
  module V1
    module Innovation
      class IdeaImpactsController < BaseController
        def create
          application = IdeaApplication.find(params[:idea_application_id])
          return render json: { error: "มีการรายงาน impact แล้ว" }, status: :unprocessable_entity if application.idea_impact.present?

          impact = application.build_idea_impact(impact_params.merge(reported_by_user_id: current_user.id))

          if impact.save
            PointsService.award(current_user, :impact_reported, reference: application.idea)
            NotificationService.idea_impacted(application.idea, current_user)
            render json: serialize(impact), status: :created
          else
            render json: { errors: impact.errors.full_messages }, status: :unprocessable_entity
          end
        end

        def update
          application = IdeaApplication.find(params[:idea_application_id])
          impact = application.idea_impact
          return render json: { error: "Not found" }, status: :not_found unless impact
          return render json: { error: "Forbidden" }, status: :forbidden unless impact.reported_by_user_id == current_user.id || current_user.admin?

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
          {
            id: imp.id, people_affected: imp.people_affected,
            time_saved_hours: imp.time_saved_hours, cost_saved_thb: imp.cost_saved_thb,
            impact_type: imp.impact_type, description: imp.description,
            evidence_url: imp.evidence_url,
            reported_by: { id: imp.reported_by_user_id, name: imp.reported_by.name, avatar_url: imp.reported_by.avatar_url },
            created_at: imp.created_at
          }
        end
      end
    end
  end
end
