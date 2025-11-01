import { paymentService } from './paymentService';
import { appointmentService, Appointment } from './appointmentService';
import { partUsageService } from './partUsageService';
import { serviceOrderService } from './serviceOrderService';

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

      // ✅ Lấy danh sách phụ tùng đã sử dụng từ PartUsage
      let parts: InvoicePart[] = [];
      let orderIDForParts = payment.orderID;
      
      console.log('[Invoice] Payment data:', { 
        paymentID: payment.paymentID, 
        orderID: payment.orderID, 
        appointmentID: payment.appointmentID 
      });
      
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
      
      // Lấy PartUsage nếu có orderID
      if (orderIDForParts) {
        try {
          console.log('[Invoice] Fetching part usage for orderID:', orderIDForParts);
          const allPartUsage = await partUsageService.getAllPartUsage();
          console.log('[Invoice] Total part usage records:', allPartUsage.length);
          
          const orderPartUsage = allPartUsage.filter(pu => pu.orderID === orderIDForParts);
          console.log('[Invoice] Part usage for orderID', orderIDForParts, ':', orderPartUsage.length, 'records');
          
          parts = orderPartUsage.map(pu => ({
            partName: pu.partName,
            quantity: pu.quantityUsed,
            // unitPrice và totalPrice có thể lấy từ Part service nếu cần
          }));
          console.log('[Invoice] ✅ Mapped parts for invoice:', parts);
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

      // ✅ Lấy danh sách phụ tùng đã sử dụng từ PartUsage
      let parts: InvoicePart[] = [];
      let orderIDForParts = payment.orderID;
      
      console.log('[Invoice] Payment data:', { 
        paymentID: payment.paymentID, 
        orderID: payment.orderID, 
        appointmentID: payment.appointmentID || appointmentID 
      });
      
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
      
      // Lấy PartUsage nếu có orderID
      if (orderIDForParts) {
        try {
          console.log('[Invoice] Fetching part usage for orderID:', orderIDForParts);
          const allPartUsage = await partUsageService.getAllPartUsage();
          console.log('[Invoice] Total part usage records:', allPartUsage.length);
          console.log('[Invoice] Part usage orders:', allPartUsage.map(pu => ({ 
            usageID: pu.usageID, 
            orderID: pu.orderID, 
            partName: pu.partName 
          })));
          
          const orderPartUsage = allPartUsage.filter(pu => pu.orderID === orderIDForParts);
          console.log('[Invoice] Part usage for orderID', orderIDForParts, ':', orderPartUsage.length, 'records');
          console.log('[Invoice] Part usage details:', orderPartUsage);
          
          parts = orderPartUsage.map(pu => ({
            partName: pu.partName,
            quantity: pu.quantityUsed,
            // unitPrice và totalPrice có thể lấy từ Part service nếu cần
          }));
          console.log('[Invoice] ✅ Mapped parts for invoice:', parts);
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

