import { httpClient } from './httpClient';
import { API_CONFIG } from '../config/api';

export interface UserListItem {
  userID: number;
  username: string;
  role: string;
  name: string;
  email: string;
  phone: string;
  address: string;
}

export interface CreateUserRequest {
  Username: string;  // Changed from username to Username
  Password: string;  // Changed from password to Password
  Role: string;      // Changed from role to Role
  Name: string;      // Changed from name to Name
  Email: string;     // Changed from email to Email
  Phone: string;     // Changed from phone to Phone
  Address: string;   // Changed from address to Address
}

export interface EditUserRequest {
  UserID: number;  // Changed from userID to UserID to match backend
  Name: string;    // Changed from name to Name
  Email: string;   // Changed from email to Email
  Phone: string;   // Changed from phone to Phone
  Address: string; // Changed from address to Address
}

export interface DeleteUserRequest {
  UserID: number;  // Changed from userID to UserID to match backend
}

class UserManagementService {
  // Get all users (Admin/Staff)
  async getAllUsers(): Promise<UserListItem[]> {
    try {
      console.log('Fetching all users...');
      const response = await httpClient.get<UserListItem[]>(API_CONFIG.ENDPOINTS.USER_MANAGEMENT.GET_ALL_USERS);
      
      console.log('Users response:', response);
      
      // Handle different response formats
      if (Array.isArray(response)) {
        return response;
      }
      
      if (response && typeof response === 'object') {
        const anyRes: any = response as any;
        if (anyRes.success && Array.isArray(anyRes.data)) {
          return anyRes.data as UserListItem[];
        }
        if (Array.isArray(anyRes.data)) {
          return anyRes.data as UserListItem[];
        }
      }
      
      return [];
    } catch (error: any) {
      console.error('Error getting all users:', error);
      throw error;
    }
  }

  // Search users by keyword (Admin/Staff)
  async searchUsers(keyword: string): Promise<UserListItem[]> {
    try {
      console.log('Searching users with keyword:', keyword);
      const response = await httpClient.get<UserListItem[]>(
        API_CONFIG.ENDPOINTS.USER_MANAGEMENT.SEARCH_USERS,
        { keyword }
      );
      
      console.log('Search users response:', response);
      
      // Handle different response formats
      if (Array.isArray(response)) {
        return response;
      }
      
      if (response && typeof response === 'object') {
        const anyRes: any = response as any;
        if (anyRes.success && Array.isArray(anyRes.data)) {
          return anyRes.data as UserListItem[];
        }
        if (Array.isArray(anyRes.data)) {
          return anyRes.data as UserListItem[];
        }
      }
      
      return [];
    } catch (error: any) {
      console.error('Error searching users:', error);
      throw error;
    }
  }

  // Create new user (Admin only)
  async createUser(userData: CreateUserRequest): Promise<{ message: string }> {
    try {
      console.log('Creating user:', userData);
      const response = await httpClient.post<{ message: string }>(
        API_CONFIG.ENDPOINTS.USER_MANAGEMENT.CREATE_USER,
        userData
      );
      
      console.log('Create user response:', response);
      
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
      
      return { message: 'Tạo user thành công!' };
    } catch (error: any) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  // Edit user (Admin only)
  async editUser(userData: EditUserRequest): Promise<{ message: string }> {
    try {
      console.log('Editing user:', userData);
      const response = await httpClient.put<{ message: string }>(
        API_CONFIG.ENDPOINTS.USER_MANAGEMENT.EDIT_USER,
        userData
      );
      
      console.log('Edit user response:', response);
      
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
      
      return { message: 'Cập nhật user thành công!' };
    } catch (error: any) {
      console.error('Error editing user:', error);
      throw error;
    }
  }

  // Delete user (Admin only)
  async deleteUser(userID: number): Promise<{ message: string }> {
    try {
      console.log('Deleting user:', userID);
      const response = await httpClient.deleteWithBody<{ message: string }>(
        API_CONFIG.ENDPOINTS.USER_MANAGEMENT.DELETE_USER,
        { UserID: userID }  // Changed from userID to UserID
      );
      
      console.log('Delete user response:', response);
      
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
      
      return { message: 'Xóa user thành công!' };
    } catch (error: any) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  // Get users by role
  async getUsersByRole(role: string): Promise<UserListItem[]> {
    try {
      const allUsers = await this.getAllUsers();
      return allUsers.filter(user => user.role === role);
    } catch (error: any) {
      console.error('Error getting users by role:', error);
      throw error;
    }
  }

  // Get customers only
  async getCustomers(): Promise<UserListItem[]> {
    return this.getUsersByRole('Customer');
  }

  // Get staff only
  async getStaff(): Promise<UserListItem[]> {
    return this.getUsersByRole('Staff');
  }

  // Get technicians only
  async getTechnicians(): Promise<UserListItem[]> {
    return this.getUsersByRole('Technician');
  }

  // Get admins only
  async getAdmins(): Promise<UserListItem[]> {
    return this.getUsersByRole('Admin');
  }
}

export const userManagementService = new UserManagementService();
export default userManagementService;
