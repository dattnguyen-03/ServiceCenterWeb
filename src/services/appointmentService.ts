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
  vehicleID?: number;
  serviceCenterID?: number;
  paymentMethod?: string; // "online", "cash"
  paymentStatus?: string; // "pending", "completed", "failed"
  paymentAmount?: number;
}

export interface BookAppointmentRequest {
  vehicleID: number;
  serviceType: string; // backend expects ServiceName here
  centerID: number;
  requestedDate: string; // ISO string
}

export interface BookAppointmentResponse {
  message?: string;
  appointmentID?: number;
}

export interface EditAppointmentRequest {
  appointmentID: number;
  serviceType: string;
  vehicleID: number;
  serviceCenterID: number;
  requestedDate: string;
  status: string;
}

export interface DeleteAppointmentRequest {
  appointmentID: number;
}

class AppointmentService {
  async book(data: BookAppointmentRequest): Promise<BookAppointmentResponse> {
    const res = await httpClient.post<BookAppointmentResponse>(
      API_CONFIG.ENDPOINTS.APPOINTMENT.BOOK,
      data
    );

    // Backend returns { message, appointmentID }
    if (res && typeof res === 'object' && 'message' in res) {
      return res as BookAppointmentResponse;
    }

    return { message: 'Đặt lịch thành công' };
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

  // Search appointments by keyword (UserName or Model)
  async searchAppointments(keyword: string): Promise<Appointment[]> {
    try {
      console.log('Searching appointments with keyword:', keyword);
      const response = await httpClient.get<Appointment[]>(
        `/SearchAppointmentAPI?keyword=${encodeURIComponent(keyword)}`
      );

      console.log('Search response:', response);

      // Backend may return array directly or wrapped
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
      return [];
    } catch (error: any) {
      console.error('Error searching appointments:', error);
      throw new Error(error.message || 'Lỗi tìm kiếm lịch hẹn');
    }
  }

  // Edit appointment (Admin only)
  async editAppointment(data: EditAppointmentRequest): Promise<string> {
    try {
      console.log('Editing appointment:', data);
      const response = await httpClient.put<{ message?: string }>(
        `/EditAppointmentAPI?id=${data.appointmentID}`,
        {
          serviceType: data.serviceType,
          vehicleID: data.vehicleID,
          serviceCenterID: data.serviceCenterID,
          requestedDate: data.requestedDate,
          status: data.status,
        }
      );

      console.log('Edit response:', response);
      return response.message || 'Cập nhật lịch hẹn thành công';
    } catch (error: any) {
      console.error('Error editing appointment:', error);
      throw new Error(error.message || 'Lỗi cập nhật lịch hẹn');
    }
  }

  // Delete appointment (Admin only)
  async deleteAppointment(appointmentID: number): Promise<string> {
    try {
      console.log('Deleting appointment:', appointmentID);
      const response = await httpClient.delete<{ message?: string }>(
        `/DeleteAppointmentAPI?id=${appointmentID}`
      );

      console.log('Delete response:', response);
      return response.message || 'Xóa lịch hẹn thành công';
    } catch (error: any) {
      console.error('Error deleting appointment:', error);
      throw new Error(error.message || 'Lỗi xóa lịch hẹn');
    }
  }

  // Cancel appointment (Customer)
  async cancelAppointment(appointmentID: number): Promise<string> {
    try {
      console.log('Canceling appointment:', appointmentID);
      const response = await httpClient.post<{ message?: string }>(
        API_CONFIG.ENDPOINTS.APPOINTMENT.CANCEL,
        { appointmentID }
      );

      console.log('Cancel response:', response);
      return response.message || 'Hủy lịch hẹn thành công';
    } catch (error: any) {
      console.error('Error canceling appointment:', error);
      throw new Error(error.message || 'Lỗi hủy lịch hẹn');
    }
  }
}

export const appointmentService = new AppointmentService();
export default appointmentService;
