class InnovationProjectMember < ApplicationRecord
  belongs_to :innovation_project
  belongs_to :user

  validates :user_id, uniqueness: { scope: :innovation_project_id }
end
