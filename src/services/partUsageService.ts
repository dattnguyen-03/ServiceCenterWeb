import { httpClient } from './httpClient';
import { ApiResponse } from '../types/api';

export interface PartUsage {
  usageID: number;
  orderID: number;
  partID?: number;
  partName: string;
  quantityUsed: number;
}

export interface CreatePartUsageRequest {
  orderID: number;
  partID: number;
  quantityUsed: number;
  centerID: number; // để xác định tồn kho ở trung tâm nào
}

class PartUsageService {
  /**
   * Technician xem PartUsage của các Order mà TechnicianID = UserID của họ
   */
  async getMyPartUsage(): Promise<PartUsage[]> {
    try {
      const response = await httpClient.get<any>('/ViewPartUsageAPI/my-usage');
      
      if (response && response.data && Array.isArray(response.data)) {
        return response.data.map((item: any) => ({
          usageID: item.usageID,
          orderID: item.orderID,
          partID: item.partID,
          partName: item.partName || '',
          quantityUsed: item.quantityUsed || 0,
        }));
      }
      
      if (response && Array.isArray(response)) {
        return response.map((item: any) => ({
          usageID: item.usageID,
          orderID: item.orderID,
          partID: item.partID,
          partName: item.partName || '',
          quantityUsed: item.quantityUsed || 0,
        }));
      }
      
      return [];
    } catch (error: any) {
      // Backend trả về 404 với message "Bạn chưa có bản ghi sử dụng linh kiện nào." 
      // Đây là trường hợp bình thường khi chưa có data, không phải lỗi
      if (error.message && (
        error.message.includes('Bạn chưa có bản ghi') || 
        error.message.includes('Không có dữ liệu') ||
        error.message.includes('404')
      )) {
        console.log('No part usage records found (expected):', error.message);
        return [];
      }
      
      console.error('Error getting my part usage:', error);
      throw new Error(error.message || 'Lỗi khi lấy danh sách sử dụng phụ tùng');
    }
  }

  /**
   * Admin xem tất cả PartUsage
   */
  async getAllPartUsage(): Promise<PartUsage[]> {
    try {
      const response = await httpClient.get<any>('/GetPartUsageAPI/all');
      
      if (response && response.data && Array.isArray(response.data)) {
        return response.data.map((item: any) => ({
          usageID: item.usageID,
          orderID: item.orderID,
          partID: item.partID,
          partName: item.partName || '',
          quantityUsed: item.quantityUsed || 0,
        }));
      }
      
      if (response && Array.isArray(response)) {
        return response.map((item: any) => ({
          usageID: item.usageID,
          orderID: item.orderID,
          partID: item.partID,
          partName: item.partName || '',
          quantityUsed: item.quantityUsed || 0,
        }));
      }
      
      return [];
    } catch (error: any) {
      console.error('Error getting all part usage:', error);
      throw new Error(error.message || 'Lỗi khi lấy danh sách sử dụng phụ tùng');
    }
  }

  /**
   * Admin tìm kiếm PartUsage theo tên Part
   */
  async searchPartUsage(partName: string): Promise<PartUsage[]> {
    try {
      const response = await httpClient.get<any>('/SearchPartUsageAPI/search', { partName });
      
      if (response && response.data && Array.isArray(response.data)) {
        return response.data.map((item: any) => ({
          usageID: item.usageID,
          orderID: item.orderID,
          partID: item.partID,
          partName: item.partName || '',
          quantityUsed: item.quantityUsed || 0,
        }));
      }
      
      if (response && Array.isArray(response)) {
        return response.map((item: any) => ({
          usageID: item.usageID,
          orderID: item.orderID,
          partID: item.partID,
          partName: item.partName || '',
          quantityUsed: item.quantityUsed || 0,
        }));
      }
      
      return [];
    } catch (error: any) {
      console.error('Error searching part usage:', error);
      throw new Error(error.message || 'Lỗi khi tìm kiếm sử dụng phụ tùng');
    }
  }

  /**
   * Admin/Technician tạo PartUsage (sẽ trừ số lượng Inventory)
   */
  async createPartUsage(data: CreatePartUsageRequest): Promise<ApiResponse<PartUsage>> {
    try {
      const response = await httpClient.post<any>('/CreatePartUsageAPI', data);
      
      if (response && response.success !== false) {
        return { success: true, message: response.message || 'Tạo bản ghi sử dụng phụ tùng thành công', data: response.data };
      }
      
      throw new Error(response?.message || 'Không thể tạo bản ghi sử dụng phụ tùng');
    } catch (error: any) {
      console.error('Error creating part usage:', error);
      throw new Error(error.message || 'Lỗi khi tạo bản ghi sử dụng phụ tùng');
    }
  }

  /**
   * Admin xóa PartUsage (sẽ hoàn lại số lượng vào Inventory)
   */
  async deletePartUsage(usageID: number): Promise<ApiResponse<void>> {
    try {
      const response = await httpClient.delete<void>(`/DeletePartUsageAPI/${usageID}`);
      
      if (response && response.success !== false) {
        return { success: true, message: response.message || 'Xóa bản ghi sử dụng phụ tùng thành công' };
      }
      
      throw new Error(response?.message || 'Không thể xóa bản ghi sử dụng phụ tùng');
    } catch (error: any) {
      console.error('Error deleting part usage:', error);
      throw new Error(error.message || 'Lỗi khi xóa bản ghi sử dụng phụ tùng');
    }
  }
}

export const partUsageService = new PartUsageService();

