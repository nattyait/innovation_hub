import { NavLink } from 'react-router-dom'

const NAV = [
  { to: '/innovation/ideas',    label: 'ไอเดีย',    icon: '💡' },
  { to: '/innovation/classroom', label: 'เรียนรู้',   icon: '📚' },
  { to: '/innovation/projects', label: 'โปรเจค',    icon: '🚀' },
  { to: '/innovation/admin',    label: 'Admin',      icon: '🛡️' },
]

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-[var(--color-border)] flex safe-b">
      {NAV.map(({ to, label, icon }) => (
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
