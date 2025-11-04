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
      const response = await httpClient.post<any>('/CreatePartAPI', data) as any;
      
      // Backend trả về {message: '...', part: {...}} không có field success
      if (response && response.part) {
        // Map response về format ApiResponse
        return {
          success: true,
          message: response.message || 'Tạo phụ tùng thành công',
          data: response.part as Part
        };
      }
      
      // Nếu có message nhưng không có part, có thể là lỗi
      if (response && response.message && !response.part) {
        throw new Error(response.message);
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
      const response = await httpClient.put<any>('/EditPartAPI', data);
      
      // Backend trả về {message, part} hoặc {success, data, message}
      if (response) {
        // Nếu có response.success (format ApiResponse)
        if (response.success && response.data) {
          return {
            success: true,
            data: response.data,
            message: response.message || 'Cập nhật phụ tùng thành công'
          };
        }
        
        // Nếu có response.part (format backend)
        if (response.part) {
          return {
            success: true,
            data: response.part,
            message: response.message || 'Cập nhật phụ tùng thành công'
          };
        }
        
        // Nếu response là Part trực tiếp
        if (response.partID) {
          return {
            success: true,
            data: response as Part,
            message: 'Cập nhật phụ tùng thành công'
          };
        }
      }
      
      throw new Error('Không thể cập nhật phụ tùng: Response không hợp lệ');
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
      const response = await httpClient.deleteWithBody<any>('/DeletePartAPI', { partID }) as any;
      
      // Nếu httpClient không throw error, nghĩa là status code là 200-299 (thành công)
      // Backend trả về {message: '...'} không có field success
      if (response && response.message) {
        return {
          success: true,
          message: response.message,
          data: undefined
        };
      }
      
      // Nếu có success field (format cũ hoặc format khác)
      if (response && response.success) {
        return response;
      }
      
      // Fallback: nếu không có message hoặc success, coi như thành công
      return {
        success: true,
        message: 'Xóa phụ tùng thành công',
        data: undefined
      };
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

