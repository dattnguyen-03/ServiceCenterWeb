import { httpClient } from './httpClient';

export interface QuotePart {
  partID: number;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface QuotePartDetail {
  quotePartID: number;
  partID: number;
  partName: string;
  partDescription: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

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
  parts?: QuotePart[]; // Danh sách phụ tùng
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
  parts?: QuotePartDetail[]; // Danh sách phụ tùng chi tiết
}

export interface UpdateQuoteRequest {
  quoteID: number;
  totalAmount?: number;
  discountAmount?: number;
  finalAmount?: number;
  description?: string;
  notes?: string;
  expiresAt?: string;
  parts?: QuotePart[]; // Danh sách phụ tùng (optional)
}

export interface ApproveQuoteRequest {
  quoteID: number;
  action: 'approve' | 'reject';
  reason?: string;
}

export interface CreateQuoteRequestFromTechnician {
  checklistID: number;
  appointmentID: number;
  parts: QuotePart[];
  notes?: string;
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
   * Tính tổng giá trị phụ tùng
   */
  calculatePartsTotal(parts: QuotePart[]): number {
    return parts.reduce((total, part) => total + part.totalPrice, 0);
  }

  /**
   * Tính tổng giá trị phụ tùng từ QuotePartDetail
   */
  calculatePartsTotalFromDetail(parts: QuotePartDetail[]): number {
    return parts.reduce((total, part) => total + part.totalPrice, 0);
  }

  /**
   * Format danh sách phụ tùng để hiển thị
   */
  formatPartsList(parts: QuotePartDetail[]): string {
    if (!parts || parts.length === 0) return 'Không có phụ tùng';
    
    return parts.map(part => 
      `${part.partName} (${part.quantity}x ${this.formatPrice(part.unitPrice)})`
    ).join(', ');
  }

  /**
   * Tạo Quote từ yêu cầu của Technician
   * (Method này sẽ được gọi từ PartsUsage component)
   */
  async createQuoteFromTechnicianRequest(data: CreateQuoteRequestFromTechnician): Promise<string> {
    try {
      const response = await httpClient.post<{ success: boolean; message: string; data: any }>(
        '/CreateQuoteRequestAPI',
        data
      );
      
      if (response.success) {
        return response.message;
      } else {
        throw new Error(response.message || 'Lỗi gửi yêu cầu báo giá');
      }
    } catch (error: any) {
      console.error('Error creating quote request:', error);
      throw new Error(error.message || 'Lỗi gửi yêu cầu báo giá');
    }
  }
}

export const quoteService = new QuoteService();
export default quoteService;

