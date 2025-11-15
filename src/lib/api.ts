// API Configuration and utilities
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const USE_MOCK_API = !API_BASE_URL || API_BASE_URL === '';
console.log('API_BASE_URL:', API_BASE_URL, 'USE_MOCK_API:', USE_MOCK_API);

// Types based on your API documentation
export interface LoginRequest {
  usernameOrEmail: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  tokenType: string;
}

export interface ApiResponse {
  success: boolean;
  message: string;
}

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  orgMemberships: OrgMembership[];
}

export interface OrgMembership {
  orgId: string;
  orgName: string;
  roles: string[];
  permissions: string[];
}

export interface OrgDetailResponse {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  createdBy: string;
  availableRoles: string[];
  yourPermissions: string[];
}

export interface ProjectResponse {
  id: string;
  name: string;
  orderNo: string;
  el1No: string;
  projectCode: string;
  startingDate: string;
  tentativeEndingDate: string;
  status: 'PLANNING' | 'IN_PROGRESS' | 'ON_HOLD' | 'COMPLETED' | 'CANCELLED';
  orgId: string;
  orgName: string;
  createdBy: string;
  createdAt: string;
  teamMembers: string[];
  taskCount: number;
}

export interface WorkerResponse {
  id: string;
  name: string;
  uanNumber: string;
  contactNumber: string;
  bankDetails: {
    accountNumber: string;
    ifscCode: string;
    bankName: string;
    branch: string;
  };
  tenderIds: string[];
  orgIds: string[];
  tags: string[];
  isActive: boolean;
}

export interface CreateProjectRequest {
  name: string;
  orderNo: string;
  el1No: string;
  projectCode?: string;
  startingDate: string;
  tentativeEndingDate: string;
  initialTeamMembers?: string[];
}

export interface CreateWorkerRequest {
  name: string;
  uanNumber: string;
  contactNumber?: string;
  bankDetails?: {
    accountNumber: string;
    ifscCode: string;
    bankName: string;
    branch: string;
  };
  tags?: string[];
  orgIds: string[];
}

// Token management
const TOKEN_KEY = 'buizzment_token';

export const tokenManager = {
  getToken: (): string | null => localStorage.getItem(TOKEN_KEY),
  setToken: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  removeToken: () => localStorage.removeItem(TOKEN_KEY),
  isAuthenticated: (): boolean => !!localStorage.getItem(TOKEN_KEY)
};

// Mock API Client for development
const mockApiClient = {
  login: (credentials: LoginRequest): LoginResponse => {
    // Mock login - accept any credentials for demo
    return {
      accessToken: 'mock-jwt-token-' + Date.now(),
      tokenType: 'Bearer'
    };
  },

  getCurrentUser: (): UserProfile => {
    return {
      id: 'user-1',
      username: 'demo',
      email: 'demo@test.com',
      orgMemberships: [
        {
          orgId: 'org-1',
          orgName: 'Demo Organization',
          roles: ['ADMIN'],
          permissions: ['READ', 'WRITE', 'DELETE']
        }
      ]
    };
  },

  getOrganization: (orgId: string): OrgDetailResponse => {
    return {
      id: orgId,
      name: 'Demo Organization',
      description: 'A demo organization for testing',
      createdAt: new Date().toISOString(),
      createdBy: 'user-1',
      availableRoles: ['ADMIN', 'MANAGER', 'MEMBER'],
      yourPermissions: ['READ', 'WRITE', 'DELETE']
    };
  },

  getProjects: (orgId: string): ProjectResponse[] => {
    return [
      {
        id: 'proj-1',
        name: 'Highway Construction Project',
        orderNo: 'ORD-2024-001',
        el1No: 'EL1-2024-001',
        projectCode: 'HCP-001',
        startingDate: '2024-01-15',
        tentativeEndingDate: '2024-12-31',
        status: 'IN_PROGRESS',
        orgId: orgId,
        orgName: 'Demo Organization',
        createdBy: 'user-1',
        createdAt: new Date().toISOString(),
        teamMembers: ['user-1', 'user-2', 'user-3'],
        taskCount: 15
      },
      {
        id: 'proj-2',
        name: 'Bridge Renovation',
        orderNo: 'ORD-2024-002',
        el1No: 'EL1-2024-002',
        projectCode: 'BR-002',
        startingDate: '2024-02-01',
        tentativeEndingDate: '2025-01-31',
        status: 'PLANNING',
        orgId: orgId,
        orgName: 'Demo Organization',
        createdBy: 'user-1',
        createdAt: new Date().toISOString(),
        teamMembers: ['user-1', 'user-4'],
        taskCount: 8
      },
      {
        id: 'proj-3',
        name: 'Road Maintenance Phase 1',
        orderNo: 'ORD-2023-015',
        el1No: 'EL1-2023-015',
        projectCode: 'RM-015',
        startingDate: '2023-11-01',
        tentativeEndingDate: '2024-03-31',
        status: 'COMPLETED',
        orgId: orgId,
        orgName: 'Demo Organization',
        createdBy: 'user-1',
        createdAt: new Date().toISOString(),
        teamMembers: ['user-1', 'user-2'],
        taskCount: 25
      }
    ];
  },

  getWorkers: (orgId: string): WorkerResponse[] => {
    return [
      {
        id: 'worker-1',
        name: 'Rajesh Kumar',
        uanNumber: 'UAN123456789',
        contactNumber: '+91-9876543210',
        bankDetails: {
          accountNumber: '1234567890',
          ifscCode: 'SBIN0001234',
          bankName: 'State Bank of India',
          branch: 'Main Branch'
        },
        tenderIds: ['proj-1', 'proj-3'],
        orgIds: [orgId],
        tags: ['skilled', 'supervisor'],
        isActive: true
      },
      {
        id: 'worker-2',
        name: 'Amit Singh',
        uanNumber: 'UAN987654321',
        contactNumber: '+91-9876543211',
        bankDetails: {
          accountNumber: '0987654321',
          ifscCode: 'HDFC0001234',
          bankName: 'HDFC Bank',
          branch: 'City Branch'
        },
        tenderIds: ['proj-1', 'proj-2'],
        orgIds: [orgId],
        tags: ['skilled', 'operator'],
        isActive: true
      },
      {
        id: 'worker-3',
        name: 'Suresh Patel',
        uanNumber: 'UAN456789123',
        contactNumber: '+91-9876543212',
        bankDetails: {
          accountNumber: '4567891230',
          ifscCode: 'ICIC0001234',
          bankName: 'ICICI Bank',
          branch: 'Industrial Area'
        },
        tenderIds: ['proj-3'],
        orgIds: [orgId],
        tags: ['general'],
        isActive: false
      }
    ];
  }
};

// HTTP client with auth headers
class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    // Use mock API if no backend URL is configured
    if (USE_MOCK_API) {
      console.warn('⚠️ Using MOCK API - VITE_API_BASE_URL is not set. Request:', options.method || 'GET', endpoint);
      return this.getMockResponse<T>(endpoint, options.method || 'GET', options.body);
    }

    const token = tokenManager.getToken();
    
    const url = `${this.baseURL}${endpoint}`;
    console.log('🌐 Making API Request:', options.method || 'GET', url);
    console.log('📦 Request Body:', options.body);
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      console.log('📥 API Response Status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.text();
        console.error('❌ API Error:', response.status, errorData);
        throw new Error(`API Error: ${response.status} - ${errorData}`);
      }

      const data = await response.json();
      console.log('✅ API Success:', data);
      return data;
    } catch (error) {
      console.error('❌ API request failed:', error);
      // Don't silently fall back to mock - throw the error instead
      throw error;
    }
  }

  private getMockResponse<T>(endpoint: string, method: string, body?: any): T {
    if (method === 'POST' && endpoint === '/auth/signin') {
      return mockApiClient.login(body ? JSON.parse(body as string) : {}) as T;
    }
    
    if (endpoint === '/users/me') {
      return mockApiClient.getCurrentUser() as T;
    }

    // Handle /workers?orgId=xxx format
    if (endpoint.startsWith('/workers?orgId=')) {
      const orgId = endpoint.split('orgId=')[1];
      return mockApiClient.getWorkers(orgId) as T;
    }

    if (endpoint.startsWith('/orgs/')) {
      const parts = endpoint.split('/');
      const orgId = parts[2];
      
      if (parts[3] === 'projects') {
        if (method === 'POST') {
          // Handle project creation
          const requestData = body ? JSON.parse(body as string) : {};
          const projects = mockApiClient.getProjects(orgId);
          const newProject: ProjectResponse = {
            id: `proj-${Date.now()}`,
            name: requestData.name || '',
            orderNo: requestData.orderNo || '',
            el1No: requestData.el1No || '',
            projectCode: requestData.projectCode || requestData.orderNo || '',
            startingDate: requestData.startingDate || '',
            tentativeEndingDate: requestData.tentativeEndingDate || '',
            status: 'PLANNING',
            orgId: orgId,
            orgName: 'Demo Organization',
            createdBy: 'user-1',
            createdAt: new Date().toISOString(),
            teamMembers: requestData.initialTeamMembers || [],
            taskCount: 0
          };
          return newProject as T;
        }
        return mockApiClient.getProjects(orgId) as T;
      }
      if (parts[3] === 'workers') {
        return mockApiClient.getWorkers(orgId) as T;
      }
      return mockApiClient.getOrganization(orgId) as T;
    }

    // Handle POST /attendances/
    if (method === 'POST' && endpoint === '/attendances/') {
      const requestData = body ? JSON.parse(body as string) : {};
      return {
        id: `attendance-${Date.now()}`,
        tenderId: requestData.tenderId || '',
        monthYear: requestData.monthYear || '',
        startDate: requestData.startDate || '',
        endDate: requestData.endDate || '',
        createdAt: new Date().toISOString(),
      } as T;
    }

    throw new Error(`Mock endpoint not implemented: ${method} ${endpoint}`);
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient(API_BASE_URL || '');