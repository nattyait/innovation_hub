class InnovationProject < ApplicationRecord
  STATUSES = %w[planning active completed on_hold].freeze
  enum :status, STATUSES.index_by(&:itself), default: "planning"

  belongs_to :idea
  belongs_to :sponsor, class_name: "User"

  has_many :innovation_project_members, dependent: :destroy
  has_many :members, through: :innovation_project_members, source: :user
  has_many :project_topics,      dependent: :destroy
  has_many :project_deployments, dependent: :destroy

  validates :title, presence: true
end
