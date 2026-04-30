class User < ApplicationRecord
  has_secure_password

  ROLES = %w[employee manager admin sponsor].freeze

  enum :role, ROLES.index_by(&:itself), default: "employee"

  belongs_to :manager, class_name: "User", optional: true

  has_many :direct_reports,     class_name: "User", foreign_key: :manager_id, dependent: :nullify
  has_many :ideas,              foreign_key: :author_id,   dependent: :destroy
  has_many :approved_ideas,     foreign_key: :approver_id, class_name: "Idea", dependent: :nullify
  has_many :idea_hearts,        dependent: :destroy
  has_many :idea_comments,      dependent: :destroy
  has_many :idea_comment_votes, dependent: :destroy
  has_many :heart_budgets,      dependent: :destroy
  has_many :idea_applications,  foreign_key: :applied_by_user_id, dependent: :destroy
  has_many :idea_impacts,       foreign_key: :reported_by_user_id, dependent: :destroy
  has_many :innovation_points,        dependent: :destroy
  has_many :user_badges,              dependent: :destroy
  has_many :notifications,            dependent: :destroy
  has_many :sponsored_projects,       class_name: "InnovationProject", foreign_key: :sponsor_id, dependent: :nullify
  has_many :innovation_project_members, dependent: :destroy
  has_many :joined_projects,          through: :innovation_project_members, source: :innovation_project

  validates :name,  presence: true
  validates :email, presence: true, uniqueness: { case_sensitive: false },
                    format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :role,  inclusion: { in: ROLES }

  def current_budget
    heart_budgets.order(opened_at: :desc).first
  end

  def remaining_hearts
    budget = current_budget
    return 0 unless budget
    budget.total - budget.used
  end

  def total_points
    innovation_points.sum(:points)
  end
end
