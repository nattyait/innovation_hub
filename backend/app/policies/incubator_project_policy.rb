class IncubatorProjectPolicy < ApplicationPolicy
  def show?          = true
  def update?        = owner_or_admin?
  def change_status? = user.admin?

  private

  def owner_or_admin?
    user.admin? || record.owner == user
  end
end
