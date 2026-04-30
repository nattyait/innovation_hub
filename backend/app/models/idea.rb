class Idea < ApplicationRecord
  include Discard::Model

  STATUSES   = %w[draft submitted under_review approved declined returned].freeze
  CATEGORIES = %w[product process technology culture customer other].freeze

  enum :status, STATUSES.index_by(&:itself), default: "draft"

  belongs_to :author,   class_name: "User"
  belongs_to :approver, class_name: "User", optional: true

  has_many :idea_hearts,         dependent: :destroy
  has_many :idea_comments,       dependent: :destroy
  has_many :idea_applications,   dependent: :destroy
  has_many :idea_community_tags, dependent: :destroy
  has_many :communities,         through: :idea_community_tags

  validates :title,  presence: true, length: { maximum: 200 }
  validates :body,   presence: true
  validates :status, inclusion: { in: STATUSES }

  scope :published,        -> { kept.where(status: :approved) }
  scope :pending_approval, -> { kept.where(status: :under_review) }
  scope :by_hearts,        -> { left_joins(:idea_hearts).group(:id).order("COUNT(idea_hearts.id) DESC") }

  def heart_count
    idea_hearts.count
  end

  def hearted_by?(user)
    idea_hearts.exists?(user: user)
  end

  def application_count
    idea_applications.count
  end

  def total_people_affected
    idea_applications.joins(:idea_impact).sum("idea_impacts.people_affected")
  end
end
