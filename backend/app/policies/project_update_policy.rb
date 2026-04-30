class ProjectUpdatePolicy < ApplicationPolicy
  def create?
    project = record.incubator_project
    user.admin? || project.project_members.exists?(user: user)
  end
end
