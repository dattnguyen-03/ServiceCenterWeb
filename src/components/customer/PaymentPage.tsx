import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Button, Tag, Select, Space, Spin } from 'antd';
import { CreditCardOutlined, DownloadOutlined } from '@ant-design/icons';
import { paymentService } from '../../services/paymentService';
import { showError } from '../../utils/sweetAlert';
import { Payment } from '../../services/paymentService';

const { Option } = Select;

const PaymentPage: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      setLoading(true);
      const data = await paymentService.getPaymentHistory();
      setPayments(data);
    } catch (err: any) {
      showError('Lỗi tải lịch sử thanh toán', err.message || 'Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const filteredPayments = payments.filter(p => {
    if (filterStatus === 'all') return true;
    return p.status === filterStatus;
  });

  const totalPaid = payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0);
  const totalPending = payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0);
  
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit'
    });
  };

  const getStatusTag = (status: string) => {
    const statusMap: Record<string, { color: string; text: string }> = {
      completed: { color: 'green', text: ' Đã thanh toán' },
      pending: { color: 'orange', text: ' Chờ thanh toán' },
      failed: { color: 'red', text: ' Thất bại' },
      cancelled: { color: 'default', text: ' Đã hủy' }
    };
    
    const statusInfo = statusMap[status] || { color: 'default', text: status };
    return statusInfo;
  };

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #f0f9ff 0%, #f9fafb 100%)' }}>
      {/* Gradient Header */}
      <div className="p-6 bg-gradient-to-r from-rose-600 to-pink-500 text-white rounded-b-3xl shadow-lg mb-8">
        <div className="flex items-center mb-3">
          <CreditCardOutlined style={{ fontSize: 32, marginRight: 12 }} />
          <h1 className="text-4xl font-bold">Thanh toán & Hóa đơn</h1>
        </div>
        <p className="text-rose-100 text-lg">Quản lý các phương thức thanh toán và xem lại lịch sử hóa đơn của bạn</p>
      </div>

      <div className="px-6 pb-6">
        <Row gutter={[32, 32]}>
          {/* Payment Summary */}
          <Col xs={24} md={8}>
            <Card 
              style={{
                borderRadius: 20,
                boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
                border: '1px solid #e5e7eb',
                background: 'linear-gradient(135deg, #fff5f7 0%, #fff9fa 100%)'
              }}
              bodyStyle={{ padding: 24 }}
            >
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1f2937', marginBottom: 24 }}>
                 Tổng quan chi phí
              </h3>
              
              <div style={{
                background: 'linear-gradient(135deg, #fecdd3 0%, #fbcfe8 100%)',
                padding: 16,
                borderRadius: 12,
                marginBottom: 16,
                border: '2px solid #fda4af'
              }}>
                <div style={{ fontSize: 12, color: '#be185d', marginBottom: 4, fontWeight: 600 }}>Đã thanh toán</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#be185d' }}>
                  {totalPaid.toLocaleString('vi-VN')} VNĐ
                </div>
              </div>

              <div style={{
                background: 'linear-gradient(135deg, #fed7aa 0%, #fce7d6 100%)',
                padding: 16,
                borderRadius: 12,
                border: '2px solid #fbbd23'
              }}>
                <div style={{ fontSize: 12, color: '#d97706', marginBottom: 4, fontWeight: 600 }}>Chờ thanh toán</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#d97706' }}>
                  {totalPending.toLocaleString('vi-VN')} VNĐ
                </div>
              </div>
            </Card>
          </Col>
          
          {/* Payment History */}
          <Col xs={24}>
            <Card 
              style={{
                borderRadius: 20,
                boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
                border: '1px solid #e5e7eb'
              }}
              bodyStyle={{ padding: 24 }}
            >
              <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1f2937', margin: 0 }}>
                  Lịch sử hóa đơn
                </h3>
                <Space style={{ gap: 12 }}>
                  <Select 
                    value={filterStatus}
                    onChange={setFilterStatus}
                    style={{ width: 150, borderRadius: 10 }}
                  >
                    <Option value="all">Tất cả</Option>
                    <Option value="completed">Đã thanh toán</Option>
                    <Option value="pending">Chờ thanh toán</Option>
                    <Option value="failed">Thất bại</Option>
                  </Select>
                  {/* <Button 
                    icon={<DownloadOutlined />}
                    size="large"
                    style={{
                      borderRadius: 10,
                      fontWeight: 600
                    }}
                  >
                    Xuất Excel
                  </Button> */}
                </Space>
              </div>

              {loading ? (
                <div style={{ textAlign: 'center', padding: '60px 0' }}>
                  <Spin size="large" />
                </div>
              ) : filteredPayments.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 0', color: '#6b7280' }}>
                  Không có lịch sử thanh toán
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%' }}>
                    <thead style={{ backgroundColor: '#f3f4f6' }}>
                      <tr>
                        <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 600, color: '#6b7280', fontSize: 14 }}>Mã TT</th>
                        <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 600, color: '#6b7280', fontSize: 14 }}>Ngày tạo</th>
                        <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 600, color: '#6b7280', fontSize: 14 }}>Mô tả</th>
                        <th style={{ textAlign: 'right', padding: '12px 16px', fontWeight: 600, color: '#6b7280', fontSize: 14 }}>Số tiền</th>
                        <th style={{ textAlign: 'center', padding: '12px 16px', fontWeight: 600, color: '#6b7280', fontSize: 14 }}>Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPayments.map((payment, index) => {
                        const statusInfo = getStatusTag(payment.status);
                        return (
                          <tr 
                            key={payment.paymentID}
                            style={{
                              borderBottom: '1px solid #e5e7eb',
                              backgroundColor: index % 2 === 0 ? '#fafbfc' : '#fff',
                              transition: 'background-color 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = index % 2 === 0 ? '#fafbfc' : '#fff'}
                          >
                            <td style={{ padding: '12px 16px', fontWeight: 700, color: '#2563eb' }}>#{payment.paymentID}</td>
                            <td style={{ padding: '12px 16px', color: '#4b5563' }}>{formatDate(payment.createdAt)}</td>
                            <td style={{ padding: '12px 16px', color: '#4b5563' }}>{payment.description}</td>
                            <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 700, color: '#1f2937' }}>
                              {paymentService.formatPrice(payment.amount)}
                            </td>
                            <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                              <Tag 
                                color={statusInfo.color as any}
                                style={{ borderRadius: 20, fontWeight: 600 }}
                              >
                                {statusInfo.text}
                              </Tag>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default PaymentPage;
