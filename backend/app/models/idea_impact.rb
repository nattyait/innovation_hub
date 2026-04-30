class IdeaImpact < ApplicationRecord
  IMPACT_TYPES = %w[time cost people process other].freeze

  enum :impact_type, IMPACT_TYPES.index_by(&:itself), default: "other"

  belongs_to :idea_application
  belongs_to :reported_by, class_name: "User", foreign_key: :reported_by_user_id

  validates :people_affected, presence: true, numericality: { greater_than_or_equal_to: 0 }
  validates :description,     presence: true
  validates :impact_type,     inclusion: { in: IMPACT_TYPES }
end
