class IdeaComment < ApplicationRecord
  belongs_to :idea
  belongs_to :user

  validates :body, presence: true, length: { maximum: 1000 }
end
