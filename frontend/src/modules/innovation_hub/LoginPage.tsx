import { useNavigate } from 'react-router-dom'
import { useAuth } from './shared/hooks/useAuth'

const PERSONAS = [
  { key: 'employee'      as const, label: 'พนักงาน',         icon: '👤', desc: 'เสนอไอเดีย • ให้หัวใจ' },
  { key: 'admin'         as const, label: 'แอดมิน',          icon: '🛡️', desc: 'Moderate • อนุมัติไอเดีย' },
  { key: 'sponsor'       as const, label: 'Sponsor/หัวหน้า', icon: '💼', desc: 'ดูข้อมูล • พิจารณา Sponsor' },
  { key: 'project_owner' as const, label: 'Project Owner',   icon: '🚀', desc: 'อัปเดตโปรเจค Incubator' },
]

export function LoginPage() {
  const { loginAsPersona } = useAuth()
  const navigate = useNavigate()

  const handleLogin = async (persona: typeof PERSONAS[number]['key']) => {
    await loginAsPersona(persona)
    navigate('/innovation/ideas')
  }

  return (
    <div className="min-h-dvh gradient-header flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">💡</div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Innovation Hub</h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">Krungthai POC — เลือก persona เพื่อเข้าสู่ระบบ</p>
        </div>
        <div className="space-y-3">
          {PERSONAS.map((p) => (
            <button
              key={p.key}
              onClick={() => handleLogin(p.key)}
              className="w-full bg-[var(--color-bg-surface)] rounded-[var(--radius-card)] shadow-card p-4 flex items-center gap-4 text-left"
            >
              <span className="text-3xl">{p.icon}</span>
              <div>
                <p className="font-semibold">{p.label}</p>
                <p className="text-xs text-[var(--color-text-secondary)]">{p.desc}</p>
              </div>
              <span className="ml-auto text-[var(--color-text-secondary)]">›</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
