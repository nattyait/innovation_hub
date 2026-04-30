import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ideasApi, impactsApi } from '../shared/api'
import type { Idea, IdeaComment, IdeaApplication, ImpactType } from '../shared/types'
import { PageHeader } from '../shared/components/PageHeader'
import { IdeaStatusBadge } from '../shared/components/StatusBadge'
import { HeartButton } from '../shared/components/HeartButton'
import { useAuth } from '../shared/hooks/useAuth'

const EMPTY_APPLY = {
  department: '', apply_description: '',
  people_affected: '', time_saved_hours: '', cost_saved_thb: '',
  impact_type: 'other' as ImpactType, impact_description: '',
}

export function IdeaDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user, isManager } = useAuth()

  const [idea, setIdea] = useState<Idea | null>(null)
  const [comments, setComments] = useState<IdeaComment[]>([])
  const [applications, setApplications] = useState<IdeaApplication[]>([])
  const [remainingHearts, setRemainingHearts] = useState(user?.remaining_hearts ?? 0)

  // UI state
  const [commentBody, setCommentBody] = useState('')
  const [showApplyForm, setShowApplyForm] = useState(false)
  const [showReturnInput, setShowReturnInput] = useState(false)
  const [returnReason, setReturnReason] = useState('')

  const [applyForm, setApplyForm] = useState(EMPTY_APPLY)

  // Retroactive impact form for existing applications without impact
  const [impactFormFor, setImpactFormFor] = useState<number | null>(null)
  const [impactForm, setImpactForm] = useState({
    people_affected: '', time_saved_hours: '', cost_saved_thb: '',
    impact_type: 'other' as ImpactType, description: '',
  })

  useEffect(() => {
    if (!id) return
    ideasApi.get(Number(id)).then(({ data }) => { setIdea(data); setRemainingHearts(user?.remaining_hearts ?? 0) })
    ideasApi.listComments(Number(id)).then(({ data }) => setComments(data))
  }, [id])

  useEffect(() => {
    if (idea?.status === 'approved') {
      impactsApi.listApplications(idea.id).then(({ data }) => setApplications(data))
    }
  }, [idea?.id, idea?.status])

  if (!idea) return <div className="p-8 text-center text-[var(--color-text-secondary)]">กำลังโหลด...</div>

  const isAuthor    = user?.id === idea.author.id
  const isApprover  = isManager && idea.approver?.id === user?.id
  const canHeart    = idea.status === 'approved' && (idea.hearted || remainingHearts > 0)
  const canEdit     = isAuthor && ['draft', 'submitted', 'returned'].includes(idea.status)
  const canSubmit   = isAuthor && ['draft', 'returned'].includes(idea.status)
  const canRetract  = isAuthor && idea.status === 'submitted'
  const canApprove  = isApprover && ['submitted', 'under_review'].includes(idea.status)

  /* ── Heart ── */
  const handleHeart = async () => {
    if (!idea) return
    try {
      if (idea.hearted && idea.heart_id) {
        const { data } = await ideasApi.removeHeart(idea.heart_id)
        setIdea((p) => p ? { ...p, hearted: false, heart_id: null, heart_count: data.heart_count } : p)
        setRemainingHearts(data.remaining_hearts)
      } else if (!idea.hearted && remainingHearts > 0) {
        const { data } = await ideasApi.giveHeart(idea.id)
        setIdea((p) => p ? { ...p, hearted: true, heart_id: data.heart_id, heart_count: data.heart_count } : p)
        setRemainingHearts(data.remaining_hearts)
      }
    } catch { /* interceptor handles 401 */ }
  }

  /* ── Approval actions ── */
  const handleApprove = async () => {
    const { data } = await ideasApi.approve(idea.id); setIdea(data)
  }
  const handleDecline = async () => {
    if (!confirm('ยืนยันการปฏิเสธไอเดียนี้?')) return
    const { data } = await ideasApi.decline(idea.id); setIdea(data)
  }
  const handleReturn = async () => {
    if (!returnReason.trim()) return
    const { data } = await ideasApi.returnIdea(idea.id, returnReason)
    setIdea(data); setShowReturnInput(false); setReturnReason('')
  }

  /* ── Author submit/retract ── */
  const handleSubmit = async () => {
    const { data } = await ideasApi.submit(idea.id); setIdea(data)
  }
  const handleRetract = async () => {
    const { data } = await ideasApi.retractIdea(idea.id)
    setIdea(data)
  }

  /* ── Comment ── */
  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!commentBody.trim()) return
    const { data } = await ideasApi.addComment(idea.id, commentBody)
    setComments((p) => [...p, data]); setCommentBody('')
  }

  const handleUpvote = async (comment: IdeaComment) => {
    if (comment.upvoted) {
      const { data } = await ideasApi.removeCommentUpvote(comment.id)
      setComments((p) => p.map((c) => c.id === comment.id ? { ...c, upvoted: false, upvote_count: data.upvote_count } : c))
    } else {
      const { data } = await ideasApi.upvoteComment(comment.id)
      setComments((p) => p.map((c) => c.id === comment.id ? { ...c, upvoted: true, upvote_count: data.upvote_count } : c))
    }
  }

  /* ── Apply idea + impact in one step ── */
  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!applyForm.apply_description.trim()) return

    const { data: app } = await impactsApi.createApplication(idea.id, {
      department: applyForm.department || undefined,
      description: applyForm.apply_description,
    })

    // Create impact immediately together with application
    const impactPayload = {
      people_affected: parseInt(applyForm.people_affected) || 0,
      time_saved_hours: applyForm.time_saved_hours ? parseFloat(applyForm.time_saved_hours) : undefined,
      cost_saved_thb: applyForm.cost_saved_thb ? parseFloat(applyForm.cost_saved_thb) : undefined,
      impact_type: applyForm.impact_type,
      description: applyForm.impact_description,
    }
    const { data: impact } = await impactsApi.createImpact(app.id, impactPayload)
    const appWithImpact = { ...app, impact }

    setApplications((p) => [appWithImpact, ...p])
    setIdea((p) => p ? { ...p, application_count: (p.application_count ?? 0) + 1 } : p)
    setShowApplyForm(false)
    setApplyForm(EMPTY_APPLY)
  }

  /* ── Retroactive impact for existing applications ── */
  const handleImpact = async (e: React.FormEvent, appId: number) => {
    e.preventDefault()
    const payload = {
      people_affected: parseInt(impactForm.people_affected) || 0,
      time_saved_hours: impactForm.time_saved_hours ? parseFloat(impactForm.time_saved_hours) : undefined,
      cost_saved_thb: impactForm.cost_saved_thb ? parseFloat(impactForm.cost_saved_thb) : undefined,
      impact_type: impactForm.impact_type,
      description: impactForm.description,
    }
    const { data } = await impactsApi.createImpact(appId, payload)
    setApplications((p) => p.map((a) => a.id === appId ? { ...a, impact: data } : a))
    setImpactFormFor(null)
    setImpactForm({ people_affected: '', time_saved_hours: '', cost_saved_thb: '', impact_type: 'other', description: '' })
  }

  return (
    <div>
      <PageHeader title="" showBack />

      <div className="px-4 py-4 space-y-4">
        {/* ── Idea Card ── */}
        <div className="bg-[var(--color-bg-surface)] rounded-[var(--radius-card)] shadow-card p-4">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <IdeaStatusBadge status={idea.status} />
            <span className="text-xs text-[var(--color-text-secondary)]">{idea.category}</span>
            {idea.communities.map((c) => (
              <span key={c.id} className="text-xs bg-[var(--color-bg-badge)] text-[var(--color-primary)] px-2 py-0.5 rounded-full">{c.name}</span>
            ))}
          </div>

          <h2 className="text-xl font-bold leading-snug">{idea.title}</h2>
          <p className="mt-3 text-sm leading-relaxed text-[var(--color-text-secondary)]">{idea.body}</p>

          {idea.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {idea.tags.map((tag) => (
                <span key={tag} className="bg-[var(--color-bg-badge)] text-[var(--color-primary)] text-xs px-2 py-0.5 rounded-full">#{tag}</span>
              ))}
            </div>
          )}

          {/* Return reason */}
          {idea.status === 'returned' && idea.return_reason && (
            <div className="mt-3 bg-orange-50 border border-orange-200 rounded-[var(--radius-input)] p-3">
              <p className="text-xs font-medium text-orange-700">เหตุผลที่ส่งคืน</p>
              <p className="text-sm text-orange-600 mt-0.5">{idea.return_reason}</p>
            </div>
          )}

          {/* Impact stats */}
          {applications.length > 0 && (
            <div className="mt-3 flex gap-3 flex-wrap">
              <span className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full">🚀 ถูกนำไปใช้ {applications.length} ครั้ง</span>
              {applications.flatMap((a) => a.impact ? [a.impact.people_affected] : []).reduce((s, n) => s + n, 0) > 0 && (
                <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full">
                  👥 {applications.reduce((s, a) => s + (a.impact?.people_affected ?? 0), 0).toLocaleString()} คน
                </span>
              )}
            </div>
          )}

          <div className="flex items-center justify-between mt-4 pt-3 border-t border-[var(--color-border)] flex-wrap gap-2">
            <span className="text-xs text-[var(--color-text-secondary)]">โดย {idea.author.name}</span>
            <div className="flex items-center gap-2 flex-wrap">
              {canSubmit && (
                <button onClick={handleSubmit} className="bg-[var(--color-primary)] text-white text-xs font-medium px-3 py-1.5 rounded-[var(--radius-button)] shadow-btn">
                  เสนอเพื่อพิจารณา
                </button>
              )}
              {canRetract && (
                <button onClick={handleRetract} className="border border-[var(--color-border-input)] text-[var(--color-text-secondary)] text-xs px-3 py-1.5 rounded-[var(--radius-button)]">
                  ดึงกลับ
                </button>
              )}
              {canEdit && (
                <button onClick={() => navigate(`/innovation/ideas/${idea.id}/edit`)} className="border border-[var(--color-border-input)] text-[var(--color-text-secondary)] text-xs px-3 py-1.5 rounded-[var(--radius-button)]">
                  แก้ไข
                </button>
              )}
              {idea.status === 'approved' && (
                <HeartButton hearted={idea.hearted} count={idea.heart_count} onClick={handleHeart} disabled={!canHeart} />
              )}
            </div>
          </div>
          {idea.status === 'approved' && !idea.hearted && remainingHearts === 0 && (
            <p className="mt-1 text-xs text-orange-500 text-right">หัวใจหมดแล้วในรอบนี้</p>
          )}
        </div>

        {/* ── Approver action bar ── */}
        {canApprove && (
          <div className="bg-[var(--color-bg-surface)] rounded-[var(--radius-card)] shadow-card p-4 space-y-3">
            <p className="text-sm font-semibold">การพิจารณา</p>
            <div className="flex gap-2">
              <button onClick={handleApprove} className="flex-1 bg-green-500 text-white text-sm font-medium py-2 rounded-[var(--radius-button)]">อนุมัติ</button>
              <button onClick={handleDecline} className="flex-1 bg-red-500 text-white text-sm font-medium py-2 rounded-[var(--radius-button)]">ปฏิเสธ</button>
              <button onClick={() => setShowReturnInput((v) => !v)} className="flex-1 border border-[var(--color-border-input)] text-sm py-2 rounded-[var(--radius-button)]">ส่งคืน</button>
            </div>
            {showReturnInput && (
              <div className="space-y-2">
                <textarea
                  rows={2}
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  placeholder="ระบุเหตุผลและสิ่งที่ต้องแก้ไข..."
                  className="w-full border border-[var(--color-border-input)] rounded-[var(--radius-input)] px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)] resize-none"
                />
                <button onClick={handleReturn} className="w-full bg-orange-500 text-white text-sm font-medium py-2 rounded-[var(--radius-button)]">ส่งคืนพร้อมเหตุผล</button>
              </div>
            )}
          </div>
        )}

        {/* ── Applications section ── */}
        {idea.status === 'approved' && (
          <div className="bg-[var(--color-bg-surface)] rounded-[var(--radius-card)] shadow-card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm">การนำไปใช้งาน ({applications.length})</h3>
              <button
                onClick={() => setShowApplyForm((v) => !v)}
                className="text-xs text-[var(--color-primary)] font-medium"
              >
                + ฉันนำไปใช้แล้ว
              </button>
            </div>

            {showApplyForm && (
              <form onSubmit={handleApply} className="border border-[var(--color-border-dashed)] rounded-[var(--radius-input)] p-3 space-y-3">
                {/* ── การนำไปใช้ ── */}
                <p className="text-xs font-semibold text-[var(--color-text-primary)]">การนำไปใช้</p>
                <input
                  value={applyForm.department}
                  onChange={(e) => setApplyForm({ ...applyForm, department: e.target.value })}
                  placeholder="แผนก / สาขา (ไม่บังคับ)"
                  className="w-full border border-[var(--color-border-input)] rounded-[var(--radius-input)] px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)]"
                />
                <textarea
                  required rows={2}
                  value={applyForm.apply_description}
                  onChange={(e) => setApplyForm({ ...applyForm, apply_description: e.target.value })}
                  placeholder="นำไปใช้อย่างไร เช่น นำ e-Form มาแทนกระดาษที่สาขา *"
                  className="w-full border border-[var(--color-border-input)] rounded-[var(--radius-input)] px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)] resize-none"
                />

                {/* ── ผลลัพธ์ที่เกิดขึ้น ── */}
                <p className="text-xs font-semibold text-[var(--color-text-primary)] pt-1 border-t border-[var(--color-border)]">ผลลัพธ์ที่เกิดขึ้น</p>
                <div className="space-y-2">
                  <input
                    required type="number" min="0"
                    value={applyForm.people_affected}
                    onChange={(e) => setApplyForm({ ...applyForm, people_affected: e.target.value })}
                    placeholder="จำนวนคนที่ได้รับผลกระทบ *"
                    className="w-full border border-[var(--color-border-input)] rounded-[var(--radius-input)] px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)]"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number" min="0" step="0.5"
                      value={applyForm.time_saved_hours}
                      onChange={(e) => setApplyForm({ ...applyForm, time_saved_hours: e.target.value })}
                      placeholder="เวลาที่ประหยัด (ชม.)"
                      className="border border-[var(--color-border-input)] rounded-[var(--radius-input)] px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)]"
                    />
                    <input
                      type="number" min="0"
                      value={applyForm.cost_saved_thb}
                      onChange={(e) => setApplyForm({ ...applyForm, cost_saved_thb: e.target.value })}
                      placeholder="ประหยัดงบ (บาท)"
                      className="border border-[var(--color-border-input)] rounded-[var(--radius-input)] px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)]"
                    />
                  </div>
                  <select
                    value={applyForm.impact_type}
                    onChange={(e) => setApplyForm({ ...applyForm, impact_type: e.target.value as ImpactType })}
                    className="w-full border border-[var(--color-border-input)] rounded-[var(--radius-input)] px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)] bg-white"
                  >
                    <option value="time">ประหยัดเวลา</option>
                    <option value="cost">ประหยัดต้นทุน</option>
                    <option value="people">กระทบคนจำนวนมาก</option>
                    <option value="process">ปรับปรุงกระบวนการ</option>
                    <option value="other">อื่นๆ</option>
                  </select>
                  <textarea
                    required rows={2}
                    value={applyForm.impact_description}
                    onChange={(e) => setApplyForm({ ...applyForm, impact_description: e.target.value })}
                    placeholder="อธิบายผลลัพธ์ที่เกิดขึ้นโดยละเอียด *"
                    className="w-full border border-[var(--color-border-input)] rounded-[var(--radius-input)] px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)] resize-none"
                  />
                </div>

                <div className="flex gap-2 pt-1">
                  <button type="submit" className="flex-1 bg-[var(--color-primary)] text-white text-sm font-medium py-2 rounded-[var(--radius-button)]">บันทึก</button>
                  <button type="button" onClick={() => { setShowApplyForm(false); setApplyForm(EMPTY_APPLY) }}
                    className="flex-1 border border-[var(--color-border-input)] text-sm py-2 rounded-[var(--radius-button)]">ยกเลิก</button>
                </div>
              </form>
            )}

            {applications.map((app) => (
              <div key={app.id} className="border border-[var(--color-border)] rounded-[var(--radius-input)] p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-[var(--color-bg-badge)] flex items-center justify-center text-xs shrink-0">{app.applied_by.name[0]}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium">{app.applied_by.name}{app.department && <span className="text-[var(--color-text-secondary)] ml-1">• {app.department}</span>}</p>
                    <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">{app.description}</p>
                  </div>
                </div>
                {app.impact ? (
                  <div className="bg-green-50 rounded-[var(--radius-input)] p-2 text-xs space-y-0.5">
                    <p className="font-medium text-green-700">Impact ที่รายงาน</p>
                    <p className="text-green-600">👥 {app.impact.people_affected.toLocaleString()} คน{app.impact.time_saved_hours ? ` • ⏱ ${app.impact.time_saved_hours}h` : ''}{app.impact.cost_saved_thb ? ` • 💰 ฿${app.impact.cost_saved_thb.toLocaleString()}` : ''}</p>
                    <p className="text-green-600">{app.impact.description}</p>
                    <p className="text-[var(--color-text-secondary)]">รายงานโดย {app.impact.reported_by.name}</p>
                  </div>
                ) : (
                  impactFormFor === app.id ? (
                    <form onSubmit={(e) => handleImpact(e, app.id)} className="space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <input required type="number" min="0" placeholder="จำนวนคนที่ได้รับผลกระทบ *"
                          value={impactForm.people_affected} onChange={(e) => setImpactForm({ ...impactForm, people_affected: e.target.value })}
                          className="col-span-2 border border-[var(--color-border-input)] rounded-[var(--radius-input)] px-3 py-2 text-xs outline-none focus:border-[var(--color-primary)]" />
                        <input type="number" min="0" step="0.5" placeholder="เวลาที่ประหยัด (ชม.)"
                          value={impactForm.time_saved_hours} onChange={(e) => setImpactForm({ ...impactForm, time_saved_hours: e.target.value })}
                          className="border border-[var(--color-border-input)] rounded-[var(--radius-input)] px-3 py-2 text-xs outline-none focus:border-[var(--color-primary)]" />
                        <input type="number" min="0" placeholder="ประหยัดงบ (บาท)"
                          value={impactForm.cost_saved_thb} onChange={(e) => setImpactForm({ ...impactForm, cost_saved_thb: e.target.value })}
                          className="border border-[var(--color-border-input)] rounded-[var(--radius-input)] px-3 py-2 text-xs outline-none focus:border-[var(--color-primary)]" />
                      </div>
                      <select value={impactForm.impact_type} onChange={(e) => setImpactForm({ ...impactForm, impact_type: e.target.value as ImpactType })}
                        className="w-full border border-[var(--color-border-input)] rounded-[var(--radius-input)] px-3 py-2 text-xs outline-none focus:border-[var(--color-primary)] bg-white">
                        <option value="time">ประหยัดเวลา</option>
                        <option value="cost">ประหยัดต้นทุน</option>
                        <option value="people">กระทบคนจำนวนมาก</option>
                        <option value="process">ปรับปรุงกระบวนการ</option>
                        <option value="other">อื่นๆ</option>
                      </select>
                      <textarea required rows={2} placeholder="อธิบาย impact โดยละเอียด *"
                        value={impactForm.description} onChange={(e) => setImpactForm({ ...impactForm, description: e.target.value })}
                        className="w-full border border-[var(--color-border-input)] rounded-[var(--radius-input)] px-3 py-2 text-xs outline-none focus:border-[var(--color-primary)] resize-none" />
                      <div className="flex gap-2">
                        <button type="submit" className="flex-1 bg-green-500 text-white text-xs font-medium py-1.5 rounded-[var(--radius-button)]">บันทึก Impact</button>
                        <button type="button" onClick={() => setImpactFormFor(null)} className="flex-1 border border-[var(--color-border-input)] text-xs py-1.5 rounded-[var(--radius-button)]">ยกเลิก</button>
                      </div>
                    </form>
                  ) : (
                    <button onClick={() => setImpactFormFor(app.id)} className="text-xs text-[var(--color-primary)] font-medium">+ รายงาน Impact</button>
                  )
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── Comments ── */}
        <div className="bg-[var(--color-bg-surface)] rounded-[var(--radius-card)] shadow-card p-4">
          <h3 className="font-semibold mb-3 text-sm">ความคิดเห็น ({comments.length})</h3>
          <div className="space-y-3 mb-4">
            {comments.map((c) => (
              <div key={c.id} className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-[var(--color-bg-badge)] flex items-center justify-center text-sm shrink-0">{c.user.name[0]}</div>
                <div className="flex-1">
                  <p className="text-xs font-medium">{c.user.name}</p>
                  <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">{c.body}</p>
                  <button
                    onClick={() => handleUpvote(c)}
                    className={`mt-1 flex items-center gap-1 text-xs transition-colors ${c.upvoted ? 'text-[var(--color-primary)] font-medium' : 'text-[var(--color-text-secondary)]'}`}
                  >
                    👍 {c.upvote_count > 0 && c.upvote_count}
                  </button>
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
            <button type="submit" className="bg-[var(--color-primary)] text-white rounded-[var(--radius-button)] px-4 py-2 text-sm font-medium shadow-btn">ส่ง</button>
          </form>
        </div>
      </div>
    </div>
  )
}
