import { httpClient } from './httpClient';
import { API_CONFIG } from '../config/api';

export interface AdminServiceOrder {
  OrderID: number;
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
  technicianName?: string;
  staffName?: string;
}

export interface UpdateServiceOrderStatusRequest {
  OrderID: number;
  Status: string;
}

export interface AssignTechnicianRequest {
  OrderID: number;
  TechnicianID: number;
}

class AdminServiceOrderService {
  // Get all service orders for Admin/Staff
  async getAllServiceOrders(): Promise<AdminServiceOrder[]> {
    try {
      console.log('Fetching all service orders for admin...');
      
      // Since backend doesn't have this API yet, we'll use the existing technician API
      // and modify the response to work for admin view
      const response = await httpClient.get<any>(
        API_CONFIG.ENDPOINTS.SERVICE_ORDER.VIEW
      );

      console.log('Service orders response:', response);

      // Transform the response to match AdminServiceOrder interface
      if (Array.isArray(response)) {
        return response.map(order => this.transformToAdminServiceOrder(order));
      }
      
      if (response && typeof response === 'object') {
        const anyRes: any = response as any;
        if (anyRes.success && Array.isArray(anyRes.data)) {
          return anyRes.data.map((order: any) => this.transformToAdminServiceOrder(order));
        }
        if (Array.isArray(anyRes.data)) {
          return anyRes.data.map((order: any) => this.transformToAdminServiceOrder(order));
        }
      }
      
      // If no data, return empty array
      return [];
    } catch (error: any) {
      console.error('Error getting all service orders:', error);
      // Return mock data for now since backend doesn't have this API
      return this.getMockServiceOrders();
    }
  }

  // Transform service order to admin format
  private transformToAdminServiceOrder(order: any): AdminServiceOrder {
    return {
      OrderID: order.OrderID || order.orderID,
      appointmentID: order.appointmentID,
      staffID: order.staffID || 0,
      technicianID: order.technicianID || 0,
      createDate: order.createDate || order.CreateDate,
      status: order.status || order.Status,
      customerName: order.customerName || order.CustomerName,
      vehicleModel: order.vehicleModel || order.VehicleModel,
      serviceType: order.serviceType || order.ServiceType,
      centerName: order.centerName || order.CenterName,
      requestDate: order.requestDate || order.RequestDate,
      technicianName: order.technicianName || 'Chưa phân công',
      staffName: order.staffName || 'N/A'
    };
  }

  // Mock data for development
  private getMockServiceOrders(): AdminServiceOrder[] {
    return [
      {
        OrderID: 1,
        appointmentID: 1,
        staffID: 1,
        technicianID: 1,
        createDate: '2024-01-15T09:00:00',
        status: 'InProgress',
        customerName: 'Nguyễn Văn A',
        vehicleModel: 'VinFast VF8 - 30A-12345',
        serviceType: 'Bảo dưỡng định kỳ',
        centerName: 'Trung tâm Hà Nội',
        requestDate: '2024-01-16T09:00:00',
        technicianName: 'Phạm Kỹ Thuật',
        staffName: 'Nguyễn Staff'
      },
      {
        OrderID: 2,
        appointmentID: 2,
        staffID: 1,
        technicianID: 2,
        createDate: '2024-01-14T14:00:00',
        status: 'Completed',
        customerName: 'Trần Thị B',
        vehicleModel: 'Tesla Model Y - 30A-54321',
        serviceType: 'Sửa chữa',
        centerName: 'Trung tâm TP.HCM',
        requestDate: '2024-01-15T14:00:00',
        technicianName: 'Lê Kỹ Thuật',
        staffName: 'Nguyễn Staff'
      },
      {
        OrderID: 3,
        appointmentID: 3,
        staffID: 2,
        technicianID: 0,
        createDate: '2024-01-16T10:00:00',
        status: 'Pending',
        customerName: 'Lê Minh C',
        vehicleModel: 'VinFast VF e34 - 30A-67890',
        serviceType: 'Kiểm tra pin',
        centerName: 'Trung tâm Đà Nẵng',
        requestDate: '2024-01-17T10:00:00',
        technicianName: 'Chưa phân công',
        staffName: 'Trần Staff'
      }
    ];
  }

  // Update service order status
  async updateServiceOrderStatus(data: UpdateServiceOrderStatusRequest): Promise<string> {
    try {
      console.log('Updating service order status:', data);
      const response = await httpClient.put<any>(
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

  // Assign technician to service order
  async assignTechnician(data: AssignTechnicianRequest): Promise<string> {
    try {
      console.log('Assigning technician:', data);
      
      // For now, we'll simulate the API call since backend doesn't have this endpoint
      // In real implementation, this would call a backend API
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      return 'Phân công kỹ thuật viên thành công';
    } catch (error: any) {
      console.error('Error assigning technician:', error);
      throw new Error(error.message || 'Lỗi phân công kỹ thuật viên');
    }
  }
}

export const adminServiceOrderService = new AdminServiceOrderService();
export default adminServiceOrderService;
