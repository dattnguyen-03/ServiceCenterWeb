import React, { useState, useEffect } from 'react';
import { Table, Card, Button, Space, Tag, Modal, Form, Select, Input, Statistic, Spin } from 'antd';
import {
  CarOutlined,
  UserOutlined,
  ToolOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';

interface ServiceQueue {
  id: string;
  vehicleInfo: string;
  customerName: string;
  serviceType: string;
  priority: 'high' | 'medium' | 'low';
  status: 'waiting' | 'in-progress' | 'completed' | 'cancelled';
  assignedTechnician?: string;
  estimatedDuration: number;
  startTime?: string;
  notes: string;
}

interface Technician {
  id: string;
  name: string;
  specialization: string[];
  status: 'available' | 'busy' | 'off-duty';
  currentTask?: string;
}

// Mock data - This will be replaced by API calls
const mockServices: ServiceQueue[] = [
  {
    id: 'SVC001',
    vehicleInfo: 'VinFast VF8 - 30A-12345',
    customerName: 'Nguyễn Văn A',
    serviceType: 'Bảo dưỡng định kỳ',
    priority: 'high',
    status: 'waiting',
    estimatedDuration: 120,
    notes: 'Khách hẹn lấy xe trong ngày',
  },
  // Add more mock data...
];

const mockTechnicians: Technician[] = [
  {
    id: 'T001',
    name: 'Kỹ thuật viên A',
    specialization: ['EV System', 'Battery'],
    status: 'available',
  },
  // Add more mock data...
];

const ServiceQueueManagement: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [services, setServices] = useState<ServiceQueue[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [loading, setLoading] = useState(true);
  const [form] = Form.useForm();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      // TODO: Replace with API calls
      // const servicesRes = await api.getServices();
      // const techniciansRes = await api.getTechnicians();
      // setServices(servicesRes.data);
      // setTechnicians(techniciansRes.data);
      setServices(mockServices);
      setTechnicians(mockTechnicians);
      setLoading(false);
    };
    fetchData();
  }, []);

  const columns = [
    {
      title: 'Thông tin xe',
      dataIndex: 'vehicleInfo',
      key: 'vehicleInfo',
      render: (text: string) => (
        <Space>
          <CarOutlined />
          {text}
        </Space>
      ),
    },
    {
      title: 'Khách hàng',
      dataIndex: 'customerName',
      key: 'customerName',
      render: (text: string) => (
        <Space>
          <UserOutlined />
          {text}
        </Space>
      ),
    },
    {
      title: 'Loại dịch vụ',
      dataIndex: 'serviceType',
      key: 'serviceType',
    },
    {
      title: 'Độ ưu tiên',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority: string) => {
        const colors = {
          high: 'red',
          medium: 'orange',
          low: 'blue',
        };
        return (
          <Tag color={colors[priority as keyof typeof colors]}>
            {priority === 'high' ? 'Cao' : priority === 'medium' ? 'Trung bình' : 'Thấp'}
          </Tag>
        );
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const colors = {
          waiting: 'default',
          'in-progress': 'processing',
          completed: 'success',
          cancelled: 'error',
        };
        const texts = {
          waiting: 'Chờ xử lý',
          'in-progress': 'Đang thực hiện',
          completed: 'Hoàn thành',
          cancelled: 'Đã hủy',
        };
        return (
          <Tag color={colors[status as keyof typeof colors]}>
            {texts[status as keyof typeof texts]}
          </Tag>
        );
      },
    },
    {
      title: 'KTV phụ trách',
      dataIndex: 'assignedTechnician',
      key: 'assignedTechnician',
      render: (tech: string) => tech || 'Chưa phân công',
    },
    {
      title: 'Thời gian dự kiến',
      dataIndex: 'estimatedDuration',
      key: 'estimatedDuration',
      render: (duration: number) => `${duration} phút`,
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, record: ServiceQueue) => (
        <Space>
          <Button
            type="primary"
            icon={<ToolOutlined />}
            onClick={() => handleAssign(record)}
            disabled={record.status === 'completed' || record.status === 'cancelled'}
          >
            Phân công
          </Button>
          <Button
            icon={<CheckCircleOutlined />}
            onClick={() => handleUpdateStatus(record)}
            disabled={record.status === 'completed' || record.status === 'cancelled'}
          >
            Cập nhật
          </Button>
        </Space>
      ),
    },
  ];

  const handleAssign = (service: ServiceQueue) => {
    form.setFieldsValue({
      serviceId: service.id,
      technicianId: service.assignedTechnician,
      notes: service.notes,
    });
    setIsModalVisible(true);
  };

  const handleUpdateStatus = (service: ServiceQueue) => {
    Modal.confirm({
      title: 'Cập nhật trạng thái',
      icon: <ExclamationCircleOutlined />,
      content: 'Xác nhận hoàn thành dịch vụ này?',
      onOk() {
        // Call API to update service status
        console.log('Update service status:', service.id);
      },
    });
  };

  const handleSubmit = (values: any) => {
    // Call API to assign technician
    console.log('Assign technician:', values);
    setIsModalVisible(false);
    form.resetFields();
  };

  const availableTechnicians = technicians.filter(tech => tech.status === 'available');

  return (
    <div className="p-6">
      <Spin spinning={loading}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <Statistic
              title="Đang chờ xử lý"
              value={services.filter(s => s.status === 'waiting').length}
              prefix={<ClockCircleOutlined style={{ color: '#faad14' }} />}
            />
          </Card>
          <Card>
            <Statistic
              title="Đang thực hiện"
              value={services.filter(s => s.status === 'in-progress').length}
              prefix={<ToolOutlined style={{ color: '#1890ff' }} />}
            />
          </Card>
          <Card>
            <Statistic
              title="KTV sẵn sàng"
              value={availableTechnicians.length}
              prefix={<UserOutlined style={{ color: '#52c41a' }} />}
            />
          </Card>
        </div>

        <Card title="Quản lý hàng chờ dịch vụ">
          <Table
            columns={columns}
            dataSource={services}
            rowKey="id"
            pagination={{ pageSize: 10 }}
          />
        </Card>
      </Spin>

      <Modal
        title="Phân công kỹ thuật viên"
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        onOk={form.submit}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item name="serviceId" hidden>
            <Input />
          </Form.Item>

          <Form.Item
            name="technicianId"
            label="Chọn kỹ thuật viên"
            rules={[{ required: true, message: 'Vui lòng chọn kỹ thuật viên' }]}
          >
            <Select>
              {availableTechnicians.map(tech => (
                <Select.Option key={tech.id} value={tech.id}>
                  {tech.name} - {tech.specialization.join(', ')}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="notes"
            label="Ghi chú"
          >
            <Input.TextArea />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ServiceQueueManagement;