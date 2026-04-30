import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { projectsApi } from '../shared/api'
import type { IncubatorProject } from '../shared/types'
import { PageHeader } from '../shared/components/PageHeader'
import { ProjectStatusBadge } from '../shared/components/StatusBadge'

export function ProjectListPage() {
  const [projects, setProjects] = useState<IncubatorProject[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    projectsApi.list().then(({ data }) => setProjects(data)).finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <PageHeader title="Incubator Projects" />
      <div className="px-4 py-4 space-y-3">
        {loading ? (
          <div className="text-center py-12 text-[var(--color-text-secondary)]">กำลังโหลด...</div>
        ) : projects.length === 0 ? (
          <div className="text-center py-12 text-[var(--color-text-secondary)]">ยังไม่มีโปรเจค</div>
        ) : (
          projects.map((project) => (
            <div
              key={project.id}
              onClick={() => navigate(`/innovation/projects/${project.id}`)}
              className="bg-[var(--color-bg-surface)] rounded-[var(--radius-card)] shadow-card p-4 cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <ProjectStatusBadge status={project.status} />
                  <h3 className="font-semibold mt-1.5 leading-snug">{project.title}</h3>
                  {project.idea && (
                    <p className="text-xs text-[var(--color-text-secondary)] mt-1">จากไอเดีย: {project.idea.title}</p>
                  )}
                  <div className="flex items-center gap-3 mt-2 text-xs text-[var(--color-text-secondary)]">
                    <span>👥 {project.member_count} คน</span>
                    {project.owner && <span>🏆 {project.owner.name}</span>}
                  </div>
                </div>
                <span className="text-[var(--color-text-secondary)] text-lg">›</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
