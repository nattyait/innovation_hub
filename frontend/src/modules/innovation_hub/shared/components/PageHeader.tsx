import { useNavigate } from 'react-router-dom'

interface Props {
  title: string
  showBack?: boolean
  action?: React.ReactNode
}

export function PageHeader({ title, showBack = false, action }: Props) {
  const navigate = useNavigate()
  return (
    <div className="gradient-header px-4 pt-12 pb-6">
      <div className="flex items-center justify-between">
        {showBack ? (
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1 bg-white/80 rounded-full px-3 py-1.5 text-sm text-[var(--color-text-primary)]"
          >
            ← กลับ
          </button>
        ) : (
          <div />
        )}
        {action && <div>{action}</div>}
      </div>
      <h1 className="mt-3 text-2xl font-bold text-[var(--color-text-primary)]">{title}</h1>
    </div>
  )
}
