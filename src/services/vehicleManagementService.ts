import { httpClient } from './httpClient';
import { API_CONFIG } from '../config/api';

export interface VehicleListItem {
  vehicleID: number;
  ownerName: string;
  model: string;
  vin: string;
  licensePlate: string;
  year?: number;
  notes: string;
  lastServiceDate?: string;
  nextServiceDate?: string;
}

class VehicleManagementService {
  // Get all vehicles (Admin/Staff)
  async getAllVehicles(): Promise<VehicleListItem[]> {
    try {
      console.log('Fetching all vehicles...');
      const response = await httpClient.get<any>('/GetAllVehicleAPI');
      
      console.log('Vehicles response:', response);
      
      // Handle different response formats
      if (Array.isArray(response)) {
        return response;
      }
      
      if (response && typeof response === 'object') {
        const anyRes: any = response as any;
        if (anyRes.success && Array.isArray(anyRes.vehicles)) {
          return anyRes.vehicles as VehicleListItem[];
        }
        if (Array.isArray(anyRes.vehicles)) {
          return anyRes.vehicles as VehicleListItem[];
        }
        if (Array.isArray(anyRes.data)) {
          return anyRes.data as VehicleListItem[];
        }
      }
      
      return [];
    } catch (error: any) {
      console.error('Error getting all vehicles:', error);
      throw error;
    }
  }

  // Search vehicles by keyword (Admin/Staff)
  async searchVehicles(keyword: string): Promise<VehicleListItem[]> {
    try {
      console.log('Searching vehicles with keyword:', keyword);
      const response = await httpClient.get<any>(
        '/SearchVehicleAPI',
        { keyword }
      );
      
      console.log('Search vehicles response:', response);
      
      // Handle different response formats
      if (Array.isArray(response)) {
        return response;
      }
      
      if (response && typeof response === 'object') {
        const anyRes: any = response as any;
        if (anyRes.success && Array.isArray(anyRes.vehicles)) {
          return anyRes.vehicles as VehicleListItem[];
        }
        if (Array.isArray(anyRes.vehicles)) {
          return anyRes.vehicles as VehicleListItem[];
        }
        if (Array.isArray(anyRes.data)) {
          return anyRes.data as VehicleListItem[];
        }
      }
      
      return [];
    } catch (error: any) {
      console.error('Error searching vehicles:', error);
      throw error;
    }
  }
}

export default new VehicleManagementService();