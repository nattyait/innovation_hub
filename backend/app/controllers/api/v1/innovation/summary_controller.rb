module Api
  module V1
    module Innovation
      # Public endpoints for One Krungthai home feed widgets
      class SummaryController < BaseController
        def index
          render json: {
            trending_ideas: trending_ideas,
            active_projects_count: IncubatorProject.active.count,
            total_ideas: Idea.published.count
          }
        end

        def trending_ideas
          Idea.published.by_hearts.limit(5).map do |i|
            { id: i.id, title: i.title, heart_count: i.heart_count, category: i.category }
          end
        end

        def active_projects
          IncubatorProject.active.includes(:idea).limit(5).map do |p|
            { id: p.id, title: p.title, status: p.status, idea_title: p.idea&.title }
          end
        end
      end
    end
  end
end
