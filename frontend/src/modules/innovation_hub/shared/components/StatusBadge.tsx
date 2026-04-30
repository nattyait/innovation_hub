import type { IdeaStatus } from '../types'

const IDEA_COLORS: Record<IdeaStatus, string> = {
  draft:        'bg-gray-100 text-gray-500',
  submitted:    'bg-yellow-50 text-yellow-600',
  under_review: 'bg-orange-50 text-orange-500',
  approved:     'bg-green-50 text-green-600',
  declined:     'bg-red-50 text-red-500',
  returned:     'bg-amber-50 text-amber-600',
}

const IDEA_LABELS: Record<IdeaStatus, string> = {
  draft:        'ร่าง',
  submitted:    'รอพิจารณา',
  under_review: 'กำลังพิจารณา',
  approved:     'อนุมัติแล้ว',
  declined:     'ไม่ผ่าน',
  returned:     'ส่งคืนแก้ไข',
}

export function IdeaStatusBadge({ status }: { status: IdeaStatus }) {
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${IDEA_COLORS[status] ?? 'bg-gray-100 text-gray-500'}`}>
      {IDEA_LABELS[status] ?? status}
    </span>
  )
}
