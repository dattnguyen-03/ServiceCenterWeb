import { httpClient } from './httpClient';
import { API_CONFIG } from '../config/api';
import { 
  Customer,
  Staff,
  Appointment,
  Part,
  ServiceRecord,
  DashboardStats,
  RevenueReport,
  ServiceReport,
  CustomerFilters,
  AppointmentFilters,
  ServiceFilters,
  PaginatedResponse
} from '../types/api';

class AdminService {
  // Dashboard
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await httpClient.get<DashboardStats>(API_CONFIG.ENDPOINTS.ADMIN.DASHBOARD);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || 'Không thể lấy thông tin dashboard');
  }

  // Customer Management
  async getCustomers(filters?: CustomerFilters): Promise<PaginatedResponse<Customer>> {
    const queryParams = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const endpoint = `${API_CONFIG.ENDPOINTS.ADMIN.CUSTOMERS}?${queryParams.toString()}`;
    const response = await httpClient.get<PaginatedResponse<Customer>>(endpoint);
    
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || 'Không thể lấy danh sách khách hàng');
  }

  async getCustomerDetails(id: string): Promise<Customer> {
    const response = await httpClient.get<Customer>(
      `${API_CONFIG.ENDPOINTS.ADMIN.CUSTOMERS}/${id}`
    );
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || 'Không thể lấy thông tin khách hàng');
  }

  async updateCustomerStatus(id: string, status: 'active' | 'inactive' | 'suspended'): Promise<void> {
    const response = await httpClient.patch(
      `${API_CONFIG.ENDPOINTS.ADMIN.CUSTOMERS}/${id}/status`,
      { status }
    );
    if (!response.success) {
      throw new Error(response.message || 'Cập nhật trạng thái thất bại');
    }
  }

  async deleteCustomer(id: string): Promise<void> {
    const response = await httpClient.delete(
      `${API_CONFIG.ENDPOINTS.ADMIN.CUSTOMERS}/${id}`
    );
    if (!response.success) {
      throw new Error(response.message || 'Xóa khách hàng thất bại');
    }
  }

  // Staff Management
  async getStaff(): Promise<Staff[]> {
    const response = await httpClient.get<Staff[]>(API_CONFIG.ENDPOINTS.ADMIN.STAFF);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || 'Không thể lấy danh sách nhân viên');
  }

  async createStaff(staff: Omit<Staff, 'id' | 'createdAt' | 'updatedAt'>): Promise<Staff> {
    const response = await httpClient.post<Staff>(
      API_CONFIG.ENDPOINTS.ADMIN.STAFF,
      staff
    );
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || 'Thêm nhân viên thất bại');
  }

  async updateStaff(id: string, staff: Partial<Staff>): Promise<Staff> {
    const response = await httpClient.put<Staff>(
      `${API_CONFIG.ENDPOINTS.ADMIN.STAFF}/${id}`,
      staff
    );
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || 'Cập nhật nhân viên thất bại');
  }

  async deleteStaff(id: string): Promise<void> {
    const response = await httpClient.delete(
      `${API_CONFIG.ENDPOINTS.ADMIN.STAFF}/${id}`
    );
    if (!response.success) {
      throw new Error(response.message || 'Xóa nhân viên thất bại');
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

    const endpoint = `${API_CONFIG.ENDPOINTS.ADMIN.APPOINTMENTS}?${queryParams.toString()}`;
    const response = await httpClient.get<PaginatedResponse<Appointment>>(endpoint);
    
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || 'Không thể lấy danh sách lịch hẹn');
  }

  async assignTechnician(appointmentId: string, technicianId: string): Promise<void> {
    const response = await httpClient.patch(
      `${API_CONFIG.ENDPOINTS.ADMIN.APPOINTMENTS}/${appointmentId}/assign`,
      { technicianId }
    );
    if (!response.success) {
      throw new Error(response.message || 'Phân công kỹ thuật viên thất bại');
    }
  }

  // Parts Management
  async getParts(): Promise<Part[]> {
    const response = await httpClient.get<Part[]>(API_CONFIG.ENDPOINTS.ADMIN.PARTS);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || 'Không thể lấy danh sách phụ tùng');
  }

  async createPart(part: Omit<Part, 'id' | 'createdAt' | 'updatedAt'>): Promise<Part> {
    const response = await httpClient.post<Part>(
      API_CONFIG.ENDPOINTS.ADMIN.PARTS,
      part
    );
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || 'Thêm phụ tùng thất bại');
  }

  async updatePart(id: string, part: Partial<Part>): Promise<Part> {
    const response = await httpClient.put<Part>(
      `${API_CONFIG.ENDPOINTS.ADMIN.PARTS}/${id}`,
      part
    );
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || 'Cập nhật phụ tùng thất bại');
  }

  async deletePart(id: string): Promise<void> {
    const response = await httpClient.delete(
      `${API_CONFIG.ENDPOINTS.ADMIN.PARTS}/${id}`
    );
    if (!response.success) {
      throw new Error(response.message || 'Xóa phụ tùng thất bại');
    }
  }

  async updatePartStock(id: string, quantity: number): Promise<void> {
    const response = await httpClient.patch(
      `${API_CONFIG.ENDPOINTS.ADMIN.PARTS}/${id}/stock`,
      { quantity }
    );
    if (!response.success) {
      throw new Error(response.message || 'Cập nhật tồn kho thất bại');
    }
  }

  // Financial Reports
  async getRevenueReport(dateFrom: string, dateTo: string): Promise<RevenueReport[]> {
    const response = await httpClient.get<RevenueReport[]>(
      `${API_CONFIG.ENDPOINTS.ADMIN.FINANCE}/revenue?dateFrom=${dateFrom}&dateTo=${dateTo}`
    );
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || 'Không thể lấy báo cáo doanh thu');
  }

  // Revenue API Methods
  async getTotalRevenue(dateFrom?: string, dateTo?: string, centerID?: number): Promise<any> {
    const params: Record<string, any> = {};
    if (dateFrom) params.dateFrom = dateFrom;
    if (dateTo) params.dateTo = dateTo;
    if (centerID) params.centerID = centerID;
    
    const response = await httpClient.get<any>(
      API_CONFIG.ENDPOINTS.REVENUE.TOTAL,
      params
    );
    // Backend returns { success: true, data: {...} }
    if (response && response.success && response.data) {
      return response.data;
    }
    // Fallback: response might be direct data
    if (response && !response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || 'Không thể lấy tổng doanh thu');
  }

  async getTodayRevenue(centerID?: number): Promise<any> {
    const params: Record<string, any> = {};
    if (centerID) params.centerID = centerID;
    
    const response = await httpClient.get<any>(
      API_CONFIG.ENDPOINTS.REVENUE.TODAY,
      params
    );
    if (response && response.success && response.data) {
      return response.data;
    }
    if (response && !response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || 'Không thể lấy doanh thu hôm nay');
  }

  async getMonthRevenue(centerID?: number): Promise<any> {
    const params: Record<string, any> = {};
    if (centerID) params.centerID = centerID;
    
    const response = await httpClient.get<any>(
      API_CONFIG.ENDPOINTS.REVENUE.MONTH,
      params
    );
    if (response && response.success && response.data) {
      return response.data;
    }
    if (response && !response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || 'Không thể lấy doanh thu tháng');
  }

  async getRevenueByPeriod(dateFrom: string, dateTo: string, periodType: string = 'day'): Promise<any[]> {
    const params: Record<string, any> = {
      dateFrom,
      dateTo,
      periodType
    };
    
    const response = await httpClient.get<any[]>(
      API_CONFIG.ENDPOINTS.REVENUE.BY_PERIOD,
      params
    );
    if (response && response.success && response.data) {
      return Array.isArray(response.data) ? response.data : [];
    }
    if (response && !response.success && Array.isArray(response.data)) {
      return response.data;
    }
    throw new Error(response.message || 'Không thể lấy doanh thu theo kỳ');
  }

  async getRevenueByService(dateFrom?: string, dateTo?: string, centerID?: number): Promise<any[]> {
    const params: Record<string, any> = {};
    if (dateFrom) params.dateFrom = dateFrom;
    if (dateTo) params.dateTo = dateTo;
    if (centerID) params.centerID = centerID;
    
    const response = await httpClient.get<any[]>(
      API_CONFIG.ENDPOINTS.REVENUE.BY_SERVICE,
      params
    );
    if (response && response.success && response.data) {
      return Array.isArray(response.data) ? response.data : [];
    }
    if (response && !response.success && Array.isArray(response.data)) {
      return response.data;
    }
    throw new Error(response.message || 'Không thể lấy doanh thu theo dịch vụ');
  }

  async getRevenueByCenter(dateFrom?: string, dateTo?: string): Promise<any[]> {
    const params: Record<string, any> = {};
    if (dateFrom) params.dateFrom = dateFrom;
    if (dateTo) params.dateTo = dateTo;
    
    const response = await httpClient.get<any[]>(
      API_CONFIG.ENDPOINTS.REVENUE.BY_CENTER,
      params
    );
    if (response && response.success && response.data) {
      return Array.isArray(response.data) ? response.data : [];
    }
    if (response && !response.success && Array.isArray(response.data)) {
      return response.data;
    }
    throw new Error(response.message || 'Không thể lấy doanh thu theo trung tâm');
  }

  async getDashboardRevenue(centerID?: number): Promise<any> {
    const params: Record<string, any> = {};
    if (centerID) params.centerID = centerID;
    
    const response = await httpClient.get<any>(
      API_CONFIG.ENDPOINTS.REVENUE.DASHBOARD,
      params
    );
    if (response && response.success && response.data) {
      return response.data;
    }
    if (response && !response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || 'Không thể lấy dữ liệu dashboard doanh thu');
  }

  async getServiceReport(dateFrom: string, dateTo: string): Promise<ServiceReport[]> {
    const response = await httpClient.get<ServiceReport[]>(
      `${API_CONFIG.ENDPOINTS.ADMIN.REPORTS}/services?dateFrom=${dateFrom}&dateTo=${dateTo}`
    );
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || 'Không thể lấy báo cáo dịch vụ');
  }

  async exportReport(type: 'revenue' | 'service', dateFrom: string, dateTo: string): Promise<void> {
    const endpoint = `${API_CONFIG.ENDPOINTS.ADMIN.REPORTS}/export?type=${type}&dateFrom=${dateFrom}&dateTo=${dateTo}`;
    
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Export failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${type}-report-${dateFrom}-${dateTo}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      throw new Error('Xuất báo cáo thất bại');
    }
  }

  // Service Management
  async getServices(filters?: ServiceFilters): Promise<PaginatedResponse<ServiceRecord>> {
    const queryParams = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const endpoint = `${API_CONFIG.ENDPOINTS.COMMON.SERVICES}?${queryParams.toString()}`;
    const response = await httpClient.get<PaginatedResponse<ServiceRecord>>(endpoint);
    
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || 'Không thể lấy danh sách dịch vụ');
  }

  async updateServiceStatus(id: string, status: ServiceRecord['status']): Promise<void> {
    const response = await httpClient.patch(
      `${API_CONFIG.ENDPOINTS.COMMON.SERVICES}/${id}/status`,
      { status }
    );
    if (!response.success) {
      throw new Error(response.message || 'Cập nhật trạng thái dịch vụ thất bại');
    }
  }
}

export const adminService = new AdminService();
export default adminService;