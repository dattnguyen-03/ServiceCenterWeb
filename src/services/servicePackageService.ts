import { httpClient } from './httpClient';
import { API_CONFIG } from '../config/api';
import { ServicePackage } from '../types/api';

/**
 * Service Package Service
 * Handles all service package related API calls
 */
class ServicePackageService {
  /**
   * Get all available service packages
   * Used by: Customer (view packages), Staff (manage packages), Admin (manage packages)
   */
  async getServicePackages(): Promise<ServicePackage[]> {
    try {
      const response = await httpClient.get<ServicePackage[]>(
        API_CONFIG.ENDPOINTS.SERVICE_PACKAGE.GET
      );
      
      // Backend trả về array trực tiếp
      if (Array.isArray(response)) {
        return response;
      }
      
      // Nếu response có format {success, data}
      if (response && typeof response === 'object' && 'success' in response && response.success && 'data' in response) {
        return response.data as ServicePackage[];
      }
      
      throw new Error('Không tìm thấy gói dịch vụ');
    } catch (error: any) {
      console.error('Error getting service packages:', error);
      throw new Error(error.message || 'Không thể lấy danh sách gói dịch vụ');
    }
  }

  /**
   * Get service package by ID
   */
  async getServicePackageById(packageId: number): Promise<ServicePackage | null> {
    try {
      const packages = await this.getServicePackages();
      return packages.find(pkg => pkg.packageID === packageId) || null;
    } catch (error: any) {
      console.error('Error getting service package by ID:', error);
      throw new Error(error.message || 'Không thể lấy thông tin gói dịch vụ');
    }
  }

  /**
   * Format price for display
   */
  formatPrice(price: number | null | undefined): string {
    // Handle invalid or missing price
    if (price === null || price === undefined || isNaN(price) || price <= 0) {
      return 'Liên hệ';
    }
    
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  }

  /**
   * Format duration for display
   */
  formatDuration(months: number | null | undefined): string {
    // Handle invalid or missing duration
    if (months === null || months === undefined || isNaN(months) || months <= 0) {
      return 'Theo gói dịch vụ';
    }
    
    // Convert to integer to avoid decimal issues
    const totalMonths = Math.floor(months);
    
    if (totalMonths < 12) {
      return `${totalMonths} tháng`;
    } else if (totalMonths === 12) {
      return '1 năm';
    } else {
      const years = Math.floor(totalMonths / 12);
      const remainingMonths = totalMonths % 12;
      if (remainingMonths === 0) {
        return `${years} năm`;
      } else {
        return `${years} năm ${remainingMonths} tháng`;
      }
    }
  }

  /**
   * Get package recommendations based on vehicle age
   */
  getPackageRecommendations(vehicleYear: number): { basic: boolean; advanced: boolean } {
    const currentYear = new Date().getFullYear();
    const vehicleAge = currentYear - vehicleYear;
    
    return {
      basic: vehicleAge >= 0, // All vehicles need basic maintenance
      advanced: vehicleAge >= 2 // Older vehicles benefit from advanced maintenance
    };
  }

  /**
   * Calculate package value score (price per month)
   */
  calculateValueScore(pkg: ServicePackage): number {
    return pkg.price / pkg.durationMonths;
  }

  /**
   * Sort packages by value (best price per month first)
   */
  sortByValue(packages: ServicePackage[]): ServicePackage[] {
    return [...packages].sort((a, b) => this.calculateValueScore(a) - this.calculateValueScore(b));
  }

  /**
   * Sort packages by duration (shortest first)
   */
  sortByDuration(packages: ServicePackage[]): ServicePackage[] {
    return [...packages].sort((a, b) => a.durationMonths - b.durationMonths);
  }

  /**
   * Sort packages by price (lowest first)
   */
  sortByPrice(packages: ServicePackage[]): ServicePackage[] {
    return [...packages].sort((a, b) => a.price - b.price);
  }
}

export const servicePackageService = new ServicePackageService();
