import { useState, useEffect } from 'react';
import { organizationService } from '@/services/organizationService';
import { projectService } from '@/services/projectService';
import { workerService } from '@/services/workerService';
import { OrgDetailResponse, ProjectResponse, WorkerResponse } from '@/lib/api';

export const useCurrentOrganization = () => {
  const [organization, setOrganization] = useState<OrgDetailResponse | null>(null);
  const [projects, setProjects] = useState<ProjectResponse[]>([]);
  const [workers, setWorkers] = useState<WorkerResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const selectedOrgId = localStorage.getItem('selectedOrgId');
      if (!selectedOrgId) {
        setError('No organization selected');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Fetch organization, projects, and workers in parallel
        const [orgData, projectsData, workersData] = await Promise.all([
          organizationService.getOrganization(selectedOrgId),
          projectService.getProjects(selectedOrgId),
          workerService.getWorkers(selectedOrgId)
        ]);

        setOrganization(orgData);
        setProjects(projectsData);
        setWorkers(workersData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const refetchData = async () => {
    const selectedOrgId = localStorage.getItem('selectedOrgId');
    if (selectedOrgId) {
      try {
        const [projectsData, workersData] = await Promise.all([
          projectService.getProjects(selectedOrgId),
          workerService.getWorkers(selectedOrgId)
        ]);
        setProjects(projectsData);
        setWorkers(workersData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to refresh data');
      }
    }
  };

  return {
    organization,
    projects,
    workers,
    isLoading,
    error,
    refetchData
  };
};