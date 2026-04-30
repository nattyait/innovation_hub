class ProjectDeployment < ApplicationRecord
  STATUSES = %w[not_started adopted adapted not_adopted].freeze
  enum :status, STATUSES.index_by(&:itself), default: "not_started"

  belongs_to :innovation_project
  belongs_to :assigned_by, class_name: "User", foreign_key: :assigned_by_id
  has_one :project_deployment_impact, dependent: :destroy

  validates :department_name, presence: true
end
