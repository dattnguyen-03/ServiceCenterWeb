import React, { useState, useEffect } from 'react';
import { Table, Card, Button, Space, Tag, Modal, Form, Input, Select, Spin } from 'antd';
import {
  UserOutlined,
  ToolOutlined,
  PhoneOutlined,
  MailOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  CalendarOutlined,
} from '@ant-design/icons';

interface Staff {
  id: string;
  name: string;
  role: string;
  specialization: string[];
  phone: string;
  email: string;
  status: 'active' | 'off-duty' | 'on-leave';
  certifications: {
    name: string;
    issueDate: string;
    expiryDate: string;
  }[];
  schedule: {
    shift: 'morning' | 'afternoon' | 'night';
    date: string;
  }[];
}

// Mock data - This will be replaced by API data
const mockStaffMembers: Staff[] = [
  {
    id: 'T001',
    name: 'Nguyễn Văn A',
    role: 'Senior Technician',
    specialization: ['EV Systems', 'Battery Maintenance'],
    phone: '0901234567',
    email: 'technician.a@service.com',
    status: 'active',
    certifications: [
      {
        name: 'EV System Specialist',
        issueDate: '2023-01-01',
        expiryDate: '2024-01-01',
      },
    ],
    schedule: [
      {
        shift: 'morning',
        date: '2023-09-14',
      },
    ],
  },
  // Add more mock data...
];

const StaffManagement: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [staffMembers, setStaffMembers] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [form] = Form.useForm();

  useEffect(() => {
    // TODO: Replace with API call
    const fetchStaff = async () => {
      setLoading(true);
      // const response = await api.getStaff();
      // setStaffMembers(response.data);
      setStaffMembers(mockStaffMembers); // Using mock data for now
      setLoading(false);
    };

    fetchStaff();
  }, []);

  const columns = [
    {
      title: 'Nhân viên',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => (
        <Space>
          <UserOutlined />
          {text}
        </Space>
      ),
    },
    {
      title: 'Vị trí',
      dataIndex: 'role',
      key: 'role',
      render: (text: string) => (
        <Space>
          <ToolOutlined />
          {text}
        </Space>
      ),
    },
    {
      title: 'Chuyên môn',
      dataIndex: 'specialization',
      key: 'specialization',
      render: (specializations: string[]) => (
        <Space>
          {specializations.map(spec => (
            <Tag key={spec} color="blue">{spec}</Tag>
          ))}
        </Space>
      ),
    },
    {
      title: 'Liên hệ',
      key: 'contact',
      render: (_: any, record: Staff) => (
        <Space direction="vertical" size="small">
          <Space>
            <PhoneOutlined />
            {record.phone}
          </Space>
          <Space>
            <MailOutlined />
            {record.email}
          </Space>
        </Space>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const colors = {
          active: 'success',
          'off-duty': 'default',
          'on-leave': 'warning',
        };
        const texts = {
          active: 'Đang làm việc',
          'off-duty': 'Ngoài ca',
          'on-leave': 'Nghỉ phép',
        };
        return (
          <Tag color={colors[status as keyof typeof colors]}>
            {texts[status as keyof typeof texts]}
          </Tag>
        );
      },
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, record: Staff) => (
        <Space>
          <Button
            icon={<CalendarOutlined />}
            onClick={() => handleSchedule(record)}
          >
            Lịch làm việc
          </Button>
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Sửa
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          >
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  const handleEdit = (staff: Staff) => {
    setEditingStaff(staff);
    form.setFieldsValue({
      ...staff,
      certifications: staff.certifications.map(cert => ({
        ...cert,
        issueDate: cert.issueDate,
        expiryDate: cert.expiryDate,
      })),
    });
    setIsModalVisible(true);
  };

  const handleSchedule = (staff: Staff) => {
    // Implement schedule management
    console.log('Manage schedule for:', staff.name);
  };

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: 'Bạn có chắc chắn muốn xóa nhân viên này?',
      onOk() {
        // TODO: Call API to delete staff
        console.log('Delete staff:', id);
        setStaffMembers(prev => prev.filter(staff => staff.id !== id));
      },
    });
  };

  const handleSubmit = (values: any) => {
    if (editingStaff) {
      // TODO: Call API to update staff
      console.log('Update staff:', { ...editingStaff, ...values });
      setStaffMembers(prev => prev.map(staff => staff.id === editingStaff.id ? { ...staff, ...values } : staff));
    } else {
      // TODO: Call API to create staff
      const newStaff = { id: `T${Date.now()}`, ...values };
      console.log('Create staff:', newStaff);
      setStaffMembers(prev => [...prev, newStaff]);
    }
    setIsModalVisible(false);
    form.resetFields();
  };

  return (
    <div className="p-6">
      <Card
        title="Quản lý nhân sự"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingStaff(null);
              form.resetFields();
              setIsModalVisible(true);
            }}
          >
            Thêm nhân viên
          </Button>
        }
      >
        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={staffMembers}
            rowKey="id"
            pagination={{ pageSize: 10 }}
          />
        </Spin>
      </Card>

      <Modal
        title={editingStaff ? 'Sửa thông tin nhân viên' : 'Thêm nhân viên mới'}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        onOk={form.submit}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="name"
            label="Tên nhân viên"
            rules={[{ required: true, message: 'Vui lòng nhập tên nhân viên' }]}
          >
            <Input prefix={<UserOutlined />} />
          </Form.Item>

          <Form.Item
            name="role"
            label="Vị trí"
            rules={[{ required: true, message: 'Vui lòng chọn vị trí' }]}
          >
            <Select>
              <Select.Option value="Senior Technician">Kỹ thuật viên cao cấp</Select.Option>
              <Select.Option value="Technician">Kỹ thuật viên</Select.Option>
              <Select.Option value="Service Advisor">Cố vấn dịch vụ</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="specialization"
            label="Chuyên môn"
            rules={[{ required: true, message: 'Vui lòng chọn chuyên môn' }]}
          >
            <Select mode="multiple">
              <Select.Option value="EV Systems">Hệ thống EV</Select.Option>
              <Select.Option value="Battery Maintenance">Bảo dưỡng pin</Select.Option>
              <Select.Option value="Motor Systems">Hệ thống động cơ</Select.Option>
              <Select.Option value="Charging Systems">Hệ thống sạc</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="phone"
            label="Số điện thoại"
            rules={[
              { required: true, message: 'Vui lòng nhập số điện thoại' },
              { pattern: /^[0-9]{10}$/, message: 'Số điện thoại không hợp lệ' },
            ]}
          >
            <Input prefix={<PhoneOutlined />} />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Vui lòng nhập email' },
              { type: 'email', message: 'Email không hợp lệ' },
            ]}
          >
            <Input prefix={<MailOutlined />} />
          </Form.Item>

          <Form.Item
            name="status"
            label="Trạng thái"
            rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
          >
            <Select>
              <Select.Option value="active">Đang làm việc</Select.Option>
              <Select.Option value="off-duty">Ngoài ca</Select.Option>
              <Select.Option value="on-leave">Nghỉ phép</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default StaffManagement;