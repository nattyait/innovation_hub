class HeartBudget < ApplicationRecord
  belongs_to :user

  validates :period_label, presence: true,
                           uniqueness: { scope: :user_id }
  validates :total, numericality: { greater_than: 0 }
  validates :used, numericality: { greater_than_or_equal_to: 0 }
  validate :used_cannot_exceed_total

  def remaining
    total - used
  end

  private

  def used_cannot_exceed_total
    errors.add(:used, "cannot exceed total") if used.present? && total.present? && used > total
  end
end
