interface Props {
  remaining: number
  total?: number
}

export function HeartBudgetBar({ remaining, total = 10 }: Props) {
  const used = total - remaining
  return (
    <div className="flex items-center gap-2 bg-white/70 backdrop-blur rounded-full px-3 py-1.5">
      <span className="text-base">❤️</span>
      <div className="flex gap-0.5">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: i < used ? 'var(--color-heart)' : 'var(--color-heart-empty)' }}
          />
        ))}
      </div>
      <span className="text-xs font-semibold text-[var(--color-text-primary)]">
        {remaining} / {total}
      </span>
    </div>
  )
}
