// API Configuration and utilities
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
console.log('API_BASE_URL set to:', API_BASE_URL); // Debug log

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
    const token = tokenManager.getToken();
    
    const url = `${this.baseURL}${endpoint}`;
    console.log('API Request URL:', url); // Debug log
    console.log('Base URL:', this.baseURL); // Debug log
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`API Error: ${response.status} - ${errorData}`);
    }

    return response.json();
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

export const apiClient = new ApiClient(API_BASE_URL);