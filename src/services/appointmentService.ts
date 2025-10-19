import { httpClient } from './httpClient';
import { API_CONFIG } from '../config/api';
import { AppointmentSummary } from '../types/api';

export interface Appointment {
  appointmentID: number;
  userName: string;
  vehicleModel: string;
  serviceType: string;
  centerName: string;
  requestedDate: string;
  status: string;
}

export interface BookAppointmentRequest {
  vehicleID: number;
  serviceType: string; // backend expects ServiceName here
  centerID: number;
  requestedDate: string; // ISO string
}

export interface BookAppointmentResponse {
  message?: string;
}

class AppointmentService {
  async book(data: BookAppointmentRequest): Promise<string> {
    const res = await httpClient.post<BookAppointmentResponse>(
      API_CONFIG.ENDPOINTS.APPOINTMENT.BOOK,
      data
    );

    // Backend typically returns { message } or ApiResponse
    if (typeof res === 'string') return res;
    if (res && (res as any).message) return (res as any).message as string;
    if ((res as any).success && (res as any).message) return (res as any).message as string;

    return 'Đặt lịch thành công';
  }

  async getMyAppointments(): Promise<AppointmentSummary[]> {
    try {
      const response = await httpClient.get<AppointmentSummary[]>(
        API_CONFIG.ENDPOINTS.APPOINTMENT.VIEW
      );

      // Backend may return array directly or wrapped { success, data }
      if (Array.isArray(response)) return response;
      if (response && typeof response === 'object' && 'success' in response) {
        const anyRes: any = response as any;
        if (anyRes.success && Array.isArray(anyRes.data)) {
          return anyRes.data as AppointmentSummary[];
        }
      }
      throw new Error('Không thể tải danh sách lịch hẹn');
    } catch (error: any) {
      console.error('Error getting appointments:', error);
      throw new Error(error.message || 'Lỗi tải lịch hẹn');
    }
  }

  // Get all appointments (Staff/Admin)
  async getAllAppointments(): Promise<Appointment[]> {
    try {
      console.log('Fetching all appointments...');
      const response = await httpClient.get<Appointment[]>(
        API_CONFIG.ENDPOINTS.APPOINTMENT.GET_ALL
      );

      console.log('Appointments response:', response);

      // Backend may return array directly or wrapped { success, data } or { message, data }
      if (Array.isArray(response)) return response;
      if (response && typeof response === 'object') {
        const anyRes: any = response as any;
        if (anyRes.success && Array.isArray(anyRes.data)) {
          return anyRes.data as Appointment[];
        }
        if (Array.isArray(anyRes.data)) {
          return anyRes.data as Appointment[];
        }
      }
      throw new Error('Không thể tải danh sách lịch hẹn');
    } catch (error: any) {
      console.error('Error getting all appointments:', error);
      throw new Error(error.message || 'Lỗi tải danh sách lịch hẹn');
    }
  }
}

export const appointmentService = new AppointmentService();
export default appointmentService;
