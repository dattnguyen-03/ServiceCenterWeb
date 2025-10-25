import React, { useState, useEffect } from 'react';
import { Building2, Plus, Phone, MapPin } from 'lucide-react';
import { Card, Button, Modal, Typography, Space, Badge, Tooltip, Form, Input, Select, message } from 'antd';
import Swal from 'sweetalert2';
import { ReloadOutlined, SearchOutlined, FilterOutlined, PlusOutlined, EyeOutlined, EditOutlined, DeleteOutlined, UserOutlined } from '@ant-design/icons';
import { 
  getAllServiceCenters, 
  searchServiceCenters, 
  createServiceCenter, 
  editServiceCenter, 
  deleteServiceCenter,
  type ServiceCenter,
  type CreateServiceCenterDTO,
  type EditServiceCenterDTO
} from '../../services/serviceCenterManagementService';
import { getAllUsers, type UserListItem } from '../../services/userService';

const { Title, Text } = Typography;
const { Option } = Select;

const ServiceCenterManagement: React.FC = () => {
  const [serviceCenters, setServiceCenters] = useState<ServiceCenter[]>([]);
  const [filteredCenters, setFilteredCenters] = useState<ServiceCenter[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedCenter, setSelectedCenter] = useState<ServiceCenter | null>(null);
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [form] = Form.useForm();

  // Load data
  useEffect(() => {
    loadServiceCenters();
    loadUsers();
  }, []);

  // Filter centers based on search text
  useEffect(() => {
    console.log('useEffect triggered - serviceCenters:', serviceCenters);
    console.log('useEffect triggered - filteredCenters:', filteredCenters);
    
    if (!serviceCenters) return;
    
    if (searchText.trim() === '') {
      setFilteredCenters(serviceCenters);
    } else {
      const filtered = serviceCenters.filter(center =>
        center.name.toLowerCase().includes(searchText.toLowerCase()) ||
        center.address.toLowerCase().includes(searchText.toLowerCase()) ||
        center.phone.includes(searchText)
      );
      setFilteredCenters(filtered);
    }
  }, [searchText, serviceCenters]);

  const loadServiceCenters = async () => {
    try {
      setLoading(true);
      const data = await getAllServiceCenters();
      console.log('Component received data:', data);
      console.log('Data type:', typeof data);
      console.log('Data length:', data?.length);
      setServiceCenters(data || []);
      setFilteredCenters(data || []);
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Lỗi!',
        text: 'Lỗi khi tải danh sách trung tâm dịch vụ',
        confirmButtonColor: '#ef4444'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const data = await getAllUsers();
      // Chỉ lấy users có role Admin hoặc Staff để làm manager
      const managerUsers = (data || []).filter(user => 
        user.role === 'Admin' || user.role === 'Staff'
      );
      setUsers(managerUsers);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const handleSearch = async () => {
    if (searchText.trim() === '') {
      loadServiceCenters();
      return;
    }

    try {
      setLoading(true);
      const data = await searchServiceCenters(searchText);
      setServiceCenters(data || []);
      setFilteredCenters(data || []);
    } catch (error) {
      message.error('Lỗi khi tìm kiếm trung tâm dịch vụ');
    } finally {
      setLoading(false);
    }
  };

  const handleView = (center: ServiceCenter) => {
    if (!center) {
      console.error('Center is undefined');
      return;
    }
    setSelectedCenter(center);
    setDetailModalVisible(true);
  };

  const handleEdit = (center: ServiceCenter) => {
    console.log('Editing center:', center);
    if (!center) {
      console.error('Center is undefined');
      return;
    }
    setSelectedCenter(center);
    form.setFieldsValue({
      name: center.name || '',
      address: center.address || '',
      phone: center.phone || '',
      managerID: center.managerID || undefined
    });
    setEditModalVisible(true);
  };

  const handleDelete = async (center: ServiceCenter) => {
    console.log('Deleting center:', center);
    if (!center) {
      console.error('Center is undefined');
      return;
    }
    
    const result = await Swal.fire({
      title: 'Xác nhận xóa',
      text: `Bạn có chắc chắn muốn xóa trung tâm "${center.name || 'này'}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy'
    });

    if (result.isConfirmed) {
      try {
        console.log('Confirming delete for center ID:', center.centerID);
        await deleteServiceCenter(center.centerID);
        Swal.fire({
          icon: 'success',
          title: 'Thành công!',
          text: 'Xóa trung tâm dịch vụ thành công',
          confirmButtonColor: '#10b981'
        });
        loadServiceCenters();
      } catch (error) {
        console.error('Delete error:', error);
        Swal.fire({
          icon: 'error',
          title: 'Lỗi!',
          text: 'Lỗi khi xóa trung tâm dịch vụ',
          confirmButtonColor: '#ef4444'
        });
      }
    }
  };

  const handleCreate = () => {
    setSelectedCenter(null);
    form.resetFields();
    setEditModalVisible(true);
  };

  const handleSubmit = async (values: any) => {
    try {
      if (selectedCenter) {
        // Edit mode
        const editData: EditServiceCenterDTO = {
          centerID: selectedCenter.centerID,
          name: values.name,
          address: values.address,
          phone: values.phone,
          managerID: values.managerID
        };
        await editServiceCenter(editData);
        Swal.fire({
          icon: 'success',
          title: 'Thành công!',
          text: 'Cập nhật trung tâm dịch vụ thành công',
          confirmButtonColor: '#10b981'
        });
      } else {
        // Create mode
        const createData: CreateServiceCenterDTO = {
          name: values.name,
          address: values.address,
          phone: values.phone,
          managerID: values.managerID
        };
        await createServiceCenter(createData);
        Swal.fire({
          icon: 'success',
          title: 'Thành công!',
          text: 'Tạo trung tâm dịch vụ thành công',
          confirmButtonColor: '#10b981'
        });
      }
      
      setEditModalVisible(false);
      loadServiceCenters();
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Lỗi!',
        text: 'Lỗi khi lưu trung tâm dịch vụ',
        confirmButtonColor: '#ef4444'
      });
    }
  };

  const columns: any[] = [
    {
      title: 'ID',
      dataIndex: 'centerID',
      key: 'centerID',
      width: 80,
      render: (id: number, record: ServiceCenter) => (
        <Badge count={id} style={{ backgroundColor: '#1890ff' }} />
      )
    },
    {
      title: 'Tên trung tâm',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      render: (text: string, record: ServiceCenter) => (
        <div className="flex items-center space-x-2">
          <Building2 className="text-blue-500 w-4 h-4" />
          <span className="font-medium">{text}</span>
        </div>
      )
    },
    {
      title: 'Địa chỉ',
      dataIndex: 'address',
      key: 'address',
      width: 300,
      render: (text: string, record: ServiceCenter) => (
        <div className="flex items-center space-x-2">
          <MapPin className="text-green-500 w-4 h-4" />
          <span className="text-gray-600">{text}</span>
        </div>
      )
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phone',
      key: 'phone',
      width: 150,
      render: (text: string, record: ServiceCenter) => (
        <div className="flex items-center space-x-2">
          <Phone className="text-purple-500 w-4 h-4" />
          <span className="text-gray-600">{text}</span>
        </div>
      )
    },
    {
      title: 'Quản lý',
      dataIndex: 'managerName',
      key: 'managerName',
      width: 200,
      render: (managerName: string, record: ServiceCenter) => (
        <div className="flex items-center space-x-2">
          <UserOutlined className="text-orange-500" />
          <span className="text-gray-600">
            {managerName || 'Chưa có'}
          </span>
        </div>
      )
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 150,
      render: (value: any, record: ServiceCenter) => {
        console.log('Rendering action buttons for record:', record);
        if (!record) {
          console.error('Record is undefined in action column');
          return <span>Error</span>;
        }
        return (
          <Space size="small">
            <Tooltip title="Xem chi tiết">
              <Button
                icon={<EyeOutlined />}
                onClick={() => handleView(record)}
                className="!bg-gradient-to-r !from-blue-500 !to-cyan-600 hover:!from-blue-600 hover:!to-cyan-700 !border-0 text-white"
              />
            </Tooltip>
            <Tooltip title="Chỉnh sửa">
              <Button
                icon={<EditOutlined />}
                onClick={() => handleEdit(record)}
                className="!bg-gradient-to-r !from-green-500 !to-emerald-600 hover:!from-green-600 hover:!to-emerald-700 !border-0 text-white"
              />
            </Tooltip>
            <Tooltip title="Xóa">
              <Button
                icon={<DeleteOutlined />}
                onClick={() => handleDelete(record)}
                className="!bg-gradient-to-r !from-red-500 !to-pink-600 hover:!from-red-600 hover:!to-pink-700 !border-0 text-white"
              />
            </Tooltip>
          </Space>
        );
      }
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Building2 className="text-white text-2xl" />
          </div>
          <Title level={3} className="text-gray-700 mb-2">Đang tải dữ liệu...</Title>
          <Text type="secondary">Vui lòng chờ trong giây lát</Text>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <Card className="mb-6 shadow-lg border-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center">
              <Building2 className="text-white text-xl" />
            </div>
            <div>
              <Title level={2} className="!mb-0 text-gray-800">Quản lý Trung tâm Dịch vụ</Title>
              <Text type="secondary" className="text-base">
                Quản lý thông tin các trung tâm dịch vụ trong hệ thống
              </Text>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">{serviceCenters?.length || 0}</div>
              <div className="text-sm text-gray-500">Trung tâm</div>
            </div>
            {/* <Button
              icon={<ReloadOutlined />}
              onClick={loadServiceCenters}
              className="!bg-gradient-to-r !from-gray-500 !to-gray-600 hover:!from-gray-600 hover:!to-gray-700 !border-0 text-white"
            >
              Làm mới
            </Button> */}
            {/* <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreate}
              className="!bg-gradient-to-r !from-blue-500 !to-cyan-600 hover:!from-blue-600 hover:!to-cyan-700 !border-0"
            >
              Thêm trung tâm
            </Button> */}
          </div>
        </div>
      </Card>

      {/* Search and Filter Bar */}
      <Card className="mb-6 shadow-lg border-0">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <Input
              placeholder="Tìm kiếm theo tên, địa chỉ hoặc số điện thoại..."
              prefix={<SearchOutlined className="text-gray-400" />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onPressEnter={handleSearch}
              className="h-10"
            />
          </div>
          <Button
            icon={<SearchOutlined />}
            onClick={handleSearch}
            className="!bg-gradient-to-r !from-blue-500 !to-cyan-600 hover:!from-blue-600 hover:!to-cyan-700 !border-0 text-white h-10 px-6"
          >
            Tìm kiếm
          </Button>
          <Button
            icon={<FilterOutlined />}
            className="!bg-gradient-to-r !from-gray-500 !to-gray-600 hover:!from-gray-600 hover:!to-gray-700 !border-0 text-white h-10 px-6"
          >
            Bộ lọc
          </Button>
          <div className="text-sm text-gray-500">
            Hiển thị {filteredCenters?.length || 0} / {serviceCenters?.length || 0} trung tâm
          </div>
        </div>
      </Card>

      {/* Service Centers Table */}
      <Card className="shadow-lg border-0">
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Building2 className="text-blue-500 w-5 h-5" />
              <Title level={4} className="!mb-0 text-gray-800">Danh sách Trung tâm Dịch vụ</Title>
            </div>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreate}
              className="!bg-gradient-to-r !from-blue-500 !to-cyan-600 hover:!from-blue-600 hover:!to-cyan-700 !border-0"
            >
              Thêm trung tâm
            </Button>
          </div>
          <Text type="secondary">Quản lý thông tin chi tiết các trung tâm dịch vụ</Text>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className="text-left py-3 px-4 font-semibold text-gray-700 bg-gray-50"
                    style={{ width: col.width }}
                  >
                    {col.title}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(() => {
                console.log('Rendering table - filteredCenters:', filteredCenters);
                return null;
              })()}
              {filteredCenters && filteredCenters.length > 0 ? (
                filteredCenters.map((center) => (
                  <tr
                    key={center.centerID}
                    className="border-b border-gray-100 hover:bg-blue-50 transition-colors duration-200"
                  >
                    {columns.map((col) => (
                      <td key={col.key} className="py-3 px-4">
                        {col.render ? col.render(col.dataIndex ? center[col.dataIndex as keyof ServiceCenter] : undefined, center) : String(col.dataIndex ? center[col.dataIndex as keyof ServiceCenter] || '' : '')}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="py-8 px-4 text-center text-gray-500">
                    {loading ? 'Đang tải...' : 'Không có dữ liệu'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Service Center Details Modal */}
      <Modal
        title={
          <div className="flex items-center py-2">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center mr-3">
              <Building2 className="text-white text-lg" />
            </div>
            <div>
              <div className="text-lg font-semibold text-gray-800">Chi tiết trung tâm dịch vụ</div>
              <div className="text-sm text-gray-500">Thông tin chi tiết về trung tâm</div>
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
              handleEdit(selectedCenter!);
            }}
            className="!bg-gradient-to-r !from-blue-500 !to-cyan-600 hover:!from-blue-600 hover:!to-cyan-700 !border-0 px-6"
          >
            Chỉnh sửa
          </Button>
        ]}
        width={800}
        className="rounded-lg"
      >
        {selectedCenter && (
          <div className="py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-3">
                    <Building2 className="text-blue-500" />
                    <Text strong className="text-gray-700">Thông tin cơ bản</Text>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-sm">
                      <Text type="secondary">Tên trung tâm:</Text>
                      <Text className="font-medium">{selectedCenter.name}</Text>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <MapPin className="text-green-500" />
                      <Text type="secondary">Địa chỉ:</Text>
                      <Text className="font-medium">{selectedCenter.address}</Text>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <Phone className="text-purple-500" />
                      <Text type="secondary">Số điện thoại:</Text>
                      <Text className="font-medium">{selectedCenter.phone}</Text>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-3">
                    <UserOutlined className="text-orange-500" />
                    <Text strong className="text-gray-700">Thông tin quản lý</Text>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-sm">
                      <Text type="secondary">Quản lý:</Text>
                      <Text className="font-medium">
                        {selectedCenter.managerName || 'Chưa có'}
                      </Text>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <Text type="secondary">Manager ID:</Text>
                      <Text className="font-medium">
                        {selectedCenter.managerID || 'N/A'}
                      </Text>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <Text type="secondary">Center ID:</Text>
                      <Badge count={selectedCenter.centerID} style={{ backgroundColor: '#1890ff' }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Create/Edit Modal */}
      <Modal
        title={
          <div className="flex items-center py-2">
            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center mr-3">
              <Plus className="text-white text-lg" />
            </div>
            <div>
              <div className="text-lg font-semibold text-gray-800">
                {selectedCenter ? 'Chỉnh sửa trung tâm' : 'Tạo trung tâm mới'}
              </div>
              <div className="text-sm text-gray-500">
                {selectedCenter ? 'Cập nhật thông tin trung tâm' : 'Thêm trung tâm dịch vụ mới'}
              </div>
            </div>
          </div>
        }
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setEditModalVisible(false)} className="px-6">
            Hủy
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={() => form.submit()}
            className="!bg-gradient-to-r !from-green-500 !to-emerald-600 hover:!from-green-600 hover:!to-emerald-700 !border-0 px-6"
          >
            {selectedCenter ? 'Cập nhật' : 'Tạo mới'}
          </Button>
        ]}
        width={600}
        className="rounded-lg"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="py-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              name="name"
              label={
                <div className="flex items-center space-x-2">
                  <Building2 className="text-blue-500" />
                  <span>Tên trung tâm</span>
                </div>
              }
              rules={[{ required: true, message: 'Vui lòng nhập tên trung tâm' }]}
            >
              <Input placeholder="Nhập tên trung tâm" />
            </Form.Item>

            <Form.Item
              name="phone"
              label={
                <div className="flex items-center space-x-2">
                  <Phone className="text-purple-500" />
                  <span>Số điện thoại</span>
                </div>
              }
              rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
            >
              <Input placeholder="Nhập số điện thoại" />
            </Form.Item>
          </div>

          <Form.Item
            name="address"
            label={
              <div className="flex items-center space-x-2">
                <MapPin className="text-green-500" />
                <span>Địa chỉ</span>
              </div>
            }
            rules={[{ required: true, message: 'Vui lòng nhập địa chỉ' }]}
          >
            <Input.TextArea 
              placeholder="Nhập địa chỉ trung tâm" 
              rows={3}
              showCount
              maxLength={200}
            />
          </Form.Item>

          <Form.Item
            name="managerID"
            label={
              <div className="flex items-center space-x-2">
                <UserOutlined className="text-orange-500" />
                <span>Quản lý (Admin/Staff)</span>
              </div>
            }
            rules={[
              {
                validator: (_, value) => {
                  if (value) {
                    const selectedUser = users.find(u => u.userID === value);
                    if (selectedUser && (selectedUser.role !== 'Admin' && selectedUser.role !== 'Staff')) {
                      return Promise.reject(new Error('Chỉ có thể chọn Admin hoặc Staff làm quản lý'));
                    }
                  }
                  return Promise.resolve();
                }
              }
            ]}
          >
            <Select
              placeholder="Chọn quản lý trung tâm (Admin/Staff)"
              allowClear
              showSearch
              optionFilterProp="children"
            >
              {users && users.map((user) => (
                <Option key={user.userID} value={user.userID}>
                  {user.name} ({user.email}) - {user.role}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ServiceCenterManagement;
