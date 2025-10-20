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
import { adminServiceOrderService, AdminServiceOrder } from '../../services/adminServiceOrderService';

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;


const AdminServiceTicket: React.FC = () => {
  const [tickets, setTickets] = useState<AdminServiceOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<AdminServiceOrder | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [assignModalVisible, setAssignModalVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedTechnician, setSelectedTechnician] = useState<number | null>(null);


  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    try {
      setLoading(true);
      const data = await adminServiceOrderService.getAllServiceOrders();
      setTickets(data);
    } catch (error: any) {
      console.error('Error loading tickets:', error);
      message.error(error.message || 'Không thể tải danh sách phiếu dịch vụ');
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = (ticket: AdminServiceOrder) => {
    setSelectedTicket(ticket);
    setDetailModalVisible(true);
  };

  const handleAssignTechnician = (ticket: AdminServiceOrder) => {
    setSelectedTicket(ticket);
    setAssignModalVisible(true);
  };

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    try {
      await adminServiceOrderService.updateServiceOrderStatus({
        OrderID: orderId,
        Status: newStatus
      });
      message.success('Cập nhật trạng thái thành công!');
      loadTickets();
    } catch (error: any) {
      message.error(error.message || 'Cập nhật trạng thái thất bại!');
    }
  };

  const handleAssignTechnicianSubmit = async () => {
    if (!selectedTicket || !selectedTechnician) {
      message.error('Vui lòng chọn kỹ thuật viên');
      return;
    }

    try {
      await adminServiceOrderService.assignTechnician({
        OrderID: selectedTicket.OrderID,
        TechnicianID: selectedTechnician
      });
      message.success('Phân công kỹ thuật viên thành công!');
      setAssignModalVisible(false);
      setSelectedTechnician(null);
      loadTickets();
    } catch (error: any) {
      message.error(error.message || 'Phân công kỹ thuật viên thất bại!');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'orange';
      case 'inprogress': return 'blue';
      case 'completed': return 'green';
      case 'cancelled': return 'red';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'Chờ xử lý';
      case 'inprogress': return 'Đang thực hiện';
      case 'completed': return 'Hoàn thành';
      case 'cancelled': return 'Đã hủy';
      default: return status;
    }
  };


  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.customerName.toLowerCase().includes(searchText.toLowerCase()) ||
                         ticket.OrderID.toString().includes(searchText.toLowerCase()) ||
                         ticket.vehicleModel.toLowerCase().includes(searchText.toLowerCase());
    const matchesStatus = statusFilter === 'all' || ticket.status.toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const columns = [
    {
      title: 'Mã phiếu',
      dataIndex: 'OrderID',
      key: 'OrderID',
      width: 100,
      render: (id: number) => (
        <Tag color="blue" className="font-mono">
          #{id}
        </Tag>
      ),
    },
    {
      title: 'Khách hàng',
      dataIndex: 'customerName',
      key: 'customerName',
      render: (name: string, record: AdminServiceOrder) => (
        <div>
          <Text strong>{name}</Text>
          <div className="text-sm text-gray-500">{record.vehicleModel}</div>
        </div>
      ),
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
      title: 'Trung tâm',
      dataIndex: 'centerName',
      key: 'centerName',
      ellipsis: true,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string, record: AdminServiceOrder) => (
        <Select
          value={status}
          onChange={(value) => handleStatusChange(record.OrderID, value)}
          style={{ width: 120 }}
          size="small"
        >
          <Option value="Pending">Chờ xử lý</Option>
          <Option value="InProgress">Đang thực hiện</Option>
          <Option value="Completed">Hoàn thành</Option>
          <Option value="Cancelled">Đã hủy</Option>
        </Select>
      ),
    },
    {
      title: 'Kỹ thuật viên',
      dataIndex: 'technicianName',
      key: 'technicianName',
      width: 150,
      render: (technician: string) => (
        technician && technician !== 'Chưa phân công' ? (
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
      render: (_: any, record: AdminServiceOrder) => (
        <Space>
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
            className="text-blue-600 hover:text-blue-800"
          >
            Xem
          </Button>
          {(!record.technicianName || record.technicianName === 'Chưa phân công') && (
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
              value={tickets.filter(t => t.status.toLowerCase() === 'pending').length}
              prefix={<ClockCircleOutlined className="text-orange-500" />}
              valueStyle={{ color: '#f59e0b' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card className="text-center">
            <Statistic
              title="Đang thực hiện"
              value={tickets.filter(t => t.status.toLowerCase() === 'inprogress').length}
              prefix={<ExclamationCircleOutlined className="text-blue-500" />}
              valueStyle={{ color: '#3b82f6' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card className="text-center">
            <Statistic
              title="Hoàn thành"
              value={tickets.filter(t => t.status.toLowerCase() === 'completed').length}
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
              <Option value="inprogress">Đang thực hiện</Option>
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
              <Tag color="blue">#{selectedTicket.OrderID}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Khách hàng">
              <Text strong>{selectedTicket.customerName}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Thông tin xe">
              <Text>{selectedTicket.vehicleModel}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Loại dịch vụ">
              <Tag color="blue">{selectedTicket.serviceType}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Trung tâm">
              <Text>{selectedTicket.centerName}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              <Tag color={getStatusColor(selectedTicket.status)}>
                {getStatusText(selectedTicket.status)}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Kỹ thuật viên">
              {selectedTicket.technicianName && selectedTicket.technicianName !== 'Chưa phân công' ? (
                <Tag color="green">{selectedTicket.technicianName}</Tag>
              ) : (
                <Tag color="orange">Chưa phân công</Tag>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày tạo">
              <Text>{new Date(selectedTicket.createDate).toLocaleDateString('vi-VN')}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Ngày hẹn">
              <Text>{new Date(selectedTicket.requestDate).toLocaleDateString('vi-VN')}</Text>
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
            onClick={handleAssignTechnicianSubmit}
            className="!bg-blue-600 hover:!bg-blue-700"
          >
            Phân công
          </Button>,
        ]}
      >
        <div className="space-y-4">
          <div>
            <Text strong>Phiếu dịch vụ: </Text>
            <Tag color="blue">#{selectedTicket?.OrderID}</Tag>
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
              value={selectedTechnician}
              onChange={setSelectedTechnician}
            >
              <Option value={1}>Phạm Kỹ Thuật</Option>
              <Option value={2}>Lê Kỹ Thuật</Option>
              <Option value={3}>Nguyễn Kỹ Thuật</Option>
            </Select>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminServiceTicket;
