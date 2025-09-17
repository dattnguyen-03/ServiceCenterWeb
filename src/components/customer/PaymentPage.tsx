import React from 'react';
import { Card, Row, Col, Button, Tag, List, Statistic, Select, Space } from 'antd';
import { CreditCardOutlined, FileTextOutlined, DownloadOutlined, PlusOutlined } from '@ant-design/icons';
import { mockUsers } from '../../data/mockData';

const { Option } = Select;

const PaymentPage: React.FC = () => {
  const user = mockUsers.find(u => u.id === '1');

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
    <div className="p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">Thanh toán & Hóa đơn</h1>
        <p className="text-gray-600 text-base">Quản lý các phương thức thanh toán và xem lại lịch sử hóa đơn của bạn.</p>
      </div>

      <Row gutter={[32, 32]}>
        {/* Payment Summary */}
        <Col xs={24} md={8}>
            <Card title="Tổng quan chi phí" style={{ borderRadius: '16px', boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }}>
                 <Statistic
                    title="Đã thanh toán"
                    value={totalPaid}
                    precision={0}
                    valueStyle={{ color: '#3f8600' }}
                    suffix="VNĐ"
                />
                 <Statistic
                    title="Chờ thanh toán"
                    value={totalPending}
                    precision={0}
                    valueStyle={{ color: '#cf1322' }}
                    suffix="VNĐ"
                    className="mt-4"
                />
            </Card>
        </Col>
        
        {/* Payment Methods */}
        <Col xs={24} md={16}>
          <Card 
            title={<><CreditCardOutlined className="mr-2" />Phương thức thanh toán</>}
            style={{ borderRadius: '16px', boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }}
            extra={<Button icon={<PlusOutlined />}>Thêm thẻ mới</Button>}
          >
            <List
              itemLayout="horizontal"
              dataSource={paymentMethods}
              renderItem={item => (
                <List.Item
                  actions={[<Button type="link">Sửa</Button>, <Button type="link" danger>Xóa</Button>]}
                >
                  <List.Item.Meta
                    avatar={<CreditCardOutlined style={{fontSize: '24px'}}/>}
                    title={`•••• ${item.last4} ${item.isDefault ? '(Mặc định)' : ''}`}
                    description={`Hết hạn: ${item.expiry}`}
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>

        {/* Invoice History */}
        <Col xs={24}>
          <Card 
            title={<><FileTextOutlined className="mr-2" />Lịch sử hóa đơn</>}
            style={{ borderRadius: '16px', boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }}
            extra={
                <Space>
                    <Select defaultValue="all" style={{ width: 150 }}>
                        <Option value="all">Tất cả</Option>
                        <Option value="paid">Đã thanh toán</Option>
                        <Option value="pending">Chờ thanh toán</Option>
                    </Select>
                    <Button icon={<DownloadOutlined />}>Xuất Excel</Button>
                </Space>
            }
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Mã HĐ</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Ngày</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Dịch vụ</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-600">Số tiền</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-600">Trạng thái</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-600">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {invoiceHistory.map((invoice) => (
                    <tr key={invoice.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-semibold text-blue-600">{invoice.id}</td>
                      <td className="py-3 px-4 text-gray-700">{invoice.date}</td>
                      <td className="py-3 px-4 text-gray-800">{invoice.service}</td>
                      <td className="py-3 px-4 text-gray-800 text-right">{invoice.amount.toLocaleString('vi-VN')} VNĐ</td>
                      <td className="py-3 px-4 text-center">
                        <Tag color={invoice.status === 'paid' ? 'green' : 'orange'}>
                          {invoice.status === 'paid' ? 'Đã thanh toán' : 'Chờ thanh toán'}
                        </Tag>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Button type="link">Xem chi tiết</Button>
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
  );
};

export default PaymentPage;
