import { httpClient } from './httpClient';

export interface UserListItem {
  userID: number;
  username: string;
  role: string;
  name: string;
  email: string;
  phone: string;
  address: string;
}

// Lấy danh sách tất cả users
export const getAllUsers = async (): Promise<UserListItem[]> => {
  try {
    const response = await httpClient.get('/GetAllUserAPI');
    console.log('Users API Response:', response);
    
    // Xử lý cả hai trường hợp: response.data hoặc response trực tiếp
    if (response.data && Array.isArray(response.data)) {
      return response.data;
    } else if (Array.isArray(response)) {
      return response;
    } else {
      return [];
    }
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

// Tìm kiếm users
export const searchUsers = async (keyword: string): Promise<UserListItem[]> => {
  try {
    const response = await httpClient.get(`/SearchUserAPI?keyword=${encodeURIComponent(keyword)}`);
    return response.data || [];
  } catch (error) {
    console.error('Error searching users:', error);
    throw error;
  }
};
