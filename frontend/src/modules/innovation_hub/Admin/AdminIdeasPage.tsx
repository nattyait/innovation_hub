import { useState, useEffect } from 'react'
import { client } from '../shared/api'
import type { Idea, IdeaStatus } from '../shared/types'
import { PageHeader } from '../shared/components/PageHeader'
import { IdeaStatusBadge } from '../shared/components/StatusBadge'

const STATUS_ACTIONS: { label: string; status: IdeaStatus; color: string }[] = [
  { label: 'อนุมัติ', status: 'approved', color: 'text-green-600' },
  { label: 'ปฏิเสธ', status: 'declined', color: 'text-red-500' },
  { label: 'Incubate', status: 'incubating', color: 'text-[var(--color-primary)]' },
]

export function AdminIdeasPage() {
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [filter, setFilter] = useState<IdeaStatus | ''>('pending_review')

  useEffect(() => {
    client.get('/admin/ideas', { params: { status: filter || undefined } })
      .then(({ data }) => setIdeas(data))
  }, [filter])

  const changeStatus = async (id: number, status: IdeaStatus) => {
    await client.patch(`/ideas/${id}/change_status`, { status })
    setIdeas((prev) => prev.filter((i) => i.id !== id))
  }

  const deleteIdea = async (id: number) => {
    if (!confirm('ลบไอเดียนี้?')) return
    await client.delete(`/admin/ideas/${id}`)
    setIdeas((prev) => prev.filter((i) => i.id !== id))
  }

  return (
    <div>
      <PageHeader title="Admin — จัดการไอเดีย" showBack />
      <div className="px-4 py-4 space-y-3">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as IdeaStatus | '')}
          className="w-full border border-[var(--color-border-input)] rounded-[var(--radius-input)] px-3 py-2 text-sm bg-white outline-none"
        >
          <option value="">ทั้งหมด</option>
          <option value="pending_review">รอพิจารณา</option>
          <option value="approved">อนุมัติแล้ว</option>
          <option value="declined">ปฏิเสธ</option>
          <option value="incubating">กำลัง Incubate</option>
        </select>

        {ideas.map((idea) => (
          <div key={idea.id} className="bg-[var(--color-bg-surface)] rounded-[var(--radius-card)] shadow-card p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <IdeaStatusBadge status={idea.status} />
                <p className="font-semibold mt-1 text-sm leading-snug">{idea.title}</p>
                <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">โดย {idea.author.name} • ❤️ {idea.heart_count}</p>
              </div>
              <button onClick={() => deleteIdea(idea.id)} className="text-red-400 text-lg ml-2">🗑</button>
            </div>
            <div className="flex gap-3 mt-3 pt-3 border-t border-[var(--color-border)]">
              {STATUS_ACTIONS.map(({ label, status, color }) => (
                <button
                  key={status}
                  onClick={() => changeStatus(idea.id, status)}
                  className={`text-sm font-medium ${color}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        ))}
        {ideas.length === 0 && (
          <p className="text-center py-12 text-[var(--color-text-secondary)]">ไม่มีไอเดียในสถานะนี้</p>
        )}
      </div>
    </div>
  )
}
