import { useState, useEffect } from 'react'
import { communitiesApi, ideasApi } from '../shared/api'
import { PageHeader } from '../shared/components/PageHeader'
import { IdeaCard } from '../InnovationIdeas/IdeaCard'
import type { Community, Idea } from '../shared/types'

export function CommunityPage() {
  const [communities, setCommunities] = useState<Community[]>([])
  const [selected, setSelected] = useState<Community | null>(null)
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    communitiesApi.list().then(({ data }) => {
      setCommunities(data)
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    if (selected) {
      communitiesApi.ideas(selected.id).then(({ data }) => setIdeas(data))
    } else {
      ideasApi.list({ status: 'approved' }).then(({ data }) => setIdeas(data))
    }
  }, [selected])

  return (
    <div className="min-h-screen bg-[var(--color-bg-body)]">
      <PageHeader title="ชุมชน" />

      <div className="px-[var(--spacing-page-x)] py-4 space-y-4">
        {/* Community chips */}
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-[var(--spacing-page-x)] px-[var(--spacing-page-x)]">
          <button
            onClick={() => setSelected(null)}
            className={`flex-shrink-0 px-4 py-1.5 rounded-[var(--radius-tab)] text-sm font-medium transition-colors ${
              !selected
                ? 'bg-[var(--color-primary)] text-white'
                : 'bg-white text-[var(--color-text-primary)] border border-[var(--color-border)]'
            }`}
          >
            ทั้งหมด
          </button>
          {communities.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelected(c)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-[var(--radius-tab)] text-sm font-medium transition-colors ${
                selected?.id === c.id
                  ? 'bg-[var(--color-primary)] text-white'
                  : 'bg-white text-[var(--color-text-primary)] border border-[var(--color-border)]'
              }`}
            >
              {c.name}
              <span className="ml-1.5 text-xs opacity-70">{c.member_count.toLocaleString()}</span>
            </button>
          ))}
        </div>

        {/* Ideas */}
        {loading ? (
          <p className="text-center text-[var(--color-text-secondary)] py-12">กำลังโหลด...</p>
        ) : ideas.length === 0 ? (
          <p className="text-center text-[var(--color-text-secondary)] py-12">ยังไม่มีไอเดียในชุมชนนี้</p>
        ) : (
          <div className="space-y-[var(--spacing-gap-card)]">
            {ideas.map((idea) => (
              <IdeaCard key={idea.id} idea={idea} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
