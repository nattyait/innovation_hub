module Api
  module V1
    module Innovation
      module Admin
        class IdeasController < BaseController
          before_action :require_admin!

          def index
            ideas = Idea.kept.includes(:author, :idea_hearts)
            ideas = ideas.where(status: params[:status]) if params[:status].present?
            render json: ideas.order(created_at: :desc).map { |i| admin_serialize(i) }
          end

          def update
            idea = Idea.kept.find(params[:id])
            if idea.update(admin_idea_params)
              render json: admin_serialize(idea)
            else
              render json: { errors: idea.errors.full_messages }, status: :unprocessable_entity
            end
          end

          def destroy
            Idea.kept.find(params[:id]).discard
            head :no_content
          end

          private

          def require_admin!
            render json: { error: "Forbidden" }, status: :forbidden unless current_user.admin?
          end

          def admin_idea_params
            params.require(:idea).permit(:title, :body, :category, :status, tags: [])
          end

          def admin_serialize(idea)
            { id: idea.id, title: idea.title, status: idea.status, category: idea.category,
              heart_count: idea.heart_count, tags: idea.tags,
              author: { id: idea.author_id, name: idea.author.name },
              created_at: idea.created_at }
          end
        end
      end
    end
  end
end
