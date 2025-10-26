import { httpClient } from './httpClient';
import { ApiResponse } from '../types/api';

export interface ServiceChecklist {
  checklistID: number;
  orderID: number;
  itemName: string;
  status: string;
  notes: string;
  customerName: string;
  vehicleModel: string;
  centerName: string;
  createDate: string;
}

export const serviceChecklistService = {
  // Get all service checklists (Admin/Staff only)
  getAllChecklists: async (): Promise<ServiceChecklist[]> => {
    try {
      const response = await httpClient.get<ServiceChecklist[]>('/GetServiceChecklistAPI');
      
      // If backend returns error message, return empty array
      if (response && response.message && response.message.includes('Không có checklist nào')) {
        return [];
      }
      
      return Array.isArray(response) ? response : response.data || [];
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
      const response = await httpClient.get<ServiceChecklist[]>('/ViewServiceChecklistAPI');
      
      // If backend returns error message, return empty array
      if (response && response.message && response.message.includes('Không có checklist')) {
        return [];
      }
      
      return Array.isArray(response) ? response : response.data || [];
    } catch (error: any) {
      console.error('Error fetching my service checklists:', error);
      
      // If 404 with "Không có checklist", return empty array
      if (error.message && error.message.includes('Không có checklist')) {
        return [];
      }
      
      throw error;
    }
  },
};

