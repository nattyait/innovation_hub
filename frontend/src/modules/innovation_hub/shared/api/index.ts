export { ideasApi } from './ideas'
export { projectsApi } from './projects'
export { communitiesApi } from './communities'
export { leaderboardApi } from './leaderboard'
export { impactsApi } from './impacts'
export { default as client } from './client'

import client from './client'
import type { Notification, User } from '../types'

export const authApi = {
  login: (email: string, password: string) =>
    client.post<{ token: string; user: User }>('/sessions', { email, password }),

  persona: (persona: 'employee' | 'manager' | 'admin' | 'sponsor') =>
    client.post<{ token: string; user: User }>('/sessions/persona', { persona }),
}

export const notificationsApi = {
  list: () => client.get<{ notifications: Notification[]; unread_count: number }>('/notifications'),
  markAllRead: () => client.patch('/notifications/mark_read'),
}

export const summaryApi = {
  get: () => client.get('/summary'),
  trendingIdeas: () => client.get('/summary/trending_ideas'),
  topLeaderboard: () => client.get('/summary/leaderboard'),
}
