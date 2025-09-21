import { httpClient } from './httpClient';
import { API_CONFIG } from '../config/api';
import { 
  Customer,
  Appointment,
  CreateAppointmentRequest,
  Vehicle,
  ServiceRecord,
  Payment,
  CreatePaymentRequest,
  DashboardStats,
  AppointmentFilters,
  PaginatedResponse
} from '../types/api';

class CustomerService {
  // Profile Management
  async getProfile(): Promise<Customer> {
    const response = await httpClient.get<Customer>(API_CONFIG.ENDPOINTS.CUSTOMER.PROFILE);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || 'Không thể lấy thông tin profile');
  }

  async updateProfile(data: Partial<Customer>): Promise<Customer> {
    const response = await httpClient.put<Customer>(
      API_CONFIG.ENDPOINTS.CUSTOMER.PROFILE,
      data
    );
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || 'Cập nhật profile thất bại');
  }

  // Vehicle Management
  async getVehicles(): Promise<Vehicle[]> {
    const response = await httpClient.get<Vehicle[]>(API_CONFIG.ENDPOINTS.CUSTOMER.VEHICLES);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || 'Không thể lấy danh sách xe');
  }

  async addVehicle(vehicle: Omit<Vehicle, 'id' | 'customerId' | 'createdAt' | 'updatedAt'>): Promise<Vehicle> {
    const response = await httpClient.post<Vehicle>(
      API_CONFIG.ENDPOINTS.CUSTOMER.VEHICLES,
      vehicle
    );
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || 'Thêm xe thất bại');
  }

  async updateVehicle(id: string, vehicle: Partial<Vehicle>): Promise<Vehicle> {
    const response = await httpClient.put<Vehicle>(
      `${API_CONFIG.ENDPOINTS.CUSTOMER.VEHICLES}/${id}`,
      vehicle
    );
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || 'Cập nhật xe thất bại');
  }

  async deleteVehicle(id: string): Promise<void> {
    const response = await httpClient.delete(
      `${API_CONFIG.ENDPOINTS.CUSTOMER.VEHICLES}/${id}`
    );
    if (!response.success) {
      throw new Error(response.message || 'Xóa xe thất bại');
    }
  }

  // Appointment Management
  async getAppointments(filters?: AppointmentFilters): Promise<PaginatedResponse<Appointment>> {
    const queryParams = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const endpoint = `${API_CONFIG.ENDPOINTS.CUSTOMER.APPOINTMENTS}?${queryParams.toString()}`;
    const response = await httpClient.get<PaginatedResponse<Appointment>>(endpoint);
    
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || 'Không thể lấy danh sách lịch hẹn');
  }

  async createAppointment(appointment: CreateAppointmentRequest): Promise<Appointment> {
    const response = await httpClient.post<Appointment>(
      API_CONFIG.ENDPOINTS.CUSTOMER.APPOINTMENTS,
      appointment
    );
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || 'Đặt lịch hẹn thất bại');
  }

  async updateAppointment(id: string, data: Partial<Appointment>): Promise<Appointment> {
    const response = await httpClient.put<Appointment>(
      `${API_CONFIG.ENDPOINTS.CUSTOMER.APPOINTMENTS}/${id}`,
      data
    );
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || 'Cập nhật lịch hẹn thất bại');
  }

  async cancelAppointment(id: string): Promise<void> {
    const response = await httpClient.patch(
      `${API_CONFIG.ENDPOINTS.CUSTOMER.APPOINTMENTS}/${id}/cancel`
    );
    if (!response.success) {
      throw new Error(response.message || 'Hủy lịch hẹn thất bại');
    }
  }

  // Service History
  async getServiceHistory(): Promise<ServiceRecord[]> {
    const response = await httpClient.get<ServiceRecord[]>(
      API_CONFIG.ENDPOINTS.CUSTOMER.SERVICE_HISTORY
    );
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || 'Không thể lấy lịch sử dịch vụ');
  }

  async getServiceDetails(id: string): Promise<ServiceRecord> {
    const response = await httpClient.get<ServiceRecord>(
      `${API_CONFIG.ENDPOINTS.CUSTOMER.SERVICE_HISTORY}/${id}`
    );
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || 'Không thể lấy chi tiết dịch vụ');
  }

  // Payment Management
  async getPayments(): Promise<Payment[]> {
    const response = await httpClient.get<Payment[]>(API_CONFIG.ENDPOINTS.CUSTOMER.PAYMENTS);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || 'Không thể lấy danh sách thanh toán');
  }

  async createPayment(payment: CreatePaymentRequest): Promise<Payment> {
    const response = await httpClient.post<Payment>(
      API_CONFIG.ENDPOINTS.CUSTOMER.PAYMENTS,
      payment
    );
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || 'Thanh toán thất bại');
  }

  async getPaymentDetails(id: string): Promise<Payment> {
    const response = await httpClient.get<Payment>(
      `${API_CONFIG.ENDPOINTS.CUSTOMER.PAYMENTS}/${id}`
    );
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || 'Không thể lấy chi tiết thanh toán');
  }

  // Dashboard
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await httpClient.get<DashboardStats>(
      `${API_CONFIG.ENDPOINTS.CUSTOMER.PROFILE}/dashboard`
    );
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || 'Không thể lấy thông tin dashboard');
  }

  // Available time slots
  async getAvailableTimeSlots(date: string, serviceType: string): Promise<string[]> {
    const response = await httpClient.get<string[]>(
      `${API_CONFIG.ENDPOINTS.COMMON.APPOINTMENTS}/available-slots?date=${date}&serviceType=${serviceType}`
    );
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || 'Không thể lấy thời gian trống');
  }

  // Service types
  async getServiceTypes(): Promise<{ id: string; name: string; estimatedDuration: number; basePrice: number }[]> {
    const response = await httpClient.get<{ id: string; name: string; estimatedDuration: number; basePrice: number }[]>(
      API_CONFIG.ENDPOINTS.COMMON.SERVICES
    );
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || 'Không thể lấy danh sách dịch vụ');
  }
}

export const customerService = new CustomerService();
export default customerService;