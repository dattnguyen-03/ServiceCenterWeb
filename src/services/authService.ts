import { httpClient } from './httpClient';
import { API_CONFIG } from '../config/api';
import { 
  LoginRequest, 
  RegisterRequest, 
  AuthResponse, 
  ForgotPasswordRequest,
  ResetPasswordRequest,
  User
} from '../types/api';

class AuthService {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    // Convert to backend expected format
    const backendCredentials = {
      username: credentials.email, // frontend truyền username vào trường email
      password: credentials.password
    };

    const response: any = await httpClient.post<any>(
      API_CONFIG.ENDPOINTS.AUTH.LOGIN,
      backendCredentials
    );

    // Kiểm tra trực tiếp các field từ backend
    if (response.token && response.user) {
      const userData = response.user;
      const user: User = {
        id: userData.userID?.toString() || userData.username || '',
        fullName: userData.name || userData.username || '',
        email: userData.email || '',
        phone: '',
        address: '',
        role: (userData.role || '').toLowerCase() as 'admin' | 'staff' | 'technician' | 'customer',
        status: 'active' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const authResponse: AuthResponse = {
        user,
        accessToken: response.token,
        refreshToken: response.token // Backend chưa có refresh token riêng
      };

      // Store tokens and user info
      localStorage.setItem('accessToken', authResponse.accessToken);
      localStorage.setItem('refreshToken', authResponse.refreshToken);
      localStorage.setItem('user', JSON.stringify(authResponse.user));

      return authResponse;
    }

    throw new Error('Đăng nhập thất bại');
  }

  async register(userData: RegisterRequest): Promise<User> {
    const response = await httpClient.post<User>(
      API_CONFIG.ENDPOINTS.AUTH.REGISTER,
      userData
    );
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Đăng ký thất bại');
  }

  async logout(): Promise<void> {
    try {
      // TODO: Implement logout API endpoint on backend
      // await httpClient.post(API_CONFIG.ENDPOINTS.AUTH.LOGOUT);
      console.log('Logout: Clearing local storage only');
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      // Always clear local storage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  }

  async forgotPassword(data: ForgotPasswordRequest): Promise<void> {
    const response = await httpClient.post(
      API_CONFIG.ENDPOINTS.AUTH.FORGOT_PASSWORD,
      data
    );
    
    if (!response.success) {
      throw new Error(response.message || 'Gửi email thất bại');
    }
  }

  async resetPassword(data: ResetPasswordRequest): Promise<void> {
    const response = await httpClient.post(
      API_CONFIG.ENDPOINTS.AUTH.RESET_PASSWORD,
      data
    );
    
    if (!response.success) {
      throw new Error(response.message || 'Đặt lại mật khẩu thất bại');
    }
  }

  async verifyEmail(token: string): Promise<void> {
    const response = await httpClient.post(
      API_CONFIG.ENDPOINTS.AUTH.VERIFY_EMAIL,
      { token }
    );
    
    if (!response.success) {
      throw new Error(response.message || 'Xác thực email thất bại');
    }
  }

  async refreshToken(): Promise<string> {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('Không có refresh token');
    }

    const response = await httpClient.post<{ accessToken: string; refreshToken?: string }>(
      API_CONFIG.ENDPOINTS.AUTH.REFRESH,
      { refreshToken }
    );
    
    if (response.success && response.data) {
      localStorage.setItem('accessToken', response.data.accessToken);
      if (response.data.refreshToken) {
        localStorage.setItem('refreshToken', response.data.refreshToken);
      }
      return response.data.accessToken;
    }
    
    throw new Error(response.message || 'Làm mới token thất bại');
  }

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (error) {
        console.error('Error parsing user from localStorage:', error);
        localStorage.removeItem('user');
      }
    }
    return null;
  }

  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }

  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user?.role === role;
  }

  hasAnyRole(roles: string[]): boolean {
    const user = this.getCurrentUser();
    return user ? roles.includes(user.role) : false;
  }

  // Profile management methods
  async getProfile(): Promise<any> {
    const response = await httpClient.get('/GetProfileAPI');
    // Backend trả về { message: "...", data: {...} }
    return response.data; // Chỉ lấy phần data
  }

  async updateProfile(profileData: any): Promise<any> {
    const response = await httpClient.put('/EditUserAPI', profileData);
    return response.data || response;
  }

  async changePassword(passwordData: any): Promise<any> {
    const response = await httpClient.post('/ChangePasswordAPI', passwordData);
    return response.data || response;
  }
}

export const authService = new AuthService();
export default authService;