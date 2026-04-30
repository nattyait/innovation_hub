class NotificationService
  def self.idea_approved(idea)
    Notification.create!(
      user: idea.author,
      notifiable: idea,
      kind: "idea_approved"
    )
  end

  def self.idea_incubating(idea)
    Notification.create!(
      user: idea.author,
      notifiable: idea,
      kind: "idea_incubating"
    )
  end
end
