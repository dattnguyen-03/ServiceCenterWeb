import React, { useState, useEffect } from 'react';
import { Modal, Button, Spin, message } from 'antd';
import { DownloadOutlined, PrinterOutlined } from '@ant-design/icons';
import { invoiceService, InvoiceData } from '../../services/invoiceService';
import { exportToPDF, formatCurrency, formatDate } from '../../utils/pdfUtils';

interface InvoiceViewerProps {
  paymentID?: number;
  appointmentID?: number;
  visible: boolean;
  onClose: () => void;
}

const InvoiceViewer: React.FC<InvoiceViewerProps> = ({
  paymentID,
  appointmentID,
  visible,
  onClose,
}) => {
  const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (visible && (paymentID || appointmentID)) {
      loadInvoiceData();
    } else {
      setInvoiceData(null);
      setExporting(false); // Reset exporting state when modal closes
    }
  }, [visible, paymentID, appointmentID]);

  const loadInvoiceData = async () => {
    setLoading(true);
    try {
      console.log('Loading invoice data...', { paymentID, appointmentID });
      let data: InvoiceData | null = null;
      
      if (paymentID) {
        console.log('Fetching by paymentID:', paymentID);
        data = await invoiceService.getInvoiceData(paymentID);
      } else if (appointmentID) {
        console.log('Fetching by appointmentID:', appointmentID);
        data = await invoiceService.getInvoiceDataFromAppointment(appointmentID);
      } else {
        console.warn('No paymentID or appointmentID provided');
        message.error('Thiếu thông tin để tải hóa đơn');
        onClose();
        return;
      }
      
      console.log('Invoice data loaded:', data);
      
      if (data) {
        setInvoiceData(data);
      } else {
        console.error('No invoice data returned');
        message.error('Không tìm thấy thông tin hóa đơn');
        // Không đóng modal, để user thấy thông báo
      }
    } catch (error: any) {
      console.error('Error loading invoice:', error);
      message.error(error.message || 'Không thể tải hóa đơn. Vui lòng thử lại.');
      // Không đóng modal ngay để user thấy lỗi
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = async () => {
    if (!invoiceData) return;
    
    setExporting(true);
    try {
      // Đợi một chút để đảm bảo DOM đã render xong
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const element = document.getElementById('invoice-content');
      if (!element) {
        throw new Error('Không tìm thấy nội dung hóa đơn');
      }
      
      const filename = `HoaDon-${invoiceData.invoiceNumber}.pdf`;
      await exportToPDF('invoice-content', filename);
      message.success('Xuất hóa đơn thành công!');
    } catch (error: any) {
      console.error('Error exporting PDF:', error);
      message.error(error.message || 'Không thể xuất PDF');
    } finally {
      setExporting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (!visible) return null;

  return (
    <Modal
      title={
        <div style={{ fontSize: '20px', fontWeight: 600 }}>
          Hóa Đơn Thanh Toán
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Đóng
        </Button>,
        <Button
          key="print"
          icon={<PrinterOutlined />}
          onClick={handlePrint}
          disabled={!invoiceData}
        >
          In
        </Button>,
        <Button
          key="export"
          type="primary"
          icon={<DownloadOutlined />}
          onClick={handleExportPDF}
          loading={exporting}
          disabled={!invoiceData}
        >
          Xuất PDF
        </Button>,
      ]}
      width={800}
      style={{ top: 20 }}
    >
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Spin size="large" />
          <div style={{ marginTop: '16px' }}>Đang tải hóa đơn...</div>
        </div>
      ) : !invoiceData ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ marginTop: '16px', color: '#999' }}>Không có dữ liệu hóa đơn</div>
          <div style={{ marginTop: '8px', fontSize: '12px', color: '#999' }}>
            PaymentID: {paymentID || 'N/A'}, AppointmentID: {appointmentID || 'N/A'}
          </div>
        </div>
      ) : (
        <div 
          id="invoice-content" 
          style={{ 
            padding: '20px', 
            backgroundColor: '#fff',
            display: 'block', // Đảm bảo element luôn hiển thị
            visibility: 'visible'
          }}
        >
          {/* Invoice Template */}
          <div style={{
            fontFamily: 'Arial, sans-serif',
            maxWidth: '210mm',
            margin: '0 auto',
            padding: '20px',
            backgroundColor: '#ffffff'
          }}>
            {/* Header */}
            <div style={{
              borderBottom: '3px solid #1890ff',
              paddingBottom: '20px',
              marginBottom: '30px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h1 style={{ 
                    margin: 0, 
                    fontSize: '28px', 
                    color: '#1890ff',
                    fontWeight: 'bold'
                  }}>
                    HÓA ĐƠN THANH TOÁN
                  </h1>
                  <p style={{ margin: '5px 0', fontSize: '14px', color: '#666' }}>
                    Số hóa đơn: <strong>{invoiceData.invoiceNumber}</strong>
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <h2 style={{ margin: 0, fontSize: '18px', color: '#333' }}>
                    {invoiceData.centerName}
                  </h2>
                  <p style={{ margin: '5px 0', fontSize: '12px', color: '#666' }}>
                    Trung tâm dịch vụ EV
                  </p>
                </div>
              </div>
            </div>

            {/* Customer Info */}
            <div style={{ marginBottom: '30px' }}>
              <h3 style={{ 
                margin: '0 0 15px 0', 
                fontSize: '16px',
                color: '#333',
                borderBottom: '1px solid #eee',
                paddingBottom: '10px'
              }}>
                Thông tin khách hàng
              </h3>
              <table style={{ width: '100%', fontSize: '14px' }}>
                <tbody>
                  <tr>
                    <td style={{ padding: '5px 0', width: '40%', color: '#666' }}>Tên khách hàng:</td>
                    <td style={{ padding: '5px 0', fontWeight: 'bold' }}>{invoiceData.customerName}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '5px 0', color: '#666' }}>Xe:</td>
                    <td style={{ padding: '5px 0' }}>{invoiceData.vehicleModel}</td>
                  </tr>
                  {invoiceData.customerPhone && (
                    <tr>
                      <td style={{ padding: '5px 0', color: '#666' }}>Điện thoại:</td>
                      <td style={{ padding: '5px 0' }}>{invoiceData.customerPhone}</td>
                    </tr>
                  )}
                  {invoiceData.customerAddress && (
                    <tr>
                      <td style={{ padding: '5px 0', color: '#666' }}>Địa chỉ:</td>
                      <td style={{ padding: '5px 0' }}>{invoiceData.customerAddress}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Service Details */}
            <div style={{ marginBottom: '30px' }}>
              <h3 style={{ 
                margin: '0 0 15px 0', 
                fontSize: '16px',
                color: '#333',
                borderBottom: '1px solid #eee',
                paddingBottom: '10px'
              }}>
                Chi tiết dịch vụ
              </h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f5f5f5' }}>
                    <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #ddd' }}>Mô tả</th>
                    <th style={{ padding: '12px', textAlign: 'right', border: '1px solid #ddd' }}>Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                      <div style={{ fontWeight: 'bold' }}>{invoiceData.serviceType}</div>
                      <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                        {invoiceData.description}
                      </div>
                      {/* ✅ Hiển thị danh sách phụ tùng nếu có */}
                      {invoiceData.parts && invoiceData.parts.length > 0 && (
                        <div style={{ marginTop: '10px', fontSize: '12px' }}>
                          <div style={{ fontWeight: 'bold', marginBottom: '5px', color: '#333' }}>Phụ tùng đã sử dụng:</div>
                          {invoiceData.parts.map((part, index) => (
                            <div key={index} style={{ marginLeft: '10px', marginTop: '3px', color: '#666' }}>
                              • {part.partName} x {part.quantity}
                            </div>
                          ))}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right', border: '1px solid #ddd', fontWeight: 'bold' }}>
                      {formatCurrency(invoiceData.amount)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Payment Summary */}
            <div style={{ 
              marginTop: '30px',
              padding: '20px',
              backgroundColor: '#f9f9f9',
              borderRadius: '5px'
            }}>
              <table style={{ width: '100%', fontSize: '14px' }}>
                <tbody>
                  <tr>
                    <td style={{ padding: '8px 0', textAlign: 'right', color: '#666', width: '60%' }}>
                      Phương thức thanh toán:
                    </td>
                    <td style={{ padding: '8px 0', fontWeight: 'bold', textAlign: 'right' }}>
                      {invoiceData.paymentMethod === 'online' ? '💳 Thanh toán online' : '💵 Thanh toán tiền mặt'}
                    </td>
                  </tr>
                  {invoiceData.transactionCode && (
                    <tr>
                      <td style={{ padding: '8px 0', textAlign: 'right', color: '#666' }}>
                        Mã giao dịch:
                      </td>
                      <td style={{ padding: '8px 0', fontWeight: 'bold', textAlign: 'right' }}>
                        {invoiceData.transactionCode}
                      </td>
                    </tr>
                  )}
                  <tr style={{ borderTop: '2px solid #1890ff' }}>
                    <td style={{ padding: '12px 0', textAlign: 'right', fontSize: '16px', fontWeight: 'bold' }}>
                      Tổng cộng:
                    </td>
                    <td style={{ padding: '12px 0', textAlign: 'right', fontSize: '20px', color: '#1890ff', fontWeight: 'bold' }}>
                      {formatCurrency(invoiceData.amount)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div style={{
              marginTop: '40px',
              paddingTop: '20px',
              borderTop: '1px solid #eee',
              fontSize: '12px',
              color: '#666',
              textAlign: 'center'
            }}>
              <p style={{ margin: '5px 0' }}>
                Ngày xuất: {formatDate(invoiceData.completedAt)}
              </p>
              <p style={{ margin: '5px 0' }}>
                Cảm ơn quý khách đã sử dụng dịch vụ!
              </p>
              <p style={{ margin: '5px 0', fontSize: '11px' }}>
                Hóa đơn này có giá trị pháp lý và được sử dụng làm chứng từ thanh toán
              </p>
            </div>
          </div>
        </div>
      ) }
    </Modal>
  );
};

export default InvoiceViewer;

