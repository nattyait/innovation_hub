module Api
  module V1
    module Innovation
      class IdeasController < BaseController
        before_action :set_idea, only: [:show, :update, :destroy, :change_status]

        def index
          ideas = policy_scope(Idea).kept

          if params[:mine] == "true"
            ideas = ideas.where(author_id: current_user.id)
          else
            # Exclude drafts from the general feed — only show to author via ?mine=true
            ideas = ideas.where.not(status: "draft")
          end

          ideas = ideas.where(status: params[:status]) if params[:status].present?
          ideas = ideas.where(category: params[:category]) if params[:category].present?
          ideas = ideas.by_hearts if params[:sort] == "hearts"
          ideas = ideas.order(created_at: :desc) unless params[:sort] == "hearts"

          render json: serialize_ideas(ideas, current_user)
        end

        def show
          authorize @idea
          render json: serialize_idea(@idea, current_user, detailed: true)
        end

        def create
          idea = current_user.ideas.build(idea_params)
          authorize idea
          if idea.save
            render json: serialize_idea(idea, current_user), status: :created
          else
            render json: { errors: idea.errors.full_messages }, status: :unprocessable_entity
          end
        end

        def update
          authorize @idea
          if @idea.update(idea_params)
            render json: serialize_idea(@idea, current_user)
          else
            render json: { errors: @idea.errors.full_messages }, status: :unprocessable_entity
          end
        end

        def destroy
          authorize @idea
          @idea.discard
          head :no_content
        end

        def change_status
          authorize @idea, :change_status?
          new_status = params[:status]

          unless Idea::STATUSES.include?(new_status)
            return render json: { error: "Invalid status" }, status: :unprocessable_entity
          end

          # Non-admins may only toggle between draft and pending_review
          unless current_user.admin?
            allowed = { "draft" => "pending_review", "pending_review" => "draft" }
            unless allowed[@idea.status] == new_status
              return render json: { error: "สถานะนี้ไม่สามารถเปลี่ยนได้" }, status: :forbidden
            end
          end

          if @idea.update(status: new_status)
            notify_on_status_change(@idea, new_status)
            render json: serialize_idea(@idea, current_user)
          else
            render json: { errors: @idea.errors.full_messages }, status: :unprocessable_entity
          end
        end

        private

        def set_idea
          @idea = Idea.kept.find(params[:id])
        end

        def idea_params
          params.require(:idea).permit(:title, :body, :category, tags: [])
        end

        def notify_on_status_change(idea, status)
          case status
          when "approved"   then NotificationService.idea_approved(idea)
          when "incubating" then NotificationService.idea_incubating(idea)
          end
        end

        def serialize_ideas(ideas, viewer)
          ideas.map { |i| serialize_idea(i, viewer) }
        end

        def serialize_idea(idea, viewer, detailed: false)
          heart = viewer ? idea.idea_hearts.find_by(user_id: viewer.id) : nil
          base = {
            id: idea.id, title: idea.title, category: idea.category,
            status: idea.status, tags: idea.tags,
            heart_count: idea.heart_count,
            hearted: heart.present?,
            heart_id: heart&.id,
            author: { id: idea.author_id, name: idea.author.name, avatar_url: idea.author.avatar_url },
            created_at: idea.created_at
          }
          if detailed
            base[:body] = idea.body
            if idea.incubating? && idea.incubator_project.present?
              p = idea.incubator_project
              base[:incubator_project] = {
                id: p.id, title: p.title, status: p.status, summary: p.summary,
                jira_board_url: p.jira_board_url, jira_project_key: p.jira_project_key,
                member_count: p.members.count,
                is_member: viewer ? p.project_members.exists?(user_id: viewer.id) : false,
                owner: p.owner&.slice(:id, :name, :avatar_url)
              }
            end
          end
          base
        end
      end
    end
  end
end
