import { httpClient } from './httpClient';
import { 
  ApiResponse, 
  PaginationParams, 
  PaginatedResponse,
  TechnicianDashboardStats,
  TechnicianTask,
  CreateTechnicianTaskRequest,
  UpdateTechnicianTaskRequest,
  WorkReport,
  CreateWorkReportRequest,
  PartRequest,
  CreatePartRequestRequest,
  Order,
  Appointment,
  ServiceRequest,
  Part
} from '../types/api';

class TechnicianService {
  // Dashboard & Statistics
  async getDashboardStats(): Promise<ApiResponse<TechnicianDashboardStats>> {
    return httpClient.get<TechnicianDashboardStats>('/technician/dashboard/stats');
  }

  // Task Management
  async getTasks(params?: PaginationParams & { 
    status?: TechnicianTask['status'];
    priority?: TechnicianTask['priority'];
    dateFrom?: string;
    dateTo?: string;
  }): Promise<ApiResponse<PaginatedResponse<TechnicianTask>>> {
    return httpClient.get<PaginatedResponse<TechnicianTask>>('/technician/tasks', params);
  }

  async getTaskById(id: string): Promise<ApiResponse<TechnicianTask>> {
    return httpClient.get<TechnicianTask>(`/technician/tasks/${id}`);
  }

  async createTask(data: CreateTechnicianTaskRequest): Promise<ApiResponse<TechnicianTask>> {
    return httpClient.post<TechnicianTask>('/technician/tasks', data);
  }

  async updateTask(id: string, data: UpdateTechnicianTaskRequest): Promise<ApiResponse<TechnicianTask>> {
    return httpClient.put<TechnicianTask>(`/technician/tasks/${id}`, data);
  }

  async startTask(id: string): Promise<ApiResponse<TechnicianTask>> {
    return httpClient.post<TechnicianTask>(`/technician/tasks/${id}/start`);
  }

  async completeTask(id: string, notes?: string): Promise<ApiResponse<TechnicianTask>> {
    return httpClient.post<TechnicianTask>(`/technician/tasks/${id}/complete`, { notes });
  }

  async pauseTask(id: string, reason?: string): Promise<ApiResponse<TechnicianTask>> {
    return httpClient.post<TechnicianTask>(`/technician/tasks/${id}/pause`, { reason });
  }

  // Work Reports
  async getWorkReports(params?: PaginationParams & {
    dateFrom?: string;
    dateTo?: string;
    status?: 'draft' | 'submitted' | 'approved' | 'rejected';
  }): Promise<ApiResponse<PaginatedResponse<WorkReport>>> {
    return httpClient.get<PaginatedResponse<WorkReport>>('/technician/work-reports', params);
  }

  async createWorkReport(data: CreateWorkReportRequest): Promise<ApiResponse<WorkReport>> {
    return httpClient.post<WorkReport>('/technician/work-reports', data);
  }

  async updateWorkReport(id: string, data: Partial<CreateWorkReportRequest>): Promise<ApiResponse<WorkReport>> {
    return httpClient.put<WorkReport>(`/technician/work-reports/${id}`, data);
  }

  async submitWorkReport(id: string): Promise<ApiResponse<WorkReport>> {
    return httpClient.post<WorkReport>(`/technician/work-reports/${id}/submit`);
  }

  async getWorkReportById(id: string): Promise<ApiResponse<WorkReport>> {
    return httpClient.get<WorkReport>(`/technician/work-reports/${id}`);
  }

  // Parts Management
  async getPartRequests(params?: PaginationParams & {
    status?: PartRequest['status'];
    urgency?: PartRequest['urgency'];
    dateFrom?: string;
    dateTo?: string;
  }): Promise<ApiResponse<PaginatedResponse<PartRequest>>> {
    return httpClient.get<PaginatedResponse<PartRequest>>('/technician/part-requests', params);
  }

  async createPartRequest(data: CreatePartRequestRequest): Promise<ApiResponse<PartRequest>> {
    return httpClient.post<PartRequest>('/technician/part-requests', data);
  }

  async getPartRequestById(id: string): Promise<ApiResponse<PartRequest>> {
    return httpClient.get<PartRequest>(`/technician/part-requests/${id}`);
  }

  async cancelPartRequest(id: string, reason: string): Promise<ApiResponse<PartRequest>> {
    return httpClient.post<PartRequest>(`/technician/part-requests/${id}/cancel`, { reason });
  }

  // Parts Inventory Search
  async searchParts(params?: {
    search?: string;
    category?: string;
    inStock?: boolean;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<PaginatedResponse<Part>>> {
    return httpClient.get<PaginatedResponse<Part>>('/technician/parts/search', params);
  }

  async getPartById(id: string): Promise<ApiResponse<Part>> {
    return httpClient.get<Part>(`/technician/parts/${id}`);
  }

  async checkPartAvailability(partId: string, quantity: number): Promise<ApiResponse<{
    available: boolean;
    availableQuantity: number;
    estimatedRestockDate?: string;
  }>> {
    return httpClient.get(`/technician/parts/${partId}/availability`, { quantity: quantity.toString() });
  }

  // Orders & Appointments (Read-only)
  async getAssignedOrders(params?: PaginationParams): Promise<ApiResponse<PaginatedResponse<Order>>> {
    return httpClient.get<PaginatedResponse<Order>>('/technician/orders', params);
  }

  async getOrderById(id: string): Promise<ApiResponse<Order>> {
    return httpClient.get<Order>(`/technician/orders/${id}`);
  }

  async getAssignedAppointments(params?: PaginationParams & {
    date?: string;
    status?: 'confirmed' | 'in-progress' | 'completed';
  }): Promise<ApiResponse<PaginatedResponse<Appointment>>> {
    return httpClient.get<PaginatedResponse<Appointment>>('/technician/appointments', params);
  }

  async getAppointmentById(id: string): Promise<ApiResponse<Appointment>> {
    return httpClient.get<Appointment>(`/technician/appointments/${id}`);
  }

  async getAssignedServiceRequests(params?: PaginationParams): Promise<ApiResponse<PaginatedResponse<ServiceRequest>>> {
    return httpClient.get<PaginatedResponse<ServiceRequest>>('/technician/service-requests', params);
  }

  // Progress Updates
  async updateTaskProgress(taskId: string, data: {
    progressPercent: number;
    notes?: string;
    estimatedCompletion?: string;
  }): Promise<ApiResponse<TechnicianTask>> {
    return httpClient.post<TechnicianTask>(`/technician/tasks/${taskId}/progress`, data);
  }

  async addTaskNote(taskId: string, note: string): Promise<ApiResponse<{
    id: string;
    taskId: string;
    note: string;
    createdAt: string;
  }>> {
    return httpClient.post(`/technician/tasks/${taskId}/notes`, { note });
  }

  async getTaskNotes(taskId: string): Promise<ApiResponse<Array<{
    id: string;
    taskId: string;
    note: string;
    createdAt: string;
  }>>> {
    return httpClient.get(`/technician/tasks/${taskId}/notes`);
  }

  // Time Tracking
  async clockIn(taskId?: string): Promise<ApiResponse<{
    id: string;
    technicianId: string;
    taskId?: string;
    clockInTime: string;
  }>> {
    return httpClient.post('/technician/time/clock-in', { taskId });
  }

  async clockOut(): Promise<ApiResponse<{
    id: string;
    technicianId: string;
    taskId?: string;
    clockInTime: string;
    clockOutTime: string;
    totalHours: number;
  }>> {
    return httpClient.post('/technician/time/clock-out');
  }

  async getTimeEntries(params?: PaginationParams & {
    dateFrom?: string;
    dateTo?: string;
  }): Promise<ApiResponse<PaginatedResponse<{
    id: string;
    taskId?: string;
    clockInTime: string;
    clockOutTime?: string;
    totalHours?: number;
    task?: TechnicianTask;
  }>>> {
    return httpClient.get('/technician/time/entries', params);
  }

  // Schedule & Availability
  async getSchedule(params?: {
    dateFrom?: string;
    dateTo?: string;
  }): Promise<ApiResponse<Array<{
    date: string;
    timeSlots: Array<{
      startTime: string;
      endTime: string;
      taskId?: string;
      appointmentId?: string;
      orderId?: string;
      type: 'task' | 'appointment' | 'break' | 'available';
      title?: string;
    }>;
  }>>> {
    return httpClient.get('/technician/schedule', params);
  }

  async updateAvailability(date: string, timeSlots: Array<{
    startTime: string;
    endTime: string;
    available: boolean;
  }>): Promise<ApiResponse<void>> {
    return httpClient.put('/technician/availability', { date, timeSlots });
  }

  // Notifications
  async getNotifications(params?: PaginationParams): Promise<ApiResponse<PaginatedResponse<{
    id: string;
    title: string;
    message: string;
    type: 'info' | 'warning' | 'error' | 'success' | 'task_assigned' | 'deadline_reminder';
    isRead: boolean;
    relatedTaskId?: string;
    relatedOrderId?: string;
    createdAt: string;
  }>>> {
    return httpClient.get('/technician/notifications', params);
  }

  async markNotificationAsRead(id: string): Promise<ApiResponse<void>> {
    return httpClient.put(`/technician/notifications/${id}/read`);
  }

  async markAllNotificationsAsRead(): Promise<ApiResponse<void>> {
    return httpClient.put('/technician/notifications/read-all');
  }
}

export const technicianService = new TechnicianService();