class ProjectMember < ApplicationRecord
  ROLES = %w[owner member].freeze

  belongs_to :incubator_project
  belongs_to :user

  validates :role, inclusion: { in: ROLES }
  validates :user_id, uniqueness: { scope: :incubator_project_id }
end
