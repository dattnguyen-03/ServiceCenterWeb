import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Tag, Space, Input, Modal, Form, InputNumber, Divider, Select, Typography } from 'antd';
import { FileTextOutlined, EditOutlined, EyeOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { quoteService, Quote, CreateQuoteRequest, UpdateQuoteRequest } from '../../services/quoteService';
import { showSuccess, showError, showLoading, closeLoading } from '../../utils/sweetAlert';
import { appointmentService } from '../../services/appointmentService';

const { Search } = Input;
const { Title, Text } = Typography;

const StaffQuoteManagement: React.FC = () => {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchQuotes();
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const data = await appointmentService.getAllAppointments();
      setAppointments(data || []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  };

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
      showLoading(selectedQuote ? 'Đang cập nhật báo giá...' : 'Đang tạo báo giá...');
      
      if (selectedQuote) {
        const updateData: UpdateQuoteRequest = {
          quoteID: selectedQuote.quoteID,
          totalAmount: values.totalAmount,
          discountAmount: values.discountAmount || 0,
          finalAmount: values.finalAmount,
          description: values.description,
          notes: values.notes,
        };
        await quoteService.updateQuote(updateData);
        closeLoading();
        showSuccess('Thành công', 'Cập nhật báo giá thành công');
      } else {
        const selectedAppointment = appointments.find(apt => apt.appointmentID === values.appointmentID);
        
        if (!selectedAppointment) {
          closeLoading();
          showError('Lỗi', 'Không tìm thấy lịch hẹn');
          return;
        }

        const createData: CreateQuoteRequest = {
          appointmentID: values.appointmentID,
          customerID: selectedAppointment.userID || selectedAppointment.customerID,
          centerID: selectedAppointment.centerID,
          serviceType: values.serviceType || selectedAppointment.serviceType || 'Dịch vụ bảo dưỡng',
          totalAmount: values.totalAmount,
          discountAmount: values.discountAmount || 0,
          finalAmount: values.finalAmount,
          description: values.description,
          notes: values.notes,
        };
        await quoteService.createQuote(createData);
        closeLoading();
        showSuccess('Thành công', 'Tạo báo giá thành công');
      }
      setModalVisible(false);
      form.resetFields();
      fetchQuotes();
    } catch (error: any) {
      closeLoading();
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

  const getStatusText = (status: string) => {
    const statusMap: { [key: string]: string } = {
      pending: 'Chờ duyệt',
      approved: 'Đã duyệt',
      rejected: 'Từ chối',
      expired: 'Hết hạn',
    };
    return statusMap[status] || status;
  };

  const columns = [
    {
      title: 'Khách hàng',
      key: 'customer',
      width: 180,
      render: (_: any, record: Quote) => (
        <div>
          <div className="font-medium text-gray-900">{record.customerName}</div>
          <div className="text-sm text-gray-500">{record.vehicleModel}</div>
        </div>
      ),
    },
    {
      title: 'Dịch vụ',
      dataIndex: 'serviceType',
      key: 'serviceType',
      width: 200,
      ellipsis: true,
    },
    {
      title: 'Trung tâm',
      dataIndex: 'centerName',
      key: 'centerName',
      width: 150,
    },
    {
      title: 'Phụ tùng',
      key: 'parts',
      width: 150,
      render: (_: any, record: Quote) => {
        if (!record.parts || record.parts.length === 0) {
          return <span className="text-gray-400">Không có</span>;
        }
        return (
          <div>
            <div className="text-sm font-medium text-blue-600">
              {record.parts.length} phụ tùng
            </div>
            <div className="text-xs text-gray-500">
              {quoteService.formatPrice(quoteService.calculatePartsTotalFromDetail(record.parts))}
            </div>
          </div>
        );
      },
    },
    {
      title: 'Thành tiền',
      dataIndex: 'finalAmount',
      key: 'finalAmount',
      width: 150,
      render: (amount: number) => (
        <div className="font-semibold text-green-600">
          {quoteService.formatPrice(amount)}
        </div>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      ),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      render: (date: string) => new Date(date).toLocaleDateString('vi-VN'),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 150,
      render: (_: any, record: Quote) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => {
              setSelectedQuote(record);
              setModalVisible(true);
            }}
            className="text-blue-600"
          >
            Xem
          </Button>
          {record.status === 'pending' && (
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => {
                setSelectedQuote(record);
                form.setFieldsValue({
                  appointmentID: record.appointmentID,
                  serviceType: record.serviceType,
                  totalAmount: record.totalAmount,
                  discountAmount: record.discountAmount || 0,
                  finalAmount: record.finalAmount,
                  description: record.description,
                  notes: record.notes,
                });
                setModalVisible(true);
              }}
              className="text-green-600"
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
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                <FileTextOutlined className="text-white text-2xl" />
              </div>
              <div>
                <Title level={2} className="!mb-1 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Quản Lý Báo Giá
                </Title>
                <Text type="secondary" className="text-base">
                  Tạo và quản lý báo giá cho khách hàng
                </Text>
                <div className="flex items-center space-x-4 mt-2">
                  <div className="flex items-center space-x-1 text-sm text-gray-500">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Hệ thống hoạt động bình thường</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    Tổng cộng: {quotes.length} báo giá
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
             /
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <Card className="mb-6 border-0 shadow-sm">
        <Search
          placeholder="Tìm kiếm báo giá theo khách hàng, dịch vụ hoặc xe..."
          size="large"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          allowClear
          className="w-full"
        />
      </Card>

      {/* Quotes Table */}
      <Card className="border-0 shadow-sm">
        <Table
          columns={columns}
          dataSource={filteredQuotes}
          loading={loading}
          rowKey="quoteID"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} báo giá`,
          }}
          className="rounded-lg"
          rowClassName="hover:bg-gray-50 transition-colors duration-200"
        />
      </Card>

      {/* Create/Edit/View Modal */}
      <Modal
        title={
          <div className="flex items-center py-2">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
              <FileTextOutlined className="text-white text-lg" />
            </div>
            <div>
              <div className="text-lg font-semibold text-gray-800">
                {selectedQuote 
                  ? (selectedQuote.status === 'pending' ? 'Chỉnh sửa báo giá' : 'Chi tiết báo giá')
                  : 'Tạo báo giá mới'}
              </div>
              <div className="text-sm text-gray-500">
                {selectedQuote ? 'Thông tin chi tiết về báo giá' : 'Tạo báo giá mới cho khách hàng'}
              </div>
            </div>
          </div>
        }
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
          setSelectedQuote(null);
        }}
        footer={null}
        width={800}
        className="rounded-lg"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateOrUpdate}
          initialValues={selectedQuote || {}}
        >
          {selectedQuote && selectedQuote.status !== 'pending' ? (
            // View mode (only for non-pending quotes)
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Text type="secondary" className="text-sm">Khách hàng</Text>
                  <div className="font-medium text-gray-900">{selectedQuote.customerName}</div>
                </div>
                <div>
                  <Text type="secondary" className="text-sm">Xe</Text>
                  <div className="font-medium text-gray-900">{selectedQuote.vehicleModel}</div>
                </div>
                <div>
                  <Text type="secondary" className="text-sm">Trung tâm</Text>
                  <div className="font-medium text-gray-900">{selectedQuote.centerName}</div>
                </div>
                <div>
                  <Text type="secondary" className="text-sm">Trạng thái</Text>
                  <div>
                    <Tag color={getStatusColor(selectedQuote.status)}>
                      {getStatusText(selectedQuote.status)}
                    </Tag>
                  </div>
                </div>
              </div>
              <div>
                <Text type="secondary" className="text-sm">Dịch vụ</Text>
                <div className="font-medium text-gray-900">{selectedQuote.serviceType}</div>
              </div>
              <div>
                <Text type="secondary" className="text-sm">Mô tả</Text>
                <div className="text-gray-700">{selectedQuote.description}</div>
              </div>
              {selectedQuote.notes && (
                <div>
                  <Text type="secondary" className="text-sm">Ghi chú</Text>
                  <div className="text-gray-700">{selectedQuote.notes}</div>
                </div>
              )}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                {/* <div>
                  <Text type="secondary" className="text-sm">Tổng giá</Text>
                  <div className="text-lg font-semibold text-blue-600">
                    {quoteService.formatPrice(selectedQuote.totalAmount)}
                  </div>
                </div>
                <div>
                  <Text type="secondary" className="text-sm">Giảm giá</Text>
                  <div className="text-lg">
                    {quoteService.formatPrice(selectedQuote.discountAmount || 0)}
                  </div>
                </div>
                <div>
                  <Text type="secondary" className="text-sm">Thành tiền</Text>
                  <div className="text-xl font-bold text-green-600">
                    {quoteService.formatPrice(selectedQuote.finalAmount)}
                  </div>
                </div> */}
              </div>

              {/* Service Package and Parts Section */}
              <Divider />
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <ShoppingCartOutlined className="text-blue-600" />
                  <Title level={5} className="!mb-0">Danh sách hàng hóa, dịch vụ</Title>
                  {selectedQuote.parts && selectedQuote.parts.length > 0 && (
                    <Tag color="blue">{selectedQuote.parts.length} phụ tùng</Tag>
                  )}
                </div>
                <div className="border border-gray-300 rounded-lg overflow-hidden">
                  <Table
                    dataSource={(() => {
                      const rows: any[] = [];
                      let rowIndex = 1;
                      
                      // Calculate service package amount (totalAmount - parts total)
                      const partsTotal = selectedQuote.parts && selectedQuote.parts.length > 0
                        ? quoteService.calculatePartsTotalFromDetail(selectedQuote.parts)
                        : 0;
                      const servicePackageAmount = selectedQuote.totalAmount - partsTotal;
                      
                      // Add service package row if amount > 0
                      if (servicePackageAmount > 0) {
                        rows.push({
                          key: 'service-package',
                          rowIndex: rowIndex++,
                          type: 'service',
                          name: selectedQuote.serviceType || 'Gói dịch vụ',
                          description: selectedQuote.description || '',
                          unit: 'Gói',
                          quantity: 1,
                          unitPrice: servicePackageAmount,
                          totalPrice: servicePackageAmount
                        });
                      }
                      
                      // Add parts rows
                      if (selectedQuote.parts && selectedQuote.parts.length > 0) {
                        selectedQuote.parts.forEach((part, index) => {
                          rows.push({
                            key: part.quotePartID || `part-${index}`,
                            rowIndex: rowIndex++,
                            type: 'part',
                            name: part.partName,
                            description: part.partDescription || '',
                            unit: 'Chiếc',
                            quantity: part.quantity,
                            unitPrice: part.unitPrice,
                            totalPrice: part.totalPrice
                          });
                        });
                      }
                      
                      return rows.length > 0 ? rows : [];
                    })()}
                    pagination={false}
                    size="small"
                    className="rounded-lg"
                    components={{
                      header: {
                        cell: (props: any) => (
                          <th {...props} className="!bg-gray-50 !border-gray-300 !px-4 !py-2" />
                        ),
                      },
                    }}
                  >
                    <Table.Column
                      title={<div className="text-center font-semibold">STT</div>}
                      width={60}
                      align="center"
                      render={(_: any, record: any) => (
                        <div className="text-center">{record.rowIndex}</div>
                      )}
                    />
                    <Table.Column
                      title={<div className="font-semibold">Tên hàng hóa, dịch vụ</div>}
                      width="40%"
                      render={(_: any, record: any) => (
                        <div>
                          <div className="font-medium text-gray-900">{record.name}</div>
                          {record.description && (
                            <div className="text-sm text-gray-600 mt-1">{record.description}</div>
                          )}
                        </div>
                      )}
                    />
                    <Table.Column
                      title={<div className="text-center font-semibold">Đơn vị tính</div>}
                      width={100}
                      align="center"
                      render={(_: any, record: any) => (
                        <div className="text-center">{record.unit}</div>
                      )}
                    />
                    <Table.Column
                      title={<div className="text-center font-semibold">Số lượng</div>}
                      width={100}
                      align="center"
                      render={(_: any, record: any) => (
                        <div className="text-center">{record.quantity}</div>
                      )}
                    />
                    <Table.Column
                      title={<div className="text-right font-semibold">Đơn giá</div>}
                      width={150}
                      align="right"
                      render={(_: any, record: any) => (
                        <div className="text-right">{quoteService.formatPrice(record.unitPrice)}</div>
                      )}
                    />
                    <Table.Column
                      title={<div className="text-right font-semibold">Thành tiền</div>}
                      width={150}
                      align="right"
                      render={(_: any, record: any) => (
                        <div className="text-right font-semibold text-green-600">
                          {quoteService.formatPrice(record.totalPrice)}
                        </div>
                      )}
                    />
                  </Table>
                  <div className="px-4 py-1 bg-gray-50 border-b border-gray-300">
                    <div className="text-right text-xs italic text-gray-600">
                      (Thành tiền = Số lượng × Đơn giá)
                    </div>
                  </div>
                  <div className="px-4 py-3 bg-gray-50 border-t-2 border-gray-400">
                    <div className="flex justify-between items-center">
                      <div className="font-bold text-gray-900">
                        Tổng cộng tiền thanh toán:
                      </div>
                      <div className="text-right text-xl font-bold text-red-600">
                        {quoteService.formatPrice(selectedQuote.finalAmount)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Create/Edit mode
            <>
              {!selectedQuote && (
                <Form.Item
                  name="appointmentID"
                  label={
                    <span className="text-gray-700 font-medium">
                      <span className="mr-2">📅</span>
                      Lịch hẹn
                    </span>
                  }
                  rules={[{ required: true, message: 'Vui lòng chọn lịch hẹn' }]}
                >
                  <Select
                    placeholder="Chọn lịch hẹn"
                    size="large"
                    showSearch
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                      (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                    }
                    options={appointments.map(apt => ({
                      value: apt.appointmentID,
                      label: `${apt.appointmentID} - ${apt.customerName || apt.userName || 'N/A'} - ${apt.vehicleModel || 'N/A'}`,
                    }))}
                  />
                </Form.Item>
              )}

              <Form.Item
                name="serviceType"
                label={
                  <span className="text-gray-700 font-medium">
                    <span className="mr-2">🔧</span>
                    Loại dịch vụ
                  </span>
                }
                rules={[{ required: true, message: 'Vui lòng nhập loại dịch vụ' }]}
              >
                <Input placeholder="VD: Gói Bảo Dưỡng Toàn Diện" size="large" />
              </Form.Item>

              <Form.Item
                name="description"
                label={
                  <span className="text-gray-700 font-medium">
                    <span className="mr-2">📝</span>
                    Mô tả
                  </span>
                }
                rules={[{ required: true, message: 'Vui lòng nhập mô tả' }]}
              >
                <Input.TextArea rows={4} placeholder="Mô tả chi tiết dịch vụ..." />
              </Form.Item>

              <div className="grid grid-cols-2 gap-4">
                <Form.Item
                  name="totalAmount"
                  label={
                    <span className="text-gray-700 font-medium">
                      <span className="mr-2">💰</span>
                      Tổng giá (VNĐ)
                    </span>
                  }
                  rules={[{ required: true, message: 'Vui lòng nhập tổng giá' }]}
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    placeholder="0"
                    size="large"
                    min={0}
                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={(value) => Number(value!.replace(/\$\s?|(,*)/g, '')) as any}
                  />
                </Form.Item>

                <Form.Item
                  name="discountAmount"
                  label={
                    <span className="text-gray-700 font-medium">
                      <span className="mr-2">🎁</span>
                      Giảm giá (VNĐ)
                    </span>
                  }
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    placeholder="0"
                    size="large"
                    min={0}
                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={(value) => Number(value!.replace(/\$\s?|(,*)/g, '')) as any}
                  />
                </Form.Item>
              </div>

              <Form.Item
                name="finalAmount"
                label={
                  <span className="text-gray-700 font-medium">
                    <span className="mr-2">✅</span>
                    Thành tiền (VNĐ)
                  </span>
                }
                rules={[{ required: true, message: 'Vui lòng nhập thành tiền' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="0"
                  size="large"
                  min={0}
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => Number(value!.replace(/\$\s?|(,*)/g, '')) as any}
                />
              </Form.Item>

              <Form.Item
                name="notes"
                label={
                  <span className="text-gray-700 font-medium">
                    <span className="mr-2">📋</span>
                    Ghi chú
                  </span>
                }
              >
                <Input.TextArea rows={3} placeholder="Ghi chú thêm (nếu có)..." />
              </Form.Item>

              <Form.Item className="mb-0">
                <div className="flex justify-end space-x-3">
                  <Button
                    size="large"
                    onClick={() => {
                      setModalVisible(false);
                      form.resetFields();
                      setSelectedQuote(null);
                    }}
                  >
                    Hủy
                  </Button>
                  <Button
                    type="primary"
                    htmlType="submit"
                    size="large"
                    className="!bg-gradient-to-r !from-blue-500 !to-purple-600 hover:!from-blue-600 hover:!to-purple-700 !border-0"
                  >
                    {selectedQuote ? 'Cập nhật' : 'Tạo báo giá'}
                  </Button>
                </div>
              </Form.Item>
            </>
          )}
        </Form>
      </Modal>
    </div>
  );
};

export default StaffQuoteManagement;

