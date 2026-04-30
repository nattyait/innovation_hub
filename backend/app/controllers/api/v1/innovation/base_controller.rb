module Api
  module V1
    module Innovation
      class BaseController < ApplicationController
        include Pundit::Authorization

        before_action :authenticate_user!

        rescue_from Pundit::NotAuthorizedError, with: :forbidden
        rescue_from ActiveRecord::RecordNotFound, with: :not_found

        private

        def authenticate_user!
          token = request.headers["Authorization"]&.split(" ")&.last
          payload = decode_token(token)
          @current_user = User.find(payload["user_id"]) if payload
          render json: { error: "Unauthorized" }, status: :unauthorized unless @current_user
        end

        def current_user
          @current_user
        end

        def decode_token(token)
          return nil if token.blank?
          secret = Rails.application.secret_key_base
          JWT.decode(token, secret, true, algorithm: "HS256").first
        rescue JWT::DecodeError
          nil
        end

        def forbidden
          render json: { error: "Forbidden" }, status: :forbidden
        end

        def not_found
          render json: { error: "Not found" }, status: :not_found
        end

        def pagination_meta(collection)
          {
            current_page: collection.current_page,
            total_pages: collection.total_pages,
            total_count: collection.total_count
          }
        end
      end
    end
  end
end
