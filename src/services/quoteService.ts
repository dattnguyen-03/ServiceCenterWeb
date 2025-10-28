import { httpClient } from './httpClient';

export interface CreateQuoteRequest {
  appointmentID: number;
  customerID: number;
  centerID: number;
  serviceType: string;
  totalAmount: number;
  discountAmount?: number;
  finalAmount: number;
  description: string;
  notes?: string;
  expiresAt?: string;
}

export interface Quote {
  quoteID: number;
  appointmentID: number;
  customerName: string;
  vehicleModel: string;
  serviceType: string;
  centerName: string;
  totalAmount: number;
  discountAmount?: number;
  finalAmount: number;
  description: string;
  notes?: string;
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  createdAt: string;
  approvedAt?: string;
  expiresAt?: string;
  createdByName: string;
  approvedByName?: string;
}

export interface UpdateQuoteRequest {
  quoteID: number;
  totalAmount?: number;
  discountAmount?: number;
  finalAmount?: number;
  description?: string;
  notes?: string;
  expiresAt?: string;
}

export interface ApproveQuoteRequest {
  quoteID: number;
  action: 'approve' | 'reject';
  reason?: string;
}

class QuoteService {
  /**
   * Tạo báo giá mới (Admin/Staff)
   */
  async createQuote(data: CreateQuoteRequest): Promise<string> {
    try {
      const response = await httpClient.post<{ message: string }>(
        '/CreateQuoteAPI',
        data
      );
      return response.message || 'Tạo báo giá thành công';
    } catch (error: any) {
      console.error('Error creating quote:', error);
      throw new Error(error.message || 'Lỗi tạo báo giá');
    }
  }

  /**
   * Lấy tất cả báo giá (Admin/Staff)
   */
  async getAllQuotes(): Promise<Quote[]> {
    try {
      const response = await httpClient.get<{ message: string; data: Quote[] }>(
        '/GetQuoteAPI'
      );
      return response.data || [];
    } catch (error: any) {
      console.error('Error getting quotes:', error);
      throw new Error(error.message || 'Lỗi lấy danh sách báo giá');
    }
  }

  /**
   * Lấy báo giá của customer (Customer)
   */
  async getMyQuotes(): Promise<Quote[]> {
    try {
      const response = await httpClient.get<{ message: string; data: Quote[] }>(
        '/GetQuoteAPI/my-quotes'
      );
      return response.data || [];
    } catch (error: any) {
      console.error('Error getting my quotes:', error);
      throw new Error(error.message || 'Lỗi lấy báo giá');
    }
  }

  /**
   * Lấy báo giá theo Appointment ID
   */
  async getQuoteByAppointment(appointmentId: number): Promise<Quote | null> {
    try {
      const response = await httpClient.get<{ message: string; data: Quote }>(
        `/GetQuoteAPI/appointment/${appointmentId}`
      );
      return response.data || null;
    } catch (error: any) {
      console.error('Error getting quote by appointment:', error);
      return null;
    }
  }

  /**
   * Cập nhật báo giá (Admin/Staff)
   */
  async updateQuote(data: UpdateQuoteRequest): Promise<string> {
    try {
      const response = await httpClient.put<{ message: string }>(
        '/UpdateQuoteAPI',
        data
      );
      return response.message || 'Cập nhật báo giá thành công';
    } catch (error: any) {
      console.error('Error updating quote:', error);
      throw new Error(error.message || 'Lỗi cập nhật báo giá');
    }
  }

  /**
   * Customer approve/reject quote
   */
  async approveQuote(data: ApproveQuoteRequest): Promise<string> {
    try {
      const response = await httpClient.post<{ message: string }>(
        '/ApproveQuoteAPI',
        data
      );
      return response.message || 'Cập nhật báo giá thành công';
    } catch (error: any) {
      console.error('Error approving quote:', error);
      throw new Error(error.message || 'Lỗi cập nhật báo giá');
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
   * TODO: Call Parts API (implemented by other team)
   * 
   * async getPartsForService(serviceId: number): Promise<Part[]> {
   *   const response = await httpClient.get(`/PartsAPI/service/${serviceId}`);
   *   return response.data;
   * }
   * 
   * async getPartsCost(parts: Part[]): Promise<number> {
   *   let total = 0;
   *   for (const part of parts) {
   *     total += part.price * part.quantity;
   *   }
   *   return total;
   * }
   */
}

export const quoteService = new QuoteService();
export default quoteService;

