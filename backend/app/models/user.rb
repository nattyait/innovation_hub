class User < ApplicationRecord
  has_secure_password

  ROLES = %w[employee admin sponsor project_owner].freeze

  enum :role, ROLES.index_by(&:itself), default: "employee"

  has_many :ideas, foreign_key: :author_id, dependent: :destroy
  has_many :idea_hearts, dependent: :destroy
  has_many :idea_comments, dependent: :destroy
  has_many :heart_budgets, dependent: :destroy
  has_many :project_members, dependent: :destroy
  has_many :incubator_projects, through: :project_members
  has_many :notifications, dependent: :destroy

  validates :name, presence: true
  validates :email, presence: true, uniqueness: { case_sensitive: false },
                    format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :role, inclusion: { in: ROLES }

  def current_budget
    heart_budgets.order(opened_at: :desc).first
  end

  def remaining_hearts
    budget = current_budget
    return 0 unless budget
    budget.total - budget.used
  end
end
