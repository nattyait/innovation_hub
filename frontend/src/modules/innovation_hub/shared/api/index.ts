export { ideasApi } from './ideas'
export { projectsApi } from './projects'
export { default as client } from './client'

import client from './client'
import type { ClassroomCourse, Notification, User } from '../types'

export const authApi = {
  login: (email: string, password: string) =>
    client.post<{ token: string; user: User }>('/sessions', { email, password }),

  persona: (persona: 'employee' | 'admin' | 'sponsor' | 'project_owner') =>
    client.post<{ token: string; user: User }>('/sessions/persona', { persona }),
}

export const classroomApi = {
  list: (params?: { category?: string }) =>
    client.get<ClassroomCourse[]>('/classroom_courses', { params }),

  get: (id: number) => client.get<ClassroomCourse>(`/classroom_courses/${id}`),
}

export const notificationsApi = {
  list: () => client.get<{ notifications: Notification[]; unread_count: number }>('/notifications'),
  markAllRead: () => client.patch('/notifications/mark_read'),
}

export const summaryApi = {
  get: () => client.get('/summary'),
  trendingIdeas: () => client.get('/summary/trending_ideas'),
  activeProjects: () => client.get('/summary/active_projects'),
}
