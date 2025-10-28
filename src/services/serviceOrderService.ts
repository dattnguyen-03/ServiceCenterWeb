import { httpClient } from './httpClient';
import { API_CONFIG } from '../config/api';

export interface CreateServiceOrderRequest {
  appointmentID: number;
  technicianID: number;
}

export interface CreateServiceOrderResponse {
  message: string;
}

export interface ServiceOrder {
  OrderID: number; // Backend returns OrderID with capital O
  orderID?: number; // Keep for backward compatibility
  appointmentID: number;
  staffID: number;
  technicianID: number;
  createDate: string;
  status: 'Pending' | 'InProgress' | 'Completed' | 'Cancelled';
  customerName: string;
  vehicleModel: string;
  serviceType: string;
  centerName: string;
  requestDate: string;
  // Payment info
  paymentID?: number;
  paymentMethod?: string; // "online", "cash"
  paymentStatus?: string; // "pending", "completed", "failed"
  paymentAmount?: number;
}

export interface UpdateServiceOrderRequest {
  OrderID: number; // Backend expects OrderID with capital O
  Status: string; // Backend expects Status with capital S
}

export interface UpdateServiceOrderResponse {
  message: string;
}

class ServiceOrderService {
  // Create service order (Staff/Admin)
  async createServiceOrder(data: CreateServiceOrderRequest): Promise<string> {
    try {
      console.log('Sending request to:', API_CONFIG.ENDPOINTS.SERVICE_ORDER.CREATE);
      console.log('Request data:', data);
      
      const response = await httpClient.post<CreateServiceOrderResponse>(
        API_CONFIG.ENDPOINTS.SERVICE_ORDER.CREATE,
        data
      );

      console.log('Response received:', response);

      if (typeof response === 'string') return response;
      if (response && (response as any).message) return (response as any).message as string;
      if ((response as any).success && (response as any).message) return (response as any).message as string;

      return 'Tạo Service Order thành công';
    } catch (error: any) {
      console.error('Error creating service order:', error);
      throw new Error(error.message || 'Lỗi tạo Service Order');
    }
  }

  // Get service orders for technician
  async getMyServiceOrders(): Promise<ServiceOrder[]> {
    try {
      console.log('Fetching service orders...');
      const response = await httpClient.get<ServiceOrder[]>(
        API_CONFIG.ENDPOINTS.SERVICE_ORDER.VIEW
      );

      console.log('Service orders response:', response);

      // Backend returns {message: '...', data: Array}
      if (Array.isArray(response)) return response;
      if (response && typeof response === 'object') {
        const anyRes: any = response as any;
        // Check for both 'success' and 'data' properties, or just 'data' property
        if (anyRes.success && Array.isArray(anyRes.data)) {
          return anyRes.data as ServiceOrder[];
        }
        if (Array.isArray(anyRes.data)) {
          return anyRes.data as ServiceOrder[];
        }
      }
      throw new Error('Không thể tải danh sách Service Order');
    } catch (error: any) {
      console.error('Error getting service orders:', error);
      throw new Error(error.message || 'Lỗi tải Service Order');
    }
  }

  // Get all service orders (Admin/Staff)
  async getAllServiceOrders(): Promise<ServiceOrder[]> {
    try {
      console.log('Fetching all service orders...');
      const response = await httpClient.get<ServiceOrder[]>(
        `/GetServiceOrderAPI`
      );

      console.log('All service orders response:', response);

      if (Array.isArray(response)) return response;
      if (response && typeof response === 'object') {
        const anyRes: any = response as any;
        if (anyRes.success && Array.isArray(anyRes.data)) {
          return anyRes.data as ServiceOrder[];
        }
        if (Array.isArray(anyRes.data)) {
          return anyRes.data as ServiceOrder[];
        }
      }
      throw new Error('Không thể tải danh sách Service Order');
    } catch (error: any) {
      console.error('Error getting all service orders:', error);
      // If error message indicates no service orders, return empty array
      if (error.message && error.message.includes('Không có Service Order nào')) {
        return [];
      }
      throw new Error(error.message || 'Lỗi tải Service Order');
    }
  }

  // Update service order status (Technician)
  async updateServiceOrderStatus(data: UpdateServiceOrderRequest): Promise<string> {
    try {
      console.log('Updating service order status:', data);
      const response = await httpClient.put<UpdateServiceOrderResponse>(
        API_CONFIG.ENDPOINTS.SERVICE_ORDER.UPDATE,
        data
      );

      console.log('Update response:', response);

      if (typeof response === 'string') return response;
      if (response && (response as any).message) return (response as any).message as string;
      if ((response as any).success && (response as any).message) return (response as any).message as string;

      return 'Cập nhật trạng thái thành công';
    } catch (error: any) {
      console.error('Error updating service order:', error);
      throw new Error(error.message || 'Lỗi cập nhật Service Order');
    }
  }

  // Delete service order (Admin only)
  async deleteServiceOrder(orderID: number): Promise<string> {
    try {
      console.log('Deleting service order:', orderID);
      const response = await httpClient.delete<{ message?: string }>(
        `/DeleteServiceOrderAPI`,
        { orderId: orderID }
      );

      console.log('Delete response:', response);
      return response.message || 'Xóa Service Order thành công';
    } catch (error: any) {
      console.error('Error deleting service order:', error);
      throw new Error(error.message || 'Lỗi xóa Service Order');
    }
  }
}

export const serviceOrderService = new ServiceOrderService();
export default serviceOrderService;
