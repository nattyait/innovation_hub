import { useState, useEffect } from 'react'
import { projectsApi } from '../shared/api'
import type { ProjectUpdate, IncubatorProjectSummary } from '../shared/types'
import { ProjectStatusBadge } from '../shared/components/StatusBadge'

const MILESTONE_ICONS: Record<string, string> = {
  milestone: '🏁', blocker: '🚧', achievement: '🏆', general: '📝',
}

interface Props {
  project: IncubatorProjectSummary
  projectId: number
  isMember: boolean
}

export function ProjectUpdatesTab({ project, projectId, isMember }: Props) {
  const [updates, setUpdates] = useState<ProjectUpdate[]>([])
  const [newBody, setNewBody] = useState('')
  const [milestoneTag, setMilestoneTag] = useState('general')

  useEffect(() => {
    projectsApi.listUpdates(projectId).then(({ data }) => setUpdates(data))
  }, [projectId])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newBody.trim()) return
    const { data } = await projectsApi.addUpdate(projectId, { body: newBody, milestone_tag: milestoneTag })
    setUpdates((prev) => [data, ...prev])
    setNewBody('')
  }

  return (
    <div className="space-y-4">
      {/* Project summary */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <ProjectStatusBadge status={project.status} />
          <span className="text-xs text-[var(--color-text-secondary)]">👥 {project.member_count} คน</span>
        </div>
        {project.summary && (
          <p className="text-sm text-[var(--color-text-secondary)]">{project.summary}</p>
        )}
        {project.jira_board_url && (
          <a href={project.jira_board_url} target="_blank" rel="noopener noreferrer"
             className="inline-flex items-center gap-1 text-xs text-[var(--color-primary)]">
            🔗 Jira Board
          </a>
        )}
      </div>

      <hr className="border-[var(--color-border)]" />

      {/* Post update — only for project members */}
      {isMember && (
        <form onSubmit={handleAdd} className="space-y-2">
          <p className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide">โพสต์ความคืบหน้า</p>
          <select
            value={milestoneTag}
            onChange={(e) => setMilestoneTag(e.target.value)}
            className="w-full border border-[var(--color-border-input)] rounded-[var(--radius-input)] px-3 py-2 text-sm bg-white outline-none"
          >
            <option value="general">📝 ทั่วไป</option>
            <option value="milestone">🏁 Milestone</option>
            <option value="achievement">🏆 ความสำเร็จ</option>
            <option value="blocker">🚧 Blocker</option>
          </select>
          <textarea
            rows={3}
            value={newBody}
            onChange={(e) => setNewBody(e.target.value)}
            placeholder="อธิบายความคืบหน้า..."
            className="w-full border border-[var(--color-border-input)] rounded-[var(--radius-input)] px-3 py-2.5 text-sm outline-none focus:border-[var(--color-primary)] resize-none"
          />
          <button
            type="submit"
            className="w-full bg-[var(--color-primary)] text-white rounded-[var(--radius-button)] py-2.5 font-semibold shadow-btn"
          >
            โพสต์อัปเดต
          </button>
        </form>
      )}

      {/* Timeline */}
      <div className="space-y-3">
        {updates.length === 0 && (
          <p className="text-center text-sm text-[var(--color-text-secondary)] py-4">ยังไม่มีการอัปเดต</p>
        )}
        {updates.map((u) => (
          <div key={u.id} className="border-l-2 border-[var(--color-border)] pl-3">
            <div className="flex items-center gap-2 mb-0.5">
              <span>{MILESTONE_ICONS[u.milestone_tag ?? 'general']}</span>
              <span className="text-xs font-medium">{u.user.name}</span>
              <span className="text-xs text-[var(--color-text-secondary)]">
                {new Date(u.created_at).toLocaleDateString('th-TH')}
              </span>
            </div>
            <p className="text-sm">{u.body}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
