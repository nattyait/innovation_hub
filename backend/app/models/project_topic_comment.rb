class ProjectTopicComment < ApplicationRecord
  belongs_to :project_topic
  belongs_to :author, class_name: "User"
  belongs_to :parent, class_name: "ProjectTopicComment", optional: true
  has_many :replies, class_name: "ProjectTopicComment", foreign_key: :parent_id, dependent: :destroy

  validates :body, presence: true

  scope :top_level, -> { where(parent_id: nil) }
end
