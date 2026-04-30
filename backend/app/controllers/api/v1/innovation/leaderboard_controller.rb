module Api
  module V1
    module Innovation
      class LeaderboardController < BaseController
        def index
          category = params[:category] || "top_innovator"
          period   = params[:period]   || "month"
          start_at = period_start(period)

          entries = case category
                    when "top_innovator"      then top_innovators(start_at)
                    when "impact_champion"    then impact_champions(start_at)
                    when "community_catalyst" then community_catalysts(start_at)
                    when "idea_adopter"       then idea_adopters(start_at)
                    when "rising_star"        then rising_stars(start_at)
                    else []
                    end

          render json: entries
        end

        private

        def period_start(period)
          case period
          when "month"   then Time.current.beginning_of_month
          when "quarter" then Time.current.beginning_of_quarter
          else           Time.at(0)
          end
        end

        def serialize_entry(user, score, rank)
          {
            rank:   rank,
            score:  score.to_i,
            user:   { id: user.id, name: user.name, avatar_url: user.avatar_url },
            badges: user.user_badges.pluck(:badge_key)
          }
        end

        def top_innovators(start_at)
          User.joins(:ideas)
              .where(ideas: { status: "approved", created_at: start_at.. })
              .group("users.id")
              .order("COUNT(ideas.id) DESC")
              .limit(20)
              .select("users.*, COUNT(ideas.id) AS score")
              .map.with_index(1) { |u, i| serialize_entry(u, u.score, i) }
        end

        def impact_champions(start_at)
          User.joins(ideas: { idea_applications: :idea_impact })
              .where("ideas.author_id = users.id")
              .where(idea_impacts: { created_at: start_at.. })
              .group("users.id")
              .order("SUM(idea_impacts.people_affected) DESC")
              .limit(20)
              .select("users.*, SUM(idea_impacts.people_affected) AS score")
              .map.with_index(1) { |u, i| serialize_entry(u, u.score, i) }
        end

        def community_catalysts(start_at)
          User.joins("LEFT JOIN idea_hearts ih ON ih.user_id = users.id AND ih.created_at >= :s", s: start_at)
              .joins("LEFT JOIN idea_comments ic ON ic.user_id = users.id AND ic.created_at >= :s", s: start_at)
              .group("users.id")
              .order("(COUNT(DISTINCT ih.id) + COUNT(DISTINCT ic.id)) DESC")
              .limit(20)
              .select("users.*, (COUNT(DISTINCT ih.id) + COUNT(DISTINCT ic.id)) AS score")
              .map.with_index(1) { |u, i| serialize_entry(u, u.score, i) }
        end

        def idea_adopters(start_at)
          User.joins(:idea_applications)
              .where(idea_applications: { created_at: start_at.. })
              .group("users.id")
              .order("COUNT(idea_applications.id) DESC")
              .limit(20)
              .select("users.*, COUNT(idea_applications.id) AS score")
              .map.with_index(1) { |u, i| serialize_entry(u, u.score, i) }
        end

        def rising_stars(start_at)
          User.joins(:innovation_points)
              .where(innovation_points: { earned_at: start_at.. })
              .group("users.id")
              .order("SUM(innovation_points.points) DESC")
              .limit(20)
              .select("users.*, SUM(innovation_points.points) AS score")
              .map.with_index(1) { |u, i| serialize_entry(u, u.score, i) }
        end
      end
    end
  end
end
