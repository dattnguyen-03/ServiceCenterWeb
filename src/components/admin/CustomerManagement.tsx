import React, { useState, useEffect } from 'react';
import { Users, Car, UserCheck, Calendar } from 'lucide-react';
import { getAllUsers, searchUsers, type UserListItem } from '../../api/users';
import { Card, Button, Modal, Typography, Space, Tag, Badge, Tooltip, Divider, Spin } from 'antd';
import { ReloadOutlined, SearchOutlined, FilterOutlined, PlusOutlined, EyeOutlined, EditOutlined, DeleteOutlined, UserOutlined, PhoneOutlined, MailOutlined, EnvironmentOutlined, SettingOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

// Use the API types
type Customer = UserListItem;

const CustomerManagement: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);

  useEffect(() => {
    const fetchCustomers = async () => {
      setLoading(true);
      try {
        const data = await getAllUsers();
        setCustomers(data);
      } catch (error: any) {
        console.error('Error fetching customers:', error);
        setCustomers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);
  
  // Handle search with API call
  const handleSearch = async (keyword: string) => {
    if (!keyword.trim()) {
      // If empty, fetch all users
      const data = await getAllUsers();
      setCustomers(data);
      return;
    }

    try {
      const data = await searchUsers(keyword);
      setCustomers(data);
    } catch (error: any) {
      console.error('Error searching users:', error);
    }
  };

  const filteredCustomers = customers.filter(customer => {
    // Filter by role if needed (only show customers)
    const isCustomer = customer.role === 'Customer';
    return isCustomer;
  });

  const handleViewDetail = async (customer: Customer) => {
    setSelectedCustomer(customer);
    setDetailModalVisible(true);
  };


  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 via-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg">
                <Users className="text-white text-2xl" />
              </div>
              <div>
                <Title level={2} className="!mb-1 bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                  Quản Lý Khách Hàng
                </Title>
                <Text type="secondary" className="text-base">
                  Quản lý thông tin khách hàng và lịch sử dịch vụ
                </Text>
                <div className="flex items-center space-x-4 mt-2">
                  <div className="flex items-center space-x-1 text-sm text-gray-500">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Hệ thống hoạt động bình thường</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    Tổng cộng: {customers.length} khách hàng
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  const fetchCustomers = async () => {
                    setLoading(true);
                    try {
                      const data = await getAllUsers();
                      setCustomers(data);
                    } catch (error: any) {
                      console.error('Error fetching customers:', error);
                      setCustomers([]);
                    } finally {
                      setLoading(false);
                    }
                  };
                  fetchCustomers();
                }}
                className="border-gray-200 hover:border-blue-500 hover:text-blue-500"
                size="large"
              >
                Làm mới
              </Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                size="large"
                className="!bg-gradient-to-r !from-indigo-500 !to-blue-600 hover:!from-indigo-600 hover:!to-blue-700 !border-0 shadow-lg"
              >
                Thêm khách hàng
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card 
          className="text-center hover:shadow-lg transition-all duration-300 border-0"
          style={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white'
          }}
        >
          <div className="flex items-center justify-center mb-3">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <Users className="text-2xl" />
            </div>
          </div>
          <Title level={3} style={{ color: 'white', fontSize: '28px', fontWeight: 'bold', margin: 0 }}>
            {customers.length}
          </Title>
          <Text style={{ color: 'white', opacity: 0.9 }}>Tổng khách hàng</Text>
        </Card>

        <Card 
          className="text-center hover:shadow-lg transition-all duration-300 border-0"
          style={{ 
            background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
            color: 'white'
          }}
        >
          <div className="flex items-center justify-center mb-3">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <Car className="text-2xl" />
            </div>
          </div>
          <Title level={3} style={{ color: 'white', fontSize: '28px', fontWeight: 'bold', margin: 0 }}>
            {customers.length}
          </Title>
          <Text style={{ color: 'white', opacity: 0.9 }}>Tổng xe đăng ký</Text>
        </Card>

        <Card 
          className="text-center hover:shadow-lg transition-all duration-300 border-0"
          style={{ 
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            color: 'white'
          }}
        >
          <div className="flex items-center justify-center mb-3">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <UserCheck className="text-2xl" />
            </div>
          </div>
          <Title level={3} style={{ color: 'white', fontSize: '28px', fontWeight: 'bold', margin: 0 }}>
            15
          </Title>
          <Text style={{ color: 'white', opacity: 0.9 }}>Khách hàng mới tháng này</Text>
        </Card>

        <Card 
          className="text-center hover:shadow-lg transition-all duration-300 border-0"
          style={{ 
            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            color: 'white'
          }}
        >
          <div className="flex items-center justify-center mb-3">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <Calendar className="text-2xl" />
            </div>
          </div>
          <Title level={3} style={{ color: 'white', fontSize: '28px', fontWeight: 'bold', margin: 0 }}>
            92%
          </Title>
          <Text style={{ color: 'white', opacity: 0.9 }}>Tỷ lệ hài lòng</Text>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card className="mb-6 border-0 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex items-center space-x-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <SearchOutlined className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm khách hàng..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  handleSearch(e.target.value);
                }}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Hoạt động</option>
              <option value="inactive">Không hoạt động</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              icon={<FilterOutlined />}
              className="border-gray-200 hover:border-blue-500 hover:text-blue-500"
            >
              Bộ lọc
            </Button>
            <div className="text-sm text-gray-500">
              Hiển thị {filteredCustomers.length} khách hàng
            </div>
          </div>
        </div>
      </Card>

      {/* Customer Table */}
      <Card className="border-0 shadow-sm">
        <div className="mb-4">
          <Title level={4} className="!mb-0 text-gray-700">
            <Users className="mr-2 text-indigo-500" />
            Danh sách khách hàng
          </Title>
          <Text type="secondary" className="text-sm">
            Quản lý và theo dõi thông tin khách hàng
          </Text>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-4 px-6 font-medium text-gray-600">Khách hàng</th>
                <th className="text-left py-4 px-6 font-medium text-gray-600">Liên hệ</th>
                <th className="text-left py-4 px-6 font-medium text-gray-600">Thông tin</th>
                <th className="text-left py-4 px-6 font-medium text-gray-600">Loại</th>
                <th className="text-left py-4 px-6 font-medium text-gray-600">Trạng thái</th>
                <th className="text-left py-4 px-6 font-medium text-gray-600">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-10">
                    <Spin size="large" />
                    <div className="mt-4 text-gray-500">Đang tải dữ liệu...</div>
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer) => (
                  <tr key={customer.userID} className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200">
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-full flex items-center justify-center">
                          <UserOutlined className="text-white text-lg" />
                        </div>
                        <div>
                          <Text strong className="text-gray-900 text-base">{customer.name}</Text>
                          <div className="text-sm text-gray-500">{customer.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2 text-sm">
                          <PhoneOutlined className="text-green-500" />
                          <Text className="text-gray-900">{customer.phone}</Text>
                        </div>
                        <div className="flex items-center space-x-2 text-sm">
                          <EnvironmentOutlined className="text-blue-500" />
                          <Text className="text-gray-600 truncate">{customer.address}</Text>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <SettingOutlined className="text-purple-500 text-sm" />
                          <Tag color="blue" className="border-0">{customer.role}</Tag>
                        </div>
                        <div className="text-xs text-gray-500">
                          @{customer.username}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <Users className="text-indigo-500 text-sm" />
                        <Text strong className="text-gray-900">Khách hàng</Text>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <Tag color="green" className="border-0">Hoạt động</Tag>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <Space size="small">
                        <Tooltip title="Xem chi tiết">
                          <Button
                            icon={<EyeOutlined />}
                            onClick={() => handleViewDetail(customer)}
                            className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all duration-200"
                            size="small"
                          >
                            Xem
                          </Button>
                        </Tooltip>
                        <Tooltip title="Chỉnh sửa">
                          <Button
                            icon={<EditOutlined />}
                            className="text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-all duration-200"
                            size="small"
                          >
                            Sửa
                          </Button>
                        </Tooltip>
                        <Tooltip title="Xóa khách hàng">
                          <Button
                            danger
                            icon={<DeleteOutlined />}
                            className="rounded-lg transition-all duration-200"
                            size="small"
                          >
                            Xóa
                          </Button>
                        </Tooltip>
                      </Space>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Customer Details Modal */}
      <Modal
        title={
          <div className="flex items-center py-2">
            <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-lg flex items-center justify-center mr-3">
              <Users className="text-white text-lg" />
            </div>
            <div>
              <div className="text-lg font-semibold text-gray-800">Chi tiết khách hàng</div>
              <div className="text-sm text-gray-500">Thông tin chi tiết về khách hàng</div>
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
            className="!bg-gradient-to-r !from-indigo-500 !to-blue-600 hover:!from-indigo-600 hover:!to-blue-700 !border-0 px-6"
          >
            Chỉnh sửa
          </Button>,
        ]}
        width={800}
        className="rounded-lg"
      >
        {selectedCustomer && (
          <div className="py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-3">
                    <UserOutlined className="text-indigo-500" />
                    <Text strong className="text-gray-700">Thông tin cá nhân</Text>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-sm">
                      <MailOutlined className="text-blue-500" />
                      <Text type="secondary">Email:</Text>
                      <Text className="font-medium">{selectedCustomer.email}</Text>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <PhoneOutlined className="text-green-500" />
                      <Text type="secondary">Điện thoại:</Text>
                      <Text className="font-medium">{selectedCustomer.phone}</Text>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <EnvironmentOutlined className="text-purple-500" />
                      <Text type="secondary">Địa chỉ:</Text>
                      <Text className="font-medium">{selectedCustomer.address}</Text>
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
                      <Text type="secondary">Username:</Text>
                      <Text className="font-medium">@{selectedCustomer.username}</Text>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <Text type="secondary">Role:</Text>
                      <Tag color="blue" className="border-0">{selectedCustomer.role}</Tag>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <Text type="secondary">User ID:</Text>
                      <Badge count={selectedCustomer.userID} style={{ backgroundColor: '#1890ff' }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <Divider />
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-3">
                <Car className="text-indigo-500" />
                <Text strong className="text-gray-700">Thông tin bổ sung</Text>
              </div>
              <Text className="text-gray-500 text-sm leading-relaxed">
                Để xem thông tin chi tiết về xe và lịch sử dịch vụ, vui lòng sử dụng các chức năng quản lý xe và lịch hẹn riêng biệt.
              </Text>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CustomerManagement;