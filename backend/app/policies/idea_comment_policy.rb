class IdeaCommentPolicy < ApplicationPolicy
  def create?  = user.present?
  def destroy? = record.user_id == user.id || user.admin?
end
