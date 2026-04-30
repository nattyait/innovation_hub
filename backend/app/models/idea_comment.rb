class IdeaComment < ApplicationRecord
  belongs_to :idea
  belongs_to :user
  has_many :idea_comment_votes, dependent: :destroy

  validates :body, presence: true, length: { maximum: 1000 }

  def upvote_count
    idea_comment_votes.count
  end

  def upvoted_by?(user)
    idea_comment_votes.exists?(user: user)
  end
end
