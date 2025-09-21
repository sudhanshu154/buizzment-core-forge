import { apiClient, tokenManager, LoginRequest, LoginResponse, UserProfile } from '@/lib/api';

export const authService = {
  // Login user
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/auth/signin', credentials);
    tokenManager.setToken(response.accessToken);
    return response;
  },

  // Get current user profile
  async getCurrentUser(): Promise<UserProfile> {
    return apiClient.get<UserProfile>('/users/me');
  },

  // Logout user
  logout(): void {
    tokenManager.removeToken();
  },

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return tokenManager.isAuthenticated();
  }
};