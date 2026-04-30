class NotificationService
  def self.idea_approved(idea)
    create(user: idea.author, notifiable: idea, kind: "idea_approved")
  end

  def self.idea_declined(idea)
    create(user: idea.author, notifiable: idea, kind: "idea_declined")
  end

  def self.idea_returned(idea)
    create(user: idea.author, notifiable: idea, kind: "idea_returned")
  end

  def self.idea_pending_approval(idea)
    create(user: idea.approver, notifiable: idea, kind: "idea_pending_approval") if idea.approver
  end

  def self.idea_applied(idea, applier)
    create(user: idea.author, notifiable: idea, kind: "idea_applied") unless idea.author_id == applier.id
  end

  def self.idea_impacted(idea, reporter)
    create(user: idea.author, notifiable: idea, kind: "idea_impacted") unless idea.author_id == reporter.id
  end

  def self.create(user:, notifiable:, kind:)
    Notification.create!(user: user, notifiable: notifiable, kind: kind)
  rescue ActiveRecord::RecordInvalid
    nil
  end
end
