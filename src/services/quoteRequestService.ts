import { httpClient } from './httpClient';

export interface QuoteRequestPart {
  partID: number;
  partName: string;
  partDescription: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface QuoteRequest {
  quoteRequestID: number;
  checklistID: number;
  appointmentID: number;
  customerName: string;
  vehicleModel: string;
  technicianName: string;
  centerName: string;
  serviceType: string;
  checklistItem: string;
  partsCount: number;
  totalPartsValue: number;
  notes: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  processedAt?: string;
  processedByName?: string;
  parts: QuoteRequestPart[];
}

export interface CreateQuoteFromRequestRequest {
  quoteRequestID: number;
  discountAmount?: number;
  notes?: string;
}

class QuoteRequestService {
  /**
   * Lấy tất cả yêu cầu báo giá (Admin/Staff)
   */
  async getAllQuoteRequests(): Promise<QuoteRequest[]> {
    try {
      const response = await httpClient.get<QuoteRequest[]>('/QuoteRequestAPI');
      return response.data || [];
    } catch (error: any) {
      console.error('Error getting quote requests:', error);
      throw new Error(error.message || 'Lỗi lấy danh sách yêu cầu báo giá');
    }
  }

  /**
   * Lấy chi tiết yêu cầu báo giá (Admin/Staff)
   */
  async getQuoteRequestById(id: number): Promise<QuoteRequest | null> {
    try {
      const response = await httpClient.get<QuoteRequest>(`/QuoteRequestAPI/${id}`);
      return response.data || null;
    } catch (error: any) {
      console.error('Error getting quote request:', error);
      return null;
    }
  }

  /**
   * Tạo Quote từ QuoteRequest (Admin/Staff)
   */
  async createQuoteFromRequest(data: CreateQuoteFromRequestRequest): Promise<string> {
    try {
      const response = await httpClient.post<{ success: boolean; message: string; data: any }>(
        '/CreateQuoteFromRequestAPI',
        data
      );
      
      if (response.success) {
        return response.message || 'Báo giá đã được tạo thành công';
      } else {
        throw new Error(response.message || 'Lỗi tạo báo giá');
      }
    } catch (error: any) {
      console.error('Error creating quote from request:', error);
      throw new Error(error.message || 'Lỗi tạo báo giá');
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
   * Format ngày tháng
   */
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleString('vi-VN');
  }
}

export const quoteRequestService = new QuoteRequestService();
export default quoteRequestService;
