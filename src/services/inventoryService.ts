import { httpClient } from './httpClient';
import { ApiResponse } from '../types/api';

export interface Inventory {
  inventoryID: number;
  partID: number;
  partName: string;
  centerID: number;
  centerName: string;
  quantity: number;
}

export interface CreateInventoryRequest {
  partID: number;
  centerID: number;
  quantity: number;
}

class InventoryService {
  /**
   * Lấy tất cả tồn kho (Admin only)
   */
  async getAllInventories(): Promise<Inventory[]> {
    try {
      const response = await httpClient.get<any>('/ViewInventoryAPI');
      
      // Backend trả về { message, data }
      if (response && response.data && Array.isArray(response.data)) {
        return response.data.map((item: any) => ({
          inventoryID: item.inventoryID,
          partID: item.partID || 0,
          partName: item.partName || '',
          centerID: item.centerID || 0,
          centerName: item.centerName || '',
          quantity: item.quantity || 0,
        }));
      }
      
      // Fallback: nếu response trả về trực tiếp array
      if (response && Array.isArray(response)) {
        return response.map((item: any) => ({
          inventoryID: item.inventoryID,
          partID: item.partID || 0,
          partName: item.partName || '',
          centerID: item.centerID || 0,
          centerName: item.centerName || '',
          quantity: item.quantity || 0,
        }));
      }
      
      return [];
    } catch (error: any) {
      console.error('Error getting all inventories:', error);
      throw new Error(error.message || 'Lỗi khi lấy danh sách tồn kho');
    }
  }

  /**
   * Tìm kiếm tồn kho (Admin only)
   */
  async searchInventories(keyword: string): Promise<Inventory[]> {
    try {
      const response = await httpClient.get<any>('/SearchInventoryAPI', { keyword });
      
      // Backend trả về { message, data }
      if (response && response.data && Array.isArray(response.data)) {
        return response.data.map((item: any) => ({
          inventoryID: item.inventoryID,
          partID: item.partID || 0,
          partName: item.partName || '',
          centerID: item.centerID || 0,
          centerName: item.centerName || '',
          quantity: item.quantity || 0,
        }));
      }
      
      // Fallback: nếu response trả về trực tiếp array
      if (response && Array.isArray(response)) {
        return response.map((item: any) => ({
          inventoryID: item.inventoryID,
          partID: item.partID || 0,
          partName: item.partName || '',
          centerID: item.centerID || 0,
          centerName: item.centerName || '',
          quantity: item.quantity || 0,
        }));
      }
      
      return [];
    } catch (error: any) {
      console.error('Error searching inventories:', error);
      throw new Error(error.message || 'Lỗi khi tìm kiếm tồn kho');
    }
  }

  /**
   * Tạo tồn kho mới (Admin only)
   */
  async createInventory(data: CreateInventoryRequest): Promise<ApiResponse<Inventory>> {
    try {
      const response = await httpClient.post<any>('/CreateInventoryAPI', data);
      
      if (response && response.success !== false) {
        return { success: true, message: response.message || 'Tạo tồn kho thành công', data: response.data };
      }
      
      throw new Error(response?.message || 'Không thể tạo tồn kho');
    } catch (error: any) {
      console.error('Error creating inventory:', error);
      throw new Error(error.message || 'Lỗi khi tạo tồn kho');
    }
  }

  /**
   * Cập nhật tồn kho (Admin only)
   */
  async updateInventory(inventoryID: number, data: CreateInventoryRequest): Promise<ApiResponse<Inventory>> {
    try {
      const response = await httpClient.put<any>(`/EditInventoryAPI/${inventoryID}`, data);
      
      if (response && response.success !== false) {
        return { success: true, message: response.message || 'Cập nhật tồn kho thành công', data: response.data };
      }
      
      throw new Error(response?.message || 'Không thể cập nhật tồn kho');
    } catch (error: any) {
      console.error('Error updating inventory:', error);
      throw new Error(error.message || 'Lỗi khi cập nhật tồn kho');
    }
  }

  /**
   * Xóa tồn kho (Admin only)
   */
  async deleteInventory(inventoryID: number): Promise<ApiResponse<void>> {
    try {
      const response = await httpClient.delete<void>(`/DeleteInventoryAPI/${inventoryID}`);
      
      if (response && response.success !== false) {
        return { success: true, message: response.message || 'Xóa tồn kho thành công' };
      }
      
      throw new Error(response?.message || 'Không thể xóa tồn kho');
    } catch (error: any) {
      console.error('Error deleting inventory:', error);
      throw new Error(error.message || 'Lỗi khi xóa tồn kho');
    }
  }
}

export const inventoryService = new InventoryService();

