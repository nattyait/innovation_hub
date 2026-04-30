class AdminSetting < ApplicationRecord
  validates :key, presence: true, uniqueness: true

  def self.get(key, default: nil)
    find_by(key: key)&.value || default
  end

  def self.set(key, value)
    find_or_initialize_by(key: key).tap { |s| s.update!(value: value.to_s) }
  end

  def self.heart_budget_amount
    get("heart_budget_amount", default: "10").to_i
  end
end
