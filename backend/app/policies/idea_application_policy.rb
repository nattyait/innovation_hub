class IdeaApplicationPolicy < ApplicationPolicy
  def create? = user.present? && record.idea.approved?
  def index?  = user.present?
end
