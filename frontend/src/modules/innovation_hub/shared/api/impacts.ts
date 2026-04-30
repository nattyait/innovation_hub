import client from './client'
import type { IdeaApplication, IdeaImpact, ImpactType } from '../types'

export const impactsApi = {
  listApplications: (ideaId: number) =>
    client.get<IdeaApplication[]>(`/ideas/${ideaId}/applications`),

  createApplication: (ideaId: number, data: { department?: string; description: string }) =>
    client.post<IdeaApplication>(`/ideas/${ideaId}/applications`, data),

  createImpact: (
    applicationId: number,
    data: {
      people_affected: number
      time_saved_hours?: number
      cost_saved_thb?: number
      impact_type: ImpactType
      description: string
      evidence_url?: string
    }
  ) => client.post<IdeaImpact>(`/applications/${applicationId}/impact`, data),
}
