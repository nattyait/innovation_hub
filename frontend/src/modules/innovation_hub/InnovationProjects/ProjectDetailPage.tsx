import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { projectsApi } from '../shared/api'
import { PageHeader } from '../shared/components/PageHeader'
import { SegmentedTabs } from '../shared/components/SegmentedTabs'
import type { InnovationProject } from '../shared/types'
import { ProjectInfoTab } from './tabs/ProjectInfoTab'
import { ProjectDiscussionTab } from './tabs/ProjectDiscussionTab'
import { ProjectDeploymentTab } from './tabs/ProjectDeploymentTab'
import { useAuth } from '../shared/hooks/useAuth'

type Tab = 'info' | 'discussion' | 'deployment'

const TABS = [
  { label: 'รายละเอียด', value: 'info' as Tab },
  { label: 'Discussion', value: 'discussion' as Tab },
  { label: 'การส่งต่อ', value: 'deployment' as Tab },
]

export function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const [project, setProject] = useState<InnovationProject | null>(null)
  const [tab, setTab] = useState<Tab>('info')

  useEffect(() => {
    if (!id) return
    projectsApi.get(Number(id)).then(({ data }) => setProject(data))
  }, [id])

  if (!project) return <div className="p-8 text-center text-[var(--color-text-secondary)]">กำลังโหลด...</div>

  const isMember = project.members.some((m) => m.user.id === user?.id)
  const isSponsor = user?.role === 'sponsor'
  const canEdit = isMember || isSponsor || user?.role === 'admin'

  return (
    <div className="min-h-screen bg-[var(--color-bg-body)]">
      <div className="gradient-header px-4 pt-12 pb-4">
        <PageHeader title="" showBack />
        <h1 className="text-xl font-bold text-[var(--color-text-primary)] mb-3 mt-1 leading-snug">{project.title}</h1>
        <SegmentedTabs tabs={TABS} active={tab} onChange={(v) => setTab(v as Tab)} />
      </div>

      <div className="px-4 py-4">
        {tab === 'info' && (
          <ProjectInfoTab project={project} canEdit={canEdit} onUpdated={setProject} />
        )}
        {tab === 'discussion' && (
          <ProjectDiscussionTab projectId={project.id} />
        )}
        {tab === 'deployment' && (
          <ProjectDeploymentTab projectId={project.id} isSponsor={isSponsor} />
        )}
      </div>
    </div>
  )
}
