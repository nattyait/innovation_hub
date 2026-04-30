import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { ideasApi } from '../shared/api'
import type { Idea } from '../shared/types'
import { SegmentedTabs } from '../shared/components/SegmentedTabs'
import { HeartBudgetBar } from '../shared/components/HeartBudgetBar'
import { IdeaCard } from './IdeaCard'
import { useAuth } from '../shared/hooks/useAuth'

type TabValue = 'all' | 'approved' | 'mine' | 'pending'

export function IdeaListPage() {
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [tab, setTab] = useState<TabValue>('all')
  const [loading, setLoading] = useState(true)
  const [remainingHearts, setRemainingHearts] = useState(0)
  const navigate = useNavigate()
  const { user, isManager } = useAuth()

  useEffect(() => {
    if (user) setRemainingHearts(user.remaining_hearts)
  }, [user])

  const TABS = [
    { label: 'ทั้งหมด',  value: 'all'     as TabValue },
    { label: 'อนุมัติ',  value: 'approved' as TabValue },
    { label: 'ของฉัน',   value: 'mine'    as TabValue },
    ...(isManager ? [{ label: 'รออนุมัติ', value: 'pending' as TabValue }] : []),
  ]

  const fetchIdeas = useCallback(() => {
    setLoading(true)
    const call =
      tab === 'pending'
        ? ideasApi.pendingApprovals()
        : ideasApi.list({
            ...(tab === 'mine'     ? { mine: true }             : {}),
            ...(tab === 'approved' ? { status: 'approved' }     : {}),
            sort: 'hearts',
          })
    call.then(({ data }) => setIdeas(data)).finally(() => setLoading(false))
  }, [tab])

  useEffect(() => { fetchIdeas() }, [fetchIdeas])

  const handleHeartToggle = (id: number, heart_count: number, hearted: boolean, heart_id: number | null, newRemaining: number) => {
    setIdeas((prev) => prev.map((i) => i.id === id ? { ...i, heart_count, hearted, heart_id } : i))
    setRemainingHearts(newRemaining)
  }

  return (
    <div>
      <div className="gradient-header px-4 pt-12 pb-4">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Innovation Ideas</h1>
          <div className="flex items-center gap-2">
            <HeartBudgetBar remaining={remainingHearts} />
            <button
              onClick={() => navigate('/innovation/ideas/new')}
              className="w-10 h-10 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center shadow-fab text-xl"
            >
              +
            </button>
          </div>
        </div>
        <SegmentedTabs tabs={TABS} active={tab} onChange={(v) => setTab(v as TabValue)} />
      </div>

      <div className="px-4 py-4">
        {loading ? (
          <div className="text-center py-16 text-[var(--color-text-secondary)]">กำลังโหลด...</div>
        ) : ideas.length === 0 ? (
          <div className="text-center py-16 text-[var(--color-text-secondary)]">
            {tab === 'pending' ? 'ไม่มีไอเดียรออนุมัติ' : tab === 'mine' ? 'ยังไม่มีไอเดียของคุณ' : 'ยังไม่มีไอเดีย'}
          </div>
        ) : (
          <div className="space-y-3">
            {ideas.map((idea) => (
              <IdeaCard
                key={idea.id}
                idea={idea}
                remainingHearts={remainingHearts}
                onHeartToggle={handleHeartToggle}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
