class ProjectTopic < ApplicationRecord
  belongs_to :innovation_project
  belongs_to :author, class_name: "User"
  has_many :project_topic_comments, dependent: :destroy

  validates :title, :body, presence: true

  def top_level_comment_count
    project_topic_comments.where(parent_id: nil).count
  end
end
