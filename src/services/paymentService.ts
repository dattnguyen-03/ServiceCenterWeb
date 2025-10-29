import { httpClient } from './httpClient';
import { API_CONFIG } from '../config/api';

export interface CreatePaymentRequest {
  orderID?: number;         // For payment after ServiceOrder
  appointmentID?: number;   // For payment before ServiceOrder (recommended)
  amount: number;
  description: string;
  paymentMethod: 'online' | 'cash'; // Payment method
  returnUrl?: string;
}

export interface CreatePaymentResponse {
  message: string;
  paymentUrl: string;
  amount: number;
  description: string;
}

export interface Payment {
  paymentID: number;
  orderID?: number;
  amount: number;
  description: string;
  status: string;
  createdAt: string;
  completedAt?: string;
  transactionCode?: string;
}

export interface UpdatePaymentRequest {
  paymentID: number;
  status: 'pending' | 'completed' | 'failed' | 'cancelled' | 'refunded';
  transactionCode?: string;
}

class PaymentService {
  /**
   * Tạo payment link để thanh toán
   */
  async createPayment(data: CreatePaymentRequest): Promise<CreatePaymentResponse> {
    try {
      console.log('Creating payment:', data);
      const response = await httpClient.post<CreatePaymentResponse>(
        '/CreatePaymentAPI',
        data
      );

      console.log('Payment response:', response);
      
      // Backend returns { message, paymentUrl, amount, description } or wrapped
      const anyRes: any = response;
      
      // Cash payment: paymentUrl = null, nhưng có message thành công
      // Online payment: có paymentUrl
      if (anyRes?.message && anyRes.message.includes('thành công')) {
        return {
          message: anyRes.message || 'Tạo payment thành công',
          paymentUrl: anyRes.paymentUrl || null, // null cho cash payment
          amount: anyRes.amount || 0,
          description: anyRes.description || ''
        };
      }
      
      throw new Error('Không thể tạo payment link');
    } catch (error: any) {
      console.error('Error creating payment:', error);
      throw new Error(error.message || 'Lỗi tạo thanh toán');
    }
  }

  /**
   * Lấy lịch sử thanh toán của user hiện tại
   */
  async getPaymentHistory(): Promise<Payment[]> {
    try {
      console.log('Fetching payment history...');
      const response = await httpClient.get<Payment[]>(
        '/GetPaymentHistoryAPI'
      );

      console.log('Payment history response:', response);

      // Backend may return array directly or wrapped
      if (Array.isArray(response)) return response;
      
      if (response && typeof response === 'object') {
        const anyRes: any = response;
        if (anyRes.success && Array.isArray(anyRes.data)) {
          return anyRes.data as Payment[];
        }
        if (Array.isArray(anyRes.data)) {
          return anyRes.data as Payment[];
        }
      }
      
      return [];
    } catch (error: any) {
      console.error('Error getting payment history:', error);
      throw new Error(error.message || 'Lỗi tải lịch sử thanh toán');
    }
  }

  /**
   * Lấy payment theo OrderID
   */
  async getPaymentByOrder(orderId: number): Promise<Payment | null> {
    try {
      console.log('Fetching payment by order:', orderId);
      const response = await httpClient.get<Payment>(
        `/GetPaymentHistoryAPI/${orderId}`
      );

      console.log('Payment response:', response);

      const anyRes: any = response;
      if (anyRes?.success && anyRes.data) {
        return anyRes.data as Payment;
      }
      // Nếu response trả về trực tiếp
      if (anyRes && 'paymentID' in anyRes) {
        return {
          paymentID: anyRes.paymentID || 0,
          orderID: anyRes.orderID || 0,
          amount: anyRes.amount || 0,
          description: anyRes.description || '',
          status: anyRes.status || '',
          createdAt: anyRes.createdAt || '',
          completedAt: anyRes.completedAt,
          transactionCode: anyRes.transactionCode
        };
      }
      
      return null;
    } catch (error: any) {
      console.error('Error getting payment by order:', error);
      return null;
    }
  }

  /**
   * Format giá tiền VNĐ
   */
  formatPrice(amount: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
    }).format(amount);
  }

  /**
   * Kiểm tra trạng thái payment
   */
  isPaymentCompleted(status: string): boolean {
    return status === 'completed';
  }

  isPaymentPending(status: string): boolean {
    return status === 'pending';
  }

  isPaymentFailed(status: string): boolean {
    return status === 'failed' || status === 'cancelled';
  }

  /**
   * Cập nhật trạng thái payment (Admin/Staff)
   */
  async updatePaymentStatus(data: UpdatePaymentRequest): Promise<string> {
    try {
      console.log('Updating payment status:', data);
      const response = await httpClient.put<{ message?: string }>(
        '/UpdatePaymentAPI',
        data
      );

      console.log('Update payment response:', response);
      return response.message || 'Cập nhật trạng thái thành công';
    } catch (error: any) {
      console.error('Error updating payment:', error);
      throw new Error(error.message || 'Lỗi cập nhật trạng thái thanh toán');
    }
  }

  /**
   * Xác nhận thanh toán từ PayOS (verify payment by orderCode)
   */
  async verifyPayment(orderCode: number): Promise<{ success: boolean; message: string }> {
    try {
      console.log('Verifying payment for orderCode:', orderCode);
      const response = await httpClient.get<{ success: boolean; message: string }>(
        `/PaymentVerifyAPI/${orderCode}`
      );

      console.log('Verify payment response:', response);
      
      const anyRes: any = response;
      return {
        success: anyRes.success || false,
        message: anyRes.message || 'Xác nhận thanh toán thành công'
      };
    } catch (error: any) {
      console.error('Error verifying payment:', error);
      throw new Error(error.message || 'Lỗi xác nhận thanh toán');
    }
  }
}

export const paymentService = new PaymentService();
export default paymentService;

