import { httpClient } from './httpClient';
import { ApiResponse } from '../types/api';

export interface Part {
  partID: number;
  name: string;
  description: string;
  minStock: number | null;
  price: number;
}

export interface CreatePartRequest {
  name: string;
  description: string;
  minStock?: number;
  price: number;
}

export interface DeletePartRequest {
  partID: number;
}

class PartService {
  /**
   * Lấy tất cả phụ tùng (Không yêu cầu role)
   */
  async getAllParts(): Promise<Part[]> {
    try {
      const response = await httpClient.get<Part[]>('/ViewPartAPI');
      
      if (response && Array.isArray(response)) {
        return response;
      }
      
      return [];
    } catch (error: any) {
      console.error('Error getting all parts:', error);
      throw new Error(error.message || 'Lỗi khi lấy danh sách phụ tùng');
    }
  }

  /**
   * Tìm kiếm phụ tùng (Không yêu cầu role)
   */
  async searchParts(keyword: string): Promise<Part[]> {
    try {
      const response = await httpClient.get<Part[]>('/SearchPartAPI', { keyword });
      
      if (response && Array.isArray(response)) {
        return response;
      }
      
      return [];
    } catch (error: any) {
      console.error('Error searching parts:', error);
      throw new Error(error.message || 'Lỗi khi tìm kiếm phụ tùng');
    }
  }

  /**
   * Tạo phụ tùng mới (Admin only)
   */
  async createPart(data: CreatePartRequest): Promise<ApiResponse<Part>> {
    try {
      const response = await httpClient.post<Part>('/CreatePartAPI', data);
      
      if (response && response.success) {
        return response;
      }
      
      throw new Error(response?.message || 'Không thể tạo phụ tùng');
    } catch (error: any) {
      console.error('Error creating part:', error);
      throw new Error(error.message || 'Lỗi khi tạo phụ tùng');
    }
  }

  /**
   * Cập nhật phụ tùng (Admin only)
   */
  async updatePart(data: Part): Promise<ApiResponse<Part>> {
    try {
      const response = await httpClient.put<Part>('/EditPartAPI', data);
      
      if (response && response.success) {
        return response;
      }
      
      throw new Error(response?.message || 'Không thể cập nhật phụ tùng');
    } catch (error: any) {
      console.error('Error updating part:', error);
      throw new Error(error.message || 'Lỗi khi cập nhật phụ tùng');
    }
  }

  /**
   * Xóa phụ tùng (Admin only)
   */
  async deletePart(partID: number): Promise<ApiResponse<void>> {
    try {
      const response = await httpClient.deleteWithBody<void>('/DeletePartAPI', { partID });
      
      if (response && response.success) {
        return response;
      }
      
      throw new Error(response?.message || 'Không thể xóa phụ tùng');
    } catch (error: any) {
      console.error('Error deleting part:', error);
      throw new Error(error.message || 'Lỗi khi xóa phụ tùng');
    }
  }

  /**
   * Format giá tiền
   */
  formatPrice(price: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  }
}

export const partService = new PartService();

