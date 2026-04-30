import { useState, useEffect } from 'react'
import { leaderboardApi } from '../shared/api'
import { PageHeader } from '../shared/components/PageHeader'
import { SegmentedTabs } from '../shared/components/SegmentedTabs'
import type { LeaderboardCategory, LeaderboardEntry, LeaderboardPeriod } from '../shared/types'

const CATEGORIES: { key: LeaderboardCategory; label: string }[] = [
  { key: 'top_innovator',    label: 'นักสร้างไอเดีย' },
  { key: 'impact_champion',  label: 'Impact' },
  { key: 'community_catalyst', label: 'ชุมชน' },
  { key: 'idea_adopter',     label: 'นำไปใช้' },
  { key: 'rising_star',      label: 'ดาวรุ่ง' },
]

const PERIODS: { value: LeaderboardPeriod; label: string }[] = [
  { value: 'month',   label: 'เดือนนี้' },
  { value: 'quarter', label: 'ไตรมาสนี้' },
  { value: 'all',     label: 'ตลอดกาล' },
]

const BADGE_LABELS: Record<string, string> = {
  first_idea: '🌱', approved_innovator: '💡', trendsetter: '🔥',
  serial_innovator: '🚀', impact_maker: '📊', adoption_driver: '🤝',
  community_builder: '💬', top_contributor: '⭐',
}

const RANK_COLORS = ['text-yellow-500', 'text-gray-400', 'text-amber-600']

export function LeaderboardPage() {
  const [category, setCategory] = useState<LeaderboardCategory>('top_innovator')
  const [period, setPeriod] = useState<LeaderboardPeriod>('month')
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    leaderboardApi.fetch(category, period).then(({ data }) => {
      setEntries(data)
      setLoading(false)
    })
  }, [category, period])

  return (
    <div className="min-h-screen bg-[var(--color-bg-body)]">
      <PageHeader title="อันดับ" />

      <div className="px-[var(--spacing-page-x)] py-4 space-y-4">
        {/* Category tabs — horizontal scroll */}
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-[var(--spacing-page-x)] px-[var(--spacing-page-x)]">
          {CATEGORIES.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setCategory(key)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-[var(--radius-tab)] text-sm font-medium transition-colors ${
                category === key
                  ? 'bg-[var(--color-primary)] text-white'
                  : 'bg-white text-[var(--color-text-primary)] border border-[var(--color-border)]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Period selector */}
        <SegmentedTabs
          tabs={PERIODS}
          active={period}
          onChange={(v) => setPeriod(v as LeaderboardPeriod)}
        />

        {/* Entries */}
        {loading ? (
          <p className="text-center text-[var(--color-text-secondary)] py-12">กำลังโหลด...</p>
        ) : entries.length === 0 ? (
          <p className="text-center text-[var(--color-text-secondary)] py-12">ยังไม่มีข้อมูล</p>
        ) : (
          <div className="space-y-[var(--spacing-gap-card)]">
            {entries.map((entry) => (
              <div
                key={entry.user.id}
                className="bg-[var(--color-bg-surface)] rounded-[var(--radius-card)] shadow-[var(--shadow-card)] p-4 flex items-center gap-3"
              >
                <span className={`w-7 text-center font-bold text-lg ${RANK_COLORS[entry.rank - 1] ?? 'text-[var(--color-text-secondary)]'}`}>
                  {entry.rank <= 3 ? ['🥇','🥈','🥉'][entry.rank - 1] : entry.rank}
                </span>
                <div className="w-10 h-10 rounded-full bg-[var(--color-bg-badge)] flex items-center justify-center text-lg overflow-hidden flex-shrink-0">
                  {entry.user.avatar_url
                    ? <img src={entry.user.avatar_url} alt="" className="w-full h-full object-cover" />
                    : entry.user.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-[var(--color-text-primary)] truncate">{entry.user.name}</p>
                  <div className="flex gap-1 mt-0.5">
                    {entry.badges.map((b) => (
                      <span key={b} title={b}>{BADGE_LABELS[b] ?? '🏷️'}</span>
                    ))}
                  </div>
                </div>
                <span className="font-bold text-[var(--color-primary)] text-base">{entry.score.toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
