import { paymentService } from './paymentService';
import { appointmentService, Appointment } from './appointmentService';
import { partUsageService } from './partUsageService';
import { serviceOrderService } from './serviceOrderService';
import { partService } from './partService';
import { quoteService } from './quoteService';

export interface InvoicePart {
  partName: string;
  quantity: number;
  unitPrice?: number; // Nếu có thông tin giá
  totalPrice?: number; // Nếu có thông tin giá
}

export interface InvoiceData {
  paymentID: number;
  invoiceNumber: string;
  customerName: string;
  customerPhone?: string;
  customerAddress?: string;
  vehicleModel: string;
  serviceType: string;
  centerName: string;
  paymentMethod: 'online' | 'cash';
  amount: number;
  description: string;
  transactionCode?: string;
  createdAt: string;
  completedAt: string;
  appointmentID: number;
  orderID?: number;
  parts?: InvoicePart[]; // ✅ Danh sách phụ tùng đã sử dụng
}

class InvoiceService {
  /**
   * Lấy thông tin đầy đủ cho hóa đơn từ paymentID
   */
  async getInvoiceData(paymentID: number): Promise<InvoiceData | null> {
    try {
      // Lấy payment info
      const paymentHistory = await paymentService.getPaymentHistory();
      const payment = paymentHistory.find(p => p.paymentID === paymentID);
      
      if (!payment || payment.status !== 'completed') {
        throw new Error('Payment không tồn tại hoặc chưa hoàn thành');
      }

      // Lấy appointment info để có customer, vehicle, service details
      let appointment: Appointment | null = null;
      if (payment.orderID) {
        // Nếu có orderID, lấy từ service order (cần implement API hoặc dùng appointmentID)
        // Tạm thời lấy từ appointments
      }
      
      // Tìm appointment từ list
      try {
        const appointments = await appointmentService.getAllAppointments();
        
        // Ưu tiên tìm qua appointmentID (nếu có)
        if (payment.appointmentID) {
          appointment = appointments.find(a => a.appointmentID === payment.appointmentID) || null;
        }
        
        // Nếu không tìm thấy, thử tìm qua orderID
        if (!appointment && payment.orderID) {
          appointment = appointments.find(a => a.appointmentID === payment.orderID) || null;
        }
        
        // Nếu vẫn không tìm thấy, thử tìm qua payment amount và description
        if (!appointment && payment.description) {
          const descMatch = appointments.find(a => 
            payment.description.includes(a.serviceType) ||
            payment.description.includes(a.userName) ||
            (a.paymentAmount && Math.abs(a.paymentAmount - payment.amount) < 1000)
          );
          if (descMatch) appointment = descMatch;
        }
      } catch (err) {
        console.warn('Could not fetch appointment details:', err);
      }

      // Tạo invoice number
      const invoiceNumber = `INV-${payment.paymentID.toString().padStart(6, '0')}-${new Date(payment.completedAt || payment.createdAt).getFullYear()}`;

      // ✅ Lấy danh sách phụ tùng từ Quote hoặc PartUsage
      let parts: InvoicePart[] = [];
      let orderIDForParts = payment.orderID;
      const targetAppointmentID = payment.appointmentID || appointment?.appointmentID;
      
      console.log('[Invoice] Payment data:', { 
        paymentID: payment.paymentID, 
        orderID: payment.orderID, 
        appointmentID: payment.appointmentID,
        targetAppointmentID
      });
      
      // Ưu tiên 1: Lấy parts từ Quote (nếu có) - Quote có thông tin đầy đủ nhất
      if (targetAppointmentID) {
        try {
          console.log('[Invoice] Trying to fetch Quote for appointmentID:', targetAppointmentID);
          const allQuotes = await quoteService.getAllQuotes();
          const quote = allQuotes.find(q => q.appointmentID === targetAppointmentID && (q.status === 'approved' || q.status === 'pending'));
          
          if (quote && quote.parts && quote.parts.length > 0) {
            console.log('[Invoice] ✅ Found Quote with parts:', quote.quoteID, 'status:', quote.status, 'parts count:', quote.parts.length);
            parts = quote.parts.map(qp => ({
              partName: qp.partName,
              quantity: qp.quantity,
              unitPrice: qp.unitPrice,
              totalPrice: qp.totalPrice,
            }));
            console.log('[Invoice] ✅ Mapped parts from Quote:', parts);
          } else {
            console.log('[Invoice] No Quote found with parts for appointmentID:', targetAppointmentID);
          }
        } catch (quoteErr: any) {
          console.warn('[Invoice] Could not fetch Quote for parts:', quoteErr.message);
        }
      }
      
      // Nếu không có orderID trong payment, thử lấy từ ServiceOrder qua appointmentID
      if (!orderIDForParts) {
        const targetAppointmentID = payment.appointmentID || (appointment?.appointmentID);
        if (targetAppointmentID) {
          try {
            console.log('[Invoice] No orderID in payment, searching ServiceOrder for appointmentID:', targetAppointmentID);
            
            const allServiceOrders = await serviceOrderService.getAllServiceOrders();
            console.log('[Invoice] Total service orders found:', allServiceOrders.length);
            
            const serviceOrder = allServiceOrders.find(so => so.appointmentID === targetAppointmentID);
            if (serviceOrder) {
              orderIDForParts = serviceOrder.OrderID || serviceOrder.orderID;
              console.log('[Invoice] ✅ Found service order:', { 
                OrderID: serviceOrder.OrderID || serviceOrder.orderID, 
                appointmentID: serviceOrder.appointmentID 
              });
            } else {
              console.warn('[Invoice] ❌ No service order found for appointmentID:', targetAppointmentID);
            }
          } catch (err: any) {
            console.error('[Invoice] ❌ Could not fetch service order:', err.message || err);
          }
        } else {
          console.warn('[Invoice] ❌ No appointmentID available to search for ServiceOrder');
        }
      } else {
        console.log('[Invoice] ✅ Using orderID from payment:', orderIDForParts);
      }
      
      // Ưu tiên 2: Nếu không có Quote, lấy từ PartUsage
      if (parts.length === 0 && orderIDForParts) {
        try {
          console.log('[Invoice] Fetching part usage for orderID:', orderIDForParts);
          const allPartUsage = await partUsageService.getAllPartUsage();
          console.log('[Invoice] Total part usage records:', allPartUsage.length);
          
          // Filter PartUsage - kiểm tra cả orderID và OrderID (nếu có)
          const orderPartUsage = allPartUsage.filter(pu => {
            const puOrderID = (pu as any).orderID || (pu as any).OrderID;
            return puOrderID === orderIDForParts;
          });
          console.log('[Invoice] Part usage for orderID', orderIDForParts, ':', orderPartUsage.length, 'records');
          console.log('[Invoice] Filtered part usage details:', orderPartUsage);
          
          if (orderPartUsage.length === 0) {
            console.warn('[Invoice] ⚠️ No part usage found for orderID:', orderIDForParts);
            console.warn('[Invoice] All part usage orderIDs:', allPartUsage.map(pu => ({
              usageID: pu.usageID,
              orderID: (pu as any).orderID || (pu as any).OrderID,
              partID: pu.partID,
              partName: pu.partName
            })));
          }
          
          // Lấy danh sách Part để lấy giá
          let allParts: any[] = [];
          try {
            allParts = await partService.getAllParts();
            console.log('[Invoice] Total parts found:', allParts.length);
            console.log('[Invoice] Sample parts:', allParts.slice(0, 3).map(p => ({
              partID: p.partID,
              name: p.name,
              price: p.price
            })));
          } catch (partErr: any) {
            console.warn('[Invoice] Could not fetch parts for pricing:', partErr.message);
          }
          
          // Map PartUsage với giá từ Part service
          parts = orderPartUsage.map(pu => {
            // Tìm Part tương ứng để lấy giá - kiểm tra cả partID
            const part = pu.partID ? allParts.find(p => p.partID === pu.partID) : null;
            
            if (!part && pu.partID) {
              console.warn('[Invoice] ⚠️ Part not found for partID:', pu.partID, 'partName:', pu.partName);
            }
            
            const unitPrice = part?.price || part?.unitPrice || 0;
            const totalPrice = unitPrice * pu.quantityUsed;
            
            console.log('[Invoice] Part mapping result:', {
              partID: pu.partID,
              partName: pu.partName,
              quantity: pu.quantityUsed,
              unitPrice,
              totalPrice,
              foundPart: !!part,
              partPrice: part?.price
            });
            
            return {
              partName: pu.partName,
              quantity: pu.quantityUsed,
              unitPrice: unitPrice > 0 ? unitPrice : undefined,
              totalPrice: totalPrice > 0 ? totalPrice : undefined,
            };
          });
          console.log('[Invoice] ✅ Final mapped parts for invoice:', parts);
        } catch (err: any) {
          console.error('[Invoice] ❌ Could not fetch part usage:', err.message || err);
          // Không throw error, chỉ log warning - hóa đơn vẫn có thể hiển thị
        }
      } else {
        console.warn('[Invoice] ❌ No orderID found - cannot fetch parts');
        console.warn('[Invoice] Payment:', payment);
        console.warn('[Invoice] Appointment:', appointment);
      }

      return {
        paymentID: payment.paymentID,
        invoiceNumber,
        customerName: appointment?.userName || 'Khách hàng',
        customerPhone: undefined, // Cần thêm vào appointment/order API
        customerAddress: undefined, // Cần thêm vào appointment/order API
        vehicleModel: appointment?.vehicleModel || 'N/A',
        serviceType: appointment?.serviceType || payment.description,
        centerName: appointment?.centerName || 'Trung tâm dịch vụ',
        paymentMethod: (payment.paymentMethod as 'online' | 'cash') || (payment.transactionCode ? 'online' : 'cash'), // Use paymentMethod if available, otherwise infer
        amount: payment.amount,
        description: payment.description,
        transactionCode: payment.transactionCode,
        createdAt: payment.createdAt,
        completedAt: payment.completedAt || payment.createdAt,
        appointmentID: appointment?.appointmentID || 0,
        orderID: payment.orderID || orderIDForParts, // ✅ Lấy orderID từ payment hoặc serviceOrder
        parts // ✅ Thêm parts vào invoice data
      };
    } catch (error: any) {
      console.error('Error getting invoice data:', error);
      throw new Error(error.message || 'Không thể lấy thông tin hóa đơn');
    }
  }

  /**
   * Lấy invoice data từ appointment (nếu có payment completed)
   */
  async getInvoiceDataFromAppointment(appointmentID: number): Promise<InvoiceData | null> {
    try {
      const appointments = await appointmentService.getAllAppointments();
      const appointment = appointments.find(a => a.appointmentID === appointmentID);
      
      if (!appointment) {
        throw new Error('Appointment không tồn tại');
      }

      // Tìm payment từ appointment - dùng API riêng cho Admin/Staff
      let payment: any = null;
      try {
        payment = await paymentService.getPaymentByAppointment(appointmentID);
      } catch (err) {
        // Fallback: thử tìm từ payment history nếu API không có quyền
        console.warn('Could not get payment by appointment API, trying history...', err);
        const paymentHistory = await paymentService.getPaymentHistory();
        payment = paymentHistory.find(p => 
          p.appointmentID === appointmentID || 
          p.orderID === appointmentID || 
          (appointment.paymentAmount && Math.abs(p.amount - appointment.paymentAmount) < 1000)
        );
      }

      if (!payment || payment.status !== 'completed') {
        throw new Error('Chưa có thanh toán hoàn tất cho appointment này');
      }

      const invoiceNumber = `INV-${payment.paymentID.toString().padStart(6, '0')}-${new Date(payment.completedAt || payment.createdAt).getFullYear()}`;

      // ✅ Lấy danh sách phụ tùng từ Quote hoặc PartUsage
      let parts: InvoicePart[] = [];
      let orderIDForParts = payment.orderID;
      const targetAppointmentID = appointmentID || payment.appointmentID;
      
      console.log('[Invoice] Payment data:', { 
        paymentID: payment.paymentID, 
        orderID: payment.orderID, 
        appointmentID: payment.appointmentID || appointmentID,
        targetAppointmentID
      });
      
      // Ưu tiên 1: Lấy parts từ Quote (nếu có) - Quote có thông tin đầy đủ nhất
      if (targetAppointmentID) {
        try {
          console.log('[Invoice] Trying to fetch Quote for appointmentID:', targetAppointmentID);
          const allQuotes = await quoteService.getAllQuotes();
          const quote = allQuotes.find(q => q.appointmentID === targetAppointmentID && (q.status === 'approved' || q.status === 'pending'));
          
          if (quote && quote.parts && quote.parts.length > 0) {
            console.log('[Invoice] ✅ Found Quote with parts:', quote.quoteID, 'status:', quote.status, 'parts count:', quote.parts.length);
            parts = quote.parts.map(qp => ({
              partName: qp.partName,
              quantity: qp.quantity,
              unitPrice: qp.unitPrice,
              totalPrice: qp.totalPrice,
            }));
            console.log('[Invoice] ✅ Mapped parts from Quote:', parts);
          } else {
            console.log('[Invoice] No Quote found with parts for appointmentID:', targetAppointmentID);
          }
        } catch (quoteErr: any) {
          console.warn('[Invoice] Could not fetch Quote for parts:', quoteErr.message);
        }
      }
      
      // Nếu không có orderID trong payment, thử lấy từ ServiceOrder qua appointmentID (từ tham số)
      if (!orderIDForParts) {
        try {
          const targetAppointmentID = appointmentID || payment.appointmentID;
          console.log('[Invoice] No orderID in payment, searching ServiceOrder for appointmentID:', targetAppointmentID);
          
          const allServiceOrders = await serviceOrderService.getAllServiceOrders();
          console.log('[Invoice] Total service orders found:', allServiceOrders.length);
          console.log('[Invoice] Service orders:', allServiceOrders.map(so => ({ 
            OrderID: so.OrderID || so.orderID, 
            appointmentID: so.appointmentID 
          })));
          
          const serviceOrder = allServiceOrders.find(so => so.appointmentID === targetAppointmentID);
          if (serviceOrder) {
            orderIDForParts = serviceOrder.OrderID || serviceOrder.orderID;
            console.log('[Invoice] ✅ Found service order:', { 
              OrderID: serviceOrder.OrderID || serviceOrder.orderID, 
              appointmentID: serviceOrder.appointmentID 
            });
          } else {
            console.warn('[Invoice] ❌ No service order found for appointmentID:', targetAppointmentID);
            console.warn('[Invoice] Available appointmentIDs:', allServiceOrders.map(so => so.appointmentID));
          }
        } catch (err: any) {
          console.error('[Invoice] ❌ Could not fetch service order:', err.message || err);
        }
      } else {
        console.log('[Invoice] ✅ Using orderID from payment:', orderIDForParts);
      }
      
      // Ưu tiên 2: Nếu không có Quote, lấy từ PartUsage
      if (parts.length === 0 && orderIDForParts) {
        try {
          console.log('[Invoice] Fetching part usage for orderID:', orderIDForParts);
          const allPartUsage = await partUsageService.getAllPartUsage();
          console.log('[Invoice] Total part usage records:', allPartUsage.length);
          console.log('[Invoice] Part usage orders:', allPartUsage.map(pu => ({ 
            usageID: pu.usageID, 
            orderID: pu.orderID, 
            partID: pu.partID,
            partName: pu.partName 
          })));
          
          // Filter PartUsage - kiểm tra cả orderID và OrderID (nếu có)
          const orderPartUsage = allPartUsage.filter(pu => {
            const puOrderID = (pu as any).orderID || (pu as any).OrderID;
            return puOrderID === orderIDForParts;
          });
          console.log('[Invoice] Part usage for orderID', orderIDForParts, ':', orderPartUsage.length, 'records');
          console.log('[Invoice] Filtered part usage details:', orderPartUsage);
          
          if (orderPartUsage.length === 0) {
            console.warn('[Invoice] ⚠️ No part usage found for orderID:', orderIDForParts);
            console.warn('[Invoice] All part usage orderIDs:', allPartUsage.map(pu => ({
              usageID: pu.usageID,
              orderID: (pu as any).orderID || (pu as any).OrderID,
              partID: pu.partID,
              partName: pu.partName
            })));
          }
          
          // Lấy danh sách Part để lấy giá
          let allParts: any[] = [];
          try {
            allParts = await partService.getAllParts();
            console.log('[Invoice] Total parts found:', allParts.length);
            console.log('[Invoice] Sample parts:', allParts.slice(0, 3).map(p => ({
              partID: p.partID,
              name: p.name,
              price: p.price
            })));
          } catch (partErr: any) {
            console.warn('[Invoice] Could not fetch parts for pricing:', partErr.message);
          }
          
          // Map PartUsage với giá từ Part service
          parts = orderPartUsage.map(pu => {
            // Tìm Part tương ứng để lấy giá - kiểm tra cả partID
            const part = pu.partID ? allParts.find(p => p.partID === pu.partID) : null;
            
            if (!part && pu.partID) {
              console.warn('[Invoice] ⚠️ Part not found for partID:', pu.partID, 'partName:', pu.partName);
            }
            
            const unitPrice = part?.price || part?.unitPrice || 0;
            const totalPrice = unitPrice * pu.quantityUsed;
            
            console.log('[Invoice] Part mapping result:', {
              partID: pu.partID,
              partName: pu.partName,
              quantity: pu.quantityUsed,
              unitPrice,
              totalPrice,
              foundPart: !!part,
              partPrice: part?.price
            });
            
            return {
              partName: pu.partName,
              quantity: pu.quantityUsed,
              unitPrice: unitPrice > 0 ? unitPrice : undefined,
              totalPrice: totalPrice > 0 ? totalPrice : undefined,
            };
          });
          console.log('[Invoice] ✅ Final mapped parts for invoice:', parts);
        } catch (err: any) {
          console.error('[Invoice] ❌ Could not fetch part usage:', err.message || err);
          // Không throw error, chỉ log warning - hóa đơn vẫn có thể hiển thị
        }
      } else {
        console.warn('[Invoice] ❌ No orderID found - cannot fetch parts');
        console.warn('[Invoice] Payment data:', payment);
      }

      return {
        paymentID: payment.paymentID,
        invoiceNumber,
        customerName: appointment.userName,
        customerPhone: undefined,
        customerAddress: undefined,
        vehicleModel: appointment.vehicleModel,
        serviceType: appointment.serviceType,
        centerName: appointment.centerName,
        paymentMethod: (appointment.paymentMethod as 'online' | 'cash') || 'cash',
        amount: payment.amount,
        description: payment.description || `Thanh toán dịch vụ ${appointment.serviceType}`,
        transactionCode: payment.transactionCode,
        createdAt: payment.createdAt,
        completedAt: payment.completedAt || payment.createdAt,
        appointmentID: appointment.appointmentID,
        orderID: payment.orderID || orderIDForParts, // ✅ Lấy orderID từ payment hoặc serviceOrder
        parts // ✅ Thêm parts vào invoice data
      };
    } catch (error: any) {
      console.error('Error getting invoice data from appointment:', error);
      throw new Error(error.message || 'Không thể lấy thông tin hóa đơn');
    }
  }
}

export const invoiceService = new InvoiceService();
export default invoiceService;

