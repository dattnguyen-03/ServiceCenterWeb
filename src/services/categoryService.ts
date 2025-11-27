import { httpClient } from './httpClient';
import { 
  Category, 
  CreateCategoryRequest, 
  EditCategoryRequest,
  SearchCategoryRequest,
  ApiResponse 
} from '../types/api';

class CategoryService {
  // 📋 Lấy danh sách tất cả categories
  async getCategories(): Promise<Category[]> {
    try {
      const response = await httpClient.get('/GetCategoryAPI');
      console.log('categoryService - Full response:', response);
      console.log('categoryService - Array.isArray(response):', Array.isArray(response));
      
      // Nếu response là array trực tiếp (từ console log ta thấy response là array)
      if (Array.isArray(response)) {
        return response as Category[];
      }
      
      // Nếu không phải array thì return empty
      return [];
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  }

  // ➕ Tạo category mới
  async createCategory(data: CreateCategoryRequest): Promise<ApiResponse> {
    try {
      const response = await httpClient.post('/CreateCategoryAPI', data);
      return response;
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  }

  // ✏️ Chỉnh sửa category
  async editCategory(data: EditCategoryRequest): Promise<ApiResponse> {
    try {
      const response = await httpClient.put(`/EditCategoryAPI/${data.categoryID}`, {
        Name: data.name,
        Description: data.description
      });
      return response.data;
    } catch (error) {
      console.error('Error editing category:', error);
      throw error;
    }
  }

  // 🗑️ Xóa category
  async deleteCategory(categoryID: number): Promise<ApiResponse> {
    try {
      const response = await httpClient.deleteWithBody('/DeleteCategoryAPI', {
        CategoryID: categoryID
      });
      return response;
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  }

  // 🔍 Tìm kiếm categories
  async searchCategories(params: SearchCategoryRequest): Promise<Category[]> {
    try {
      const keyword = params.name || params.description || '';
      const response = await httpClient.get(`/SearchCategoryAPI?keyword=${encodeURIComponent(keyword)}`);
      return response.data || [];
    } catch (error) {
      console.error('Error searching categories:', error);
      throw error;
    }
  }

  // 🔗 Lấy categories theo ServiceID
  async getCategoriesByService(serviceID: number): Promise<Category[]> {
    try {
      const response = await httpClient.post('/LoadCategoryService', {
        ServiceID: serviceID
      });
      return response.data || [];
    } catch (error) {
      console.error('Error loading categories by service:', error);
      throw error;
    }
  }

  // 🏷️ Gán category cho service package
  async assignCategoryToPackage(packageID: number, categoryID: number): Promise<ApiResponse> {
    try {
      const response = await httpClient.post('/AssignCategoryToPackage', {
        PackageID: packageID,
        CategoryID: categoryID
      });
      return response.data;
    } catch (error) {
      console.error('Error assigning category to package:', error);
      throw error;
    }
  }

  // 🗑️ Gỡ category khỏi service package
  async removeCategoryFromPackage(packageID: number, categoryID: number): Promise<ApiResponse> {
    try {
      const response = await httpClient.delete('/RemoveCategoryFromPackage', {
        data: {
          PackageID: packageID,
          CategoryID: categoryID
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error removing category from package:', error);
      throw error;
    }
  }
}

export const categoryService = new CategoryService();
export default categoryService;