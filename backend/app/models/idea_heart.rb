class IdeaHeart < ApplicationRecord
  belongs_to :idea
  belongs_to :user

  validates :idea_id, uniqueness: { scope: :user_id, message: "already hearted by this user" }
  validate :idea_must_be_approved
  validate :user_has_remaining_budget

  after_create :consume_budget, :notify_for_milestone
  after_destroy :refund_budget

  private

  def idea_must_be_approved
    errors.add(:idea, "must be approved before receiving hearts") unless idea&.approved?
  end

  def user_has_remaining_budget
    return unless user
    errors.add(:base, "ไม่มี innovation budget เหลือในรอบนี้") if user.remaining_hearts <= 0
  end

  def consume_budget
    budget = user.current_budget
    budget&.increment!(:used)
  end

  def refund_budget
    budget = user.current_budget
    budget&.decrement!(:used)
  end

  def notify_for_milestone
    # future: trigger milestone notifications
  end
end
