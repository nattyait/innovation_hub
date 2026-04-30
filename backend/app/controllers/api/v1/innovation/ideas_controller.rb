module Api
  module V1
    module Innovation
      class IdeasController < BaseController
        before_action :set_idea, only: [:show, :update, :destroy, :submit, :retract, :approve, :decline, :return_idea]

        def index
          ideas = policy_scope(Idea).kept

          if params[:mine] == "true"
            ideas = ideas.where(author_id: current_user.id)
          else
            ideas = ideas.where.not(status: %w[draft submitted returned])
          end

          ideas = ideas.where(status: params[:status])       if params[:status].present?
          ideas = ideas.where(category: params[:category])   if params[:category].present?
          ideas = ideas.where(id: Community.find(params[:community_id]).ideas) if params[:community_id].present?
          ideas = ideas.by_hearts                            if params[:sort] == "hearts"
          ideas = ideas.order(created_at: :desc)             unless params[:sort] == "hearts"

          render json: serialize_ideas(ideas)
        end

        def show
          authorize @idea
          render json: serialize_idea(@idea, detailed: true)
        end

        def create
          idea = current_user.ideas.build(idea_params)
          authorize idea
          if idea.save
            sync_communities(idea)
            render json: serialize_idea(idea), status: :created
          else
            render json: { errors: idea.errors.full_messages }, status: :unprocessable_entity
          end
        end

        def update
          authorize @idea
          if @idea.update(idea_params)
            sync_communities(@idea)
            render json: serialize_idea(@idea)
          else
            render json: { errors: @idea.errors.full_messages }, status: :unprocessable_entity
          end
        end

        def destroy
          authorize @idea
          @idea.discard
          head :no_content
        end

        # Employee submits idea for approval — routes to direct manager via org chart
        def submit
          authorize @idea, :submit?
          approver = @idea.author.manager
          return render json: { error: "ไม่พบผู้บังคับบัญชา กรุณาติดต่อ Admin" }, status: :unprocessable_entity unless approver

          if @idea.update(status: "submitted", approver: approver)
            NotificationService.idea_pending_approval(@idea)
            PointsService.award(@idea.author, :idea_submitted, reference: @idea)
            render json: serialize_idea(@idea)
          else
            render json: { errors: @idea.errors.full_messages }, status: :unprocessable_entity
          end
        end

        # Author retracts submitted idea back to draft
        def retract
          authorize @idea, :retract?
          if @idea.update(status: "draft", approver: nil)
            render json: serialize_idea(@idea)
          else
            render json: { errors: @idea.errors.full_messages }, status: :unprocessable_entity
          end
        end

        # Manager / Sponsor approves
        def approve
          authorize @idea, :approve?
          if @idea.update(status: "approved")
            NotificationService.idea_approved(@idea)
            PointsService.award(@idea.author, :idea_approved, reference: @idea)
            render json: serialize_idea(@idea)
          else
            render json: { errors: @idea.errors.full_messages }, status: :unprocessable_entity
          end
        end

        # Manager / Sponsor declines
        def decline
          authorize @idea, :approve?
          if @idea.update(status: "declined")
            NotificationService.idea_declined(@idea)
            render json: serialize_idea(@idea)
          else
            render json: { errors: @idea.errors.full_messages }, status: :unprocessable_entity
          end
        end

        # Manager / Sponsor returns with reason for revision
        def return_idea
          authorize @idea, :approve?
          return_reason = params[:return_reason].to_s.strip
          return render json: { error: "กรุณาระบุเหตุผลที่ส่งคืน" }, status: :unprocessable_entity if return_reason.blank?

          if @idea.update(status: "returned", return_reason: return_reason)
            NotificationService.idea_returned(@idea)
            render json: serialize_idea(@idea)
          else
            render json: { errors: @idea.errors.full_messages }, status: :unprocessable_entity
          end
        end

        # Ideas waiting for current manager/sponsor's approval
        def pending_approvals
          authorize Idea, :pending_approvals?
          base = Idea.kept.where(status: %w[submitted under_review]).includes(:author, :idea_hearts)
          # Sponsor sees all submitted ideas; manager sees only their direct reports'
          ideas = current_user.sponsor? ? base : base.where(approver_id: current_user.id)
                      .order(created_at: :asc)
          render json: serialize_ideas(ideas)
        end

        private

        def set_idea
          @idea = Idea.kept.find(params[:id])
        end

        def idea_params
          params.require(:idea).permit(:title, :body, :category, tags: [])
        end

        def sync_communities(idea)
          return unless params[:idea]&.key?(:community_ids)
          ids = Array(params[:idea][:community_ids]).map(&:to_i).uniq
          idea.idea_community_tags.where.not(community_id: ids).destroy_all
          ids.each { |cid| idea.idea_community_tags.find_or_create_by!(community_id: cid) }
        end

        def serialize_ideas(ideas)
          ideas.includes(:author, :idea_hearts, :communities).map { |i| serialize_idea(i) }
        end

        def serialize_idea(idea, detailed: false)
          heart = idea.idea_hearts.find { |h| h.user_id == current_user.id }
          data = {
            id:                idea.id,
            title:             idea.title,
            category:          idea.category,
            status:            idea.status,
            tags:              idea.tags,
            heart_count:       idea.heart_count,
            hearted:           heart.present?,
            heart_id:          heart&.id,
            comment_count:     idea.idea_comments.count,
            application_count: idea.application_count,
            return_reason:     idea.return_reason,
            communities:       idea.communities.map { |c| { id: c.id, name: c.name } },
            author:            { id: idea.author_id, name: idea.author.name, avatar_url: idea.author.avatar_url },
            approver:          idea.approver ? { id: idea.approver_id, name: idea.approver.name } : nil,
            created_at:        idea.created_at
          }
          data[:body] = idea.body if detailed
          data
        end
      end
    end
  end
end
