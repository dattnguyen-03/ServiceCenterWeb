import React, { useState, useEffect } from 'react';
import {
  Card, Table, Button, Input, Modal, Form, InputNumber, Tag, Space, 
  Descriptions, notification, Row, Col, Statistic, Divider
} from 'antd';
import {
  EyeOutlined, CheckCircleOutlined, ClockCircleOutlined,
  ShoppingCartOutlined, UserOutlined, CarOutlined, 
  ToolOutlined, DollarOutlined, FileTextOutlined
} from '@ant-design/icons';
import { quoteRequestService, QuoteRequest, CreateQuoteFromRequestRequest } from '../../services/quoteRequestService';
import { showSuccess, showError } from '../../utils/sweetAlert';

const QuoteRequestManagement: React.FC = () => {
  const [quoteRequests, setQuoteRequests] = useState<QuoteRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<QuoteRequest | null>(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [isCreateQuoteModalVisible, setIsCreateQuoteModalVisible] = useState(false);
  const [createQuoteForm] = Form.useForm();
  const [creatingQuote, setCreatingQuote] = useState(false);

  useEffect(() => {
    fetchQuoteRequests();
  }, []);

  const fetchQuoteRequests = async () => {
    setLoading(true);
    try {
      const requests = await quoteRequestService.getAllQuoteRequests();
      setQuoteRequests(requests);
    } catch (error: any) {
      notification.error({
        message: 'Lỗi tải danh sách yêu cầu báo giá',
        description: error.message || 'Không thể tải danh sách yêu cầu báo giá.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = (request: QuoteRequest) => {
    setSelectedRequest(request);
    setIsDetailModalVisible(true);
  };

  const handleCreateQuote = (request: QuoteRequest) => {
    setSelectedRequest(request);
    createQuoteForm.setFieldsValue({
      quoteRequestID: request.quoteRequestID,
      discountAmount: 0,
      notes: request.notes
    });
    setIsCreateQuoteModalVisible(true);
  };

  const handleSubmitCreateQuote = async () => {
    try {
      const values = await createQuoteForm.validateFields();
      setCreatingQuote(true);

      const createQuoteData: CreateQuoteFromRequestRequest = {
        quoteRequestID: values.quoteRequestID,
        discountAmount: values.discountAmount || 0,
        notes: values.notes
      };

      const result = await quoteRequestService.createQuoteFromRequest(createQuoteData);
      showSuccess('Thành công', result);
      
      // Refresh danh sách
      await fetchQuoteRequests();
      
      // Đóng modal
      setIsCreateQuoteModalVisible(false);
      createQuoteForm.resetFields();
      
    } catch (error: any) {
      showError('Lỗi tạo báo giá', error.message);
    } finally {
      setCreatingQuote(false);
    }
  };

  const filteredRequests = quoteRequests.filter(request =>
    request.customerName.toLowerCase().includes(searchText.toLowerCase()) ||
    request.vehicleModel.toLowerCase().includes(searchText.toLowerCase()) ||
    request.technicianName.toLowerCase().includes(searchText.toLowerCase()) ||
    request.centerName.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    {
      title: 'ID',
      dataIndex: 'quoteRequestID',
      key: 'quoteRequestID',
      width: 80,
    },
    {
      title: 'Khách hàng',
      dataIndex: 'customerName',
      key: 'customerName',
      width: 150,
      render: (text: string, record: QuoteRequest) => (
        <div>
          <div style={{ fontWeight: 600 }}>{text}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>{record.vehicleModel}</div>
        </div>
      ),
    },
    {
      title: 'Technician',
      dataIndex: 'technicianName',
      key: 'technicianName',
      width: 120,
    },
    {
      title: 'Trung tâm',
      dataIndex: 'centerName',
      key: 'centerName',
      width: 150,
    },
    {
      title: 'Dịch vụ',
      dataIndex: 'serviceType',
      key: 'serviceType',
      width: 200,
      render: (text: string, record: QuoteRequest) => (
        <div>
          <div style={{ fontSize: '13px' }}>{text}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            Checklist: {record.checklistItem}
          </div>
        </div>
      ),
    },
    {
      title: 'Phụ tùng',
      key: 'parts',
      width: 120,
      render: (_: any, record: QuoteRequest) => (
        <div>
          <div style={{ fontSize: '13px', fontWeight: 600 }}>
            {record.partsCount} phụ tùng
          </div>
          <div style={{ fontSize: '12px', color: '#10b981', fontWeight: 600 }}>
            {quoteRequestService.formatPrice(record.totalPartsValue)}
          </div>
        </div>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => {
        const statusConfig = {
          pending: { color: 'orange', text: 'Chờ xử lý', icon: <ClockCircleOutlined /> },
          approved: { color: 'green', text: 'Đã duyệt', icon: <CheckCircleOutlined /> },
          rejected: { color: 'red', text: 'Đã từ chối', icon: <CheckCircleOutlined /> },
        };
        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
        return (
          <Tag color={config.color} icon={config.icon}>
            {config.text}
          </Tag>
        );
      },
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      render: (date: string) => quoteRequestService.formatDate(date),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 150,
      render: (_: any, record: QuoteRequest) => (
        <Space size="small">
          <Button
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
            size="small"
          >
            Xem
          </Button>
          {record.status === 'pending' && (
            <Button
              type="primary"
              icon={<CheckCircleOutlined />}
              onClick={() => handleCreateQuote(record)}
              size="small"
            >
              Tạo báo giá
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card
        bordered={false}
        className="shadow-lg rounded-xl"
        extra={
          <Input.Search
            placeholder="Tìm kiếm yêu cầu báo giá..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
          />
        }
      >
        <Table
          columns={columns}
          dataSource={filteredRequests}
          loading={loading}
          rowKey="quoteRequestID"
          pagination={{ pageSize: 10 }}
          scroll={{ x: 'max-content' }}
        />
      </Card>

      {/* Modal chi tiết yêu cầu */}
      <Modal
        title={
          <div style={{ fontSize: '18px', fontWeight: 600 }}>
            Chi tiết yêu cầu báo giá #{selectedRequest?.quoteRequestID}
          </div>
        }
        open={isDetailModalVisible}
        onCancel={() => setIsDetailModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedRequest && (
          <div>
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="ID yêu cầu">
                {selectedRequest.quoteRequestID}
              </Descriptions.Item>
              <Descriptions.Item label="Checklist ID">
                {selectedRequest.checklistID}
              </Descriptions.Item>
              <Descriptions.Item label="Khách hàng">
                <div>
                  <UserOutlined style={{ marginRight: '8px' }} />
                  {selectedRequest.customerName}
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="Xe">
                <div>
                  <CarOutlined style={{ marginRight: '8px' }} />
                  {selectedRequest.vehicleModel}
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="Technician">
                <div>
                  <ToolOutlined style={{ marginRight: '8px' }} />
                  {selectedRequest.technicianName}
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="Trung tâm">
                {selectedRequest.centerName}
              </Descriptions.Item>
              <Descriptions.Item label="Dịch vụ">
                {selectedRequest.serviceType}
              </Descriptions.Item>
              <Descriptions.Item label="Hạng mục checklist">
                {selectedRequest.checklistItem}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Tag color={selectedRequest.status === 'pending' ? 'orange' : 'green'}>
                  {selectedRequest.status === 'pending' ? 'Chờ xử lý' : 'Đã xử lý'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Ngày tạo">
                {quoteRequestService.formatDate(selectedRequest.createdAt)}
              </Descriptions.Item>
              <Descriptions.Item label="Ghi chú" span={2}>
                {selectedRequest.notes || 'Không có ghi chú'}
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px' }}>
                <ShoppingCartOutlined style={{ marginRight: '8px' }} />
                Danh sách phụ tùng ({selectedRequest.partsCount})
              </h4>
              
              <Table
                dataSource={selectedRequest.parts}
                pagination={false}
                size="small"
                columns={[
                  {
                    title: 'Tên phụ tùng',
                    dataIndex: 'partName',
                    key: 'partName',
                  },
                  {
                    title: 'Số lượng',
                    dataIndex: 'quantity',
                    key: 'quantity',
                    width: 80,
                  },
                  {
                    title: 'Đơn giá',
                    dataIndex: 'unitPrice',
                    key: 'unitPrice',
                    width: 120,
                    render: (price: number) => quoteRequestService.formatPrice(price),
                  },
                  {
                    title: 'Thành tiền',
                    dataIndex: 'totalPrice',
                    key: 'totalPrice',
                    width: 120,
                    render: (price: number) => (
                      <span style={{ fontWeight: 600, color: '#10b981' }}>
                        {quoteRequestService.formatPrice(price)}
                      </span>
                    ),
                  },
                ]}
              />

              <div style={{ textAlign: 'right', marginTop: '12px', fontSize: '16px', fontWeight: 700, color: '#10b981' }}>
                Tổng phụ tùng: {quoteRequestService.formatPrice(selectedRequest.totalPartsValue)}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal tạo báo giá */}
      <Modal
        title={
          <div style={{ fontSize: '18px', fontWeight: 600 }}>
            Tạo báo giá từ yêu cầu #{selectedRequest?.quoteRequestID}
          </div>
        }
        open={isCreateQuoteModalVisible}
        onCancel={() => {
          setIsCreateQuoteModalVisible(false);
          createQuoteForm.resetFields();
        }}
        onOk={handleSubmitCreateQuote}
        confirmLoading={creatingQuote}
        okText="Tạo báo giá"
        cancelText="Hủy"
        width={600}
      >
        {selectedRequest && (
          <div>
            <div style={{ 
              marginBottom: '20px', 
              padding: '12px', 
              background: '#f9fafb', 
              borderRadius: '8px',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>
                <strong>Thông tin yêu cầu:</strong>
              </div>
              <div style={{ fontSize: '13px', color: '#374151' }}>
                <div>Khách hàng: <strong>{selectedRequest.customerName}</strong></div>
                <div>Xe: <strong>{selectedRequest.vehicleModel}</strong></div>
                <div>Technician: <strong>{selectedRequest.technicianName}</strong></div>
                <div>Phụ tùng: <strong>{selectedRequest.partsCount} phụ tùng - {quoteRequestService.formatPrice(selectedRequest.totalPartsValue)}</strong></div>
              </div>
            </div>

            <Form form={createQuoteForm} layout="vertical">
              <Form.Item
                name="quoteRequestID"
                hidden
              >
                <Input />
              </Form.Item>
              
              <Form.Item
                name="discountAmount"
                label="Giảm giá (VND)"
                rules={[{ type: 'number', min: 0, message: 'Giảm giá phải >= 0' }]}
              >
                <InputNumber
                  min={0}
                  style={{ width: '100%' }}
                  placeholder="Nhập số tiền giảm giá"
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                />
              </Form.Item>

              <Form.Item
                name="notes"
                label="Ghi chú bổ sung"
              >
                <Input.TextArea
                  rows={3}
                  placeholder="Nhập ghi chú bổ sung cho báo giá..."
                />
              </Form.Item>
            </Form>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default QuoteRequestManagement;
