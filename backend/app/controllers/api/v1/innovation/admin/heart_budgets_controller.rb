module Api
  module V1
    module Innovation
      module Admin
        class HeartBudgetsController < BaseController
          before_action :require_admin!

          def open_period
            label = params[:period_label] || Time.current.strftime("%Y-%m")
            HeartBudgetService.open_new_period(period_label: label)
            render json: { message: "Period '#{label}' opened for all users" }
          end

          def settings
            amount = params[:heart_budget_amount].to_i
            return render json: { error: "Amount must be positive" }, status: :unprocessable_entity unless amount > 0
            AdminSetting.set("heart_budget_amount", amount)
            render json: { heart_budget_amount: amount }
          end

          private

          def require_admin!
            render json: { error: "Forbidden" }, status: :forbidden unless current_user.admin?
          end
        end
      end
    end
  end
end
