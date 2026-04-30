class ClassroomCourse < ApplicationRecord
  validates :title, presence: true
  validates :sf_course_id, uniqueness: true, allow_nil: true

  scope :by_category, ->(cat) { where(category: cat) }
  scope :ordered, -> { order(created_at: :desc) }
end
