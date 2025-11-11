import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Tag, Space, Input, Modal, Form, InputNumber, Divider } from 'antd';
import { FileTextOutlined, EditOutlined, EyeOutlined, ShoppingCartOutlined } from '@ant-design/icons';
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
      title: 'Phụ tùng',
      key: 'parts',
      width: 200,
      render: (_: any, record: Quote) => {
        if (!record.parts || record.parts.length === 0) {
          return <span className="text-gray-400">Không có</span>;
        }
        return (
          <div>
            <div className="text-sm font-medium">
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
    <div>
      <Card>
        <div className="flex justify-between items-center mb-6">
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

              {/* Service Package and Parts Section */}
              <Divider />
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <ShoppingCartOutlined className="text-blue-600" />
                  <h3 className="text-lg font-semibold">Danh sách hàng hóa, dịch vụ</h3>
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
                        // Try to extract checklistID from description (format: "...cho checklist #31")
                        const checklistMatch = selectedQuote.description?.match(/checklist\s*#(\d+)/i);
                        const checklistID = checklistMatch ? checklistMatch[1] : '';
                        
                        rows.push({
                          key: 'service-package',
                          rowIndex: rowIndex++,
                          type: 'service',
                          name: checklistID 
                            ? `Báo giá dịch vụ + phụ tùng cho checklist #${checklistID}`
                            : (selectedQuote.serviceType || 'Gói dịch vụ'),
                          description: checklistID
                            ? `Báo giá gói dịch vụ (${quoteService.formatPrice(servicePackageAmount)}) + phụ tùng (${quoteService.formatPrice(partsTotal)}) cho checklist #${checklistID}`
                            : (selectedQuote.description || ''),
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

