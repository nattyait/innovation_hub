class HeartBudgetService
  def self.open_new_period(period_label: nil)
    label = period_label || Time.current.strftime("%Y-%m")
    amount = AdminSetting.heart_budget_amount

    User.find_each do |user|
      user.heart_budgets.find_or_create_by!(period_label: label) do |b|
        b.total = amount
        b.used = 0
        b.opened_at = Time.current
      end
    end
  end

  def self.ensure_budget_for(user)
    label = Time.current.strftime("%Y-%m")
    user.heart_budgets.find_or_create_by!(period_label: label) do |b|
      b.total = AdminSetting.heart_budget_amount
      b.used = 0
      b.opened_at = Time.current
    end
  end
end
