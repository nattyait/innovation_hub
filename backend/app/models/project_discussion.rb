class ProjectDiscussion < ApplicationRecord
  belongs_to :incubator_project
  belongs_to :user

  validates :body, presence: true, length: { maximum: 2000 }
end
