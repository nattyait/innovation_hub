import type { IdeaStatus, ProjectStatus } from '../types'

const IDEA_COLORS: Record<IdeaStatus, string> = {
  draft:          'bg-gray-100 text-gray-500',
  pending_review: 'bg-yellow-50 text-yellow-600',
  approved:       'bg-green-50 text-green-600',
  declined:       'bg-red-50 text-red-500',
  incubating:     'bg-blue-50 text-[var(--color-primary)]',
}

const IDEA_LABELS: Record<IdeaStatus, string> = {
  draft:          'ร่าง',
  pending_review: 'รอพิจารณา',
  approved:       'อนุมัติแล้ว',
  declined:       'ไม่ผ่าน',
  incubating:     'กำลัง Incubate',
}

const PROJECT_COLORS: Record<ProjectStatus, string> = {
  discovery: 'bg-purple-50 text-purple-600',
  mvp:       'bg-blue-50 text-blue-600',
  pilot:     'bg-cyan-50 text-cyan-600',
  scaling:   'bg-green-50 text-green-600',
  completed: 'bg-gray-100 text-gray-500',
  on_hold:   'bg-orange-50 text-orange-500',
}

export function IdeaStatusBadge({ status }: { status: IdeaStatus }) {
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${IDEA_COLORS[status]}`}>
      {IDEA_LABELS[status]}
    </span>
  )
}

export function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium uppercase tracking-wide ${PROJECT_COLORS[status]}`}>
      {status.replace('_', ' ')}
    </span>
  )
}
