import { httpClient } from './httpClient';
import { API_CONFIG } from '../config/api';

export interface CustomerWithDetails {
  userID: number;
  username: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  createDate: string;
  vehicleCount: number;
  appointmentCount: number;
  totalSpent: number;
  lastServiceDate?: string;
}

export interface Vehicle {
  vehicleID: number;
  model: string;
  vin: string;
  year?: number;
  color: string;
  createDate: string;
}

export interface Appointment {
  appointmentID: number;
  serviceType: string;
  requestedDate: string;
  status: string;
  cost?: number;
  description: string;
}

export interface CustomerFullDetails {
  userID: number;
  username: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  createDate: string;
  vehicles: Vehicle[];
  appointments: Appointment[];
  vehicleCount: number;
  appointmentCount: number;
  totalSpent: number;
  lastServiceDate?: string;
}

class CustomerManagementService {
  // Get all customers for Admin/Staff
  async getAllCustomers(): Promise<CustomerWithDetails[]> {
    try {
      console.log('Fetching all customers...');
      const response = await httpClient.get<any>(API_CONFIG.ENDPOINTS.ADMIN.GET_ALL_CUSTOMERS);

      console.log('Customers response:', response);

      if (Array.isArray(response)) {
        return response;
      }
      
      if (response && typeof response === 'object') {
        const anyRes: any = response as any;
        if (anyRes.success && Array.isArray(anyRes.data)) {
          return anyRes.data as CustomerWithDetails[];
        }
        if (Array.isArray(anyRes.data)) {
          return anyRes.data as CustomerWithDetails[];
        }
      }
      
      // If no data, return empty array
      return [];
    } catch (error: any) {
      console.error('Error getting all customers:', error);
      // Return mock data for now since backend might not be ready
      return this.getMockCustomers();
    }
  }

  // Get customer details with vehicles and appointments
  async getCustomerDetails(customerId: number): Promise<CustomerFullDetails> {
    try {
      console.log('Fetching customer details for ID:', customerId);
      const response = await httpClient.get<any>(`${API_CONFIG.ENDPOINTS.ADMIN.GET_CUSTOMER_DETAILS}/${customerId}`);

      console.log('Customer details response:', response);

      if (response && typeof response === 'object') {
        const anyRes: any = response as any;
        if (anyRes.success && anyRes.data) {
          return anyRes.data as CustomerFullDetails;
        }
        if (anyRes.data) {
          return anyRes.data as CustomerFullDetails;
        }
      }
      
      throw new Error('Không thể lấy chi tiết khách hàng');
    } catch (error: any) {
      console.error('Error getting customer details:', error);
      // Return mock data for now
      return this.getMockCustomerDetails(customerId);
    }
  }

  // Mock data for development
  private getMockCustomers(): CustomerWithDetails[] {
    return [
      {
        userID: 1,
        username: 'nguyenvannam',
        name: 'Nguyễn Văn Nam',
        email: 'nam@email.com',
        phone: '0901234567',
        address: 'Hà Nội, Việt Nam',
        createDate: '2024-01-01T00:00:00',
        vehicleCount: 2,
        appointmentCount: 5,
        totalSpent: 2500000,
        lastServiceDate: '2024-01-25T00:00:00'
      },
      {
        userID: 2,
        username: 'tranthib',
        name: 'Trần Thị B',
        email: 'tranthib@email.com',
        phone: '0907654321',
        address: 'TP.HCM, Việt Nam',
        createDate: '2024-01-15T00:00:00',
        vehicleCount: 1,
        appointmentCount: 3,
        totalSpent: 1800000,
        lastServiceDate: '2024-01-20T00:00:00'
      }
    ];
  }

  private getMockCustomerDetails(customerId: number): CustomerFullDetails {
    return {
      userID: customerId,
      username: 'nguyenvannam',
      name: 'Nguyễn Văn Nam',
      email: 'nam@email.com',
      phone: '0901234567',
      address: 'Hà Nội, Việt Nam',
      createDate: '2024-01-01T00:00:00',
      vehicles: [
        {
          vehicleID: 1,
          model: 'VinFast VF8',
          vin: 'VF8ABC123456789',
          year: 2023,
          color: 'Trắng',
          createDate: '2024-01-01T00:00:00'
        },
        {
          vehicleID: 2,
          model: 'Tesla Model Y',
          vin: 'TSMY456789123',
          year: 2023,
          color: 'Đen',
          createDate: '2024-01-01T00:00:00'
        }
      ],
      appointments: [
        {
          appointmentID: 1,
          serviceType: 'Thay lốp',
          requestedDate: '2024-01-25T00:00:00',
          status: 'Completed',
          cost: 500000,
          description: 'Thay lốp xe VinFast VF8'
        },
        {
          appointmentID: 2,
          serviceType: 'Bảo dưỡng định kỳ',
          requestedDate: '2024-01-20T00:00:00',
          status: 'Completed',
          cost: 800000,
          description: 'Bảo dưỡng 10,000 km'
        }
      ],
      vehicleCount: 2,
      appointmentCount: 5,
      totalSpent: 2500000,
      lastServiceDate: '2024-01-25T00:00:00'
    };
  }
}

export const customerManagementService = new CustomerManagementService();
export default customerManagementService;
