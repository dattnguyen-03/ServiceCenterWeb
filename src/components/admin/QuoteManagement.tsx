import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Tag, Space, Input, Modal, Form, InputNumber } from 'antd';
import { FileTextOutlined, EditOutlined, EyeOutlined } from '@ant-design/icons';
import { quoteService, Quote, CreateQuoteRequest, UpdateQuoteRequest } from '../../services/quoteService';
import { showSuccess, showError } from '../../utils/sweetAlert';

const { Search } = Input;

const QuoteManagement: React.FC = () => {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchQuotes();
  }, []);

  const fetchQuotes = async () => {
    setLoading(true);
    try {
      const data = await quoteService.getAllQuotes();
      setQuotes(data);
    } catch (error: any) {
      showError('Lỗi tải dữ liệu', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrUpdate = async (values: any) => {
    try {
      if (selectedQuote) {
        const updateData: UpdateQuoteRequest = {
          quoteID: selectedQuote.quoteID,
          totalAmount: values.totalAmount,
          discountAmount: values.discountAmount,
          finalAmount: values.finalAmount,
          description: values.description,
          notes: values.notes,
        };
        await quoteService.updateQuote(updateData);
        showSuccess('Cập nhật báo giá thành công');
      } else {
        const createData: CreateQuoteRequest = {
          appointmentID: values.appointmentID,
          customerID: values.customerID,
          centerID: values.centerID,
          serviceType: values.serviceType,
          totalAmount: values.totalAmount,
          discountAmount: values.discountAmount,
          finalAmount: values.finalAmount,
          description: values.description,
          notes: values.notes,
        };
        await quoteService.createQuote(createData);
        showSuccess('Tạo báo giá thành công');
      }
      setModalVisible(false);
      form.resetFields();
      fetchQuotes();
    } catch (error: any) {
      showError('Lỗi', error.message);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'green';
      case 'pending': return 'orange';
      case 'rejected': return 'red';
      case 'expired': return 'gray';
      default: return 'blue';
    }
  };

  const columns = [
    {
      title: 'Khách hàng',
      key: 'customer',
      render: (_: any, record: Quote) => (
        <div>
          <div className="font-medium">{record.customerName}</div>
          <div className="text-sm text-gray-500">{record.vehicleModel}</div>
        </div>
      ),
    },
    {
      title: 'Dịch vụ',
      dataIndex: 'serviceType',
      key: 'serviceType',
    },
    {
      title: 'Trung tâm',
      dataIndex: 'centerName',
      key: 'centerName',
    },
    {
      title: 'Giá trị',
      key: 'amount',
      render: (_: any, record: Quote) => (
        <div>
          <div className="font-semibold text-lg text-blue-600">
            {quoteService.formatPrice(record.finalAmount)}
          </div>
          {record.discountAmount && record.discountAmount > 0 && (
            <div className="text-xs text-gray-500">
              Giảm: {quoteService.formatPrice(record.discountAmount)}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusText = {
          pending: 'Chờ duyệt',
          approved: 'Đã duyệt',
          rejected: 'Từ chối',
          expired: 'Hết hạn',
        };
        return (
          <Tag color={getStatusColor(status)}>
            {statusText[status as keyof typeof statusText]}
          </Tag>
        );
      },
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString('vi-VN'),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_: any, record: Quote) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => {
              setSelectedQuote(record);
              setModalVisible(true);
            }}
          >
            Xem
          </Button>
          {record.status === 'pending' && (
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => {
                setSelectedQuote(record);
                form.setFieldsValue(record);
                setModalVisible(true);
              }}
            >
              Sửa
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const filteredQuotes = quotes.filter(
    (quote) =>
      quote.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quote.serviceType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quote.vehicleModel.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6">
      <Card>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Quản Lý Báo Giá</h2>
          <Space>
            <Search
              placeholder="Tìm kiếm báo giá..."
              style={{ width: 300 }}
              onSearch={setSearchQuery}
              allowClear
            />
            <Button
              type="primary"
              icon={<FileTextOutlined />}
              onClick={() => {
                setSelectedQuote(null);
                form.resetFields();
                setModalVisible(true);
              }}
            >
              Tạo Báo Giá
            </Button>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={filteredQuotes}
          loading={loading}
          rowKey="quoteID"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={selectedQuote ? 'Chi tiết báo giá' : 'Tạo báo giá mới'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
          setSelectedQuote(null);
        }}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateOrUpdate}
          initialValues={selectedQuote || {}}
        >
          {selectedQuote ? (
            // View mode
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-600">Khách hàng</label>
                  <div className="font-medium">{selectedQuote.customerName}</div>
                </div>
                <div>
                  <label className="text-gray-600">Xe</label>
                  <div className="font-medium">{selectedQuote.vehicleModel}</div>
                </div>
                <div>
                  <label className="text-gray-600">Trung tâm</label>
                  <div className="font-medium">{selectedQuote.centerName}</div>
                </div>
                <div>
                  <label className="text-gray-600">Trạng thái</label>
                  <Tag color={getStatusColor(selectedQuote.status)}>
                    {selectedQuote.status}
                  </Tag>
                </div>
              </div>
              <div>
                <label className="text-gray-600">Mô tả</label>
                <div>{selectedQuote.description}</div>
              </div>
              {selectedQuote.notes && (
                <div>
                  <label className="text-gray-600">Ghi chú</label>
                  <div>{selectedQuote.notes}</div>
                </div>
              )}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-gray-600">Tổng giá</label>
                  <div className="text-lg font-semibold text-blue-600">
                    {quoteService.formatPrice(selectedQuote.totalAmount)}
                  </div>
                </div>
                <div>
                  <label className="text-gray-600">Giảm giá</label>
                  <div className="text-lg">
                    {quoteService.formatPrice(selectedQuote.discountAmount || 0)}
                  </div>
                </div>
                <div>
                  <label className="text-gray-600">Thành tiền</label>
                  <div className="text-xl font-bold text-green-600">
                    {quoteService.formatPrice(selectedQuote.finalAmount)}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Create/Edit mode
            <>
              <Form.Item
                name="appointmentID"
                label="Appointment ID"
                rules={[{ required: true, message: 'Vui lòng nhập Appointment ID' }]}
              >
                <InputNumber style={{ width: '100%' }} placeholder="Nhập Appointment ID" />
              </Form.Item>

              <Form.Item
                name="customerID"
                label="Customer ID"
                rules={[{ required: true, message: 'Vui lòng nhập Customer ID' }]}
              >
                <InputNumber style={{ width: '100%' }} placeholder="Nhập Customer ID" />
              </Form.Item>

              <Form.Item
                name="serviceType"
                label="Loại dịch vụ"
                rules={[{ required: true, message: 'Vui lòng nhập loại dịch vụ' }]}
              >
                <Input placeholder="VD: Gói Bảo Dưỡng Toàn Diện" />
              </Form.Item>

              <Form.Item
                name="description"
                label="Mô tả"
                rules={[{ required: true, message: 'Vui lòng nhập mô tả' }]}
              >
                <Input.TextArea rows={3} placeholder="Mô tả chi tiết dịch vụ..." />
              </Form.Item>

              <div className="grid grid-cols-2 gap-4">
                <Form.Item
                  name="totalAmount"
                  label="Tổng giá"
                  rules={[{ required: true, message: 'Vui lòng nhập tổng giá' }]}
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    placeholder="0"
                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={(value) => value!.replace(/\$\s?|(,*)/g, '')}
                  />
                </Form.Item>

                <Form.Item name="discountAmount" label="Giảm giá">
                  <InputNumber
                    style={{ width: '100%' }}
                    placeholder="0"
                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={(value) => value!.replace(/\$\s?|(,*)/g, '')}
                  />
                </Form.Item>
              </div>

              <Form.Item
                name="finalAmount"
                label="Thành tiền"
                rules={[{ required: true, message: 'Vui lòng nhập thành tiền' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="0"
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => value!.replace(/\$\s?|(,*)/g, '')}
                />
              </Form.Item>

              <Form.Item name="notes" label="Ghi chú">
                <Input.TextArea rows={2} placeholder="Ghi chú thêm (nếu có)..." />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" block>
                  {selectedQuote ? 'Cập nhật' : 'Tạo báo giá'}
                </Button>
              </Form.Item>
            </>
          )}
        </Form>
      </Modal>
    </div>
  );
};

export default QuoteManagement;

