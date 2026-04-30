import { useState, useEffect } from 'react'
import { projectsApi } from '../../shared/api'
import type { ProjectDeployment, DeploymentStatus, ImpactType } from '../../shared/types'

const STATUS_LABELS: Record<DeploymentStatus, string> = {
  not_started: 'ยังไม่ได้ใช้', adopted: 'นำไปใช้แล้ว',
  adapted: 'นำไปปรับใช้', not_adopted: 'ไม่ได้นำไปใช้',
}
const STATUS_COLORS: Record<DeploymentStatus, string> = {
  not_started: 'bg-gray-100 text-gray-500', adopted: 'bg-green-50 text-green-700',
  adapted: 'bg-blue-50 text-blue-700', not_adopted: 'bg-red-50 text-red-500',
}

const EMPTY_IMPACT = {
  people_affected: '', time_saved_hours: '', cost_saved_thb: '',
  impact_type: 'other' as ImpactType, description: '',
}

interface Props { projectId: number; isSponsor: boolean }

export function ProjectDeploymentTab({ projectId, isSponsor }: Props) {
  const [deployments, setDeployments] = useState<ProjectDeployment[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [addForm, setAddForm] = useState({ department_name: '', start_date: '', end_date: '' })
  const [impactFormFor, setImpactFormFor] = useState<number | null>(null)
  const [impactForm, setImpactForm] = useState(EMPTY_IMPACT)

  useEffect(() => {
    projectsApi.listDeployments(projectId).then(({ data }) => setDeployments(data))
  }, [projectId])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    const { data } = await projectsApi.createDeployment(projectId, addForm)
    setDeployments((p) => [...p, data])
    setAddForm({ department_name: '', start_date: '', end_date: '' })
    setShowAddForm(false)
  }

  const handleStatusChange = async (depId: number, status: DeploymentStatus) => {
    const { data } = await projectsApi.updateDeploymentStatus(depId, status)
    setDeployments((p) => p.map((d) => d.id === depId ? data : d))
    if (status === 'adopted') setImpactFormFor(depId)
  }

  const handleImpact = async (e: React.FormEvent, depId: number) => {
    e.preventDefault()
    const payload = {
      people_affected: parseInt(impactForm.people_affected) || 0,
      time_saved_hours: impactForm.time_saved_hours ? parseFloat(impactForm.time_saved_hours) : undefined,
      cost_saved_thb: impactForm.cost_saved_thb ? parseFloat(impactForm.cost_saved_thb) : undefined,
      impact_type: impactForm.impact_type,
      description: impactForm.description,
    }
    const { data } = await projectsApi.createDeploymentImpact(depId, payload)
    setDeployments((p) => p.map((d) => d.id === depId ? { ...d, impact: data } : d))
    setImpactFormFor(null)
    setImpactForm(EMPTY_IMPACT)
  }

  return (
    <div className="space-y-3">
      {isSponsor && (
        <button onClick={() => setShowAddForm((v) => !v)}
          className="w-full bg-[var(--color-primary)] text-white text-sm font-medium py-2.5 rounded-[var(--radius-button)]">
          + Assign หน่วยงาน
        </button>
      )}

      {showAddForm && (
        <form onSubmit={handleAdd}
          className="bg-[var(--color-bg-surface)] rounded-[var(--radius-card)] shadow-card p-4 space-y-3">
          <input required value={addForm.department_name}
            onChange={(e) => setAddForm({ ...addForm, department_name: e.target.value })}
            placeholder="ชื่อหน่วยงาน / ฝ่าย / แผนก *"
            className="w-full border border-[var(--color-border-input)] rounded-[var(--radius-input)] px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)]" />
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-[var(--color-text-secondary)] block mb-1">วันเริ่ม</label>
              <input type="date" value={addForm.start_date}
                onChange={(e) => setAddForm({ ...addForm, start_date: e.target.value })}
                className="w-full border border-[var(--color-border-input)] rounded-[var(--radius-input)] px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)]" />
            </div>
            <div>
              <label className="text-xs text-[var(--color-text-secondary)] block mb-1">วันสิ้นสุด</label>
              <input type="date" value={addForm.end_date}
                onChange={(e) => setAddForm({ ...addForm, end_date: e.target.value })}
                className="w-full border border-[var(--color-border-input)] rounded-[var(--radius-input)] px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)]" />
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="flex-1 bg-[var(--color-primary)] text-white text-sm py-2 rounded-[var(--radius-button)]">บันทึก</button>
            <button type="button" onClick={() => setShowAddForm(false)}
              className="flex-1 border border-[var(--color-border-input)] text-sm py-2 rounded-[var(--radius-button)]">ยกเลิก</button>
          </div>
        </form>
      )}

      {deployments.length === 0 ? (
        <p className="text-center py-12 text-[var(--color-text-secondary)]">ยังไม่มีหน่วยงานที่ Assign</p>
      ) : deployments.map((dep) => (
        <div key={dep.id} className="bg-[var(--color-bg-surface)] rounded-[var(--radius-card)] shadow-card p-4 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-semibold text-sm">{dep.department_name}</p>
              <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                {dep.start_date && `${dep.start_date} → ${dep.end_date ?? '...'}`}
                {dep.overdue && <span className="text-red-500 ml-2 font-medium">เกินกำหนด!</span>}
              </p>
            </div>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${STATUS_COLORS[dep.status]}`}>
              {STATUS_LABELS[dep.status]}
            </span>
          </div>

          {/* Status update selector */}
          <select value={dep.status}
            onChange={(e) => handleStatusChange(dep.id, e.target.value as DeploymentStatus)}
            className="w-full border border-[var(--color-border-input)] rounded-[var(--radius-input)] px-3 py-2 text-sm bg-white outline-none focus:border-[var(--color-primary)]">
            {(Object.keys(STATUS_LABELS) as DeploymentStatus[]).map((s) => (
              <option key={s} value={s}>{STATUS_LABELS[s]}</option>
            ))}
          </select>

          {/* Impact display */}
          {dep.impact ? (
            <div className="bg-green-50 rounded-[var(--radius-input)] p-3 text-xs space-y-1">
              <p className="font-medium text-green-700">Impact ที่รายงาน</p>
              <p className="text-green-600">
                👥 {dep.impact.people_affected.toLocaleString()} คน
                {dep.impact.time_saved_hours ? ` • ⏱ ${dep.impact.time_saved_hours}h` : ''}
                {dep.impact.cost_saved_thb ? ` • 💰 ฿${dep.impact.cost_saved_thb.toLocaleString()}` : ''}
              </p>
              <p className="text-green-600">{dep.impact.description}</p>
              <p className="text-[var(--color-text-secondary)]">รายงานโดย {dep.impact.reported_by.name}</p>
            </div>
          ) : (dep.status === 'adopted' || dep.status === 'adapted') && (
            impactFormFor === dep.id ? (
              <form onSubmit={(e) => handleImpact(e, dep.id)} className="space-y-2 border border-[var(--color-border-dashed)] rounded-[var(--radius-input)] p-3">
                <p className="text-xs font-semibold text-[var(--color-text-primary)]">รายงาน Impact</p>
                <input required type="number" min="0"
                  value={impactForm.people_affected}
                  onChange={(e) => setImpactForm({ ...impactForm, people_affected: e.target.value })}
                  placeholder="จำนวนคนที่ได้รับผลกระทบ *"
                  className="w-full border border-[var(--color-border-input)] rounded-[var(--radius-input)] px-3 py-2 text-xs outline-none focus:border-[var(--color-primary)]" />
                <div className="grid grid-cols-2 gap-2">
                  <input type="number" min="0" step="0.5"
                    value={impactForm.time_saved_hours}
                    onChange={(e) => setImpactForm({ ...impactForm, time_saved_hours: e.target.value })}
                    placeholder="เวลาที่ประหยัด (ชม.)"
                    className="border border-[var(--color-border-input)] rounded-[var(--radius-input)] px-3 py-2 text-xs outline-none focus:border-[var(--color-primary)]" />
                  <input type="number" min="0"
                    value={impactForm.cost_saved_thb}
                    onChange={(e) => setImpactForm({ ...impactForm, cost_saved_thb: e.target.value })}
                    placeholder="ประหยัดงบ (บาท)"
                    className="border border-[var(--color-border-input)] rounded-[var(--radius-input)] px-3 py-2 text-xs outline-none focus:border-[var(--color-primary)]" />
                </div>
                <select value={impactForm.impact_type}
                  onChange={(e) => setImpactForm({ ...impactForm, impact_type: e.target.value as ImpactType })}
                  className="w-full border border-[var(--color-border-input)] rounded-[var(--radius-input)] px-3 py-2 text-xs bg-white outline-none focus:border-[var(--color-primary)]">
                  <option value="time">ประหยัดเวลา</option>
                  <option value="cost">ประหยัดต้นทุน</option>
                  <option value="people">กระทบคนจำนวนมาก</option>
                  <option value="process">ปรับปรุงกระบวนการ</option>
                  <option value="other">อื่นๆ</option>
                </select>
                <textarea required rows={2}
                  value={impactForm.description}
                  onChange={(e) => setImpactForm({ ...impactForm, description: e.target.value })}
                  placeholder="อธิบายผลลัพธ์ *"
                  className="w-full border border-[var(--color-border-input)] rounded-[var(--radius-input)] px-3 py-2 text-xs outline-none focus:border-[var(--color-primary)] resize-none" />
                <div className="flex gap-2">
                  <button type="submit" className="flex-1 bg-green-500 text-white text-xs font-medium py-1.5 rounded-[var(--radius-button)]">บันทึก</button>
                  <button type="button" onClick={() => setImpactFormFor(null)}
                    className="flex-1 border border-[var(--color-border-input)] text-xs py-1.5 rounded-[var(--radius-button)]">ยกเลิก</button>
                </div>
              </form>
            ) : (
              <button onClick={() => setImpactFormFor(dep.id)}
                className="text-xs text-[var(--color-primary)] font-medium">+ รายงาน Impact</button>
            )
          )}
        </div>
      ))}
    </div>
  )
}
