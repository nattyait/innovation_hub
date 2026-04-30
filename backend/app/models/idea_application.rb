class IdeaApplication < ApplicationRecord
  belongs_to :idea
  belongs_to :applied_by, class_name: "User", foreign_key: :applied_by_user_id
  has_one :idea_impact, dependent: :destroy

  validates :description, presence: true
end
