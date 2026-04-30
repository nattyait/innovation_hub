import { useState, useEffect, useRef } from 'react'
import { projectsApi } from '../shared/api'
import type { ProjectDiscussion } from '../shared/types'
import { useAuth } from '../shared/hooks/useAuth'

interface Props {
  projectId: number
}

export function ProjectDiscussionBoard({ projectId }: Props) {
  const [discussions, setDiscussions] = useState<ProjectDiscussion[]>([])
  const [body, setBody] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const { user } = useAuth()

  useEffect(() => {
    projectsApi.listDiscussions(projectId).then(({ data }) => setDiscussions(data))
  }, [projectId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [discussions])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!body.trim()) return
    const { data } = await projectsApi.addDiscussion(projectId, body)
    setDiscussions((prev) => [...prev, data])
    setBody('')
  }

  const handleDelete = async (id: number) => {
    await projectsApi.deleteDiscussion(id)
    setDiscussions((prev) => prev.filter((d) => d.id !== id))
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide">
        Discussion ({discussions.length})
      </p>

      <div className="space-y-3 max-h-80 overflow-y-auto">
        {discussions.length === 0 && (
          <p className="text-center text-sm text-[var(--color-text-secondary)] py-4">
            ยังไม่มีการพูดคุย — เป็นคนแรกที่เริ่ม!
          </p>
        )}
        {discussions.map((d) => (
          <div key={d.id} className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-[var(--color-bg-badge)] flex items-center justify-center text-sm shrink-0 font-medium">
              {d.user.name[0]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium">{d.user.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[var(--color-text-secondary)]">
                    {new Date(d.created_at).toLocaleDateString('th-TH')}
                  </span>
                  {user && (user.id === d.user.id || user.role === 'admin') && (
                    <button onClick={() => handleDelete(d.id)} className="text-xs text-red-400">ลบ</button>
                  )}
                </div>
              </div>
              <p className="text-sm mt-0.5 break-words">{d.body}</p>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2 pt-2 border-t border-[var(--color-border)]">
        <input
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="พูดคุยเกี่ยวกับโปรเจคนี้..."
          className="flex-1 border border-[var(--color-border-input)] rounded-[var(--radius-input)] px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)]"
        />
        <button
          type="submit"
          className="bg-[var(--color-primary)] text-white rounded-[var(--radius-button)] px-4 py-2 text-sm font-medium shadow-btn"
        >
          ส่ง
        </button>
      </form>
    </div>
  )
}
