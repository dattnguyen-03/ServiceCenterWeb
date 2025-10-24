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

import { getAllUsers, searchUsers, createUser, editUser, deleteUser, type UserListItem } from '../../api/users';

const StaffManagement: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [staffMembers, setStaffMembers] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [form] = Form.useForm();
  const mapUsers = (data: UserListItem[]): Staff[] =>
    data.map((u) => ({
      id: String(u.userID),
      name: u.name,
      role: u.role,
      specialization: [],
      phone: u.phone,
      email: u.email,
      status: 'active',
      certifications: [],
      schedule: [],
    }));

  useEffect(() => {
    const fetchStaff = async () => {
      setLoading(true);
      try {
        const { data } = await getAllUsers();
        setStaffMembers(mapUsers(data));
      } finally {
        setLoading(false);
      }
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
      async onOk() {
        await deleteUser(Number(id));
        const { data } = await getAllUsers();
        setStaffMembers(mapUsers(data));
      },
    });
  };

  const handleSubmit = async (values: any) => {
    if (editingStaff) {
      await editUser({
        userID: Number(editingStaff.id),
        name: values.name,
        email: values.email,
        phone: values.phone,
        address: values.address,
      });
    } else {
      await createUser({
        username: values.username,
        password: values.password,
        role: values.role,
        name: values.name,
        email: values.email,
        phone: values.phone,
        address: values.address,
      });
    }
    setIsModalVisible(false);
    form.resetFields();
    const { data } = await getAllUsers();
    setStaffMembers(mapUsers(data));
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
        <Input.Search
          allowClear
          placeholder="Tìm theo Username/Name/Email"
          onSearch={async (val) => {
            setLoading(true);
            try {
              const { data } = val ? await searchUsers(val) : await getAllUsers();
              setStaffMembers(mapUsers(data));
            } finally {
              setLoading(false);
            }
          }}
          style={{ width: 360, marginBottom: 16 }}
        />
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
          {!editingStaff && (
            <>
              <Form.Item
                name="username"
                label="Username"
                rules={[{ required: true, message: 'Vui lòng nhập username' }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="password"
                label="Mật khẩu"
                rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}
              >
                <Input.Password />
              </Form.Item>
            </>
          )}
          <Form.Item
            name="name"
            label="Tên nhân viên"
            rules={[{ required: true, message: 'Vui lòng nhập tên nhân viên' }]}
          >
            <Input prefix={<UserOutlined />} />
          </Form.Item>
          <Form.Item
            name="role"
            label="Vai trò"
            rules={[{ required: true, message: 'Vui lòng chọn vai trò' }]}
          >
            <Select disabled={!!editingStaff}>
              <Select.Option value="Customer">Khách hàng</Select.Option>
              <Select.Option value="Staff">Nhân viên</Select.Option>
              <Select.Option value="Technician">Kỹ thuật viên</Select.Option>
              <Select.Option value="Admin">Quản trị</Select.Option>
            </Select>
          </Form.Item>
          {/* specialization and schedule are not used by backend */}

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

          {/* status is UI-only; not persisted */}
        </Form>
      </Modal>
    </div>
  );
};

export default StaffManagement;