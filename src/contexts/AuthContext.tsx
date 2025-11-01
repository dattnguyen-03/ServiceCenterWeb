import React, { createContext, useContext, useState, useEffect } from 'react';
import { User as LocalUser } from '../types';
import { User as ApiUser, LoginRequest } from '../types/api';
import { authService } from '../services/authService';

// Convert API User to Local User format
const convertApiUserToLocalUser = (apiUser: ApiUser): LocalUser => ({
  id: apiUser.id,
  name: apiUser.fullName,
  email: apiUser.email,
  role: apiUser.role,
  avatar: apiUser.profileImage,
  centerID: apiUser.centerID ?? undefined, // ✅ Lưu CenterID cho Staff/Technician
});

export interface AuthContextType {
  user: LocalUser | null;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  setUser: (user: LocalUser | null) => void;
  isAuthenticated: boolean;
  refreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<LocalUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize auth state from localStorage
    const initializeAuth = () => {
      try {
        const currentUser = authService.getCurrentUser();
        const token = authService.getAccessToken();
        
        if (currentUser && token) {
          setUser(convertApiUserToLocalUser(currentUser));
        }
      } catch (error) {
        console.error('Error initializing auth state:', error);
        // Clear corrupted data
        authService.logout();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials: LoginRequest): Promise<void> => {
    setIsLoading(true);
    try {
      const authResponse = await authService.login(credentials);
      const user = convertApiUserToLocalUser(authResponse.user);
      console.log('Login successful, setting user:', user);
      setUser(user);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await authService.logout();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      // Even if API call fails, clear local state
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshToken = async (): Promise<void> => {
    try {
      await authService.refreshToken();
    } catch (error) {
      console.error('Token refresh failed:', error);
      // If refresh fails, logout user
      await logout();
      throw error;
    }
  };

  const isAuthenticated = authService.isAuthenticated();

  const value: AuthContextType = {
    user,
    login,
    logout,
    isLoading,
    setUser,
    isAuthenticated,
    refreshToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};