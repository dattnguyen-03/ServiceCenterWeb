import { httpClient } from './httpClient';
import { API_CONFIG } from '../config/api';
import { ServiceCenter } from '../types/api';

// Re-export for convenience
export type { ServiceCenter };

/**
 * Service Center Service
 * Handles all service center related API calls
 */
class ServiceCenterService {
  /**
   * Get all available service centers
   * Used by: Customer (view centers for booking), Staff/Admin (manage centers)
   */
  async getServiceCenters(): Promise<ServiceCenter[]> {
    try {
      const response = await httpClient.get<ServiceCenter[]>(
        API_CONFIG.ENDPOINTS.SERVICE_CENTER.GET
      );
      
      // Backend trả về array trực tiếp
      if (Array.isArray(response)) {
        return response;
      }
      
      // Nếu response có format {success, data}
      if (response && typeof response === 'object' && 'success' in response && response.success && 'data' in response) {
        return response.data as ServiceCenter[];
      }
      
      throw new Error('Không tìm thấy trung tâm dịch vụ');
    } catch (error: any) {
      console.error('Error getting service centers:', error);
      throw new Error(error.message || 'Không thể lấy danh sách trung tâm dịch vụ');
    }
  }

  /**
   * Get service center by ID
   */
  async getServiceCenterById(centerId: number): Promise<ServiceCenter | null> {
    try {
      const centers = await this.getServiceCenters();
      return centers.find(center => center.centerID === centerId) || null;
    } catch (error: any) {
      console.error('Error getting service center by ID:', error);
      throw new Error(error.message || 'Không thể lấy thông tin trung tâm dịch vụ');
    }
  }

  /**
   * Format center display name
   */
  formatCenterDisplay(center: ServiceCenter): string {
    return `${center.name} - ${center.address}`;
  }

  /**
   * Get centers sorted by name
   */
  async getServiceCentersSorted(): Promise<ServiceCenter[]> {
    try {
      const centers = await this.getServiceCenters();
      return centers.sort((a, b) => a.name.localeCompare(b.name));
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get center recommendations based on location or other criteria
   */
  getCenterRecommendations(centers: ServiceCenter[], _userLocation?: string): ServiceCenter[] {
    // Simple implementation - can be enhanced with actual location matching
    return centers.slice(0, 3); // Return first 3 centers as recommendations
  }
}

export const serviceCenterService = new ServiceCenterService();
export default serviceCenterService;