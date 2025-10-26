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
    console.log('Calling getAllUsers API...');
    const response = await httpClient.get('/GetAllUserAPI');
    console.log('getAllUsers API Response:', response);
    
    // Xử lý cả hai trường hợp: response.data hoặc response trực tiếp
    if (response.data && Array.isArray(response.data)) {
      console.log('Returning response.data:', response.data);
      return response.data;
    } else if (Array.isArray(response)) {
      console.log('Returning response directly:', response);
      return response;
    } else {
      console.log('No valid data found, returning empty array');
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
