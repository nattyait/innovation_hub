module Api
  module V1
    module Innovation
      class CommunitiesController < BaseController
        def index
          render json: Community.order(:name).map { |c| serialize(c) }
        end

        def ideas
          community = Community.find(params[:id])
          ideas = community.ideas.kept.where(status: "approved")
                           .includes(:author, :idea_hearts, :communities)
                           .order(created_at: :desc)
          render json: ideas.map { |i| serialize_idea(i) }
        end

        private

        def serialize(c)
          { id: c.id, external_id: c.external_id, name: c.name,
            description: c.description, member_count: c.member_count, avatar_url: c.avatar_url }
        end

        def serialize_idea(idea)
          heart = idea.idea_hearts.find { |h| h.user_id == current_user.id }
          { id: idea.id, title: idea.title, category: idea.category, status: idea.status,
            tags: idea.tags, heart_count: idea.heart_count, hearted: heart.present?,
            heart_id: heart&.id, comment_count: idea.idea_comments.count,
            application_count: idea.application_count,
            communities: idea.communities.map { |c| { id: c.id, name: c.name } },
            author: { id: idea.author_id, name: idea.author.name, avatar_url: idea.author.avatar_url },
            created_at: idea.created_at }
        end
      end
    end
  end
end
