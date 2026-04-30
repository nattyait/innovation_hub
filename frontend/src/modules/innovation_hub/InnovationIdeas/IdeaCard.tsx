import { useNavigate } from 'react-router-dom'
import type { Idea } from '../shared/types'
import { HeartButton } from '../shared/components/HeartButton'
import { IdeaStatusBadge } from '../shared/components/StatusBadge'
import { ideasApi } from '../shared/api'

interface Props {
  idea: Idea
  remainingHearts?: number
  onHeartToggle?: (id: number, heart_count: number, hearted: boolean, heart_id: number | null, remaining_hearts: number) => void
}

export function IdeaCard({ idea, remainingHearts = 0, onHeartToggle }: Props) {
  const navigate = useNavigate()

  const handleHeart = async () => {
    try {
      if (idea.hearted && idea.heart_id) {
        const { data } = await ideasApi.removeHeart(idea.heart_id)
        onHeartToggle?.(idea.id, data.heart_count, false, null, data.remaining_hearts)
      } else if (!idea.hearted && remainingHearts > 0) {
        const { data } = await ideasApi.giveHeart(idea.id)
        onHeartToggle?.(idea.id, data.heart_count, true, data.heart_id, data.remaining_hearts)
      }
    } catch { /* handled by interceptor */ }
  }

  const canHeart = idea.hearted || remainingHearts > 0

  return (
    <div
      onClick={() => navigate(`/innovation/ideas/${idea.id}`)}
      className="bg-[var(--color-bg-surface)] rounded-[var(--radius-card)] shadow-card p-4 cursor-pointer active:scale-[0.99] transition-transform"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <IdeaStatusBadge status={idea.status} />
            {idea.category && <span className="text-xs text-[var(--color-text-secondary)]">{idea.category}</span>}
          </div>
          <h3 className="font-semibold text-base leading-snug line-clamp-2">{idea.title}</h3>
          <div className="flex items-center gap-3 mt-2">
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-full bg-[var(--color-bg-badge)] flex items-center justify-center text-xs">{idea.author.name[0]}</div>
              <span className="text-xs text-[var(--color-text-secondary)]">{idea.author.name}</span>
            </div>
            {idea.application_count > 0 && (
              <span className="text-xs text-green-600">🚀 {idea.application_count}</span>
            )}
            {idea.communities.length > 0 && (
              <span className="text-xs text-[var(--color-text-secondary)] truncate">{idea.communities[0].name}</span>
            )}
          </div>
        </div>
        {idea.status === 'approved' && (
          <HeartButton hearted={idea.hearted} count={idea.heart_count} onClick={handleHeart} disabled={!canHeart} />
        )}
      </div>
      {idea.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {idea.tags.map((tag) => (
            <span key={tag} className="bg-[var(--color-bg-badge)] text-[var(--color-primary)] text-xs px-2 py-0.5 rounded-full">#{tag}</span>
          ))}
        </div>
      )}
    </div>
  )
}
