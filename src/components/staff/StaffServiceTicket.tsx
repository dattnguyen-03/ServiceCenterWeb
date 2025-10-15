import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Table, Tag, Space, Spin, message, Typography, Statistic, Modal, Form, Input, Select, DatePicker } from 'antd';
import { 
  FileTextOutlined, 
  PlusOutlined,
  EyeOutlined,
  EditOutlined,
  UserOutlined,
  CarOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  PhoneOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

interface ServiceTicket {
  id: string;
  customerName: string;
  customerPhone: string;
  vehicleInfo: string;
  serviceType: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  priority: 'high' | 'medium' | 'low';
  createdAt: string;
  appointmentTime: string;
  assignedTechnician?: string;
  estimatedDuration: number;
  actualDuration?: number;
  notes: string;
  createdBy: string;
}

const StaffServiceTicket: React.FC = () => {
  const [tickets, setTickets] = useState<ServiceTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<ServiceTicket | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [form] = Form.useForm();

  // Mock data - replace with API calls
  const mockTickets: ServiceTicket[] = [
    {
      id: 'SV001',
      customerName: 'Nguyễn Văn A',
      customerPhone: '0901234567',
      vehicleInfo: 'VinFast VF8 - 30A-12345',
      serviceType: 'Bảo dưỡng định kỳ',
      description: 'Bảo dưỡng 10,000 km',
      status: 'pending',
      priority: 'high',
      createdAt: '2024-01-15',
      appointmentTime: '2024-01-16 09:00',
      estimatedDuration: 120,
      notes: 'Khách hẹn lấy xe trong ngày',
      createdBy: 'Staff 1'
    },
    {
      id: 'SV002',
      customerName: 'Trần Thị B',
      customerPhone: '0907654321',
      vehicleInfo: 'Tesla Model Y - 30B-67890',
      serviceType: 'Sửa chữa',
      description: 'Thay phanh trước',
      status: 'in-progress',
      priority: 'medium',
      createdAt: '2024-01-14',
      appointmentTime: '2024-01-15 14:00',
      assignedTechnician: 'Kỹ thuật viên 1',
      estimatedDuration: 180,
      actualDuration: 90,
      notes: 'Đã thay phanh, đang kiểm tra hệ thống',
      createdBy: 'Staff 1'
    }
  ];

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    try {
      setLoading(true);
      // TODO: Replace with API call
      setTickets(mockTickets);
    } catch (error: any) {
      console.error('Error loading tickets:', error);
      message.error(error.message || 'Không thể tải danh sách phiếu dịch vụ');
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicket = () => {
    form.resetFields();
    setCreateModalVisible(true);
  };

  const handleEditTicket = (ticket: ServiceTicket) => {
    setSelectedTicket(ticket);
    form.setFieldsValue({
      customerName: ticket.customerName,
      customerPhone: ticket.customerPhone,
      vehicleInfo: ticket.vehicleInfo,
      serviceType: ticket.serviceType,
      description: ticket.description,
      priority: ticket.priority,
      appointmentTime: ticket.appointmentTime,
      estimatedDuration: ticket.estimatedDuration,
      notes: ticket.notes,
    });
    setEditModalVisible(true);
  };

  const handleViewDetail = (ticket: ServiceTicket) => {
    setSelectedTicket(ticket);
    setDetailModalVisible(true);
  };

  const handleSaveTicket = async (values: any) => {
    try {
      if (selectedTicket) {
        // Edit existing ticket
        // TODO: Implement edit API call
        message.success('Cập nhật phiếu dịch vụ thành công!');
        setEditModalVisible(false);
      } else {
        // Create new ticket
        // TODO: Implement create API call
        message.success('Tạo phiếu dịch vụ thành công!');
        setCreateModalVisible(false);
      }
      form.resetFields();
      loadTickets();
    } catch (error: any) {
      message.error(error.message || 'Có lỗi xảy ra khi lưu phiếu dịch vụ');
    }
  };

  const handleContactCustomer = (ticket: ServiceTicket) => {
    // TODO: Implement contact customer functionality
    message.info(`Liên hệ khách hàng: ${ticket.customerName} - ${ticket.customerPhone}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'orange';
      case 'in-progress': return 'blue';
      case 'completed': return 'green';
      case 'cancelled': return 'red';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Chờ xử lý';
      case 'in-progress': return 'Đang thực hiện';
      case 'completed': return 'Hoàn thành';
      case 'cancelled': return 'Đã hủy';
      default: return status;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'red';
      case 'medium': return 'orange';
      case 'low': return 'green';
      default: return 'default';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'high': return 'Cao';
      case 'medium': return 'Trung bình';
      case 'low': return 'Thấp';
      default: return priority;
    }
  };

  const columns = [
    {
      title: 'Mã phiếu',
      dataIndex: 'id',
      key: 'id',
      width: 100,
      render: (id: string) => (
        <Tag color="blue" className="font-mono">
          {id}
        </Tag>
      ),
    },
    {
      title: 'Khách hàng',
      dataIndex: 'customerName',
      key: 'customerName',
      render: (name: string, record: ServiceTicket) => (
        <div>
          <Text strong>{name}</Text>
          <div className="text-sm text-gray-500">{record.customerPhone}</div>
        </div>
      ),
    },
    {
      title: 'Thông tin xe',
      dataIndex: 'vehicleInfo',
      key: 'vehicleInfo',
      ellipsis: true,
    },
    {
      title: 'Loại dịch vụ',
      dataIndex: 'serviceType',
      key: 'serviceType',
      render: (type: string) => (
        <Tag color="blue">{type}</Tag>
      ),
    },
    {
      title: 'Ưu tiên',
      dataIndex: 'priority',
      key: 'priority',
      width: 100,
      render: (priority: string) => (
        <Tag color={getPriorityColor(priority)}>
          {getPriorityText(priority)}
        </Tag>
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
      title: 'Kỹ thuật viên',
      dataIndex: 'assignedTechnician',
      key: 'assignedTechnician',
      width: 150,
      render: (technician: string) => (
        technician ? (
          <Tag color="green">{technician}</Tag>
        ) : (
          <Tag color="orange">Chưa phân công</Tag>
        )
      ),
    },
    {
      title: 'Hành động',
      key: 'actions',
      width: 200,
      render: (_: any, record: ServiceTicket) => (
        <Space>
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
            className="text-blue-600 hover:text-blue-800"
          >
            Xem
          </Button>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEditTicket(record)}
            className="text-green-600 hover:text-green-800"
          >
            Sửa
          </Button>
          <Button
            type="text"
            icon={<PhoneOutlined />}
            onClick={() => handleContactCustomer(record)}
            className="text-orange-600 hover:text-orange-800"
          >
            Liên hệ
          </Button>
        </Space>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mr-4">
              <FileTextOutlined className="text-white text-xl" />
            </div>
            <div>
              <Title level={2} className="!mb-0 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Phiếu Dịch Vụ
              </Title>
              <Text type="secondary" className="text-lg">
                Tạo và quản lý phiếu dịch vụ cho khách hàng
              </Text>
            </div>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="large"
            onClick={handleCreateTicket}
            className="!bg-green-600 hover:!bg-green-700"
          >
            Tạo phiếu mới
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={6}>
          <Card className="text-center">
            <Statistic
              title="Tổng phiếu"
              value={tickets.length}
              prefix={<FileTextOutlined className="text-blue-500" />}
              valueStyle={{ color: '#3b82f6' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card className="text-center">
            <Statistic
              title="Chờ xử lý"
              value={tickets.filter(t => t.status === 'pending').length}
              prefix={<ClockCircleOutlined className="text-orange-500" />}
              valueStyle={{ color: '#f59e0b' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card className="text-center">
            <Statistic
              title="Đang thực hiện"
              value={tickets.filter(t => t.status === 'in-progress').length}
              prefix={<ExclamationCircleOutlined className="text-blue-500" />}
              valueStyle={{ color: '#3b82f6' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card className="text-center">
            <Statistic
              title="Hoàn thành"
              value={tickets.filter(t => t.status === 'completed').length}
              prefix={<CheckCircleOutlined className="text-green-500" />}
              valueStyle={{ color: '#10b981' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Tickets Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={tickets}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} phiếu`,
          }}
          className="rounded-lg"
        />
      </Card>

      {/* Detail Modal */}
      <Modal
        title={
          <div className="flex items-center">
            <FileTextOutlined className="mr-2 text-blue-500" />
            <span>Chi tiết phiếu dịch vụ</span>
          </div>
        }
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Đóng
          </Button>,
        ]}
        width={700}
      >
        {selectedTicket && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Text strong>Mã phiếu:</Text>
                <Tag color="blue" className="ml-2">{selectedTicket.id}</Tag>
              </div>
              <div>
                <Text strong>Trạng thái:</Text>
                <Tag color={getStatusColor(selectedTicket.status)} className="ml-2">
                  {getStatusText(selectedTicket.status)}
                </Tag>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Text strong>Khách hàng:</Text>
                <div className="mt-1">
                  <Text>{selectedTicket.customerName}</Text>
                  <div className="text-sm text-gray-500">{selectedTicket.customerPhone}</div>
                </div>
              </div>
              <div>
                <Text strong>Thông tin xe:</Text>
                <div className="mt-1">
                  <Text>{selectedTicket.vehicleInfo}</Text>
                </div>
              </div>
            </div>
            <div>
              <Text strong>Loại dịch vụ:</Text>
              <Tag color="blue" className="ml-2">{selectedTicket.serviceType}</Tag>
            </div>
            <div>
              <Text strong>Mô tả:</Text>
              <div className="mt-1">
                <Text>{selectedTicket.description}</Text>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Text strong>Ưu tiên:</Text>
                <Tag color={getPriorityColor(selectedTicket.priority)} className="ml-2">
                  {getPriorityText(selectedTicket.priority)}
                </Tag>
              </div>
              <div>
                <Text strong>Kỹ thuật viên:</Text>
                <div className="mt-1">
                  {selectedTicket.assignedTechnician ? (
                    <Tag color="green">{selectedTicket.assignedTechnician}</Tag>
                  ) : (
                    <Tag color="orange">Chưa phân công</Tag>
                  )}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Text strong>Thời gian ước tính:</Text>
                <div className="mt-1">
                  <Text>{selectedTicket.estimatedDuration} phút</Text>
                </div>
              </div>
              <div>
                <Text strong>Thời gian thực tế:</Text>
                <div className="mt-1">
                  {selectedTicket.actualDuration ? (
                    <Text>{selectedTicket.actualDuration} phút</Text>
                  ) : (
                    <Text type="secondary">Chưa hoàn thành</Text>
                  )}
                </div>
              </div>
            </div>
            <div>
              <Text strong>Ghi chú:</Text>
              <div className="mt-1">
                <Text>{selectedTicket.notes}</Text>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Create/Edit Modal */}
      <Modal
        title={
          <div className="flex items-center">
            <FileTextOutlined className="mr-2 text-blue-500" />
            <span>{selectedTicket ? 'Chỉnh sửa phiếu dịch vụ' : 'Tạo phiếu dịch vụ mới'}</span>
          </div>
        }
        open={createModalVisible || editModalVisible}
        onCancel={() => {
          setCreateModalVisible(false);
          setEditModalVisible(false);
          form.resetFields();
        }}
        footer={[
          <Button key="cancel" onClick={() => {
            setCreateModalVisible(false);
            setEditModalVisible(false);
            form.resetFields();
          }}>
            Hủy
          </Button>,
          <Button
            key="save"
            type="primary"
            onClick={() => form.submit()}
            className="!bg-blue-600 hover:!bg-blue-700"
          >
            {selectedTicket ? 'Cập nhật' : 'Tạo mới'}
          </Button>,
        ]}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSaveTicket}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Tên khách hàng"
                name="customerName"
                rules={[{ required: true, message: 'Vui lòng nhập tên khách hàng' }]}
              >
                <Input placeholder="Nhập tên khách hàng" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Số điện thoại"
                name="customerPhone"
                rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
              >
                <Input placeholder="Nhập số điện thoại" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Thông tin xe"
            name="vehicleInfo"
            rules={[{ required: true, message: 'Vui lòng nhập thông tin xe' }]}
          >
            <Input placeholder="VD: VinFast VF8 - 30A-12345" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Loại dịch vụ"
                name="serviceType"
                rules={[{ required: true, message: 'Vui lòng chọn loại dịch vụ' }]}
              >
                <Select placeholder="Chọn loại dịch vụ">
                  <Option value="Bảo dưỡng định kỳ">Bảo dưỡng định kỳ</Option>
                  <Option value="Sửa chữa">Sửa chữa</Option>
                  <Option value="Kiểm tra">Kiểm tra</Option>
                  <Option value="Thay thế phụ tùng">Thay thế phụ tùng</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Ưu tiên"
                name="priority"
                rules={[{ required: true, message: 'Vui lòng chọn mức ưu tiên' }]}
              >
                <Select placeholder="Chọn mức ưu tiên">
                  <Option value="high">Cao</Option>
                  <Option value="medium">Trung bình</Option>
                  <Option value="low">Thấp</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Mô tả"
            name="description"
            rules={[{ required: true, message: 'Vui lòng nhập mô tả' }]}
          >
            <TextArea rows={3} placeholder="Mô tả chi tiết yêu cầu dịch vụ" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Thời gian hẹn"
                name="appointmentTime"
                rules={[{ required: true, message: 'Vui lòng chọn thời gian hẹn' }]}
              >
                <DatePicker
                  showTime
                  style={{ width: '100%' }}
                  placeholder="Chọn thời gian hẹn"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Thời gian ước tính (phút)"
                name="estimatedDuration"
                rules={[{ required: true, message: 'Vui lòng nhập thời gian ước tính' }]}
              >
                <Input type="number" placeholder="Nhập số phút" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Ghi chú"
            name="notes"
          >
            <TextArea rows={2} placeholder="Ghi chú thêm (tùy chọn)" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default StaffServiceTicket;
