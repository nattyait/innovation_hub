class InnovationPoint < ApplicationRecord
  ACTION_TYPES = %w[
    idea_submitted idea_approved idea_applied_by_others
    heart_received comment_upvoted impact_reported first_adopter_bonus
    project_topic_created project_comment_added project_reply_added
    deployment_adopted deployment_impact_reported
  ].freeze

  belongs_to :user

  validates :points,      presence: true, numericality: { other_than: 0 }
  validates :action_type, inclusion: { in: ACTION_TYPES }
  validates :earned_at,   presence: true

  before_validation { self.earned_at ||= Time.current }
end
