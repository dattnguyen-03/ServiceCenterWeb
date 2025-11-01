import React, { useState, useEffect } from 'react';
import { Table, Card, Button, Space, Tag, Modal, Form, Input, Select, Spin, Typography, Tooltip } from 'antd';
import {
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  CalendarOutlined,
  ReloadOutlined,
  SearchOutlined,
  FilterOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  TeamOutlined,
  SettingOutlined,
  EnvironmentOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
import { 
  showSuccess, 
  showError, 
  showDeleteConfirm, 
  showLoading, 
  closeLoading 
} from '../../utils/sweetAlert';

interface Staff {
  id: string;
  name: string;
  role: string;
  specialization: string[];
  phone: string;
  email: string;
  address: string;
  status: 'active' | 'off-duty' | 'on-leave';
  centerID?: number | null; // ✅ Staff và Technician thuộc về một ServiceCenter
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
import { getAllServiceCenters, type ServiceCenter } from '../../services/serviceCenterManagementService';

const StaffManagement: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [staffMembers, setStaffMembers] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [form] = Form.useForm();
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [serviceCenters, setServiceCenters] = useState<ServiceCenter[]>([]); // ✅ Danh sách ServiceCenter
  const mapUsers = (data: UserListItem[]): Staff[] =>
    data.map((u) => ({
      id: String(u.userID),
      name: u.name,
      role: u.role,
      specialization: [],
      phone: u.phone,
      email: u.email,
      address: u.address,
      status: 'active',
      certifications: [],
      schedule: [],
      centerID: u.centerID, // ✅ Lưu centerID từ API
    }));

  useEffect(() => {
    const fetchStaff = async () => {
      setLoading(true);
      try {
        const data = await getAllUsers();
        setStaffMembers(mapUsers(data));
      } catch (error) {
        console.error('Error fetching staff:', error);
      } finally {
        setLoading(false);
      }
    };
    
    const fetchServiceCenters = async () => {
      try {
        const centers = await getAllServiceCenters();
        setServiceCenters(centers);
      } catch (error) {
        console.error('Error fetching service centers:', error);
      }
    };
    
    fetchStaff();
    fetchServiceCenters(); // ✅ Load danh sách ServiceCenter
  }, []);

  // Handle create user
  const handleCreateUser = async (values: any) => {
    showLoading('Đang tạo người dùng...');
    
    try {
      const createData = {
        Username: values.username,
        Password: values.password,
        Role: values.role,
        Name: values.name,
        Email: values.email,
        Phone: values.phone,
        Address: values.address,
        CenterID: (values.role === 'Staff' || values.role === 'Technician') ? values.centerID : null // ✅ Gán CenterID cho Staff/Technician
      };
      
      const result = await createUser(createData);
      closeLoading();
      
      await showSuccess('Thành công!', result.message || 'Tạo người dùng thành công!');
      
      // Refresh staff list
      const data = await getAllUsers();
      setStaffMembers(mapUsers(data));
      
      setIsModalVisible(false);
      form.resetFields();
    } catch (error: any) {
      closeLoading();
      await showError('Lỗi!', error.message || 'Có lỗi xảy ra khi tạo người dùng');
    }
  };

  // Handle edit user
  const handleEditUser = async (values: any) => {
    if (!editingStaff) return;
    
    showLoading('Đang cập nhật thông tin...');
    
    try {
      const editData = {
        UserID: parseInt(editingStaff.id),
        Name: values.name,
        Email: values.email,
        Phone: values.phone,
        Address: values.address,
        CenterID: (editingStaff.role === 'Staff' || editingStaff.role === 'Technician') ? values.centerID : null // ✅ Cập nhật CenterID cho Staff/Technician
      };
      
      const result = await editUser(editData);
      closeLoading();
      
      await showSuccess('Thành công!', result.message || 'Cập nhật thông tin thành công!');
      
      // Refresh staff list
      const data = await getAllUsers();
      setStaffMembers(mapUsers(data));
      
      setIsModalVisible(false);
      setEditingStaff(null);
      form.resetFields();
    } catch (error: any) {
      closeLoading();
      await showError('Lỗi!', error.message || 'Có lỗi xảy ra khi cập nhật thông tin');
    }
  };

  // Handle delete user
  const handleDeleteUser = async (userId: number) => {
    const result = await showDeleteConfirm('người dùng này');
    
    if (!result.isConfirmed) {
      return;
    }

    showLoading('Đang xóa người dùng...');
    
    try {
      const deleteResult = await deleteUser(userId);
      closeLoading();
      
      await showSuccess('Thành công!', deleteResult.message || 'Xóa người dùng thành công!');
      
      // Refresh staff list
      const data = await getAllUsers();
      setStaffMembers(mapUsers(data));
    } catch (error: any) {
      closeLoading();
      await showError('Lỗi!', error.message || 'Có lỗi xảy ra khi xóa người dùng');
    }
  };

  const columns = [
    {
      title: 'Nhân viên',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      render: (text: string, record: Staff) => (
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <UserOutlined className="text-white text-sm" />
          </div>
          <div>
            <Text strong className="text-gray-900">{text}</Text>
            <div className="text-xs text-gray-500">ID: {record.id}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Vị trí',
      dataIndex: 'role',
      key: 'role',
      width: 120,
      render: (text: string) => (
        <div className="flex items-center space-x-2">
          <SettingOutlined className="text-blue-500 text-sm" />
          <Tag color="blue" className="border-0">
            {text}
          </Tag>
        </div>
      ),
    },
    {
      title: 'Chuyên môn',
      dataIndex: 'specialization',
      key: 'specialization',
      width: 200,
      render: (specializations: string[]) => (
        <div className="flex flex-wrap gap-1">
          {specializations.length > 0 ? (
            specializations.map(spec => (
              <Tag key={spec} color="purple" className="text-xs">
                {spec}
              </Tag>
            ))
          ) : (
            <Text type="secondary" className="text-xs">Chưa có</Text>
          )}
        </div>
      ),
    },
    {
      title: 'Liên hệ',
      key: 'contact',
      width: 200,
      render: (_: any, record: Staff) => (
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-sm">
            <PhoneOutlined className="text-green-500" />
            <Text className="text-gray-900">{record.phone}</Text>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <MailOutlined className="text-blue-500" />
            <Text className="text-gray-600 truncate">{record.email}</Text>
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
        const icons = {
          active: <CheckCircleOutlined className="text-green-500" />,
          'off-duty': <ClockCircleOutlined className="text-gray-500" />,
          'on-leave': <ExclamationCircleOutlined className="text-orange-500" />,
        };
        return (
          <div className="flex items-center space-x-2">
            {icons[status as keyof typeof icons]}
            <Tag color={colors[status as keyof typeof colors]} className="border-0">
              {texts[status as keyof typeof texts]}
            </Tag>
          </div>
        );
      },
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 250,
      render: (_: any, record: Staff) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button
              icon={<UserOutlined />}
              onClick={() => handleViewDetail(record)}
              className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all duration-200"
              size="small"
            >
              
            </Button>
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
              className="text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-all duration-200"
              size="small"
            >
              
            </Button>
          </Tooltip>
          <Tooltip title="Xóa nhân viên">
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDeleteUser(parseInt(record.id))}
              className="rounded-lg transition-all duration-200"
              size="small"
            >

            </Button>
          </Tooltip>
        </Space>
      ),
    },
  ];

  const handleEdit = (staff: Staff) => {
    setEditingStaff(staff);
    form.setFieldsValue({
      name: staff.name,
      email: staff.email,
      phone: staff.phone,
      address: staff.address || '',
      role: staff.role,
      centerID: staff.centerID, // ✅ Set CenterID vào form
    });
    setIsModalVisible(true);
  };

  const handleSchedule = (staff: Staff) => {
    // Implement schedule management
    console.log('Manage schedule for:', staff.name);
  };

  const handleViewDetail = (staff: Staff) => {
    setSelectedStaff(staff);
    setDetailModalVisible(true);
  };


  const handleSubmit = async (values: any) => {
    if (editingStaff) {
      await handleEditUser(values);
    } else {
      await handleCreateUser(values);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg">
                <TeamOutlined className="text-white text-2xl" />
              </div>
              <div>
                <Title level={2} className="!mb-1 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Quản Lý Nhân Sự
                </Title>
                <Text type="secondary" className="text-base">
                  Quản lý thông tin nhân viên , khách hàng và kỹ thuật viên
                </Text>
                <div className="flex items-center space-x-4 mt-2">
                  <div className="flex items-center space-x-1 text-sm text-gray-500">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Hệ thống hoạt động bình thường</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    Tổng cộng: {staffMembers.length} nhân viên
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  const fetchStaff = async () => {
                    setLoading(true);
                    try {
                      const data = await getAllUsers();
                      setStaffMembers(mapUsers(data));
                    } catch (error) {
                      console.error('Error fetching staff:', error);
                    } finally {
                      setLoading(false);
                    }
                  };
                  fetchStaff();
                }}
                className="border-gray-200 hover:border-blue-500 hover:text-blue-500"
                size="large"
              >
                Làm mới
              </Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  setEditingStaff(null);
                  form.resetFields();
                  setIsModalVisible(true);
                }}
                size="large"
                className="!bg-gradient-to-r !from-purple-500 !to-pink-600 hover:!from-purple-600 hover:!to-pink-700 !border-0 shadow-lg"
              >
                Thêm nhân viên
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <Card className="mb-6 border-0 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex items-center space-x-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <SearchOutlined className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input.Search
                allowClear
                placeholder="Tìm theo Username/Name/Email"
                onSearch={async (val) => {
                  setLoading(true);
                  try {
                    const data = val ? await searchUsers(val) : await getAllUsers();
                    setStaffMembers(mapUsers(data));
                  } finally {
                    setLoading(false);
                  }
                }}
                className="pl-10 rounded-lg border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                size="large"
              />
            </div>
            <Button
              icon={<FilterOutlined />}
              className="border-gray-200 hover:border-blue-500 hover:text-blue-500"
            >
              Bộ lọc
            </Button>
          </div>
          <div className="flex items-center space-x-2">
            <div className="text-sm text-gray-500">
              Hiển thị {staffMembers.length} nhân viên
            </div>
          </div>
        </div>
      </Card>

      {/* Staff Table */}
      <Card className="border-0 shadow-sm">
        <div className="mb-4">
          <Title level={4} className="!mb-0 text-gray-700">
            <TeamOutlined className="mr-2 text-purple-500" />
            Danh sách nhân viên
          </Title>
          <Text type="secondary" className="text-sm">
            Quản lý và theo dõi thông tin nhân viên
          </Text>
        </div>
        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={staffMembers}
            rowKey="id"
            pagination={{ 
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} nhân viên`,
            }}
            className="rounded-lg"
            rowClassName="hover:bg-gray-50 transition-colors duration-200"
            size="middle"
          />
        </Spin>
      </Card>

      <Modal
        title={
          <div className="flex items-center py-2">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center mr-3">
              <TeamOutlined className="text-white text-lg" />
            </div>
            <div>
              <div className="text-lg font-semibold text-gray-800">
                {editingStaff ? 'Sửa thông tin nhân viên' : 'Thêm nhân viên mới'}
              </div>
              <div className="text-sm text-gray-500">
                {editingStaff ? 'Cập nhật thông tin nhân viên' : 'Thêm nhân viên mới vào hệ thống'}
              </div>
            </div>
          </div>
        }
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        footer={[
          <Button key="cancel" onClick={() => {
            setIsModalVisible(false);
            form.resetFields();
          }} className="px-6">
            Hủy
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={() => form.submit()}
            className="!bg-gradient-to-r !from-purple-500 !to-pink-600 hover:!from-purple-600 hover:!to-pink-700 !border-0 px-6"
          >
            {editingStaff ? 'Cập nhật' : 'Thêm mới'}
          </Button>,
        ]}
        width={700}
        className="rounded-lg"
      >
        <div className="py-4">
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            className="space-y-6"
          >
            {!editingStaff && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Form.Item
                  name="username"
                  label={
                    <span className="text-gray-700 font-medium">
                      <UserOutlined className="mr-2 text-blue-500" />
                      Username
                    </span>
                  }
                  rules={[{ required: true, message: 'Vui lòng nhập username' }]}
                >
                  <Input 
                    placeholder="Nhập username" 
                    size="large"
                    className="rounded-lg"
                  />
                </Form.Item>
                <Form.Item
                  name="password"
                  label={
                    <span className="text-gray-700 font-medium">
                      <span className="mr-2">🔒</span>
                      Mật khẩu
                    </span>
                  }
                  rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}
                >
                  <Input.Password 
                    placeholder="Nhập mật khẩu" 
                    size="large"
                    className="rounded-lg"
                  />
                </Form.Item>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Form.Item
                name="name"
                label={
                  <span className="text-gray-700 font-medium">
                    <UserOutlined className="mr-2 text-green-500" />
                    Tên nhân viên
                  </span>
                }
                rules={[{ required: true, message: 'Vui lòng nhập tên nhân viên' }]}
              >
                <Input 
                  prefix={<UserOutlined />} 
                  placeholder="Nhập tên nhân viên"
                  size="large"
                  className="rounded-lg"
                />
              </Form.Item>
              <Form.Item
                name="role"
                label={
                  <span className="text-gray-700 font-medium">
                    <SettingOutlined className="mr-2 text-purple-500" />
                    Vai trò
                  </span>
                }
                rules={[{ required: true, message: 'Vui lòng chọn vai trò' }]}
              >
                <Select 
                  disabled={!!editingStaff}
                  placeholder="Chọn vai trò"
                  size="large"
                  className="rounded-lg"
                >
                  <Select.Option value="Customer">Khách hàng</Select.Option>
                  <Select.Option value="Staff">Nhân viên</Select.Option>
                  <Select.Option value="Technician">Kỹ thuật viên</Select.Option>
                  <Select.Option value="Admin">Quản trị</Select.Option>
                </Select>
              </Form.Item>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Form.Item
                name="phone"
                label={
                  <span className="text-gray-700 font-medium">
                    <PhoneOutlined className="mr-2 text-green-500" />
                    Số điện thoại
                  </span>
                }
                rules={[
                  { required: true, message: 'Vui lòng nhập số điện thoại' },
                  { pattern: /^[0-9]{10}$/, message: 'Số điện thoại không hợp lệ' },
                ]}
              >
                <Input 
                  prefix={<PhoneOutlined />} 
                  placeholder="Nhập số điện thoại"
                  size="large"
                  className="rounded-lg"
                />
              </Form.Item>

              <Form.Item
                name="email"
                label={
                  <span className="text-gray-700 font-medium">
                    <MailOutlined className="mr-2 text-blue-500" />
                    Email
                  </span>
                }
                rules={[
                  { required: true, message: 'Vui lòng nhập email' },
                  { type: 'email', message: 'Email không hợp lệ' },
                ]}
              >
                <Input 
                  prefix={<MailOutlined />} 
                  placeholder="Nhập email"
                  size="large"
                  className="rounded-lg"
                />
              </Form.Item>
            </div>
            <Form.Item
              name="address"
              label={
                <span className="text-gray-700 font-medium">
                  <EnvironmentOutlined className="mr-2 text-purple-500" />
                  Địa chỉ
                </span>
              }
              rules={[{ required: true, message: 'Vui lòng nhập địa chỉ' }]}
            >
              <Input 
                prefix={<EnvironmentOutlined />} 
                placeholder="Nhập địa chỉ"
                size="large"
                className="rounded-lg"
              />
            </Form.Item>
            
            {/* ✅ Field chọn ServiceCenter - chỉ hiện với Staff/Technician */}
            <Form.Item
              noStyle
              shouldUpdate={(prevValues, currentValues) => 
                prevValues.role !== currentValues.role || 
                prevValues !== currentValues
              }
            >
              {({ getFieldValue }) => {
                const role = getFieldValue('role');
                const isEditing = !!editingStaff;
                const editingRole = editingStaff?.role;
                
                // Xác định role hiện tại (form value hoặc editing role)
                const currentRole = isEditing ? editingRole : role;
                const isStaffOrTechnician = currentRole === 'Staff' || currentRole === 'Technician';
                
                if (!isStaffOrTechnician) return null;
                
                return (
                  <Form.Item
                    name="centerID"
                    label={
                      <span className="text-gray-700 font-medium">
                        <EnvironmentOutlined className="mr-2 text-purple-500" />
                        Trung tâm dịch vụ <span className="text-red-500">*</span>
                      </span>
                    }
                    rules={[
                      { 
                        required: true, 
                        message: 'Vui lòng chọn trung tâm dịch vụ' 
                      }
                    ]}
                  >
                    <Select 
                      placeholder="Chọn trung tâm dịch vụ"
                      size="large"
                      className="rounded-lg"
                      showSearch
                      optionFilterProp="label"
                      filterOption={(input, option) =>
                        (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                      }
                      options={serviceCenters.map(center => ({
                        value: center.centerID,
                        label: `${center.name} - ${center.address}`,
                      }))}
                      notFoundContent={serviceCenters.length === 0 ? 'Đang tải danh sách trung tâm...' : 'Không tìm thấy trung tâm'}
                    />
                  </Form.Item>
                );
              }}
            </Form.Item>
          </Form>
        </div>
      </Modal>

      {/* Staff Detail Modal */}
      <Modal
        title={
          <div className="flex items-center py-2">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center mr-3">
              <TeamOutlined className="text-white text-lg" />
            </div>
            <div>
              <div className="text-lg font-semibold text-gray-800">Chi tiết nhân viên</div>
              <div className="text-sm text-gray-500">Thông tin chi tiết về nhân viên</div>
            </div>
          </div>
        }
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)} className="px-6">
            Đóng
          </Button>,
          <Button
            key="edit"
            type="primary"
            icon={<EditOutlined />}
            onClick={() => {
              setDetailModalVisible(false);
              handleEdit(selectedStaff!);
            }}
            className="!bg-gradient-to-r !from-purple-500 !to-pink-600 hover:!from-purple-600 hover:!to-pink-700 !border-0 px-6"
          >
            Chỉnh sửa
          </Button>,
        ]}
        width={800}
        className="rounded-lg"
      >
        {selectedStaff && (
          <div className="py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-3">
                    <UserOutlined className="text-purple-500" />
                    <Text strong className="text-gray-700">Thông tin cá nhân</Text>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-sm">
                      <Text type="secondary">Họ tên:</Text>
                      <Text className="font-medium">{selectedStaff.name}</Text>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <MailOutlined className="text-blue-500" />
                      <Text type="secondary">Email:</Text>
                      <Text className="font-medium">{selectedStaff.email}</Text>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <PhoneOutlined className="text-green-500" />
                      <Text type="secondary">Điện thoại:</Text>
                      <Text className="font-medium">{selectedStaff.phone}</Text>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <EnvironmentOutlined className="text-purple-500" />
                      <Text type="secondary">Địa chỉ:</Text>
                      <Text className="font-medium">{selectedStaff.address}</Text>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-3">
                    <SettingOutlined className="text-blue-500" />
                    <Text strong className="text-gray-700">Thông tin tài khoản</Text>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-sm">
                      <Text type="secondary">ID:</Text>
                      <Text className="font-medium">{selectedStaff.id}</Text>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <Text type="secondary">Vai trò:</Text>
                      <Tag color="blue" className="border-0">{selectedStaff.role}</Tag>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <Text type="secondary">Trạng thái:</Text>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <Tag color="green" className="border-0">Hoạt động</Tag>
                      </div>
                    </div>
                    {/* ✅ Hiển thị ServiceCenter cho Staff/Technician */}
                    {(selectedStaff.role === 'Staff' || selectedStaff.role === 'Technician') && (
                      <div className="flex items-center space-x-2 text-sm">
                        <EnvironmentOutlined className="text-purple-500" />
                        <Text type="secondary">Trung tâm dịch vụ:</Text>
                        {selectedStaff.centerID ? (
                          (() => {
                            const center = serviceCenters.find(sc => sc.centerID === selectedStaff.centerID);
                            return center ? (
                              <Text className="font-medium">{center.name} ({center.address})</Text>
                            ) : (
                              <Text className="font-medium text-orange-500">ID: {selectedStaff.centerID} (Chưa tải thông tin)</Text>
                            );
                          })()
                        ) : (
                          <Text className="font-medium text-red-500">Chưa được gán</Text>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-3">
                <TeamOutlined className="text-purple-500" />
                <Text strong className="text-gray-700">Thông tin bổ sung</Text>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm">
                  <Text type="secondary">Chuyên môn:</Text>
                  <div className="flex flex-wrap gap-1">
                    {selectedStaff.specialization.length > 0 ? (
                      selectedStaff.specialization.map(spec => (
                        <Tag key={spec} color="purple" className="text-xs">
                          {spec}
                        </Tag>
                      ))
                    ) : (
                      <Text type="secondary" className="text-xs">Chưa có</Text>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Text type="secondary">Chứng chỉ:</Text>
                  <Text className="text-xs text-gray-500">
                    {selectedStaff.certifications.length} chứng chỉ
                  </Text>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Text type="secondary">Lịch làm việc:</Text>
                  <Text className="text-xs text-gray-500">
                    {selectedStaff.schedule.length} ca làm việc
                  </Text>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default StaffManagement;