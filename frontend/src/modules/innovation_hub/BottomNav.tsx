import { NavLink } from 'react-router-dom'
import { useAuth } from './shared/hooks/useAuth'

const BASE_NAV = [
  { to: '/innovation/ideas',       label: 'ไอเดีย', icon: '💡' },
  { to: '/innovation/community',   label: 'ชุมชน',  icon: '🤝' },
  { to: '/innovation/projects',    label: 'โปรเจค', icon: '🚀' },
  { to: '/innovation/leaderboard', label: 'อันดับ', icon: '🏆' },
]

const ADMIN_NAV = { to: '/innovation/admin', label: 'Admin', icon: '🛡️' }

export function BottomNav() {
  const { user } = useAuth()
  const nav = user?.role === 'admin' ? [...BASE_NAV, ADMIN_NAV] : BASE_NAV

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-[var(--color-border)] flex safe-b">
      {nav.map(({ to, label, icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center py-2.5 gap-0.5 text-xs transition-colors ${
              isActive ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-secondary)]'
            }`
          }
        >
          <span className="text-xl">{icon}</span>
          {label}
        </NavLink>
      ))}
    </nav>
  )
}
