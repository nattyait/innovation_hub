class Idea < ApplicationRecord
  include Discard::Model

  STATUSES = %w[draft pending_review approved declined incubating].freeze
  CATEGORIES = %w[product process technology culture customer other].freeze

  enum :status, STATUSES.index_by(&:itself), default: "draft"

  belongs_to :author, class_name: "User"
  has_many :idea_hearts, dependent: :destroy
  has_many :idea_comments, dependent: :destroy
  has_one :incubator_project, dependent: :nullify

  validates :title, presence: true, length: { maximum: 200 }
  validates :body, presence: true
  validates :status, inclusion: { in: STATUSES }

  scope :published, -> { kept.where(status: :approved) }
  scope :by_hearts, -> { left_joins(:idea_hearts).group(:id).order("COUNT(idea_hearts.id) DESC") }

  def heart_count
    idea_hearts.count
  end

  def hearted_by?(user)
    idea_hearts.exists?(user: user)
  end
end
