import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ideasApi, communitiesApi } from '../shared/api'
import { PageHeader } from '../shared/components/PageHeader'
import type { Community } from '../shared/types'

const CATEGORIES = ['product', 'process', 'technology', 'culture', 'customer', 'other']
const CATEGORY_LABELS: Record<string, string> = {
  product: 'ผลิตภัณฑ์', process: 'กระบวนการ', technology: 'เทคโนโลยี',
  culture: 'วัฒนธรรม', customer: 'ลูกค้า', other: 'อื่นๆ',
}

export function IdeaFormPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const isEdit = Boolean(id)

  const [form, setForm] = useState({ title: '', body: '', category: '', tags: '' })
  const [selectedCommunityIds, setSelectedCommunityIds] = useState<number[]>([])
  const [communities, setCommunities] = useState<Community[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState<string[]>([])

  useEffect(() => {
    communitiesApi.list().then(({ data }) => setCommunities(data))
  }, [])

  useEffect(() => {
    if (isEdit && id) {
      ideasApi.get(Number(id)).then(({ data }) => {
        setForm({ title: data.title, body: data.body ?? '', category: data.category ?? '', tags: data.tags.join(', ') })
        setSelectedCommunityIds(data.communities.map((c) => c.id))
      })
    }
  }, [isEdit, id])

  const toggleCommunity = (cid: number) =>
    setSelectedCommunityIds((prev) => prev.includes(cid) ? prev.filter((x) => x !== cid) : [...prev, cid])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true); setErrors([])
    const payload = {
      title: form.title, body: form.body, category: form.category,
      tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
      community_ids: selectedCommunityIds,
    }
    try {
      if (isEdit && id) {
        await ideasApi.update(Number(id), payload)
        navigate(`/innovation/ideas/${id}`)
      } else {
        const { data } = await ideasApi.create(payload)
        navigate(`/innovation/ideas/${data.id}`)
      }
    } catch (err: any) {
      setErrors(err.response?.data?.errors ?? ['เกิดข้อผิดพลาด'])
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <PageHeader title={isEdit ? 'แก้ไขไอเดีย' : 'เสนอไอเดียใหม่'} showBack />
      <form onSubmit={handleSubmit} className="px-4 py-4 space-y-4">
        {errors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-[var(--radius-card)] p-3">
            {errors.map((e) => <p key={e} className="text-sm text-red-500">{e}</p>)}
          </div>
        )}

        <div>
          <label className="text-sm font-medium block mb-1">ชื่อไอเดีย *</label>
          <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="ชื่อไอเดียที่กระชับ ชัดเจน"
            className="w-full border border-[var(--color-border-input)] rounded-[var(--radius-input)] px-3 py-2.5 text-sm outline-none focus:border-[var(--color-primary)]" />
        </div>

        <div>
          <label className="text-sm font-medium block mb-1">รายละเอียด *</label>
          <textarea required rows={5} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })}
            placeholder="อธิบายไอเดีย ปัญหาที่แก้ไข และประโยชน์ที่ได้รับ"
            className="w-full border border-[var(--color-border-input)] rounded-[var(--radius-input)] px-3 py-2.5 text-sm outline-none focus:border-[var(--color-primary)] resize-none" />
        </div>

        <div>
          <label className="text-sm font-medium block mb-1">หมวดหมู่</label>
          <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="w-full border border-[var(--color-border-input)] rounded-[var(--radius-input)] px-3 py-2.5 text-sm outline-none focus:border-[var(--color-primary)] bg-white">
            <option value="">เลือกหมวดหมู่</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium block mb-1">Tags (คั่นด้วย ,)</label>
          <input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })}
            placeholder="เช่น AI, customer, automation"
            className="w-full border border-[var(--color-border-input)] rounded-[var(--radius-input)] px-3 py-2.5 text-sm outline-none focus:border-[var(--color-primary)]" />
        </div>

        {communities.length > 0 && (
          <div>
            <label className="text-sm font-medium block mb-2">ชุมชนที่เกี่ยวข้อง</label>
            <div className="flex flex-wrap gap-2">
              {communities.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => toggleCommunity(c.id)}
                  className={`px-3 py-1.5 rounded-[var(--radius-tab)] text-xs font-medium border transition-colors ${
                    selectedCommunityIds.includes(c.id)
                      ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]'
                      : 'bg-white text-[var(--color-text-primary)] border-[var(--color-border)]'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <button type="submit" disabled={submitting}
          className="w-full bg-[var(--color-primary)] text-white rounded-[var(--radius-button)] py-3 font-semibold shadow-btn disabled:opacity-50">
          {submitting ? 'กำลังบันทึก...' : isEdit ? 'บันทึกการแก้ไข' : 'บันทึกร่าง'}
        </button>
      </form>
    </div>
  )
}
