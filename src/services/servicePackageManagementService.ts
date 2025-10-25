import { httpClient } from './httpClient';

export interface CreateServicePackageRequest {
  Name: string;
  Description: string;
  Price: number;
}

export interface EditServicePackageRequest {
  PackageID: number;
  Name: string;
  Description: string;
  Price: number;
}

export interface DeleteServicePackageRequest {
  PackageID: number;
}

class ServicePackageManagementService {
  // Create new service package (Admin only)
  async createServicePackage(packageData: CreateServicePackageRequest): Promise<{ message: string }> {
    try {
      console.log('Creating service package:', packageData);
      
      // Validate data before sending
      if (!packageData.Name || packageData.Name.trim().length === 0) {
        throw new Error('Tên gói dịch vụ không được để trống');
      }
      
      if (!/^[a-zA-Z0-9\s\u00C0-\u1EF9]+$/.test(packageData.Name)) {
        throw new Error('Tên gói dịch vụ chỉ được chứa chữ cái, số và khoảng trắng');
      }
      
      if (packageData.Price <= 0) {
        throw new Error('Giá gói dịch vụ phải lớn hơn 0');
      }
      
      const response = await httpClient.post<{ message: string }>(
        '/CreateServicePackageAPI',
        {
          Name: packageData.Name.trim(),
          Description: packageData.Description?.trim() || '',
          Price: Number(packageData.Price)
        }
      );
      
      console.log('Create service package response:', response);
      
      // Handle different response formats
      if (response && typeof response === 'object') {
        const anyRes: any = response as any;
        if (anyRes.message) {
          return { message: anyRes.message };
        }
      }
      
      return { message: 'Tạo gói dịch vụ thành công!' };
    } catch (error: any) {
      console.error('Error creating service package:', error);
      throw error;
    }
  }

  // Edit service package (Admin only)
  async editServicePackage(packageData: EditServicePackageRequest): Promise<{ message: string }> {
    try {
      console.log('Editing service package:', packageData);
      
      // Validate data before sending
      if (!packageData.Name || packageData.Name.trim().length === 0) {
        throw new Error('Tên gói dịch vụ không được để trống');
      }
      
      if (!/^[a-zA-Z0-9\s\u00C0-\u1EF9]+$/.test(packageData.Name)) {
        throw new Error('Tên gói dịch vụ chỉ được chứa chữ cái, số và khoảng trắng');
      }
      
      if (packageData.Price < 0) {
        throw new Error('Giá gói dịch vụ không được âm');
      }
      
      const response = await httpClient.put<{ message: string }>(
        '/EditServicePackageAPI',
        {
          PackageID: packageData.PackageID,
          Name: packageData.Name.trim(),
          Description: packageData.Description?.trim() || '',
          Price: Number(packageData.Price)
        }
      );
      
      console.log('Edit service package response:', response);
      
      // Handle different response formats
      if (response && typeof response === 'object') {
        const anyRes: any = response as any;
        if (anyRes.message) {
          return { message: anyRes.message };
        }
      }
      
      return { message: 'Cập nhật gói dịch vụ thành công!' };
    } catch (error: any) {
      console.error('Error editing service package:', error);
      throw error;
    }
  }

  // Delete service package (Admin only)
  async deleteServicePackage(packageID: number): Promise<{ message: string }> {
    try {
      console.log('Deleting service package:', packageID);
      const response = await httpClient.deleteWithBody<{ message: string }>(
        '/DeleteServicePackageAPI',
        { PackageID: packageID }
      );
      
      console.log('Delete service package response:', response);
      
      // Handle different response formats
      if (response && typeof response === 'object') {
        const anyRes: any = response as any;
        if (anyRes.success && anyRes.message) {
          return { message: anyRes.message };
        }
        if (anyRes.message) {
          return { message: anyRes.message };
        }
      }
      
      return { message: 'Xóa gói dịch vụ thành công!' };
    } catch (error: any) {
      console.error('Error deleting service package:', error);
      throw error;
    }
  }
}

export default new ServicePackageManagementService();