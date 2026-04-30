import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { projectsApi } from '../shared/api'
import type { IncubatorProject, ProjectUpdate } from '../shared/types'
import { PageHeader } from '../shared/components/PageHeader'
import { ProjectStatusBadge } from '../shared/components/StatusBadge'

const MILESTONE_ICONS: Record<string, string> = {
  milestone: '🏁', blocker: '🚧', achievement: '🏆', general: '📝',
}

export function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [project, setProject] = useState<IncubatorProject | null>(null)
  const [updates, setUpdates] = useState<ProjectUpdate[]>([])
  const [newUpdate, setNewUpdate] = useState('')
  const [milestoneTag, setMilestoneTag] = useState('general')

  useEffect(() => {
    if (!id) return
    projectsApi.get(Number(id)).then(({ data }) => setProject(data))
    projectsApi.listUpdates(Number(id)).then(({ data }) => setUpdates(data))
  }, [id])

  const handleAddUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!project || !newUpdate.trim()) return
    const { data } = await projectsApi.addUpdate(project.id, { body: newUpdate, milestone_tag: milestoneTag })
    setUpdates((prev) => [data, ...prev])
    setNewUpdate('')
  }

  if (!project) return <div className="p-8 text-center text-[var(--color-text-secondary)]">กำลังโหลด...</div>

  return (
    <div>
      <PageHeader title={project.title} showBack />
      <div className="px-4 py-4 space-y-4">
        {/* Project info */}
        <div className="bg-[var(--color-bg-surface)] rounded-[var(--radius-card)] shadow-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <ProjectStatusBadge status={project.status} />
            <span className="text-xs text-[var(--color-text-secondary)]">👥 {project.member_count} คน</span>
          </div>
          {project.summary && <p className="text-sm text-[var(--color-text-secondary)]">{project.summary}</p>}
          {project.jira_board_url && (
            <a href={project.jira_board_url} target="_blank" rel="noopener noreferrer"
               className="inline-flex items-center gap-1 mt-3 text-xs text-[var(--color-primary)]">
              🔗 Jira Board
            </a>
          )}
        </div>

        {/* Post update */}
        <div className="bg-[var(--color-bg-surface)] rounded-[var(--radius-card)] shadow-card p-4">
          <h3 className="font-semibold mb-3">อัปเดตความคืบหน้า</h3>
          <form onSubmit={handleAddUpdate} className="space-y-2">
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
              value={newUpdate}
              onChange={(e) => setNewUpdate(e.target.value)}
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
        </div>

        {/* Timeline */}
        <div className="space-y-3">
          <h3 className="font-semibold">ความคืบหน้า</h3>
          {updates.map((u) => (
            <div key={u.id} className="bg-[var(--color-bg-surface)] rounded-[var(--radius-card)] shadow-card p-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-base">{MILESTONE_ICONS[u.milestone_tag ?? 'general']}</span>
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
    </div>
  )
}
