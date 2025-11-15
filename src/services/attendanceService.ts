import { apiClient } from '@/lib/api';

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
  startDate: string;
  endDate: string;
  createdAt: string;
}

export const attendanceService = {
  // Create new attendance sheet
  async createAttendanceSheet(data: CreateAttendanceSheetRequest): Promise<AttendanceSheetResponse> {
    return apiClient.post<AttendanceSheetResponse>('/attendances/', data);
  },
};


