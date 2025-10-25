import { httpClient } from './httpClient';

export interface ServiceCenter {
  centerID: number;
  name: string;
  address: string;
  phone: string;
  managerID?: number;
  managerName?: string;
  manager?: {
    userID: number;
    name: string;
    email: string;
  };
}

export interface CreateServiceCenterDTO {
  name: string;
  address: string;
  phone: string;
  managerID?: number;
}

export interface EditServiceCenterDTO {
  centerID: number;
  name: string;
  address: string;
  phone: string;
  managerID?: number;
}

export interface DeleteServiceCenterDTO {
  centerID: number;
}

// Lấy danh sách tất cả Service Centers
export const getAllServiceCenters = async (): Promise<ServiceCenter[]> => {
  try {
    const response = await httpClient.get('/GetServiceCentersAPI');
    console.log('ServiceCenters API Response:', response);
    console.log('ServiceCenters Data:', response.data);
    console.log('Response keys:', Object.keys(response));
    console.log('Response success:', response.success);
    
    // Xử lý cả hai trường hợp: response.data hoặc response trực tiếp
    if (response.data && Array.isArray(response.data)) {
      console.log('Using response.data:', response.data);
      return response.data;
    } else if (Array.isArray(response)) {
      console.log('Using response directly:', response);
      return response;
    } else {
      console.log('No valid data found, returning empty array');
      return [];
    }
  } catch (error) {
    console.error('Error fetching service centers:', error);
    throw error;
  }
};

// Tìm kiếm Service Centers
export const searchServiceCenters = async (keyword: string): Promise<ServiceCenter[]> => {
  try {
    const response = await httpClient.get(`/SearchServiceCenterAPI?keyword=${encodeURIComponent(keyword)}`);
    return response.data || [];
  } catch (error) {
    console.error('Error searching service centers:', error);
    throw error;
  }
};

// Tạo Service Center mới
export const createServiceCenter = async (data: CreateServiceCenterDTO): Promise<void> => {
  try {
    await httpClient.post('/CreateServiceCenterAPI', data);
  } catch (error) {
    console.error('Error creating service center:', error);
    throw error;
  }
};

// Chỉnh sửa Service Center
export const editServiceCenter = async (data: EditServiceCenterDTO): Promise<void> => {
  try {
    console.log('Editing service center:', data);
    await httpClient.put('/EditServiceCenterAPI', data);
  } catch (error) {
    console.error('Error editing service center:', error);
    throw error;
  }
};

// Xóa Service Center
export const deleteServiceCenter = async (centerID: number): Promise<void> => {
  try {
    console.log('Deleting service center:', centerID);
    await httpClient.deleteWithBody('/DeleteServiceCenterAPI', { CenterID: centerID });
  } catch (error) {
    console.error('Error deleting service center:', error);
    throw error;
  }
};
