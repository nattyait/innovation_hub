class Notification < ApplicationRecord
  KINDS = %w[idea_approved idea_incubating].freeze

  belongs_to :user
  belongs_to :notifiable, polymorphic: true

  validates :kind, inclusion: { in: KINDS }

  scope :unread, -> { where(read_at: nil) }
  scope :recent, -> { order(created_at: :desc) }

  def read!
    update!(read_at: Time.current) unless read_at?
  end
end
