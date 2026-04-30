import client from './client'
import type { LeaderboardEntry, LeaderboardCategory, LeaderboardPeriod } from '../types'

export const leaderboardApi = {
  fetch: (category: LeaderboardCategory, period: LeaderboardPeriod) =>
    client.get<LeaderboardEntry[]>('/leaderboard', { params: { category, period } }),
}
