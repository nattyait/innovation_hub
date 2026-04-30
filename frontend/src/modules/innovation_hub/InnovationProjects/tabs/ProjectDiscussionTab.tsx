import { useState, useEffect } from 'react'
import { projectsApi } from '../../shared/api'
import type { ProjectTopic, ProjectTopicDetail, ProjectTopicComment } from '../../shared/types'
import { useAuth } from '../../shared/hooks/useAuth'

interface Props { projectId: number }

export function ProjectDiscussionTab({ projectId }: Props) {
  useAuth()
  const [topics, setTopics] = useState<ProjectTopic[]>([])
  const [activeTopic, setActiveTopic] = useState<ProjectTopicDetail | null>(null)
  const [showNewTopic, setShowNewTopic] = useState(false)
  const [newTopic, setNewTopic] = useState({ title: '', body: '' })
  const [commentBody, setCommentBody] = useState('')
  const [replyTo, setReplyTo] = useState<{ id: number; name: string } | null>(null)

  useEffect(() => {
    projectsApi.listTopics(projectId).then(({ data }) => setTopics(data))
  }, [projectId])

  const openTopic = async (t: ProjectTopic) => {
    const { data } = await projectsApi.getTopic(projectId, t.id)
    setActiveTopic(data)
  }

  const handleCreateTopic = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTopic.title.trim() || !newTopic.body.trim()) return
    const { data } = await projectsApi.createTopic(projectId, newTopic)
    setTopics((p) => [data, ...p])
    setNewTopic({ title: '', body: '' })
    setShowNewTopic(false)
  }

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeTopic || !commentBody.trim()) return
    const { data } = await projectsApi.addComment(projectId, activeTopic.id, commentBody, replyTo?.id)
    if (replyTo) {
      setActiveTopic((p) => p ? {
        ...p,
        comments: p.comments.map((c) =>
          c.id === replyTo.id ? { ...c, replies: [...c.replies, data] } : c
        )
      } : p)
    } else {
      setActiveTopic((p) => p ? { ...p, comments: [...p.comments, data] } : p)
      setTopics((p) => p.map((t) => t.id === activeTopic.id ? { ...t, comment_count: t.comment_count + 1 } : t))
    }
    setCommentBody('')
    setReplyTo(null)
  }

  if (activeTopic) {
    return (
      <div className="space-y-4">
        <button onClick={() => setActiveTopic(null)}
          className="flex items-center gap-1 text-sm text-[var(--color-primary)]">
          ← กลับรายการ topic
        </button>

        <div className="bg-[var(--color-bg-surface)] rounded-[var(--radius-card)] shadow-card p-4">
          <h3 className="font-bold text-base">{activeTopic.title}</h3>
          <p className="text-sm text-[var(--color-text-secondary)] mt-2 leading-relaxed">{activeTopic.body}</p>
          <p className="text-xs text-[var(--color-text-secondary)] mt-2">โดย {activeTopic.author.name}</p>
        </div>

        {/* Comments */}
        <div className="bg-[var(--color-bg-surface)] rounded-[var(--radius-card)] shadow-card p-4 space-y-4">
          <h4 className="font-semibold text-sm">ความคิดเห็น ({activeTopic.comments.length})</h4>
          {activeTopic.comments.map((c) => (
            <CommentItem key={c.id} comment={c} onReply={(id, name) => { setReplyTo({ id, name }); setCommentBody('') }} />
          ))}

          {replyTo && (
            <div className="text-xs text-[var(--color-primary)] bg-blue-50 rounded px-3 py-1.5 flex items-center justify-between">
              <span>ตอบกลับ {replyTo.name}</span>
              <button onClick={() => setReplyTo(null)} className="font-bold">✕</button>
            </div>
          )}
          <form onSubmit={handleComment} className="flex gap-2">
            <input value={commentBody} onChange={(e) => setCommentBody(e.target.value)}
              placeholder={replyTo ? `ตอบกลับ ${replyTo.name}...` : "แสดงความคิดเห็น..."}
              className="flex-1 border border-[var(--color-border-input)] rounded-[var(--radius-input)] px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)]" />
            <button type="submit" className="bg-[var(--color-primary)] text-white px-4 py-2 rounded-[var(--radius-button)] text-sm font-medium">ส่ง</button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <button onClick={() => setShowNewTopic((v) => !v)}
        className="w-full bg-[var(--color-primary)] text-white text-sm font-medium py-2.5 rounded-[var(--radius-button)]">
        + สร้าง Topic ใหม่
      </button>

      {showNewTopic && (
        <form onSubmit={handleCreateTopic}
          className="bg-[var(--color-bg-surface)] rounded-[var(--radius-card)] shadow-card p-4 space-y-3">
          <input required value={newTopic.title} onChange={(e) => setNewTopic({ ...newTopic, title: e.target.value })}
            placeholder="หัวข้อ *"
            className="w-full border border-[var(--color-border-input)] rounded-[var(--radius-input)] px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)]" />
          <textarea required rows={3} value={newTopic.body} onChange={(e) => setNewTopic({ ...newTopic, body: e.target.value })}
            placeholder="รายละเอียด *"
            className="w-full border border-[var(--color-border-input)] rounded-[var(--radius-input)] px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)] resize-none" />
          <div className="flex gap-2">
            <button type="submit" className="flex-1 bg-[var(--color-primary)] text-white text-sm py-2 rounded-[var(--radius-button)]">สร้าง</button>
            <button type="button" onClick={() => setShowNewTopic(false)}
              className="flex-1 border border-[var(--color-border-input)] text-sm py-2 rounded-[var(--radius-button)]">ยกเลิก</button>
          </div>
        </form>
      )}

      {topics.length === 0 ? (
        <p className="text-center py-12 text-[var(--color-text-secondary)]">ยังไม่มี Topic</p>
      ) : topics.map((t) => (
        <div key={t.id} onClick={() => openTopic(t)}
          className="bg-[var(--color-bg-surface)] rounded-[var(--radius-card)] shadow-card p-4 cursor-pointer active:scale-[0.99] transition-transform">
          <h3 className="font-semibold text-sm">{t.title}</h3>
          <div className="flex items-center gap-3 mt-2 text-xs text-[var(--color-text-secondary)]">
            <span>โดย {t.author.name}</span>
            <span>💬 {t.comment_count}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

function CommentItem({ comment, onReply }: { comment: ProjectTopicComment; onReply: (id: number, name: string) => void }) {
  return (
    <div className="space-y-2">
      <div className="flex gap-3">
        <div className="w-8 h-8 rounded-full bg-[var(--color-bg-badge)] flex items-center justify-center text-sm shrink-0">
          {comment.author.name[0]}
        </div>
        <div className="flex-1">
          <p className="text-xs font-medium">{comment.author.name}</p>
          <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">{comment.body}</p>
          <button onClick={() => onReply(comment.id, comment.author.name)}
            className="text-xs text-[var(--color-primary)] mt-1">ตอบกลับ</button>
        </div>
      </div>
      {comment.replies.length > 0 && (
        <div className="ml-11 space-y-2 border-l-2 border-[var(--color-border)] pl-3">
          {comment.replies.map((r) => (
            <div key={r.id} className="flex gap-2">
              <div className="w-6 h-6 rounded-full bg-[var(--color-bg-badge)] flex items-center justify-center text-xs shrink-0">
                {r.author.name[0]}
              </div>
              <div>
                <p className="text-xs font-medium">{r.author.name}</p>
                <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">{r.body}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
