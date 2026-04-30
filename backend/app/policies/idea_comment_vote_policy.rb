class IdeaCommentVotePolicy < ApplicationPolicy
  def create?  = user.present?
  def destroy? = record.user_id == user.id
end
