export type Role = 'employee' | 'admin' | 'sponsor' | 'project_owner'

export interface User {
  id: number
  name: string
  email: string
  role: Role
  avatar_url: string | null
  remaining_hearts: number
}

export type IdeaStatus = 'draft' | 'pending_review' | 'approved' | 'declined' | 'incubating'
export type IdeaCategory = 'product' | 'process' | 'technology' | 'culture' | 'customer' | 'other'

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
  author: { id: number; name: string; avatar_url: string | null }
  created_at: string
  incubator_project?: IncubatorProjectSummary | null
}

export interface IncubatorProjectSummary {
  id: number
  title: string
  status: ProjectStatus
  summary: string | null
  jira_board_url: string | null
  jira_project_key: string | null
  member_count: number
  is_member: boolean
  owner: { id: number; name: string; avatar_url: string | null } | null
}

export type ProjectStatus = 'discovery' | 'mvp' | 'pilot' | 'scaling' | 'completed' | 'on_hold'
export type MilestoneTag = 'general' | 'milestone' | 'blocker' | 'achievement'

export interface IncubatorProject {
  id: number
  title: string
  status: ProjectStatus
  summary?: string
  member_count: number
  owner: { id: number; name: string; avatar_url: string | null } | null
  idea: { id: number; title: string } | null
  jira_board_url?: string
  jira?: { open_issues: number | null; current_sprint: string | null }
  members?: { id: number; name: string; avatar_url: string | null }[]
  created_at: string
}

export interface ProjectUpdate {
  id: number
  body: string
  milestone_tag: MilestoneTag | null
  user: { id: number; name: string; avatar_url: string | null }
  created_at: string
}

export interface ProjectDiscussion {
  id: number
  body: string
  user: { id: number; name: string; avatar_url: string | null }
  created_at: string
}

export interface ClassroomCourse {
  id: number
  title: string
  description: string
  thumbnail_url: string | null
  deep_link_url: string
  category: string
  duration_minutes: number
}

export interface Notification {
  id: number
  kind: 'idea_approved' | 'idea_incubating'
  read: boolean
  notifiable_type: string
  notifiable_id: number
  created_at: string
}
