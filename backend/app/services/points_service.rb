class PointsService
  POINT_VALUES = {
    idea_submitted:          5,
    idea_approved:          20,
    idea_applied_by_others: 30,
    heart_received:          2,
    comment_upvoted:         3,
    impact_reported:        15,
    first_adopter_bonus:    10
  }.freeze

  def self.award(user, action, reference: nil)
    pts = POINT_VALUES.fetch(action.to_sym, 0)
    return unless pts.positive?

    InnovationPoint.create!(
      user:           user,
      points:         pts,
      action_type:    action.to_s,
      reference_type: reference&.class&.name,
      reference_id:   reference&.id,
      earned_at:      Time.current
    )
    check_badges(user, action)
  end

  def self.check_badges(user, action)
    case action.to_sym
    when :idea_submitted
      award_badge(user, "first_idea") if user.ideas.count == 1
    when :idea_approved
      count = user.ideas.approved.count
      award_badge(user, "approved_innovator") if count >= 1
      award_badge(user, "serial_innovator")   if count >= 5
    when :heart_received
      has_trending = user.ideas.joins(:idea_hearts)
                         .group("ideas.id")
                         .having("COUNT(idea_hearts.id) >= 10")
                         .exists?
      award_badge(user, "trendsetter") if has_trending
    when :impact_reported
      award_badge(user, "impact_maker") if user.idea_impacts.count == 1
    when :idea_applied_by_others
      has_adoption = user.ideas.joins(:idea_applications)
                         .group("ideas.id")
                         .having("COUNT(idea_applications.id) >= 3")
                         .exists?
      award_badge(user, "adoption_driver") if has_adoption
    when :comment_upvoted
      award_badge(user, "community_builder") if user.idea_comments.count >= 20
    end
  end

  def self.award_badge(user, badge_key)
    UserBadge.find_or_create_by!(user: user, badge_key: badge_key) do |b|
      b.earned_at = Time.current
    end
  end
end
