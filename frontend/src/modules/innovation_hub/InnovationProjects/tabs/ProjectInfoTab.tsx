import { useState } from 'react'
import { projectsApi } from '../../shared/api'
import type { InnovationProject } from '../../shared/types'

const FIELDS: { key: keyof InnovationProject; label: string }[] = [
  { key: 'department',           label: 'สายงาน' },
  { key: 'summary',              label: 'สรุปโครงการ' },
  { key: 'expectation',          label: 'ความคาดหวัง' },
  { key: 'pain_point',           label: 'Pain Point ก่อนทำโครงการ' },
  { key: 'improved_process',     label: 'กระบวนการหลังปรับปรุง' },
  { key: 'ai_usage',             label: 'การนำ AI มาช่วย' },
  { key: 'quantitative_results', label: 'ผลลัพธ์เชิงปริมาณ' },
  { key: 'qualitative_results',  label: 'ผลลัพธ์เชิงคุณภาพ' },
  { key: 'esg_impact',           label: 'ESG' },
]

interface Props {
  project: InnovationProject
  canEdit: boolean
  onUpdated: (p: InnovationProject) => void
}

export function ProjectInfoTab({ project, canEdit, onUpdated }: Props) {
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState<Partial<InnovationProject>>({})
  const [saving, setSaving] = useState(false)

  const startEdit = () => {
    setForm({
      title: project.title, department: project.department ?? '',
      summary: project.summary ?? '', expectation: project.expectation ?? '',
      pain_point: project.pain_point ?? '', improved_process: project.improved_process ?? '',
      ai_usage: project.ai_usage ?? '', quantitative_results: project.quantitative_results ?? '',
      qualitative_results: project.qualitative_results ?? '', esg_impact: project.esg_impact ?? '',
      status: project.status,
    })
    setEditing(true)
  }

  const handleSave = async () => {
    setSaving(true)
    const { data } = await projectsApi.update(project.id, form)
    onUpdated(data)
    setEditing(false)
    setSaving(false)
  }

  const handlePrint = () => window.print()

  if (editing) {
    return (
      <div className="space-y-3">
        <div>
          <label className="text-xs font-medium text-[var(--color-text-secondary)] block mb-1">ชื่อโครงการ</label>
          <input value={form.title ?? ''} onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full border border-[var(--color-border-input)] rounded-[var(--radius-input)] px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)]" />
        </div>
        {FIELDS.map(({ key, label }) => (
          <div key={key}>
            <label className="text-xs font-medium text-[var(--color-text-secondary)] block mb-1">{label}</label>
            <textarea rows={key === 'summary' || key === 'improved_process' ? 3 : 2}
              value={(form[key] as string) ?? ''}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              className="w-full border border-[var(--color-border-input)] rounded-[var(--radius-input)] px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)] resize-none" />
          </div>
        ))}
        <div>
          <label className="text-xs font-medium text-[var(--color-text-secondary)] block mb-1">สถานะ</label>
          <select value={form.status ?? ''} onChange={(e) => setForm({ ...form, status: e.target.value as InnovationProject['status'] })}
            className="w-full border border-[var(--color-border-input)] rounded-[var(--radius-input)] px-3 py-2 text-sm bg-white outline-none focus:border-[var(--color-primary)]">
            <option value="planning">วางแผน</option>
            <option value="active">ดำเนินการ</option>
            <option value="completed">เสร็จสิ้น</option>
            <option value="on_hold">พักไว้</option>
          </select>
        </div>
        <div className="flex gap-2 pt-2">
          <button onClick={handleSave} disabled={saving}
            className="flex-1 bg-[var(--color-primary)] text-white text-sm font-medium py-2.5 rounded-[var(--radius-button)] disabled:opacity-50">
            {saving ? 'กำลังบันทึก...' : 'บันทึก'}
          </button>
          <button onClick={() => setEditing(false)}
            className="flex-1 border border-[var(--color-border-input)] text-sm py-2.5 rounded-[var(--radius-button)]">
            ยกเลิก
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Action buttons */}
      <div className="flex gap-2">
        {canEdit && (
          <button onClick={startEdit}
            className="flex-1 border border-[var(--color-primary)] text-[var(--color-primary)] text-sm font-medium py-2 rounded-[var(--radius-button)]">
            แก้ไขรายละเอียด
          </button>
        )}
        <button onClick={handlePrint}
          className="flex-1 bg-[var(--color-primary)] text-white text-sm font-medium py-2 rounded-[var(--radius-button)] print:hidden">
          Export PDF
        </button>
      </div>

      {/* Project info table — also styled for print */}
      <div className="bg-[var(--color-bg-surface)] rounded-[var(--radius-card)] shadow-card overflow-hidden print-section">
        <table className="w-full text-sm">
          <tbody>
            <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg-badge)]">
              <td colSpan={2} className="px-4 py-3 font-bold text-base text-[var(--color-text-primary)]">
                {project.title}
              </td>
            </tr>
            <InfoRow label="Sponsor" value={project.sponsor.name} />
            <InfoRow label="สมาชิก" value={project.members.map((m) => `${m.user.name}${m.role === 'owner' ? ' (owner)' : ''}`).join(', ') || '-'} />
            {FIELDS.map(({ key, label }) => (
              <InfoRow key={key} label={label} value={(project[key] as string) || '-'} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <tr className="border-b border-[var(--color-border)] last:border-0">
      <td className="px-4 py-3 text-xs font-medium text-[var(--color-text-secondary)] w-2/5 align-top whitespace-nowrap">{label}</td>
      <td className="px-4 py-3 text-sm text-[var(--color-text-primary)] whitespace-pre-wrap">{value}</td>
    </tr>
  )
}
