class ProjectUpdate < ApplicationRecord
  MILESTONE_TAGS = %w[general milestone blocker achievement].freeze

  belongs_to :incubator_project
  belongs_to :user

  validates :body, presence: true
  validates :milestone_tag, inclusion: { in: MILESTONE_TAGS }, allow_nil: true
end
