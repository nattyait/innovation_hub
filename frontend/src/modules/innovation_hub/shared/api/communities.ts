import client from './client'
import type { Community, Idea } from '../types'

export const communitiesApi = {
  list: () =>
    client.get<Community[]>('/communities'),

  ideas: (id: number, params?: { sort?: string }) =>
    client.get<Idea[]>(`/communities/${id}/ideas`, { params }),
}
