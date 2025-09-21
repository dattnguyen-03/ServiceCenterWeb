import { httpClient } from './httpClient';
import { 
  ApiResponse, 
  PaginationParams, 
  PaginatedResponse,
  StaffDashboardStats,
  Order,
  OrderStatus,
  UpdateOrderStatusRequest,
  Appointment,
  AppointmentStatus,
  UpdateAppointmentStatusRequest,
  WorkReport,
  CreateWorkReportRequest,
  Customer,
  ServiceRequest,
  ServiceRequestStatus,
  UpdateServiceRequestRequest,
  User
} from '../types/api';

class StaffService {
  // Dashboard & Statistics
  async getDashboardStats(): Promise<ApiResponse<StaffDashboardStats>> {
    return httpClient.get<StaffDashboardStats>('/staff/dashboard/stats');
  }

  // Order Management
  async getOrders(params?: PaginationParams & { 
    status?: OrderStatus;
    search?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<ApiResponse<PaginatedResponse<Order>>> {
    return httpClient.get<PaginatedResponse<Order>>('/staff/orders', params);
  }

  async getOrderById(id: string): Promise<ApiResponse<Order>> {
    return httpClient.get<Order>(`/staff/orders/${id}`);
  }

  async updateOrderStatus(id: string, data: UpdateOrderStatusRequest): Promise<ApiResponse<Order>> {
    return httpClient.put<Order>(`/staff/orders/${id}/status`, data);
  }

  async assignOrderToTechnician(orderId: string, technicianId: string): Promise<ApiResponse<Order>> {
    return httpClient.post<Order>(`/staff/orders/${orderId}/assign`, { technicianId });
  }

  // Appointment Management
  async getAppointments(params?: PaginationParams & {
    status?: AppointmentStatus;
    date?: string;
    technicianId?: string;
  }): Promise<ApiResponse<PaginatedResponse<Appointment>>> {
    return httpClient.get<PaginatedResponse<Appointment>>('/staff/appointments', params);
  }

  async getAppointmentById(id: string): Promise<ApiResponse<Appointment>> {
    return httpClient.get<Appointment>(`/staff/appointments/${id}`);
  }

  async updateAppointmentStatus(id: string, data: UpdateAppointmentStatusRequest): Promise<ApiResponse<Appointment>> {
    return httpClient.put<Appointment>(`/staff/appointments/${id}/status`, data);
  }

  async scheduleAppointment(customerId: string, data: {
    serviceType: string;
    preferredDate: string;
    preferredTime: string;
    notes?: string;
  }): Promise<ApiResponse<Appointment>> {
    return httpClient.post<Appointment>('/staff/appointments', { customerId, ...data });
  }

  // Customer Management (Basic)
  async getCustomers(params?: PaginationParams & {
    search?: string;
    status?: 'active' | 'inactive';
  }): Promise<ApiResponse<PaginatedResponse<Customer>>> {
    return httpClient.get<PaginatedResponse<Customer>>('/staff/customers', params);
  }

  async getCustomerById(id: string): Promise<ApiResponse<Customer>> {
    return httpClient.get<Customer>(`/staff/customers/${id}`);
  }

  async getCustomerOrders(customerId: string, params?: PaginationParams): Promise<ApiResponse<PaginatedResponse<Order>>> {
    return httpClient.get<PaginatedResponse<Order>>(`/staff/customers/${customerId}/orders`, params);
  }

  async getCustomerAppointments(customerId: string, params?: PaginationParams): Promise<ApiResponse<PaginatedResponse<Appointment>>> {
    return httpClient.get<PaginatedResponse<Appointment>>(`/staff/customers/${customerId}/appointments`, params);
  }

  // Service Request Management
  async getServiceRequests(params?: PaginationParams & {
    status?: ServiceRequestStatus;
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    technicianId?: string;
  }): Promise<ApiResponse<PaginatedResponse<ServiceRequest>>> {
    return httpClient.get<PaginatedResponse<ServiceRequest>>('/staff/service-requests', params);
  }

  async getServiceRequestById(id: string): Promise<ApiResponse<ServiceRequest>> {
    return httpClient.get<ServiceRequest>(`/staff/service-requests/${id}`);
  }

  async updateServiceRequest(id: string, data: UpdateServiceRequestRequest): Promise<ApiResponse<ServiceRequest>> {
    return httpClient.put<ServiceRequest>(`/staff/service-requests/${id}`, data);
  }

  async assignServiceRequestToTechnician(requestId: string, technicianId: string): Promise<ApiResponse<ServiceRequest>> {
    return httpClient.post<ServiceRequest>(`/staff/service-requests/${requestId}/assign`, { technicianId });
  }

  // Work Reports
  async getWorkReports(params?: PaginationParams & {
    dateFrom?: string;
    dateTo?: string;
    technicianId?: string;
  }): Promise<ApiResponse<PaginatedResponse<WorkReport>>> {
    return httpClient.get<PaginatedResponse<WorkReport>>('/staff/work-reports', params);
  }

  async createWorkReport(data: CreateWorkReportRequest): Promise<ApiResponse<WorkReport>> {
    return httpClient.post<WorkReport>('/staff/work-reports', data);
  }

  async getWorkReportById(id: string): Promise<ApiResponse<WorkReport>> {
    return httpClient.get<WorkReport>(`/staff/work-reports/${id}`);
  }

  // Technician Management
  async getAvailableTechnicians(date?: string, serviceType?: string): Promise<ApiResponse<User[]>> {
    const params: Record<string, string> = {};
    if (date) params.date = date;
    if (serviceType) params.serviceType = serviceType;
    
    return httpClient.get<User[]>('/staff/technicians/available', params);
  }

  async getTechnicianWorkload(technicianId: string, date?: string): Promise<ApiResponse<{
    totalTasks: number;
    completedTasks: number;
    pendingTasks: number;
    workingHours: number;
  }>> {
    const params = date ? { date } : undefined;
    return httpClient.get(`/staff/technicians/${technicianId}/workload`, params);
  }

  // Notifications
  async getNotifications(params?: PaginationParams): Promise<ApiResponse<PaginatedResponse<{
    id: string;
    title: string;
    message: string;
    type: 'info' | 'warning' | 'error' | 'success';
    isRead: boolean;
    createdAt: string;
  }>>> {
    return httpClient.get('/staff/notifications', params);
  }

  async markNotificationAsRead(id: string): Promise<ApiResponse<void>> {
    return httpClient.put(`/staff/notifications/${id}/read`);
  }

  async markAllNotificationsAsRead(): Promise<ApiResponse<void>> {
    return httpClient.put('/staff/notifications/read-all');
  }
}

export const staffService = new StaffService();