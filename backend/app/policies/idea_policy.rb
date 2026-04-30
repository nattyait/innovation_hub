class IdeaPolicy < ApplicationPolicy
  def show?    = true
  def create?  = user.present?
  def update?  = author_or_admin?
  def destroy? = author_or_admin?

  # Admin: any status transition at any time.
  # Author: may publish (draft→pending_review) or retract (pending_review→draft).
  def change_status? = user.admin? || record.author_id == user.id

  class Scope < ApplicationPolicy::Scope
    def resolve
      if user&.admin?
        scope.all
      else
        # Published/incubating ideas are visible to everyone.
        # Draft & pending_review are visible only to the author.
        scope.where(status: %w[approved incubating])
             .or(scope.where(author_id: user&.id))
      end
    end
  end

  private

  def author_or_admin?
    user.admin? || record.author_id == user.id
  end
end
