import { apiClient, ProjectResponse, CreateProjectRequest } from '@/lib/api';

export const projectService = {
  // Get all projects for an organization
  async getProjects(orgId: string, status?: string): Promise<ProjectResponse[]> {
    const query = status ? `?status=${status}` : '';
    return apiClient.get<ProjectResponse[]>(`/orgs/${orgId}/projects${query}`);
  },

  // Get project details
  async getProject(orgId: string, projectId: string): Promise<ProjectResponse> {
    return apiClient.get<ProjectResponse>(`/orgs/${orgId}/projects/${projectId}`);
  },

  // Create new project
  async createProject(orgId: string, project: CreateProjectRequest): Promise<ProjectResponse> {
    return apiClient.post<ProjectResponse>(`/orgs/${orgId}/projects`, project);
  }
};