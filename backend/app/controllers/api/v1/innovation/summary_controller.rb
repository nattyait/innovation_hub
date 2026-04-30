module Api
  module V1
    module Innovation
      class SummaryController < BaseController
        def index
          render json: {
            trending_ideas:    trending_ideas_data,
            total_ideas:       Idea.published.count,
            total_applied:     IdeaApplication.count,
            total_people_affected: IdeaImpact.sum(:people_affected)
          }
        end

        def trending_ideas
          render json: trending_ideas_data
        end

        def top_leaderboard
          render json: {
            top_innovator:  leaderboard_top("top_innovator"),
            impact_champion: leaderboard_top("impact_champion")
          }
        end

        private

        def trending_ideas_data
          Idea.published.by_hearts.limit(5).map do |i|
            { id: i.id, title: i.title, heart_count: i.heart_count, category: i.category }
          end
        end

        def leaderboard_top(category)
          User.joins(:innovation_points)
              .group("users.id")
              .order(Arel.sql("SUM(innovation_points.points) DESC"))
              .limit(3)
              .select("users.id, users.name, users.avatar_url, SUM(innovation_points.points) AS score")
              .map { |u| { id: u.id, name: u.name, score: u.score.to_i } }
        end
      end
    end
  end
end
