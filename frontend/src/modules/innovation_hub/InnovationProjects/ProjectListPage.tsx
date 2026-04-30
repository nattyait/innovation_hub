import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { projectsApi } from '../shared/api'
import { SegmentedTabs } from '../shared/components/SegmentedTabs'
import type { InnovationProjectSummary, SponsorDashboardProject, DeploymentStatus } from '../shared/types'
import { useAuth } from '../shared/hooks/useAuth'

const STATUS_LABELS: Record<string, string> = {
  planning: 'วางแผน', active: 'ดำเนินการ', completed: 'เสร็จสิ้น', on_hold: 'พักไว้',
}
const STATUS_COLORS: Record<string, string> = {
  planning: 'bg-yellow-50 text-yellow-700', active: 'bg-green-50 text-green-700',
  completed: 'bg-gray-100 text-gray-600', on_hold: 'bg-orange-50 text-orange-600',
}
const DEP_STATUS_LABELS: Record<DeploymentStatus, string> = {
  not_started: 'ยังไม่ได้ใช้', adopted: 'นำไปใช้แล้ว',
  adapted: 'นำไปปรับใช้', not_adopted: 'ไม่ได้นำไปใช้',
}
const DEP_STATUS_COLORS: Record<DeploymentStatus, string> = {
  not_started: 'bg-gray-100 text-gray-500', adopted: 'bg-green-50 text-green-700',
  adapted: 'bg-blue-50 text-blue-700', not_adopted: 'bg-red-50 text-red-500',
}

export function ProjectListPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const isSponsor = user?.role === 'sponsor'

  const [tab, setTab] = useState<'all' | 'mine'>('all')
  const [projects, setProjects] = useState<InnovationProjectSummary[]>([])
  const [dashboard, setDashboard] = useState<SponsorDashboardProject[]>([])
  const [loading, setLoading] = useState(true)

  const TABS = [
    { label: 'โปรเจคทั้งหมด', value: 'all' as const },
    ...(isSponsor ? [{ label: 'Dashboard ของฉัน', value: 'mine' as const }] : []),
  ]

  useEffect(() => {
    if (tab === 'all') {
      setLoading(true)
      projectsApi.list().then(({ data }) => { setProjects(data); setLoading(false) })
    } else {
      setLoading(true)
      projectsApi.sponsorDashboard().then(({ data }) => { setDashboard(data); setLoading(false) })
    }
  }, [tab])

  return (
    <div className="min-h-screen bg-[var(--color-bg-body)]">
      <div className="gradient-header px-4 pt-12 pb-4">
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)] mb-3">Innovation Projects</h1>
        {TABS.length > 1 && (
          <SegmentedTabs tabs={TABS} active={tab} onChange={(v) => setTab(v as typeof tab)} />
        )}
      </div>

      <div className="px-4 py-4">
        {loading ? (
          <p className="text-center py-16 text-[var(--color-text-secondary)]">กำลังโหลด...</p>
        ) : tab === 'all' ? (
          projects.length === 0 ? (
            <p className="text-center py-16 text-[var(--color-text-secondary)]">ยังไม่มี Innovation Project</p>
          ) : (
            <div className="space-y-[var(--spacing-gap-card)]">
              {projects.map((p) => (
                <div key={p.id} onClick={() => navigate(`/innovation/projects/${p.id}`)}
                  className="bg-[var(--color-bg-surface)] rounded-[var(--radius-card)] shadow-card p-4 cursor-pointer active:scale-[0.99] transition-transform">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[p.status]}`}>
                        {STATUS_LABELS[p.status]}
                      </span>
                      <h3 className="font-semibold text-base mt-1.5 leading-snug">{p.title}</h3>
                      {p.department && <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">{p.department}</p>}
                      {p.summary && <p className="text-sm text-[var(--color-text-secondary)] mt-1 line-clamp-2">{p.summary}</p>}
                    </div>
                  </div>
                  <div className="flex gap-4 mt-3 pt-3 border-t border-[var(--color-border)]">
                    <span className="text-xs text-[var(--color-text-secondary)]">💡 {p.idea.title.slice(0, 24)}…</span>
                    <span className="text-xs text-[var(--color-text-secondary)]">👥 {p.member_count}</span>
                    <span className="text-xs text-[var(--color-text-secondary)]">🏢 {p.deployment_count} หน่วยงาน</span>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          /* Sponsor Dashboard */
          dashboard.length === 0 ? (
            <p className="text-center py-16 text-[var(--color-text-secondary)]">ยังไม่มี Innovation Project ที่รับผิดชอบ</p>
          ) : (
            <div className="space-y-4">
              {dashboard.map((p) => (
                <div key={p.id} className="bg-[var(--color-bg-surface)] rounded-[var(--radius-card)] shadow-card overflow-hidden">
                  <div className="p-4 flex items-center justify-between cursor-pointer"
                    onClick={() => navigate(`/innovation/projects/${p.id}`)}>
                    <div>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[p.status]}`}>
                        {STATUS_LABELS[p.status]}
                      </span>
                      <h3 className="font-semibold text-sm mt-1">{p.title}</h3>
                      <p className="text-xs text-[var(--color-text-secondary)]">💡 {p.idea.title.slice(0, 30)}…</p>
                    </div>
                    <span className="text-[var(--color-text-secondary)]">›</span>
                  </div>
                  {p.deployments.length > 0 && (
                    <div className="border-t border-[var(--color-border)] px-4 pb-3">
                      <p className="text-xs font-medium text-[var(--color-text-secondary)] mt-2 mb-2">หน่วยงานที่ Assign</p>
                      <div className="space-y-1.5">
                        {p.deployments.map((d) => (
                          <div key={d.id} className="flex items-center justify-between text-xs">
                            <span className="text-[var(--color-text-primary)] font-medium">{d.department_name}</span>
                            <div className="flex items-center gap-2">
                              {d.overdue && <span className="text-red-500 font-medium">เกินกำหนด</span>}
                              <span className={`px-2 py-0.5 rounded-full ${DEP_STATUS_COLORS[d.status as DeploymentStatus]}`}>
                                {DEP_STATUS_LABELS[d.status as DeploymentStatus]}
                              </span>
                              {d.has_impact && <span className="text-green-600">📊</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  )
}
