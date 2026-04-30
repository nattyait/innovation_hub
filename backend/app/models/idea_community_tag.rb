class IdeaCommunityTag < ApplicationRecord
  belongs_to :idea
  belongs_to :community

  validates :community_id, uniqueness: { scope: :idea_id }
end
