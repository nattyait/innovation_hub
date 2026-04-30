export type Role = 'employee' | 'manager' | 'admin' | 'sponsor'

export interface User {
  id: number
  name: string
  email: string
  role: Role
  avatar_url: string | null
  remaining_hearts: number
  total_points: number
}

export type IdeaStatus = 'draft' | 'submitted' | 'under_review' | 'approved' | 'declined' | 'returned'
export type IdeaCategory = 'product' | 'process' | 'technology' | 'culture' | 'customer' | 'other'
export type ImpactType = 'time' | 'cost' | 'people' | 'process' | 'other'
export type BadgeKey =
  | 'first_idea' | 'approved_innovator' | 'trendsetter' | 'serial_innovator'
  | 'impact_maker' | 'adoption_driver' | 'community_builder' | 'top_contributor'
export type LeaderboardCategory =
  | 'top_innovator' | 'impact_champion' | 'community_catalyst'
  | 'idea_adopter' | 'rising_star'
export type LeaderboardPeriod = 'month' | 'quarter' | 'all'

export interface Community {
  id: number
  external_id: string
  name: string
  description: string | null
  member_count: number
  avatar_url: string | null
}

export interface Idea {
  id: number
  title: string
  body?: string
  category: IdeaCategory
  status: IdeaStatus
  tags: string[]
  heart_count: number
  hearted: boolean
  heart_id: number | null
  comment_count: number
  application_count: number
  return_reason?: string | null
  author: { id: number; name: string; avatar_url: string | null }
  approver?: { id: number; name: string } | null
  communities: Pick<Community, 'id' | 'name'>[]
  created_at: string
}

export interface IdeaComment {
  id: number
  body: string
  upvote_count: number
  upvoted: boolean
  user: { id: number; name: string; avatar_url: string | null }
  created_at: string
}

export interface IdeaApplication {
  id: number
  idea_id: number
  department: string | null
  description: string
  applied_by: { id: number; name: string; avatar_url: string | null }
  impact?: IdeaImpact | null
  created_at: string
}

export interface IdeaImpact {
  id: number
  people_affected: number
  time_saved_hours: number | null
  cost_saved_thb: number | null
  impact_type: ImpactType
  description: string
  evidence_url: string | null
  reported_by: { id: number; name: string; avatar_url: string | null }
  created_at: string
}

export interface UserBadge {
  badge_key: BadgeKey
  earned_at: string
}

export interface LeaderboardEntry {
  rank: number
  user: { id: number; name: string; avatar_url: string | null }
  score: number
  badges: BadgeKey[]
}

export interface Notification {
  id: number
  kind:
    | 'idea_approved' | 'idea_declined' | 'idea_returned'
    | 'idea_applied'  | 'idea_impacted' | 'idea_pending_approval'
  read: boolean
  notifiable_type: string
  notifiable_id: number
  created_at: string
}
