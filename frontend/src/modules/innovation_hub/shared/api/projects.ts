import client from './client'
import type {
  InnovationProject, InnovationProjectSummary,
  ProjectTopic, ProjectTopicDetail, ProjectTopicComment,
  ProjectDeployment, ProjectDeploymentImpact,
  SponsorDashboardProject, ImpactType, DeploymentStatus,
} from '../types'

export const projectsApi = {
  // Projects
  list: () =>
    client.get<InnovationProjectSummary[]>('/innovation_projects'),

  get: (id: number) =>
    client.get<InnovationProject>(`/innovation_projects/${id}`),

  create: (data: { idea_id: number; title: string; department?: string; summary?: string }) =>
    client.post<InnovationProject>('/innovation_projects', data),

  update: (id: number, data: Partial<Omit<InnovationProject, 'id' | 'idea' | 'sponsor' | 'members' | 'created_at' | 'updated_at'>>) =>
    client.patch<InnovationProject>(`/innovation_projects/${id}`, data),

  addMember: (id: number, user_id: number, role?: string) =>
    client.post(`/innovation_projects/${id}/add_member`, { user_id, role }),

  removeMember: (id: number, user_id: number) =>
    client.delete(`/innovation_projects/${id}/members/${user_id}`),

  sponsorDashboard: () =>
    client.get<SponsorDashboardProject[]>('/sponsor/dashboard'),

  // Topics
  listTopics: (projectId: number) =>
    client.get<ProjectTopic[]>(`/innovation_projects/${projectId}/topics`),

  getTopic: (projectId: number, topicId: number) =>
    client.get<ProjectTopicDetail>(`/innovation_projects/${projectId}/topics/${topicId}`),

  createTopic: (projectId: number, data: { title: string; body: string }) =>
    client.post<ProjectTopic>(`/innovation_projects/${projectId}/topics`, data),

  addComment: (projectId: number, topicId: number, body: string, parent_id?: number) =>
    client.post<ProjectTopicComment>(
      `/innovation_projects/${projectId}/topics/${topicId}/comments`,
      { body, parent_id }
    ),

  // Deployments
  listDeployments: (projectId: number) =>
    client.get<ProjectDeployment[]>(`/innovation_projects/${projectId}/deployments`),

  createDeployment: (projectId: number, data: { department_name: string; start_date?: string; end_date?: string }) =>
    client.post<ProjectDeployment>(`/innovation_projects/${projectId}/deployments`, data),

  updateDeploymentStatus: (deploymentId: number, status: DeploymentStatus) =>
    client.patch<ProjectDeployment>(`/project_deployments/${deploymentId}`, { status }),

  createDeploymentImpact: (deploymentId: number, data: {
    people_affected: number; time_saved_hours?: number; cost_saved_thb?: number;
    impact_type: ImpactType; description: string; evidence_url?: string
  }) =>
    client.post<ProjectDeploymentImpact>(`/project_deployments/${deploymentId}/impact`, data),
}
