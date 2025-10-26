import React, { useState, useEffect } from 'react';
import { Table, Card, Input, Button, Tabs, Modal, message, Spin, Statistic, Tag } from 'antd';
import { SearchOutlined, UserOutlined, TeamOutlined, CarOutlined, EyeOutlined } from '@ant-design/icons';
import { getAllUsers } from '../../services/userService';
import { vehicleService } from '../../services/vehicleService';

const { TabPane } = Tabs;

interface Customer {
  userID: number;
  username: string;
  role: string;
  name: string;
  email: string;
  phone: string;
  address: string;
}

interface Vehicle {
  vehicleID: number;
  ownerName: string;
  model: string;
  vin: string;
  licensePlate: string;
  year: number;
  notes?: string;
  lastServiceDate?: string;
  nextServiceDate?: string;
}

const CustomerVehicleManagement: React.FC = () => {
  const [isCustomerDetailModalVisible, setIsCustomerDetailModalVisible] = useState(false);
  const [isTechnicianDetailModalVisible, setIsTechnicianDetailModalVisible] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [technicians, setTechnicians] = useState<Customer[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [customerVehicles, setCustomerVehicles] = useState<Vehicle[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedTechnician, setSelectedTechnician] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(false);
  const [customerSearchText, setCustomerSearchText] = useState('');
  const [technicianSearchText, setTechnicianSearchText] = useState('');
  const [vehicleSearchText, setVehicleSearchText] = useState('');

  // Fetch customers and technicians from API
  const fetchUsers = async () => {
    try {
      setLoading(true);
      console.log('Fetching users...');
      const users = await getAllUsers();
      console.log('Users received:', users);
      
      // Separate customers and technicians
      const customerList = users.filter(user => user.role === 'Customer');
      const technicianList = users.filter(user => user.role === 'Technician');
      
      console.log('Customer list:', customerList);
      console.log('Technician list:', technicianList);
      
      setCustomers(customerList);
      setTechnicians(technicianList);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      message.error(`Không thể tải danh sách người dùng: ${error?.message || 'Lỗi không xác định'}`);
    } finally {
      setLoading(false);
    }
  };

  // Fetch vehicles from API
  const fetchVehicles = async () => {
    try {
      setLoading(true);
      console.log('Fetching vehicles...');
      const vehiclesData = await vehicleService.getAllVehicles();
      console.log('Vehicles received:', vehiclesData);
      setVehicles(vehiclesData);
    } catch (error: any) {
      console.error('Error fetching vehicles:', error);
      message.error(`Không thể tải danh sách xe: ${error?.message || 'Lỗi không xác định'}`);
    } finally {
      setLoading(false);
    }
  };

  // Fetch vehicles for a specific customer
  const fetchCustomerVehicles = async (customerId: number) => {
    try {
      setLoading(true);
      // Filter vehicles by owner name from the existing vehicles list
      const customer = customers.find(c => c.userID === customerId);
      if (customer) {
        const customerVehiclesList = vehicles.filter(vehicle => 
          vehicle.ownerName === customer.name
        );
        setCustomerVehicles(customerVehiclesList);
      } else {
        setCustomerVehicles([]);
      }
    } catch (error) {
      console.error('Error fetching customer vehicles:', error);
      message.error('Không thể tải danh sách xe của khách hàng');
    } finally {
      setLoading(false);
    }
  };

  // Handle view customer detail
  const handleViewCustomerDetail = async (customer: Customer) => {
    setSelectedCustomer(customer);
    await fetchCustomerVehicles(customer.userID);
    setIsCustomerDetailModalVisible(true);
  };

  // Handle view technician detail
  const handleViewTechnicianDetail = (technician: Customer) => {
    setSelectedTechnician(technician);
    setIsTechnicianDetailModalVisible(true);
  };

  useEffect(() => {
    fetchUsers();
    fetchVehicles();
  }, []);

  const customerColumns = [
    {
      title: 'Họ tên',
      dataIndex: 'name',
      key: 'name',
      sorter: (a: Customer, b: Customer) => a.name.localeCompare(b.name),
    },
    {
      title: 'Tên đăng nhập',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => (
        <Tag color={role === 'Customer' ? 'blue' : 'green'}>
          {role === 'Customer' ? 'Khách hàng' : 'Kỹ thuật viên'}
        </Tag>
      ),
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Địa chỉ',
      dataIndex: 'address',
      key: 'address',
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, record: Customer) => (
        <Button 
          type="primary" 
          icon={<EyeOutlined />} 
          onClick={() => handleViewCustomerDetail(record)}
          size="small"
        >
          Chi tiết
        </Button>
      ),
    },
  ];

  const technicianColumns = [
    {
      title: 'Họ tên',
      dataIndex: 'name',
      key: 'name',
      sorter: (a: Customer, b: Customer) => a.name.localeCompare(b.name),
    },
    {
      title: 'Tên đăng nhập',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Địa chỉ',
      dataIndex: 'address',
      key: 'address',
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, record: Customer) => (
        <Button 
          type="primary" 
          icon={<EyeOutlined />} 
          onClick={() => handleViewTechnicianDetail(record)}
          size="small"
        >
          Chi tiết
        </Button>
      ),
    },
  ];

  const vehicleColumns = [
    {
      title: 'Biển số',
      dataIndex: 'licensePlate',
      key: 'licensePlate',
    },
    {
      title: 'Model',
      dataIndex: 'model',
      key: 'model',
    },
    {
      title: 'Số VIN',
      dataIndex: 'vin',
      key: 'vin',
    },
    {
      title: 'Năm sản xuất',
      dataIndex: 'year',
      key: 'year',
    },
    {
      title: 'Chủ xe',
      dataIndex: 'ownerName',
      key: 'ownerName',
    },
    {
      title: 'Lần cuối bảo dưỡng',
      dataIndex: 'lastServiceDate',
      key: 'lastServiceDate',
      render: (date: string) => date ? new Date(date).toLocaleDateString('vi-VN') : 'Chưa có',
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: () => (
        <div className="space-x-2">
          <Button type="link">Lịch sử</Button>
        </div>
      ),
    },
  ];

  // Filter customers based on search text
  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(customerSearchText.toLowerCase()) ||
    customer.email.toLowerCase().includes(customerSearchText.toLowerCase()) ||
    customer.phone.includes(customerSearchText) ||
    customer.username.toLowerCase().includes(customerSearchText.toLowerCase())
  );

  // Filter technicians based on search text
  const filteredTechnicians = technicians.filter(technician =>
    technician.name.toLowerCase().includes(technicianSearchText.toLowerCase()) ||
    technician.email.toLowerCase().includes(technicianSearchText.toLowerCase()) ||
    technician.phone.includes(technicianSearchText) ||
    technician.username.toLowerCase().includes(technicianSearchText.toLowerCase())
  );

  // Filter vehicles based on search text
  const filteredVehicles = vehicles.filter(vehicle =>
    vehicle.licensePlate.toLowerCase().includes(vehicleSearchText.toLowerCase()) ||
    vehicle.model.toLowerCase().includes(vehicleSearchText.toLowerCase()) ||
    vehicle.vin.toLowerCase().includes(vehicleSearchText.toLowerCase()) ||
    vehicle.ownerName.toLowerCase().includes(vehicleSearchText.toLowerCase())
  );

  return (
    <div className="p-0">
      {/* Header Section - Matching Admin Style */}
      <div className="mb-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 via-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg">
                <UserOutlined className="text-white text-3xl" />
              </div>
              <div>
                <h2 className="!mb-1 text-2xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                  Quản Lý Khách Hàng & Xe
                </h2>
                <p className="text-gray-600 text-base">
                  Quản lý thông tin khách hàng, kỹ thuật viên và danh sách xe
                </p>
                <div className="flex items-center space-x-4 mt-2">
                  <div className="flex items-center space-x-1 text-sm text-gray-500">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Hệ thống hoạt động bình thường</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    Tổng: {customers.length} KH | {technicians.length} KTV | {vehicles.length} Xe
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards - Matching Admin Style */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="shadow-sm hover:shadow-md transition-shadow border border-gray-100">
          <Statistic
            title={<span className="text-gray-600">Tổng khách hàng</span>}
            value={customers.length}
            prefix={<UserOutlined className="text-blue-500" />}
            valueStyle={{ color: '#3b82f6' }}
          />
        </Card>
        <Card className="shadow-sm hover:shadow-md transition-shadow border border-gray-100">
          <Statistic
            title={<span className="text-gray-600">Kỹ thuật viên</span>}
            value={technicians.length}
            prefix={<TeamOutlined className="text-green-500" />}
            valueStyle={{ color: '#10b981' }}
          />
        </Card>
        <Card className="shadow-sm hover:shadow-md transition-shadow border border-gray-100">
          <Statistic
            title={<span className="text-gray-600">Tổng số xe</span>}
            value={vehicles.length}
            prefix={<CarOutlined className="text-orange-500" />}
            valueStyle={{ color: '#f97316' }}
          />
        </Card>
      </div>

      <Tabs
        defaultActiveKey="customers"
        size="large"
        className="bg-white rounded-2xl shadow-sm border border-gray-100"
      >
        <TabPane tab={<span className="flex items-center gap-2"><UserOutlined /> Khách hàng</span>} key="customers">
          <div className="p-6">
            <div className="mb-4">
              <Input
                placeholder="Tìm kiếm theo tên, email, số điện thoại..."
                prefix={<SearchOutlined />}
                size="large"
                className="w-full max-w-md"
                value={customerSearchText}
                onChange={(e) => setCustomerSearchText(e.target.value)}
              />
            </div>
            <Spin spinning={loading}>
              <Table
                columns={customerColumns}
                dataSource={filteredCustomers}
                rowKey="userID"
                pagination={{ pageSize: 10 }}
              />
            </Spin>
          </div>
        </TabPane>

        <TabPane tab={<span className="flex items-center gap-2"><TeamOutlined /> Kỹ thuật viên</span>} key="technicians">
          <div className="p-6">
            <div className="mb-4">
              <Input
                placeholder="Tìm kiếm theo tên, email, số điện thoại..."
                prefix={<SearchOutlined />}
                size="large"
                className="w-full max-w-md"
                value={technicianSearchText}
                onChange={(e) => setTechnicianSearchText(e.target.value)}
              />
            </div>
            <Spin spinning={loading}>
              <Table
                columns={technicianColumns}
                dataSource={filteredTechnicians}
                rowKey="userID"
                pagination={{ pageSize: 10 }}
              />
            </Spin>
          </div>
        </TabPane>

        <TabPane tab={<span className="flex items-center gap-2"><CarOutlined /> Xe</span>} key="vehicles">
          <div className="p-6">
            <div className="mb-4">
              <Input
                placeholder="Tìm kiếm theo biển số, model, VIN, tên chủ xe..."
                prefix={<SearchOutlined />}
                size="large"
                className="w-full max-w-md"
                value={vehicleSearchText}
                onChange={(e) => setVehicleSearchText(e.target.value)}
              />
            </div>
            <Spin spinning={loading}>
              <Table
                columns={vehicleColumns}
                dataSource={filteredVehicles}
                rowKey="vehicleID"
                pagination={{ pageSize: 10 }}
              />
            </Spin>
          </div>
        </TabPane>
      </Tabs>


      {/* Customer Detail Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <UserOutlined className="text-blue-500" />
            <span>Chi tiết khách hàng: <strong>{selectedCustomer?.name}</strong></span>
          </div>
        }
        open={isCustomerDetailModalVisible}
        onCancel={() => setIsCustomerDetailModalVisible(false)}
        footer={null}
        width={1000}
        className="custom-modal"
      >
        {selectedCustomer && (
          <div className="space-y-6">
            <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <UserOutlined className="text-blue-500" />
                Thông tin khách hàng
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="text-gray-600">Họ tên:</div>
                  <div className="font-medium text-gray-800">{selectedCustomer.name}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-gray-600">Tên đăng nhập:</div>
                  <div className="font-medium text-gray-800">{selectedCustomer.username}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-gray-600">Email:</div>
                  <div className="font-medium text-gray-800">{selectedCustomer.email}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-gray-600">Số điện thoại:</div>
                  <div className="font-medium text-gray-800">{selectedCustomer.phone}</div>
                </div>
                <div className="col-span-2 space-y-2">
                  <div className="text-gray-600">Địa chỉ:</div>
                  <div className="font-medium text-gray-800">{selectedCustomer.address}</div>
                </div>
              </div>
            </Card>

            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <CarOutlined className="text-orange-500" />
                Danh sách xe ({customerVehicles.length})
              </h3>
              <Spin spinning={loading}>
                {customerVehicles.length > 0 ? (
                  <Table
                    columns={vehicleColumns.filter(col => col.key !== 'action')}
                    dataSource={customerVehicles}
                    rowKey="vehicleID"
                    pagination={{ pageSize: 5 }}
                    size="small"
                    className="shadow-sm"
                  />
                ) : (
                  <Card className="bg-gray-50 text-center py-12">
                    <CarOutlined className="text-4xl text-gray-400 mb-3" />
                    <p className="text-gray-500 text-lg">Khách hàng này chưa có xe nào</p>
                  </Card>
                )}
              </Spin>
            </div>
          </div>
        )}
      </Modal>

      {/* Technician Detail Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <TeamOutlined className="text-green-500" />
            <span>Chi tiết kỹ thuật viên: <strong>{selectedTechnician?.name}</strong></span>
          </div>
        }
        open={isTechnicianDetailModalVisible}
        onCancel={() => setIsTechnicianDetailModalVisible(false)}
        footer={null}
        width={800}
        className="custom-modal"
      >
        {selectedTechnician && (
          <div className="space-y-6">
            <Card className="bg-gradient-to-r from-green-50 to-emerald-100 border-green-200">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <TeamOutlined className="text-green-500" />
                Thông tin kỹ thuật viên
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="text-gray-600">Họ tên:</div>
                  <div className="font-medium text-gray-800">{selectedTechnician.name}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-gray-600">Tên đăng nhập:</div>
                  <div className="font-medium text-gray-800">{selectedTechnician.username}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-gray-600">Email:</div>
                  <div className="font-medium text-gray-800">{selectedTechnician.email}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-gray-600">Số điện thoại:</div>
                  <div className="font-medium text-gray-800">{selectedTechnician.phone}</div>
                </div>
                <div className="col-span-2 space-y-2">
                  <div className="text-gray-600">Địa chỉ:</div>
                  <div className="font-medium text-gray-800">{selectedTechnician.address}</div>
                </div>
                <div className="col-span-2 space-y-2">
                  <div className="text-gray-600">Vai trò:</div>
                  <Tag color="green" className="text-sm py-1 px-3">Kỹ thuật viên</Tag>
                </div>
              </div>
            </Card>

            <Card className="bg-gradient-to-r from-blue-50 to-cyan-100 border-blue-200">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <TeamOutlined className="text-blue-500" />
                Thông tin công việc
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="text-gray-600">Trạng thái:</div>
                  <Tag color="success" className="px-3 py-1">Hoạt động</Tag>
                </div>
                <div className="space-y-2">
                  <div className="text-gray-600">Kinh nghiệm:</div>
                  <div className="font-medium text-gray-800">2+ năm</div>
                </div>
                <div className="space-y-2">
                  <div className="text-gray-600">Chuyên môn:</div>
                  <div className="font-medium text-gray-800">Bảo dưỡng xe điện</div>
                </div>
                <div className="space-y-2">
                  <div className="text-gray-600">Đánh giá:</div>
                  <div className="font-medium text-orange-500">⭐⭐⭐⭐⭐ (4.8/5)</div>
                </div>
              </div>
            </Card>

            <Card>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <EyeOutlined className="text-gray-400" />
                Lịch sử công việc gần đây
              </h3>
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <TeamOutlined className="text-4xl text-gray-300 mb-3" />
                <p className="text-gray-500 text-base">Chức năng đang phát triển</p>
                <p className="text-gray-400 text-sm mt-2">Hiển thị các công việc đã thực hiện, đánh giá từ khách hàng...</p>
              </div>
            </Card>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CustomerVehicleManagement;