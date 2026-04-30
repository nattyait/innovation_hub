interface Tab<T> { label: string; value: T }

interface Props<T> {
  tabs: Tab<T>[]
  active: T
  onChange: (value: T) => void
}

export function SegmentedTabs<T extends string>({ tabs, active, onChange }: Props<T>) {
  return (
    <div className="flex gap-1 bg-[var(--color-bg-badge)] rounded-[var(--radius-tab)] p-1">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={`flex-1 rounded-[var(--radius-tab)] px-4 py-2 text-sm font-medium transition-all ${
            active === tab.value
              ? 'bg-[var(--color-primary)] text-white shadow-btn'
              : 'text-[var(--color-text-secondary)]'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
