module Api
  module V1
    module Innovation
      class HeartsController < BaseController
        def create
          idea = Idea.kept.find(params[:idea_id])
          heart = idea.idea_hearts.build(user: current_user, comment: params[:comment])
          authorize heart
          if heart.save
            render json: {
              heart_id: heart.id,
              heart_count: idea.reload.heart_count,
              remaining_hearts: current_user.reload.remaining_hearts
            }, status: :created
          else
            render json: { errors: heart.errors.full_messages }, status: :unprocessable_entity
          end
        end

        # Shallow route: DELETE /hearts/:id
        def destroy
          heart = IdeaHeart.find(params[:id])
          authorize heart
          idea = heart.idea
          heart.destroy
          render json: {
            heart_count: idea.reload.heart_count,
            remaining_hearts: current_user.reload.remaining_hearts
          }
        end
      end
    end
  end
end
