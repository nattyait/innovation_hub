module Api
  module V1
    module Innovation
      class CommentsController < BaseController
        def index
          idea = Idea.kept.find(params[:idea_id])
          comments = idea.idea_comments
                         .includes(:user, :idea_comment_votes)
                         .order(created_at: :asc)
          render json: comments.map { |c| serialize_comment(c) }
        end

        def create
          idea = Idea.kept.find(params[:idea_id])
          comment = idea.idea_comments.build(body: params[:body], user: current_user)
          authorize comment
          if comment.save
            render json: serialize_comment(comment), status: :created
          else
            render json: { errors: comment.errors.full_messages }, status: :unprocessable_entity
          end
        end

        def destroy
          comment = IdeaComment.find(params[:id])
          authorize comment
          comment.destroy
          head :no_content
        end

        def upvote
          comment = IdeaComment.find(params[:id])
          vote = comment.idea_comment_votes.find_or_initialize_by(user: current_user)
          if vote.new_record? && vote.save
            PointsService.award(comment.user, :comment_upvoted, reference: comment)
            render json: { upvote_count: comment.upvote_count }
          else
            render json: { error: "Already upvoted" }, status: :unprocessable_entity
          end
        end

        def remove_upvote
          comment = IdeaComment.find(params[:id])
          vote = comment.idea_comment_votes.find_by(user: current_user)
          if vote
            vote.destroy
            render json: { upvote_count: comment.reload.upvote_count }
          else
            render json: { error: "Not upvoted" }, status: :not_found
          end
        end

        private

        def serialize_comment(c)
          {
            id: c.id, body: c.body,
            upvote_count: c.upvote_count,
            upvoted: c.upvoted_by?(current_user),
            user: { id: c.user_id, name: c.user.name, avatar_url: c.user.avatar_url },
            created_at: c.created_at
          }
        end
      end
    end
  end
end
