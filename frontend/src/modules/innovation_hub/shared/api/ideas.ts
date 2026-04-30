import client from './client'
import type { Idea, IdeaStatus } from '../types'

export const ideasApi = {
  list: (params?: { status?: IdeaStatus; category?: string; sort?: string; mine?: boolean }) =>
    client.get<Idea[]>('/ideas', { params }),

  get: (id: number) => client.get<Idea>(`/ideas/${id}`),

  create: (data: { title: string; body: string; category: string; tags?: string[] }) =>
    client.post<Idea>('/ideas', { idea: data }),

  update: (id: number, data: Partial<{ title: string; body: string; category: string; tags: string[] }>) =>
    client.patch<Idea>(`/ideas/${id}`, { idea: data }),

  delete: (id: number) => client.delete(`/ideas/${id}`),

  changeStatus: (id: number, status: IdeaStatus) =>
    client.patch<Idea>(`/ideas/${id}/change_status`, { status }),

  giveHeart: (ideaId: number, comment?: string) =>
    client.post<{ heart_id: number; heart_count: number; remaining_hearts: number }>(
      `/ideas/${ideaId}/hearts`, { comment }
    ),

  removeHeart: (heartId: number) =>
    client.delete<{ heart_count: number; remaining_hearts: number }>(`/hearts/${heartId}`),

  listComments: (ideaId: number) =>
    client.get(`/ideas/${ideaId}/comments`),

  addComment: (ideaId: number, body: string) =>
    client.post(`/ideas/${ideaId}/comments`, { body }),

  deleteComment: (commentId: number) =>
    client.delete(`/comments/${commentId}`),
}
