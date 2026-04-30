import client from './client'
import type { Idea, IdeaStatus, IdeaComment } from '../types'

export const ideasApi = {
  list: (params?: { status?: IdeaStatus; category?: string; sort?: string; mine?: boolean; community_id?: number }) =>
    client.get<Idea[]>('/ideas', { params }),

  get: (id: number) => client.get<Idea>(`/ideas/${id}`),

  create: (data: { title: string; body: string; category: string; tags?: string[]; community_ids?: number[] }) =>
    client.post<Idea>('/ideas', { idea: data }),

  update: (id: number, data: Partial<{ title: string; body: string; category: string; tags: string[]; community_ids: number[] }>) =>
    client.patch<Idea>(`/ideas/${id}`, { idea: data }),

  delete: (id: number) => client.delete(`/ideas/${id}`),

  submit: (id: number) =>
    client.patch<Idea>(`/ideas/${id}/submit`),

  retractIdea: (id: number) =>
    client.patch<Idea>(`/ideas/${id}/retract`),

  approve: (id: number) =>
    client.patch<Idea>(`/ideas/${id}/approve`),

  decline: (id: number, reason?: string) =>
    client.patch<Idea>(`/ideas/${id}/decline`, { reason }),

  returnIdea: (id: number, return_reason: string) =>
    client.patch<Idea>(`/ideas/${id}/return`, { return_reason }),

  giveHeart: (ideaId: number, comment?: string) =>
    client.post<{ heart_id: number; heart_count: number; remaining_hearts: number }>(
      `/ideas/${ideaId}/hearts`, { comment }
    ),

  removeHeart: (heartId: number) =>
    client.delete<{ heart_count: number; remaining_hearts: number }>(`/hearts/${heartId}`),

  listComments: (ideaId: number) =>
    client.get<IdeaComment[]>(`/ideas/${ideaId}/comments`),

  addComment: (ideaId: number, body: string) =>
    client.post<IdeaComment>(`/ideas/${ideaId}/comments`, { body }),

  deleteComment: (commentId: number) =>
    client.delete(`/comments/${commentId}`),

  upvoteComment: (commentId: number) =>
    client.post<{ upvote_count: number }>(`/comments/${commentId}/upvote`),

  removeCommentUpvote: (commentId: number) =>
    client.delete<{ upvote_count: number }>(`/comments/${commentId}/upvote`),

  pendingApprovals: () =>
    client.get<Idea[]>('/ideas/pending_approvals'),
}
