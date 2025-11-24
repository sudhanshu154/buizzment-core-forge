import { apiClient, ApiResponse, tokenManager } from '@/lib/api';

export interface CreateAttendanceSheetRequest {
  tenderId: string;
  monthYear: string; // Format: "2025-06"
  startDate: string; // Format: "01/06/2025"
  endDate: string; // Format: "31/06/2025"
}

export interface AttendanceSheetResponse {
  id: string;
  tenderId: string;
  monthYear: string;
  startDate: string | null;
  endDate: string | null;
  attendanceIds: string[];
  createdAt: string | null;
}

export interface BulkAttendanceRequest {
  tenderId: string;
  attendanceSheetId: string;
  workerAttendance: Record<string, Record<string, string>>; // workerId -> { date: status }
}

export const attendanceService = {
  // Create new attendance sheet
  async createAttendanceSheet(data: CreateAttendanceSheetRequest): Promise<AttendanceSheetResponse> {
    return apiClient.post<AttendanceSheetResponse>('/attendances/', data);
  },

  // Get all attendance sheets for a tender/project
  async getAttendanceSheets(tenderId: string): Promise<AttendanceSheetResponse[]> {
    return apiClient.get<AttendanceSheetResponse[]>(`/attendances/${tenderId}`);
  },

  // Get attendance data for a specific tender/project and month
  async getAttendanceData(tenderId: string, monthYear: string): Promise<AttendanceDataResponse> {
    return apiClient.get<AttendanceDataResponse>(`/attendances/tender/${tenderId}/month/${monthYear}`);
  },

  // Bulk update attendance
  async bulkUpdateAttendance(data: BulkAttendanceRequest): Promise<ApiResponse> {
    return apiClient.post<ApiResponse>('/attendances/bulk', data);
  },

  // Remove worker from attendance sheet
  async removeWorker(attendanceId: string, sheetId: string): Promise<ApiResponse> {
    // Handle custom response since API returns plain text "Success" instead of JSON
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
    if (!API_BASE_URL) {
      // Use mock API path if no backend
      return apiClient.post<ApiResponse>(`/attendances/remove?attendanceId=${attendanceId}&sheetId=${sheetId}`, {});
    }

    const token = tokenManager.getToken();
    const url = `${API_BASE_URL || '/api'}/attendances/remove?attendanceId=${attendanceId}&sheetId=${sheetId}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`API Error: ${response.status} - ${errorData}`);
    }

    // Try to parse as JSON first, fall back to text if it fails
    const contentType = response.headers.get('content-type');
    let data: ApiResponse;
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      // Handle plain text response like "Success"
      const text = await response.text();
      data = { success: true, message: text || 'Worker removed successfully' };
    }

    return data;
  },

  // Change worker in attendance sheet
  async changeWorker(attendanceId: string, workerId: string): Promise<ApiResponse> {
    // Handle custom response since API might return plain text instead of JSON
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
    if (!API_BASE_URL) {
      // Use mock API path if no backend
      return apiClient.post<ApiResponse>(`/attendances/change?attendanceId=${attendanceId}&workerId=${workerId}`, {});
    }

    const token = tokenManager.getToken();
    const url = `${API_BASE_URL || '/api'}/attendances/change?attendanceId=${attendanceId}&workerId=${workerId}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`API Error: ${response.status} - ${errorData}`);
    }

    // Try to parse as JSON first, fall back to text if it fails
    const contentType = response.headers.get('content-type');
    let data: ApiResponse;
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      // Handle plain text response like "Success"
      const text = await response.text();
      data = { success: true, message: text || 'Worker changed successfully' };
    }

    return data;
  },
};

export interface AttendanceRecord {
  id: string;
  workerId: string;
  dailyRecords: Record<string, string>; // Date string -> "P" | "A" | "O"
  presentDays: number;
  absentDays: number;
}

export interface AttendanceDataResponse {
  id: string | null;
  tenderId: string;
  monthYear: string;
  attendances: AttendanceRecord[];
  totalRecords: number;
}


