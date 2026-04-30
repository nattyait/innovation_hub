interface Props {
  hearted: boolean
  count: number
  onClick: () => void
  disabled?: boolean
}

export function HeartButton({ hearted, count, onClick, disabled }: Props) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick() }}
      disabled={disabled}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all disabled:opacity-40"
      style={{
        borderColor: hearted ? 'var(--color-heart)' : 'var(--color-border)',
        color: hearted ? 'var(--color-heart)' : 'var(--color-text-secondary)',
      }}
    >
      <span className="text-base">{hearted ? '❤️' : '🤍'}</span>
      <span className="text-sm font-medium">{count}</span>
    </button>
  )
}
