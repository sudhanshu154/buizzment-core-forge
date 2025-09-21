import { apiClient, OrgDetailResponse } from '@/lib/api';

export const organizationService = {
  // Get organization details
  async getOrganization(orgId: string): Promise<OrgDetailResponse> {
    return apiClient.get<OrgDetailResponse>(`/orgs/${orgId}`);
  }
};