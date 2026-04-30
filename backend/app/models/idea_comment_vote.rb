class IdeaCommentVote < ApplicationRecord
  belongs_to :idea_comment
  belongs_to :user

  validates :user_id, uniqueness: { scope: :idea_comment_id }
end
