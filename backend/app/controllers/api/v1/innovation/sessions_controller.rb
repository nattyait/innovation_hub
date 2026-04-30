module Api
  module V1
    module Innovation
      class SessionsController < ApplicationController
        # POC: persona-based login without SSO
        def create
          user = User.find_by(email: params[:email])
          if user&.authenticate(params[:password])
            token = encode_token(user_id: user.id)
            HeartBudgetService.ensure_budget_for(user)
            render json: { token: token, user: user_payload(user) }
          else
            render json: { error: "Invalid credentials" }, status: :unauthorized
          end
        end

        # POC shortcut: login as a pre-seeded persona
        def persona
          persona_map = {
            "employee"      => "employee@ktb.poc",
            "admin"         => "admin@ktb.poc",
            "sponsor"       => "sponsor@ktb.poc",
            "project_owner" => "project_owner@ktb.poc"
          }
          email = persona_map[params[:persona]]
          return render json: { error: "Unknown persona" }, status: :unprocessable_entity unless email

          user = User.find_by!(email: email)
          token = encode_token(user_id: user.id)
          HeartBudgetService.ensure_budget_for(user)
          render json: { token: token, user: user_payload(user) }
        end

        private

        def encode_token(payload)
          secret = Rails.application.secret_key_base
          JWT.encode(payload.merge(exp: 24.hours.from_now.to_i), secret, "HS256")
        end

        def user_payload(user)
          {
            id: user.id, name: user.name, email: user.email,
            role: user.role, avatar_url: user.avatar_url,
            remaining_hearts: user.remaining_hearts
          }
        end
      end
    end
  end
end
