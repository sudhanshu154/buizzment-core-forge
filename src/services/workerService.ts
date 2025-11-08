import { apiClient, WorkerResponse, CreateWorkerRequest } from '@/lib/api';

export const workerService = {
  // Get all workers for an organization
  async getWorkers(orgId: string): Promise<WorkerResponse[]> {
    return apiClient.get<WorkerResponse[]>(`/workers?orgId=${orgId}`);
  },

  // Create new worker
  async createWorker(worker: CreateWorkerRequest): Promise<WorkerResponse> {
    return apiClient.post<WorkerResponse>('/workers', worker);
  },

  // Bulk import workers
  async bulkImportWorkers(orgId: string, file: File): Promise<{ importedCount: number; message: string }> {
    const formData = new FormData();
    formData.append('file', file);
    
    const token = localStorage.getItem('buizzment_token');
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || '/api'}/workers/bulk-import/${orgId}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    return response.json();
  }
};