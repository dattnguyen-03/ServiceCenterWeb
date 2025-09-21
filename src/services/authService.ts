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
    const response = await httpClient.post<AuthResponse>(
      API_CONFIG.ENDPOINTS.AUTH.LOGIN,
      credentials
    );
    
    if (response.success && response.data) {
      // Store tokens and user info
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      return response.data;
    }
    
    throw new Error(response.message || 'Đăng nhập thất bại');
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
      await httpClient.post(API_CONFIG.ENDPOINTS.AUTH.LOGOUT);
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
}

export const authService = new AuthService();
export default authService;