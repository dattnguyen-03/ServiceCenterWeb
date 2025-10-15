import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Table, Tag, Space, Spin, message, Typography, Statistic, Modal, Descriptions, Select, Input } from 'antd';
import { 
  FileTextOutlined, 
  EyeOutlined, 
  UserOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  SearchOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Search } = Input;
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
}

const AdminServiceTicket: React.FC = () => {
  const [tickets, setTickets] = useState<ServiceTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<ServiceTicket | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [assignModalVisible, setAssignModalVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

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
      notes: 'Khách hẹn lấy xe trong ngày'
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
      notes: 'Đã thay phanh, đang kiểm tra hệ thống'
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

  const handleViewDetail = (ticket: ServiceTicket) => {
    setSelectedTicket(ticket);
    setDetailModalVisible(true);
  };

  const handleAssignTechnician = (ticket: ServiceTicket) => {
    setSelectedTicket(ticket);
    setAssignModalVisible(true);
  };

  const handleStatusChange = (_ticketId: string, _newStatus: string) => {
    // TODO: Implement status change API call
    message.success('Cập nhật trạng thái thành công!');
    loadTickets();
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

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.customerName.toLowerCase().includes(searchText.toLowerCase()) ||
                         ticket.id.toLowerCase().includes(searchText.toLowerCase()) ||
                         ticket.vehicleInfo.toLowerCase().includes(searchText.toLowerCase());
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
      render: (status: string, record: ServiceTicket) => (
        <Select
          value={status}
          onChange={(value) => handleStatusChange(record.id, value)}
          style={{ width: 120 }}
          size="small"
        >
          <Option value="pending">Chờ xử lý</Option>
          <Option value="in-progress">Đang thực hiện</Option>
          <Option value="completed">Hoàn thành</Option>
          <Option value="cancelled">Đã hủy</Option>
        </Select>
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
      width: 150,
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
          {!record.assignedTechnician && (
            <Button
              type="text"
              icon={<UserOutlined />}
              onClick={() => handleAssignTechnician(record)}
              className="text-green-600 hover:text-green-800"
            >
              Phân công
            </Button>
          )}
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
                Quản Lý Phiếu Dịch Vụ
              </Title>
              <Text type="secondary" className="text-lg">
                Quản lý tổng thể và phân công kỹ thuật viên
              </Text>
            </div>
          </div>
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

      {/* Filters */}
      <Card className="mb-6">
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={8}>
            <Search
              placeholder="Tìm kiếm theo tên, mã phiếu, xe..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              prefix={<SearchOutlined />}
            />
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: '100%' }}
              placeholder="Lọc theo trạng thái"
            >
              <Option value="all">Tất cả</Option>
              <Option value="pending">Chờ xử lý</Option>
              <Option value="in-progress">Đang thực hiện</Option>
              <Option value="completed">Hoàn thành</Option>
              <Option value="cancelled">Đã hủy</Option>
            </Select>
          </Col>
        </Row>
      </Card>

      {/* Tickets Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredTickets}
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
          <Descriptions column={1} bordered>
            <Descriptions.Item label="Mã phiếu">
              <Tag color="blue">{selectedTicket.id}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Khách hàng">
              <div>
                <Text strong>{selectedTicket.customerName}</Text>
                <div className="text-sm text-gray-500">{selectedTicket.customerPhone}</div>
              </div>
            </Descriptions.Item>
            <Descriptions.Item label="Thông tin xe">
              <Text>{selectedTicket.vehicleInfo}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Loại dịch vụ">
              <Tag color="blue">{selectedTicket.serviceType}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Mô tả">
              <Text>{selectedTicket.description}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Ưu tiên">
              <Tag color={getPriorityColor(selectedTicket.priority)}>
                {getPriorityText(selectedTicket.priority)}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              <Tag color={getStatusColor(selectedTicket.status)}>
                {getStatusText(selectedTicket.status)}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Kỹ thuật viên">
              {selectedTicket.assignedTechnician ? (
                <Tag color="green">{selectedTicket.assignedTechnician}</Tag>
              ) : (
                <Tag color="orange">Chưa phân công</Tag>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Thời gian ước tính">
              <Text>{selectedTicket.estimatedDuration} phút</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Thời gian thực tế">
              {selectedTicket.actualDuration ? (
                <Text>{selectedTicket.actualDuration} phút</Text>
              ) : (
                <Text type="secondary">Chưa hoàn thành</Text>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Ghi chú">
              <Text>{selectedTicket.notes}</Text>
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      {/* Assign Technician Modal */}
      <Modal
        title="Phân công kỹ thuật viên"
        open={assignModalVisible}
        onCancel={() => setAssignModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setAssignModalVisible(false)}>
            Hủy
          </Button>,
          <Button
            key="assign"
            type="primary"
            onClick={() => {
              // TODO: Implement assign technician API call
              message.success('Phân công kỹ thuật viên thành công!');
              setAssignModalVisible(false);
              loadTickets();
            }}
            className="!bg-blue-600 hover:!bg-blue-700"
          >
            Phân công
          </Button>,
        ]}
      >
        <div className="space-y-4">
          <div>
            <Text strong>Phiếu dịch vụ: </Text>
            <Tag color="blue">{selectedTicket?.id}</Tag>
          </div>
          <div>
            <Text strong>Khách hàng: </Text>
            <Text>{selectedTicket?.customerName}</Text>
          </div>
          <div>
            <Text strong>Loại dịch vụ: </Text>
            <Text>{selectedTicket?.serviceType}</Text>
          </div>
          <div>
            <Text strong>Chọn kỹ thuật viên:</Text>
            <Select
              style={{ width: '100%', marginTop: 8 }}
              placeholder="Chọn kỹ thuật viên"
            >
              <Option value="tech1">Kỹ thuật viên 1</Option>
              <Option value="tech2">Kỹ thuật viên 2</Option>
              <Option value="tech3">Kỹ thuật viên 3</Option>
            </Select>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminServiceTicket;
