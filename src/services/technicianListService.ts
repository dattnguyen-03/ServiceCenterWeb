import { httpClient } from './httpClient';
import { API_CONFIG } from '../config/api';

export interface Technician {
  userID: number;
  name: string;
  phone: string;
  email: string;
}

class TechnicianListService {
  // Get all technicians (Staff/Admin)
  async getAllTechnicians(): Promise<Technician[]> {
    try {
      console.log('Fetching technicians...');
      const response = await httpClient.get<Technician[]>(
        API_CONFIG.ENDPOINTS.TECHNICIAN.GET_ALL
      );

      console.log('Technicians response:', response);

      // Backend may return array directly or wrapped { success, data } or { message, data }
      if (Array.isArray(response)) return response;
      if (response && typeof response === 'object') {
        const anyRes: any = response as any;
        if (anyRes.success && Array.isArray(anyRes.data)) {
          return anyRes.data as Technician[];
        }
        if (Array.isArray(anyRes.data)) {
          return anyRes.data as Technician[];
        }
      }
      throw new Error('Không thể tải danh sách kỹ thuật viên');
    } catch (error: any) {
      console.error('Error getting technicians:', error);
      throw new Error(error.message || 'Lỗi tải danh sách kỹ thuật viên');
    }
  }
}

export const technicianListService = new TechnicianListService();
export default technicianListService;
