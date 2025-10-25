import React from 'react';
import { Card, Row, Col, Button, Tag, List, Select, Space } from 'antd';
import { CreditCardOutlined, DownloadOutlined, PlusOutlined } from '@ant-design/icons';

const { Option } = Select;

const PaymentPage: React.FC = () => {
  const invoiceHistory = [
    { id: 'INV-001', date: '2024-01-15', service: 'Bảo dưỡng định kỳ', amount: 2500000, status: 'paid' },
    { id: 'INV-002', date: '2024-02-20', service: 'Kiểm tra pin', amount: 1500000, status: 'paid' },
    { id: 'INV-003', date: '2024-03-10', service: 'Thay lốp', amount: 3500000, status: 'pending' }
  ];

  const paymentMethods = [
    { id: '1', type: 'visa', last4: '4242', expiry: '12/25', isDefault: true },
    { id: '2', type: 'mastercard', last4: '8888', expiry: '08/26', isDefault: false }
  ];
  
  const totalPaid = invoiceHistory.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.amount, 0);
  const totalPending = invoiceHistory.filter(inv => inv.status === 'pending').reduce((sum, inv) => sum + inv.amount, 0);

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
                💰 Tổng quan chi phí
              </h3>
              
              <div style={{
                background: 'linear-gradient(135deg, #fecdd3 0%, #fbcfe8 100%)',
                padding: 16,
                borderRadius: 12,
                marginBottom: 16,
                border: '2px solid #fda4af'
              }}>
                <div style={{ fontSize: 12, color: '#be185d', marginBottom: 4, fontWeight: 600 }}>✅ Đã thanh toán</div>
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
                <div style={{ fontSize: 12, color: '#d97706', marginBottom: 4, fontWeight: 600 }}>⏳ Chờ thanh toán</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#d97706' }}>
                  {totalPending.toLocaleString('vi-VN')} VNĐ
                </div>
              </div>
            </Card>
          </Col>
          
          {/* Payment Methods */}
          <Col xs={24} md={16}>
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
                  💳 Phương thức thanh toán
                </h3>
                <Button 
                  type="primary"
                  icon={<PlusOutlined />}
                  size="large"
                  style={{
                    borderRadius: 10,
                    background: 'linear-gradient(90deg, #f43f5e 0%, #fb7185 100%)',
                    border: 'none',
                    fontWeight: 600
                  }}
                >
                  Thêm thẻ mới
                </Button>
              </div>

              <List
                itemLayout="horizontal"
                dataSource={paymentMethods}
                renderItem={item => (
                  <List.Item
                    style={{
                      padding: 16,
                      background: '#f9fafb',
                      borderRadius: 12,
                      marginBottom: 12,
                      border: '1px solid #e5e7eb'
                    }}
                    actions={[
                      <Button type="link" style={{ color: '#2563eb', fontWeight: 600 }}>Sửa</Button>, 
                      <Button type="link" danger style={{ fontWeight: 600 }}>Xóa</Button>
                    ]}
                  >
                    <List.Item.Meta
                      avatar={
                        <div style={{
                          width: 48,
                          height: 48,
                          background: 'linear-gradient(135deg, #60a5fa 0%, #22c55e 100%)',
                          borderRadius: 10,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#fff',
                          fontSize: 20
                        }}>
                          💳
                        </div>
                      }
                      title={
                        <span style={{ fontWeight: 700, color: '#1f2937' }}>
                          •••• {item.last4} {item.isDefault && <Tag style={{ borderRadius: 20, marginLeft: 8 }} color="blue">Mặc định</Tag>}
                        </span>
                      }
                      description={<span style={{ fontSize: 13, color: '#6b7280' }}>Hết hạn: {item.expiry}</span>}
                    />
                  </List.Item>
                )}
              />
            </Card>
          </Col>

          {/* Invoice History */}
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
                  📋 Lịch sử hóa đơn
                </h3>
                <Space style={{ gap: 12 }}>
                  <Select 
                    defaultValue="all" 
                    style={{ width: 150, borderRadius: 10 }}
                  >
                    <Option value="all">Tất cả</Option>
                    <Option value="paid">Đã thanh toán</Option>
                    <Option value="pending">Chờ thanh toán</Option>
                  </Select>
                  <Button 
                    icon={<DownloadOutlined />}
                    size="large"
                    style={{
                      borderRadius: 10,
                      fontWeight: 600
                    }}
                  >
                    Xuất Excel
                  </Button>
                </Space>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%' }}>
                  <thead style={{ backgroundColor: '#f3f4f6' }}>
                    <tr>
                      <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 600, color: '#6b7280', fontSize: 14 }}>Mã HĐ</th>
                      <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 600, color: '#6b7280', fontSize: 14 }}>Ngày</th>
                      <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 600, color: '#6b7280', fontSize: 14 }}>Dịch vụ</th>
                      <th style={{ textAlign: 'right', padding: '12px 16px', fontWeight: 600, color: '#6b7280', fontSize: 14 }}>Số tiền</th>
                      <th style={{ textAlign: 'center', padding: '12px 16px', fontWeight: 600, color: '#6b7280', fontSize: 14 }}>Trạng thái</th>
                      <th style={{ textAlign: 'center', padding: '12px 16px', fontWeight: 600, color: '#6b7280', fontSize: 14 }}>Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoiceHistory.map((invoice, index) => (
                      <tr 
                        key={invoice.id}
                        style={{
                          borderBottom: '1px solid #e5e7eb',
                          backgroundColor: index % 2 === 0 ? '#fafbfc' : '#fff',
                          transition: 'background-color 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = index % 2 === 0 ? '#fafbfc' : '#fff'}
                      >
                        <td style={{ padding: '12px 16px', fontWeight: 700, color: '#2563eb' }}>{invoice.id}</td>
                        <td style={{ padding: '12px 16px', color: '#4b5563' }}>📅 {invoice.date}</td>
                        <td style={{ padding: '12px 16px', color: '#4b5563' }}>{invoice.service}</td>
                        <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 700, color: '#1f2937' }}>
                          {invoice.amount.toLocaleString('vi-VN')} VNĐ
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                          <Tag 
                            color={invoice.status === 'paid' ? 'green' : 'orange'}
                            style={{ borderRadius: 20, fontWeight: 600 }}
                          >
                            {invoice.status === 'paid' ? '✅ Đã thanh toán' : '⏳ Chờ thanh toán'}
                          </Tag>
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                          <Button type="link" style={{ color: '#2563eb', fontWeight: 600 }}>
                            Xem chi tiết
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default PaymentPage;
