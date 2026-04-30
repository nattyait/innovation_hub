class UserBadge < ApplicationRecord
  BADGE_KEYS = %w[
    first_idea approved_innovator trendsetter serial_innovator
    impact_maker adoption_driver community_builder top_contributor
  ].freeze

  belongs_to :user

  validates :badge_key, inclusion: { in: BADGE_KEYS }, uniqueness: { scope: :user_id }
  validates :earned_at, presence: true

  before_validation { self.earned_at ||= Time.current }
end
