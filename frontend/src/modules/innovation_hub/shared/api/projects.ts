import client from './client'
import type { IncubatorProject, ProjectStatus, ProjectUpdate, ProjectDiscussion } from '../types'

export const projectsApi = {
  list: (params?: { active?: boolean }) =>
    client.get<IncubatorProject[]>('/incubator_projects', { params }),

  get: (id: number) => client.get<IncubatorProject>(`/incubator_projects/${id}`),

  update: (id: number, data: Partial<IncubatorProject>) =>
    client.patch<IncubatorProject>(`/incubator_projects/${id}`, { incubator_project: data }),

  changeStatus: (id: number, status: ProjectStatus) =>
    client.patch<IncubatorProject>(`/incubator_projects/${id}/change_status`, { status }),

  listUpdates: (projectId: number) =>
    client.get<ProjectUpdate[]>(`/incubator_projects/${projectId}/project_updates`),

  addUpdate: (projectId: number, data: { body: string; milestone_tag?: string }) =>
    client.post<ProjectUpdate>(`/incubator_projects/${projectId}/project_updates`, { project_update: data }),

  listDiscussions: (projectId: number) =>
    client.get<ProjectDiscussion[]>(`/incubator_projects/${projectId}/project_discussions`),

  addDiscussion: (projectId: number, body: string) =>
    client.post<ProjectDiscussion>(`/incubator_projects/${projectId}/project_discussions`, { body }),

  deleteDiscussion: (id: number) =>
    client.delete(`/project_discussions/${id}`),
}
