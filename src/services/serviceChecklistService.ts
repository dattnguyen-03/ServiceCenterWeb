import { httpClient } from './httpClient';
import { ApiResponse } from '../types/api';

export interface ServiceChecklist {
  checklistID: number;
  orderID: number;
  appointmentID: number;
  itemName: string;
  status: string;
  notes: string;
  customerName: string;
  vehicleModel: string;
  centerName: string;
  createDate: string;
}

export interface CreateServiceChecklistRequest {
  orderID: number;
  itemName: string;
  status: string;
  notes?: string | null; // ✅ Optional - có thể rỗng
}

export interface EditServiceChecklistRequest {
  orderID: number;
  itemName: string;
  status: string;
  notes?: string | null; // ✅ Optional - có thể rỗng
}

export const serviceChecklistService = {
  // Get all service checklists (Admin/Staff only)
  getAllChecklists: async (): Promise<ServiceChecklist[]> => {
    try {
      const response = await httpClient.get<ServiceChecklist[]>('/GetServiceChecklistAPI');
      
      // Backend returns array directly or wrapped in data
      let data: any[] = [];
      
      if (Array.isArray(response)) {
        data = response;
      } else if (response && typeof response === 'object' && 'data' in response) {
        data = Array.isArray((response as any).data) ? (response as any).data : [];
      }
      
      // If no data or error message
      if (data.length === 0 && response && response.message && response.message.includes('Không có checklist')) {
        return [];
      }
      
      return data;
    } catch (error: any) {
      console.error('Error fetching all service checklists:', error);
      
      // If 404 with "Không có checklist", return empty array
      if (error.message && error.message.includes('Không có checklist')) {
        return [];
      }
      
      throw error;
    }
  },

  // Get service checklists for the logged-in technician
  getMyChecklists: async (): Promise<ServiceChecklist[]> => {
    try {
      console.log('[serviceChecklistService] Fetching checklists...');
      const response = await httpClient.get<ServiceChecklist[]>('/ViewServiceChecklistAPI');
      
      console.log('[serviceChecklistService] Raw response:', response);
      console.log('[serviceChecklistService] Response type:', typeof response);
      console.log('[serviceChecklistService] Is array?', Array.isArray(response));
      
      // Handle empty response (when httpClient returns [] for no data)
      if (Array.isArray(response) && response.length === 0) {
        console.log('[serviceChecklistService] No checklists found, returning empty array');
        return [];
      }
      
      // Backend returns array directly or wrapped in data
      let data: any[] = [];
      
      if (Array.isArray(response)) {
        data = response;
        console.log('[serviceChecklistService] Response is array, length:', data.length);
      } else if (response && typeof response === 'object' && 'data' in response) {
        data = Array.isArray((response as any).data) ? (response as any).data : [];
        console.log('[serviceChecklistService] Response has data property, length:', data.length);
      } else {
        console.warn('[serviceChecklistService] Unexpected response format:', response);
      }
      
      // If no data or error message
      if (data.length === 0 && response && (response as any).message && (response as any).message.includes('Không có checklist')) {
        console.log('[serviceChecklistService] No checklists found (message indicates empty)');
        return [];
      }
      
      console.log('[serviceChecklistService] Returning data, length:', data.length);
      if (data.length > 0) {
        console.log('[serviceChecklistService] First checklist:', data[0]);
      }
      
      return data;
    } catch (error: any) {
      console.error('[serviceChecklistService] Error fetching my service checklists:', error);
      
      // If 404 with "Không có checklist", return empty array
      if (error.message && error.message.includes('Không có checklist')) {
        return [];
      }
      
      throw error;
    }
  },

  // Create new service checklist
  createChecklist: async (data: CreateServiceChecklistRequest): Promise<string> => {
    try {
      // ✅ Xử lý notes: nếu rỗng hoặc chỉ có khoảng trắng thì gửi null
      const requestData = {
        ...data,
        notes: data.notes && data.notes.trim() ? data.notes.trim() : null
      };
      
      const response = await httpClient.post<{ message?: string }>(
        '/CreateServiceChecklistAPI',
        requestData
      );
      
      return response.message || 'Tạo checklist thành công';
    } catch (error: any) {
      console.error('Error creating checklist:', error);
      throw new Error(error.message || 'Lỗi tạo checklist');
    }
  },

  // Edit service checklist
  editChecklist: async (checklistId: number, data: EditServiceChecklistRequest): Promise<string> => {
    try {
      // ✅ Xử lý notes: nếu rỗng hoặc chỉ có khoảng trắng thì gửi null
      const requestData = {
        ...data,
        notes: data.notes && data.notes.trim() ? data.notes.trim() : null
      };
      
      const response = await httpClient.put<{ message?: string }>(
        `/EditServiceChecklistAPI/${checklistId}`,
        requestData
      );
      
      return response.message || 'Cập nhật checklist thành công';
    } catch (error: any) {
      console.error('Error editing checklist:', error);
      throw new Error(error.message || 'Lỗi cập nhật checklist');
    }
  },

  // Delete service checklist
  deleteChecklist: async (checklistId: number): Promise<string> => {
    try {
      const response = await httpClient.delete<{ message?: string }>(
        `/DeleteServiceChecklistAPI/${checklistId}`
      );
      
      return response.message || 'Xóa checklist thành công';
    } catch (error: any) {
      console.error('Error deleting checklist:', error);
      throw new Error(error.message || 'Lỗi xóa checklist');
    }
  },
};

