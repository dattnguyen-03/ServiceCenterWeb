import { httpClient } from './httpClient';
import { ApiResponse } from '../types/api';
import { technicianListService, Technician } from './technicianListService';

export interface TechnicianCertification {
  certificationID: number;
  technicianID: number;
  technicianName?: string;
  certificateName: string;
  issuedBy: string | null;
  issueDate: string | null;
  expiryDate: string | null;
  certificateCode: string | null;
  attachment: string | null;
  status: string | null; // "Valid" | "Expired" | "Revoked"
  notes: string | null;
}

export interface CreateTechnicianCertificationRequest {
  technicianID: number;
  certificateName: string;
  issuedBy?: string;
  issueDate?: string;
  expiryDate?: string;
  certificateCode?: string;
  attachment?: string;
  status?: string;
  notes?: string;
}

export interface EditTechnicianCertificationRequest {
  certificationID: number;
  certificateName: string;
  issuedBy?: string;
  issueDate?: string;
  expiryDate?: string;
  certificateCode?: string;
  attachment?: string;
  status?: string;
  notes?: string;
}

class TechnicianCertificationService {
  /**
   * Lấy tất cả chứng chỉ (Admin only)
   */
  async getAllCertifications(): Promise<TechnicianCertification[]> {
    try {
      const response = await httpClient.get<any>('/ViewTechnicianCertificationAPI');
      
      // Backend trả về {message: '...', data: [...]}
      if (response && response.data && Array.isArray(response.data)) {
        return response.data;
      }
      
      if (Array.isArray(response)) {
        return response;
      }
      
      return [];
    } catch (error: any) {
      console.error('Error getting all certifications:', error);
      throw new Error(error.message || 'Lỗi khi lấy danh sách chứng chỉ');
    }
  }

  /**
   * Tìm kiếm chứng chỉ theo TechnicianID hoặc CertificateCode (Admin only)
   */
  async searchCertifications(params: {
    technicianId?: number;
    certificateCode?: string;
  }): Promise<TechnicianCertification[]> {
    try {
      const response = await httpClient.get<any>('/SearchTechnicianCertificationAPI', params);
      
      // Backend trả về {message: '...', data: [...]}
      if (response && response.data && Array.isArray(response.data)) {
        return response.data;
      }
      
      if (Array.isArray(response)) {
        return response;
      }
      
      return [];
    } catch (error: any) {
      console.error('Error searching certifications:', error);
      throw new Error(error.message || 'Lỗi khi tìm kiếm chứng chỉ');
    }
  }

  /**
   * Tạo chứng chỉ mới (Admin only)
   */
  async createCertification(data: CreateTechnicianCertificationRequest): Promise<ApiResponse<TechnicianCertification>> {
    try {
      const response = await httpClient.post<any>('/CreateTechnicianCertificationAPI', data);
      
      // Backend trả về {message: '...', data: {...}}
      if (response && response.data) {
        return {
          success: true,
          message: response.message || 'Tạo chứng chỉ thành công',
          data: response.data as TechnicianCertification
        };
      }
      
      if (response && response.message) {
        throw new Error(response.message);
      }
      
      throw new Error('Không thể tạo chứng chỉ');
    } catch (error: any) {
      console.error('Error creating certification:', error);
      throw new Error(error.message || 'Lỗi khi tạo chứng chỉ');
    }
  }

  /**
   * Cập nhật chứng chỉ (Admin only)
   */
  async updateCertification(data: EditTechnicianCertificationRequest): Promise<ApiResponse<TechnicianCertification>> {
    try {
      const response = await httpClient.put<any>('/EditTechnicianCertificationAPI', data);
      
      // Backend trả về {message: '...'}
      if (response && response.message) {
        return {
          success: true,
          message: response.message,
          data: undefined as any
        };
      }
      
      if (response && response.success) {
        return response;
      }
      
      throw new Error(response?.message || 'Không thể cập nhật chứng chỉ');
    } catch (error: any) {
      console.error('Error updating certification:', error);
      throw new Error(error.message || 'Lỗi khi cập nhật chứng chỉ');
    }
  }

  /**
   * Xóa chứng chỉ (Admin only)
   */
  async deleteCertification(certificationID: number): Promise<ApiResponse<void>> {
    try {
      const response = await httpClient.delete<any>(`/DeleteTechnicianCertificationAPI/${certificationID}`);
      
      // Backend trả về {message: '...'}
      if (response && response.message) {
        return {
          success: true,
          message: response.message,
          data: undefined
        };
      }
      
      if (response && response.success) {
        return response;
      }
      
      return {
        success: true,
        message: 'Xóa chứng chỉ thành công',
        data: undefined
      };
    } catch (error: any) {
      console.error('Error deleting certification:', error);
      throw new Error(error.message || 'Lỗi khi xóa chứng chỉ');
    }
  }

  /**
   * Lấy danh sách technicians để select
   */
  async getTechnicians(): Promise<Technician[]> {
    try {
      return await technicianListService.getAllTechnicians();
    } catch (error: any) {
      console.error('Error getting technicians:', error);
      return [];
    }
  }

  /**
   * Format ngày tháng
   */
  formatDate(dateString: string | null | undefined): string {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    } catch {
      return 'N/A';
    }
  }

  /**
   * Kiểm tra chứng chỉ có hết hạn không
   */
  isExpired(expiryDate: string | null | undefined): boolean {
    if (!expiryDate) return false;
    try {
      const expiry = new Date(expiryDate);
      const now = new Date();
      return expiry < now;
    } catch {
      return false;
    }
  }
}

export const technicianCertificationService = new TechnicianCertificationService();

