module Api
  module V1
    module Innovation
      class IdeaApplicationsController < BaseController
        def index
          idea = Idea.kept.find(params[:idea_id])
          apps = idea.idea_applications.includes(:applied_by, :idea_impact).order(created_at: :desc)
          render json: apps.map { |a| serialize(a) }
        end

        def create
          idea = Idea.kept.find(params[:idea_id])
          authorize idea, :apply?

          app = idea.idea_applications.build(
            applied_by_user_id: current_user.id,
            department:         params[:department],
            description:        params[:description]
          )

          if app.save
            is_first = idea.idea_applications.count == 1
            PointsService.award(idea.author, :idea_applied_by_others, reference: idea) unless idea.author_id == current_user.id
            PointsService.award(current_user, :first_adopter_bonus, reference: idea)   if is_first
            NotificationService.idea_applied(idea, current_user)
            render json: serialize(app), status: :created
          else
            render json: { errors: app.errors.full_messages }, status: :unprocessable_entity
          end
        end

        private

        def serialize(app)
          {
            id:          app.id,
            idea_id:     app.idea_id,
            department:  app.department,
            description: app.description,
            created_at:  app.created_at,
            applied_by:  { id: app.applied_by_user_id, name: app.applied_by.name, avatar_url: app.applied_by.avatar_url },
            impact:      app.idea_impact ? serialize_impact(app.idea_impact) : nil
          }
        end

        def serialize_impact(imp)
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
