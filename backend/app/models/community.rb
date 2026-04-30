class Community < ApplicationRecord
  has_many :idea_community_tags, dependent: :destroy
  has_many :ideas, through: :idea_community_tags

  validates :external_id, presence: true, uniqueness: true
  validates :name,        presence: true
end
