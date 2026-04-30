class IdeaPolicy < ApplicationPolicy
  def show?    = true
  def create?  = user.present?
  def update?  = author_or_admin? && editable?
  def destroy? = author_or_admin?

  def submit?            = record.author_id == user.id && %w[draft returned].include?(record.status)
  def retract?           = record.author_id == user.id && record.status == "submitted"
  def approve?           = can_approve?
  def apply?             = user.present? && record.approved?
  def pending_approvals? = user.manager? || user.sponsor?

  class Scope < ApplicationPolicy::Scope
    def resolve
      return scope.all if user&.admin?

      scope.where(status: %w[approved under_review declined returned submitted])
           .or(scope.where(author_id: user&.id))
           .or(scope.where(approver_id: user&.id))
    end
  end

  private

  def author_or_admin?
    user.admin? || record.author_id == user.id
  end

  def editable?
    return true if user.admin?
    %w[draft submitted returned].include?(record.status)
  end

  def can_approve?
    pending = %w[submitted under_review].include?(record.status)
    return false unless pending
    # Manager: only approves their own direct reports' ideas
    return record.approver_id == user.id if user.manager?
    # Sponsor: approves any idea cross-department
    return true if user.sponsor?
    false
  end
end
