class IncubatorProject < ApplicationRecord
  include Discard::Model

  STATUSES = %w[discovery mvp pilot scaling completed on_hold].freeze

  enum :status, STATUSES.index_by(&:itself), default: "discovery"

  belongs_to :idea, optional: true
  has_many :project_members, dependent: :destroy
  has_many :members, through: :project_members, source: :user
  has_many :project_updates, dependent: :destroy
  has_many :project_discussions, dependent: :destroy

  validates :title, presence: true
  validates :status, inclusion: { in: STATUSES }

  scope :active, -> { kept.where.not(status: [:completed, :on_hold]) }

  def owner
    project_members.find_by(role: "owner")&.user
  end
end
