import { httpClient } from './httpClient';
import { API_CONFIG } from '../config/api';
import { ApiResponse } from '../types/api';

// Vehicle API Request/Response Types
export interface CreateVehicleRequest {
  model: string;
  vin: string;
  licensePlate: string;
  year: number;
  notes?: string;
  lastServiceDate?: string;
  odometer: number;
  lastServiceOdometer: number;
}

export interface EditVehicleRequest {
  vehicleID: number;
  model: string;
  vin: string;
  licensePlate: string;
  year: number;
  notes?: string;
  lastServiceDate?: string;
  nextServiceDate?: string;
  odometer: number;
}

export interface VehicleResponse {
  vehicleID: number;
  ownerName: string;
  model: string;
  vin: string;
  licensePlate: string;
  year: number;
  notes?: string;
  lastServiceDate?: string;
  nextServiceDate?: string;
  odometer?: number;
  lastServiceOdometer?: number;
}

export interface GetVehicleRequest {
  vehicleId: number;
}

class VehicleService {
  /**
   * Tạo xe mới
   */
  async createVehicle(data: CreateVehicleRequest): Promise<ApiResponse<VehicleResponse>> {
    try {
      const response = await httpClient.post<VehicleResponse>(
        API_CONFIG.ENDPOINTS.VEHICLE.CREATE,
        data
      );
      
      // Backend có thể trả về success message trực tiếp
      if (typeof response === 'string' || (response && 'message' in response && !('success' in response))) {
        return { success: true, message: typeof response === 'string' ? response : (response as any).message };
      }
      
      // Nếu response có format {success, data}
      if (response && typeof response === 'object' && 'success' in response) {
        return response;
      }
      
      // Fallback: coi như thành công
      return { success: true, message: 'Tạo xe thành công' };
    } catch (error: any) {
      console.error('Error creating vehicle:', error);
      // Giữ nguyên message từ backend (ví dụ: "Biển số xe đã tồn tại trong hệ thống.")
      const errorMessage = error.message || 'Không thể tạo xe mới';
      throw new Error(errorMessage);
    }
  }

  /**
   * Chỉnh sửa thông tin xe
   */
  async editVehicle(data: EditVehicleRequest): Promise<ApiResponse<VehicleResponse>> {
    try {
      const response = await httpClient.put<VehicleResponse>(
        API_CONFIG.ENDPOINTS.VEHICLE.EDIT,
        data
      );
      
      // Backend có thể trả về success message trực tiếp
      if (typeof response === 'string' || (response && 'message' in response && !('success' in response))) {
        return { success: true, message: typeof response === 'string' ? response : (response as any).message };
      }
      
      // Nếu response có format {success, data}
      if (response && typeof response === 'object' && 'success' in response) {
        return response;
      }
      
      // Fallback: coi như thành công
      return { success: true, message: 'Cập nhật xe thành công' };
    } catch (error: any) {
      console.error('Error editing vehicle:', error);
      throw new Error(error.message || 'Không thể cập nhật thông tin xe');
    }
  }

  /**
   * Lấy thông tin xe theo ID
   */
  async getVehicle(vehicleId: number): Promise<VehicleResponse> {
    try {
      const response = await httpClient.get<VehicleResponse>(
        API_CONFIG.ENDPOINTS.VEHICLE.GET,
        { vehicleId }
      );
      
      // Backend trả về object trực tiếp
      if (response && typeof response === 'object' && !Array.isArray(response) && 'vehicleID' in response) {
        return response as unknown as VehicleResponse;
      }
      
      // Nếu response có format {success, data}
      if (response && typeof response === 'object' && 'success' in response && response.success && 'data' in response) {
        return response.data as VehicleResponse;
      }
      
      throw new Error('Không tìm thấy thông tin xe');
    } catch (error: any) {
      console.error('Error getting vehicle:', error);
      throw new Error(error.message || 'Không thể lấy thông tin xe');
    }
  }

  /**
   * Lấy danh sách xe của khách hàng
   */
  async getVehiclesByCustomer(customerId?: string): Promise<VehicleResponse[]> {
    try {
      const params = customerId ? { customerId } : {};
      const response = await httpClient.get<VehicleResponse[]>(
        API_CONFIG.ENDPOINTS.VEHICLE.VIEW,
        params
      );
      
      // Backend trả về array trực tiếp
      if (Array.isArray(response)) {
        return response;
      }
      
      // Nếu response có format {success, data}
      if (response.success && Array.isArray(response.data)) {
        return response.data;
      }
      
      // Fallback
      return [];
    } catch (error: any) {
      // Nếu là lỗi 404 với message về việc chưa có xe, trả về mảng rỗng thay vì throw error
      const errorMessage = error.message || '';
      
      // Kiểm tra nếu là lỗi endpoint không tồn tại thì vẫn throw
      if (errorMessage.includes('API endpoint không tồn tại')) {
        console.error('Error getting vehicles:', error);
        throw error;
      }
      
      // Nếu là message về việc chưa có xe hoặc không tìm thấy người dùng (nhưng đã authenticated)
      // thì trả về mảng rỗng (không phải lỗi)
      if (errorMessage.includes('chưa có xe') || 
          errorMessage.includes('Người dùng hiện chưa có xe nào') ||
          errorMessage.includes('Không tìm thấy người dùng')) {
        console.log('Chưa có xe nào, trả về danh sách rỗng');
        return [];
      }
      
      // Các lỗi khác vẫn throw
      console.error('Error getting vehicles:', error);
      throw new Error(errorMessage || 'Không thể lấy danh sách xe');
    }
  }

  /**
   * Lấy tất cả xe (cho admin/staff)
   */
  async getAllVehicles(): Promise<VehicleResponse[]> {
    try {
      console.log('Calling getAllVehicles API...');
      const response = await httpClient.get('/GetAllVehicleAPI');
      console.log('getAllVehicles API Response:', response);
      
      // Backend trả về format {message, vehicles}
      if (response && typeof response === 'object' && 'vehicles' in response) {
        console.log('Returning response.vehicles:', response.vehicles);
        return response.vehicles as VehicleResponse[];
      }
      
      // Nếu response có format {success, data}
      if (response && typeof response === 'object' && 'success' in response && response.success && 'data' in response) {
        console.log('Returning response.data:', response.data);
        return response.data as VehicleResponse[];
      }
      
      // Backend trả về array trực tiếp
      if (Array.isArray(response)) {
        console.log('Returning response directly:', response);
        return response;
      }
      
      // Fallback
      console.log('No valid data found, returning empty array');
      return [];
    } catch (error: any) {
      console.error('Error getting all vehicles:', error);
      throw new Error(error.message || 'Không thể lấy danh sách xe');
    }
  }

  /**
   * Xóa xe
   */
  async deleteVehicle(vehicleId: number): Promise<ApiResponse<string>> {
    try {
      const response = await httpClient.delete<string>(
        API_CONFIG.ENDPOINTS.VEHICLE.DELETE,
        { vehicleId }
      );
      
      // Backend có thể trả về success message trực tiếp
      if (typeof response === 'string') {
        return { success: true, message: response };
      }
      
      // Nếu response có format {success, message}
      if (response && typeof response === 'object' && 'success' in response) {
        return response;
      }
      
      // Fallback: coi như thành công
      return { success: true, message: 'Xóa xe thành công' };
    } catch (error: any) {
      console.error('Error deleting vehicle:', error);
      throw new Error(error.message || 'Không thể xóa xe');
    }
  }

  /**
   * Validate vehicle data before sending to API
   */
  validateVehicleData(data: CreateVehicleRequest | EditVehicleRequest): string[] {
    const errors: string[] = [];

    if (!data.model || data.model.trim() === '') {
      errors.push('Model xe không được để trống');
    }

    if (!data.vin || data.vin.trim() === '') {
      errors.push('VIN không được để trống');
    } else if (data.vin.length < 17) {
      errors.push('VIN phải có ít nhất 17 ký tự');
    }

    if (!data.licensePlate || data.licensePlate.trim() === '') {
      errors.push('Biển số xe không được để trống');
    }

    if (!data.year || data.year < 1900 || data.year > new Date().getFullYear() + 1) {
      errors.push('Năm sản xuất không hợp lệ');
    }

    // Validate Odometer
    if (data.odometer === undefined || data.odometer < 0) {
      errors.push('Chỉ số Odometer không hợp lệ');
    }

    // Validate LastServiceOdometer for CreateVehicleRequest
    if ('lastServiceOdometer' in data) {
      const createData = data as CreateVehicleRequest;
      if (createData.lastServiceOdometer === undefined || createData.lastServiceOdometer < 0) {
        errors.push('Chỉ số Odometer lần bảo dưỡng cuối không hợp lệ');
      }
      if (createData.odometer < createData.lastServiceOdometer) {
        errors.push('Odometer hiện tại không được nhỏ hơn Odometer lần bảo dưỡng cuối');
      }
    }

    return errors;
  }

  /**
   * Format vehicle data for display
   */
  formatVehicleForDisplay(vehicle: VehicleResponse) {
    return {
      ...vehicle,
      displayName: `${vehicle.model} (${vehicle.year})`,
      lastServiceFormatted: vehicle.lastServiceDate 
        ? new Date(vehicle.lastServiceDate).toLocaleDateString('vi-VN')
        : 'Chưa có',
      nextServiceFormatted: vehicle.nextServiceDate 
        ? new Date(vehicle.nextServiceDate).toLocaleDateString('vi-VN')
        : 'Chưa có',
    };
  }
}

export const vehicleService = new VehicleService();
