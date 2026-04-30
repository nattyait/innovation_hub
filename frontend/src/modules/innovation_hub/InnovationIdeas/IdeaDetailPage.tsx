import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ideasApi } from '../shared/api'
import type { Idea } from '../shared/types'
import { PageHeader } from '../shared/components/PageHeader'
import { IdeaStatusBadge } from '../shared/components/StatusBadge'
import { HeartButton } from '../shared/components/HeartButton'
import { SegmentedTabs } from '../shared/components/SegmentedTabs'
import { ProjectUpdatesTab } from '../IncubatorProjects/ProjectUpdatesTab'
import { ProjectDiscussionBoard } from '../IncubatorProjects/ProjectDiscussionBoard'
import { useAuth } from '../shared/hooks/useAuth'

const INCUBATION_TABS = [
  { label: 'รายละเอียดโปรเจค', value: 'updates' as const },
  { label: 'Discussion',       value: 'discussion' as const },
]

export function IdeaDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [idea, setIdea] = useState<Idea | null>(null)
  const [comments, setComments] = useState<any[]>([])
  const [commentBody, setCommentBody] = useState('')
  const [incubationTab, setIncubationTab] = useState<'updates' | 'discussion'>('updates')
  const [remainingHearts, setRemainingHearts] = useState(user?.remaining_hearts ?? 0)

  useEffect(() => {
    if (!id) return
    ideasApi.get(Number(id)).then(({ data }) => setIdea(data))
    ideasApi.listComments(Number(id)).then(({ data }) => setComments(data))
  }, [id])

  useEffect(() => {
    if (user) setRemainingHearts(user.remaining_hearts)
  }, [user])

  const isAuthor = user && idea && idea.author.id === user.id

  /* --- Heart --- */
  const handleHeart = async () => {
    if (!idea) return
    try {
      if (idea.hearted && idea.heart_id) {
        const { data } = await ideasApi.removeHeart(idea.heart_id)
        setIdea((prev) => prev ? { ...prev, hearted: false, heart_id: null, heart_count: data.heart_count } : prev)
        setRemainingHearts(data.remaining_hearts)
      } else if (!idea.hearted && remainingHearts > 0) {
        const { data } = await ideasApi.giveHeart(idea.id)
        setIdea((prev) => prev ? { ...prev, hearted: true, heart_id: data.heart_id, heart_count: data.heart_count } : prev)
        setRemainingHearts(data.remaining_hearts)
      }
    } catch { /* handled by interceptor */ }
  }

  /* --- Publish / Retract --- */
  const handlePublish = async () => {
    if (!idea) return
    const { data } = await ideasApi.changeStatus(idea.id, 'pending_review')
    setIdea(data)
  }

  const handleRetract = async () => {
    if (!idea) return
    const { data } = await ideasApi.changeStatus(idea.id, 'draft')
    setIdea(data)
  }

  /* --- Comment --- */
  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!idea || !commentBody.trim()) return
    const { data } = await ideasApi.addComment(idea.id, commentBody)
    setComments((prev) => [...prev, data])
    setCommentBody('')
  }

  if (!idea) return <div className="p-8 text-center text-[var(--color-text-secondary)]">กำลังโหลด...</div>

  const canHeart = idea.hearted || remainingHearts > 0

  return (
    <div>
      <PageHeader title="" showBack />

      <div className="px-4 py-4 space-y-4">
        {/* Idea card */}
        <div className="bg-[var(--color-bg-surface)] rounded-[var(--radius-card)] shadow-card p-4">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <IdeaStatusBadge status={idea.status} />
            {idea.category && <span className="text-xs text-[var(--color-text-secondary)]">{idea.category}</span>}
          </div>
          <h2 className="text-xl font-bold leading-snug">{idea.title}</h2>
          <p className="mt-3 text-sm leading-relaxed text-[var(--color-text-secondary)]">{idea.body}</p>

          {idea.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {idea.tags.map((tag) => (
                <span key={tag} className="bg-[var(--color-bg-badge)] text-[var(--color-primary)] text-xs px-2 py-0.5 rounded-full">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between mt-4 pt-3 border-t border-[var(--color-border)] flex-wrap gap-2">
            <span className="text-xs text-[var(--color-text-secondary)]">โดย {idea.author.name}</span>

            <div className="flex items-center gap-2">
              {/* Publish / Retract buttons for author */}
              {isAuthor && idea.status === 'draft' && (
                <button
                  onClick={handlePublish}
                  className="bg-[var(--color-primary)] text-white text-xs font-medium px-3 py-1.5 rounded-[var(--radius-button)] shadow-btn"
                >
                  เสนอเพื่อพิจารณา
                </button>
              )}
              {isAuthor && idea.status === 'pending_review' && (
                <button
                  onClick={handleRetract}
                  className="border border-[var(--color-border-input)] text-[var(--color-text-secondary)] text-xs font-medium px-3 py-1.5 rounded-[var(--radius-button)]"
                >
                  ดึงกลับเป็นร่าง
                </button>
              )}
              {isAuthor && (idea.status === 'draft' || idea.status === 'pending_review') && (
                <button
                  onClick={() => navigate(`/innovation/ideas/${idea.id}/edit`)}
                  className="border border-[var(--color-border-input)] text-[var(--color-text-secondary)] text-xs font-medium px-3 py-1.5 rounded-[var(--radius-button)]"
                >
                  แก้ไข
                </button>
              )}

              {/* Heart button for approved ideas */}
              {idea.status === 'approved' && (
                <HeartButton
                  hearted={idea.hearted}
                  count={idea.heart_count}
                  onClick={handleHeart}
                  disabled={!canHeart}
                />
              )}
            </div>
          </div>

          {/* Quota warning */}
          {idea.status === 'approved' && !idea.hearted && remainingHearts === 0 && (
            <p className="mt-2 text-xs text-orange-500 text-right">หัวใจหมดแล้วในรอบนี้</p>
          )}
        </div>

        {/* Incubating project section */}
        {idea.status === 'incubating' && idea.incubator_project && (
          <div className="bg-[var(--color-bg-surface)] rounded-[var(--radius-card)] shadow-card overflow-hidden">
            <div className="px-4 pt-4">
              <SegmentedTabs tabs={INCUBATION_TABS} active={incubationTab} onChange={setIncubationTab} />
            </div>
            <div className="p-4">
              {incubationTab === 'updates' ? (
                <ProjectUpdatesTab
                  project={idea.incubator_project}
                  projectId={idea.incubator_project.id}
                  isMember={idea.incubator_project.is_member}
                />
              ) : (
                <ProjectDiscussionBoard
                  projectId={idea.incubator_project.id}
                />
              )}
            </div>
          </div>
        )}

        {/* Comments (non-incubating ideas) */}
        {idea.status !== 'incubating' && (
          <div className="bg-[var(--color-bg-surface)] rounded-[var(--radius-card)] shadow-card p-4">
            <h3 className="font-semibold mb-3">ความคิดเห็น ({comments.length})</h3>
            <div className="space-y-3 mb-4">
              {comments.map((c: any) => (
                <div key={c.id} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-[var(--color-bg-badge)] flex items-center justify-center text-sm shrink-0">
                    {c.user.name[0]}
                  </div>
                  <div>
                    <p className="text-xs font-medium">{c.user.name}</p>
                    <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">{c.body}</p>
                  </div>
                </div>
              ))}
            </div>
            <form onSubmit={handleComment} className="flex gap-2">
              <input
                value={commentBody}
                onChange={(e) => setCommentBody(e.target.value)}
                placeholder="แสดงความคิดเห็น..."
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
        )}
      </div>
    </div>
  )
}
