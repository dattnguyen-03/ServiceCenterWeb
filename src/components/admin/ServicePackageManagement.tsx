import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Table, Tag, Space, Spin, message, Typography, Statistic, Modal, Form, Input, InputNumber, Badge, Tooltip, Divider } from 'antd';
import { 
  GiftOutlined, 
  EditOutlined, 
  EyeOutlined, 
  PlusOutlined,
  DeleteOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  StarOutlined,
  SaveOutlined,
  SearchOutlined,
  FilterOutlined,
  ReloadOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import { ServicePackage } from '../../types/api';
import { servicePackageService } from '../../services/servicePackageService';
import servicePackageManagementService from '../../services/servicePackageManagementService';

const { Title, Text } = Typography;
const { TextArea } = Input;

const AdminServicePackageManagement: React.FC = () => {
  const [packages, setPackages] = useState<ServicePackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPackage, setSelectedPackage] = useState<ServicePackage | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [form] = Form.useForm();

  useEffect(() => {
    loadServicePackages();
  }, []);

  const loadServicePackages = async () => {
    try {
      setLoading(true);
      const servicePackages = await servicePackageService.getServicePackages();
      setPackages(servicePackages);
    } catch (error: any) {
      console.error('Error loading service packages:', error);
      message.error(error.message || 'Không thể tải danh sách gói dịch vụ');
      setPackages([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = (pkg: ServicePackage) => {
    setSelectedPackage(pkg);
    setDetailModalVisible(true);
  };

  const handleEditPackage = (pkg: ServicePackage) => {
    setSelectedPackage(pkg);
    form.setFieldsValue({
      name: pkg.name,
      description: pkg.description,
      price: pkg.price,
    });
    setEditModalVisible(true);
  };

  const handleAddPackage = () => {
    setSelectedPackage(null);
    form.resetFields();
    setAddModalVisible(true);
  };

  const handleDeletePackage = (pkg: ServicePackage) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: `Bạn có chắc chắn muốn xóa gói "${pkg.name}"?`,
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          const result = await servicePackageManagementService.deleteServicePackage(pkg.packageID);
          message.success(result.message || `Đã xóa gói: ${pkg.name}`);
          await loadServicePackages();
        } catch (error: any) {
          console.error('Error deleting service package:', error);
          message.error(error.message || 'Có lỗi xảy ra khi xóa gói dịch vụ');
        }
      },
    });
  };

  const handleSavePackage = async (values: any) => {
    try {
      console.log('Form values:', values);
      
      if (selectedPackage) {
        // Edit existing package
        const editData = {
          PackageID: selectedPackage.packageID,
          Name: values.name,
          Description: values.description,
          Price: Number(values.price),
        };
        console.log('Selected package:', selectedPackage);
        console.log('Edit data:', editData);
        console.log('Form values:', values);
        const result = await servicePackageManagementService.editServicePackage(editData);
        console.log('Edit result:', result);
        message.success(result.message || 'Cập nhật gói dịch vụ thành công!');
        setEditModalVisible(false);
        await loadServicePackages();
      } else {
        // Add new package
        const createData = {
          Name: values.name,
          Description: values.description,
          Price: values.price,
        };
        console.log('Create data:', createData);
        const result = await servicePackageManagementService.createServicePackage(createData);
        message.success(result.message || 'Thêm gói dịch vụ thành công!');
        setAddModalVisible(false);
        await loadServicePackages();
      }
      form.resetFields();
      setSelectedPackage(null);
      await loadServicePackages();
    } catch (error: any) {
      console.error('Error saving service package:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response,
        data: error.response?.data
      });
      
      let errorMessage = 'Có lỗi xảy ra khi lưu gói dịch vụ';
      
      if (error.message) {
        errorMessage = error.message;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      message.error(errorMessage);
    }
  };

  const filteredPackages = packages.filter(pkg => 
    pkg.name.toLowerCase().includes(searchText.toLowerCase()) ||
    pkg.description.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    // {
    //   title: 'ID',
    //   dataIndex: 'packageID',
    //   key: 'packageID',
    //   width: 80,
    //   render: (id: number) => (
    //     <Badge 
    //       count={id} 
    //       style={{ 
    //         backgroundColor: '#1890ff',
    //         fontSize: '12px',
    //         fontWeight: 'bold'
    //       }}
    //       className="!bg-blue-500"
    //     />
    //   ),
    // },
    {
      title: 'Tên gói',
      dataIndex: 'name',
      key: 'name',
      width: 280,
      render: (name: string, record: ServicePackage) => (
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <GiftOutlined className="text-blue-500 text-sm" />
            <Text strong className="text-base text-gray-800">{name}</Text>
          </div>
          <div className="flex items-center space-x-2">
            <Tag 
              color={record.packageID === 1 ? 'green' : 'gold'} 
              className="text-xs"
            >
              {record.packageID === 1 ? 'Gói cơ bản' : 'Gói nâng cao'}
            </Tag>
            {record.price > 1000000 && (
              <Tag color="purple" className="text-xs">
                <StarOutlined className="mr-1" />
                Cao cấp
              </Tag>
            )}
          </div>
        </div>
      ),
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      width: 400,
      ellipsis: true,
      render: (description: string) => (
        <Tooltip title={description} placement="topLeft">
          <Text type="secondary" className="text-sm leading-relaxed">
            {description}
          </Text>
        </Tooltip>
      ),
    },
    {
      title: 'Giá',
      dataIndex: 'price',
      key: 'price',
      width: 120,
      render: (price: number) => (
        <div className="text-right">
          <Text strong className="text-green-600 text-base">
            {servicePackageService.formatPrice(price)}
          </Text>
          <Text type="secondary" className="text-xs ml-1">
            VNĐ
          </Text>
        </div>
      ),
    },
    {
      title: 'Trạng thái',
      key: 'status',
      width: 120,
      render: (_: any) => (
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <Tag color="green" className="border-0">
            Hoạt động
          </Tag>
        </div>
      ),
    },
    {
      title: 'Hành động',
      key: 'actions',
      width: 220,
      render: (_: any, record: ServicePackage) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetail(record)}
              className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all duration-200"
            >
              Xem
            </Button>
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEditPackage(record)}
              className="text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-all duration-200"
            >
              Sửa
            </Button>
          </Tooltip>
          <Tooltip title="Xóa gói">
            <Button
              type="text"
              icon={<DeleteOutlined />}
              onClick={() => handleDeletePackage(record)}
              className="text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-all duration-200"
            >
              Xóa
            </Button>
          </Tooltip>
        </Space>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="flex flex-col items-center justify-center min-h-96 space-y-6">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
            <GiftOutlined className="text-white text-2xl" />
          </div>
          <div className="text-center">
            <Title level={3} className="text-gray-700 mb-2">Đang tải dữ liệu...</Title>
            <Text type="secondary">Vui lòng chờ trong giây lát</Text>
          </div>
          <Spin size="large" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                <GiftOutlined className="text-white text-2xl" />
              </div>
              <div>
                <Title level={2} className="!mb-1 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Quản Lý Gói Dịch Vụ
                </Title>
                <Text type="secondary" className="text-base">
                  Quản lý toàn bộ gói dịch vụ bảo dưỡng xe điện
                </Text>
                <div className="flex items-center space-x-4 mt-2">
                  <div className="flex items-center space-x-1 text-sm text-gray-500">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Hệ thống hoạt động bình thường</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    Cập nhật lần cuối: {new Date().toLocaleDateString('vi-VN')}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                icon={<ReloadOutlined />}
                onClick={loadServicePackages}
                className="border-gray-200 hover:border-blue-500 hover:text-blue-500"
                size="large"
              >
                Làm mới
              </Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                size="large"
                onClick={handleAddPackage}
                className="!bg-gradient-to-r !from-green-500 !to-emerald-600 hover:!from-green-600 hover:!to-emerald-700 !border-0 shadow-lg"
              >
                Thêm gói mới
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <Row gutter={[20, 20]} className="mb-8">
        <Col xs={24} sm={6}>
          <Card 
            className="text-center hover:shadow-lg transition-all duration-300 border-0"
            style={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white'
            }}
          >
            <div className="flex items-center justify-center mb-3">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <GiftOutlined className="text-2xl" />
              </div>
            </div>
            <Statistic
              title={<span className="text-white text-opacity-90">Tổng số gói</span>}
              value={packages.length}
              valueStyle={{ color: 'white', fontSize: '28px', fontWeight: 'bold' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card 
            className="text-center hover:shadow-lg transition-all duration-300 border-0"
            style={{ 
              background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
              color: 'white'
            }}
          >
            <div className="flex items-center justify-center mb-3">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <CheckCircleOutlined className="text-2xl" />
              </div>
            </div>
            <Statistic
              title={<span className="text-white text-opacity-90">Gói hoạt động</span>}
              value={packages.length}
              valueStyle={{ color: 'white', fontSize: '28px', fontWeight: 'bold' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card 
            className="text-center hover:shadow-lg transition-all duration-300 border-0"
            style={{ 
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              color: 'white'
            }}
          >
            <div className="flex items-center justify-center mb-3">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <StarOutlined className="text-2xl" />
              </div>
            </div>
            <Statistic
              title={<span className="text-white text-opacity-90">Gói cao cấp</span>}
              value={packages.filter(pkg => pkg.price > 1000000).length}
              valueStyle={{ color: 'white', fontSize: '28px', fontWeight: 'bold' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card 
            className="text-center hover:shadow-lg transition-all duration-300 border-0"
            style={{ 
              background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
              color: 'white'
            }}
          >
            <div className="flex items-center justify-center mb-3">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <DollarOutlined className="text-2xl" />
              </div>
            </div>
            <Statistic
              title={<span className="text-white text-opacity-90">Giá trung bình</span>}
              value={packages.length > 0 ? packages.reduce((sum, pkg) => sum + pkg.price, 0) / packages.length : 0}
              formatter={(value) => servicePackageService.formatPrice(Number(value))}
              valueStyle={{ color: 'white', fontSize: '20px', fontWeight: 'bold' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Search and Filter Bar */}
      <Card className="mb-6 border-0 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex items-center space-x-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <SearchOutlined className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Tìm kiếm gói dịch vụ..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
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
            <Button
              icon={<ReloadOutlined />}
              onClick={loadServicePackages}
              className="border-gray-200 hover:border-blue-500 hover:text-blue-500"
            >
              Làm mới
            </Button>
            <div className="text-sm text-gray-500">
              Hiển thị {filteredPackages.length} gói dịch vụ
            </div>
          </div>
        </div>
      </Card>

      {/* Packages Table */}
      <Card className="border-0 shadow-sm">
        <div className="mb-4">
          <Title level={4} className="!mb-0 text-gray-700">
            <GiftOutlined className="mr-2 text-blue-500" />
            Danh sách gói dịch vụ
          </Title>
          <Text type="secondary" className="text-sm">
            Quản lý và theo dõi tất cả các gói dịch vụ bảo dưỡng
          </Text>
        </div>
        <Table
          columns={columns}
          dataSource={filteredPackages}
          rowKey="packageID"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} gói`,
            className: "mt-4"
          }}
          className="rounded-lg"
          rowClassName="hover:bg-gray-50 transition-colors duration-200"
          size="middle"
        />
      </Card>

      {/* Detail Modal */}
      <Modal
        title={
          <div className="flex items-center py-2">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
              <GiftOutlined className="text-white text-lg" />
            </div>
            <div>
              <div className="text-lg font-semibold text-gray-800">Chi tiết gói dịch vụ</div>
              <div className="text-sm text-gray-500">Thông tin chi tiết về gói dịch vụ</div>
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
              selectedPackage && handleEditPackage(selectedPackage);
            }}
            className="!bg-blue-600 hover:!bg-blue-700 px-6"
          >
            Chỉnh sửa
          </Button>,
        ]}
        width={700}
        className="rounded-lg"
      >
        {selectedPackage && (
          <div className="py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <InfoCircleOutlined className="text-blue-500" />
                    <Text strong className="text-gray-700">Thông tin cơ bản</Text>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <Text type="secondary" className="text-sm">ID gói:</Text>
                      <div className="mt-1">
                        <Badge count={selectedPackage.packageID} style={{ backgroundColor: '#1890ff' }} />
                      </div>
                    </div>
                    <div>
                      <Text type="secondary" className="text-sm">Tên gói:</Text>
                      <div className="mt-1">
                        <Text strong className="text-lg text-gray-800">{selectedPackage.name}</Text>
                      </div>
                    </div>
                    <div>
                      <Text type="secondary" className="text-sm">Loại gói:</Text>
                      <div className="mt-1">
                        <Tag color={selectedPackage.packageID === 1 ? 'green' : 'gold'} className="text-sm">
                          {selectedPackage.packageID === 1 ? 'Cơ bản' : 'Nâng cao'}
                        </Tag>
                        {selectedPackage.price > 1000000 && (
                          <Tag color="purple" className="ml-2 text-sm">
                            <StarOutlined className="mr-1" />
                            Cao cấp
                          </Tag>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <DollarOutlined className="text-green-500" />
                    <Text strong className="text-gray-700">Thông tin giá</Text>
                  </div>
                  <div className="text-center py-4">
                    <Text strong className="text-3xl text-green-600">
                      {servicePackageService.formatPrice(selectedPackage.price)}
                    </Text>
                    <div className="text-sm text-gray-500 mt-1">VNĐ</div>
                  </div>
                </div>
              </div>
            </div>
            
            <Divider />
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-3">
                <GiftOutlined className="text-blue-500" />
                <Text strong className="text-gray-700">Mô tả chi tiết</Text>
              </div>
              <Text className="text-gray-700 leading-relaxed">{selectedPackage.description}</Text>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit/Add Modal */}
      <Modal
        title={
          <div className="flex items-center py-2">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
              <GiftOutlined className="text-white text-lg" />
            </div>
            <div>
              <div className="text-lg font-semibold text-gray-800">
                {selectedPackage ? 'Chỉnh sửa gói dịch vụ' : 'Thêm gói dịch vụ mới'}
              </div>
              <div className="text-sm text-gray-500">
                {selectedPackage ? 'Cập nhật thông tin gói dịch vụ' : 'Tạo gói dịch vụ mới cho hệ thống'}
              </div>
            </div>
          </div>
        }
        open={editModalVisible || addModalVisible}
        onCancel={() => {
          setEditModalVisible(false);
          setAddModalVisible(false);
          form.resetFields();
        }}
        footer={[
          <Button 
            key="cancel" 
            onClick={() => {
              setEditModalVisible(false);
              setAddModalVisible(false);
              form.resetFields();
            }}
            className="px-6"
          >
            Hủy
          </Button>,
          <Button
            key="save"
            type="primary"
            icon={<SaveOutlined />}
            onClick={() => form.submit()}
            className="!bg-blue-600 hover:!bg-blue-700 px-6"
          >
            {selectedPackage ? 'Cập nhật' : 'Thêm mới'}
          </Button>,
        ]}
        width={700}
        className="rounded-lg"
      >
        <div className="py-4">
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSavePackage}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Form.Item
                label={
                  <span className="text-gray-700 font-medium">
                    <GiftOutlined className="mr-2 text-blue-500" />
                    Tên gói dịch vụ
                  </span>
                }
                name="name"
                rules={[
                  { required: true, message: 'Vui lòng nhập tên gói' },
                  { max: 100, message: 'Tên gói không được quá 100 ký tự' },
                  { 
                    pattern: /^[a-zA-Z0-9\s\u00C0-\u1EF9]+$/, 
                    message: 'Tên gói chỉ được chứa chữ cái, số và khoảng trắng' 
                  }
                ]}
              >
                <Input 
                  placeholder="Nhập tên gói dịch vụ" 
                  size="large"
                  className="rounded-lg"
                />
              </Form.Item>

              <Form.Item
                label={
                  <span className="text-gray-700 font-medium">
                    <DollarOutlined className="mr-2 text-green-500" />
                    Giá (VNĐ)
                  </span>
                }
                name="price"
                rules={[
                  { required: true, message: 'Vui lòng nhập giá' },
                  { type: 'number', min: 0, message: 'Giá không được âm' }
                ]}
              >
                <InputNumber
                  placeholder="Nhập giá"
                  className="w-full"
                  size="large"
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => Number(value!.replace(/\$\s?|(,*)/g, '')) as any}
                  min={0}
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </div>

            <Form.Item
              label={
                <span className="text-gray-700 font-medium">
                  <InfoCircleOutlined className="mr-2 text-blue-500" />
                  Mô tả chi tiết
                </span>
              }
              name="description"
              rules={[
                { required: true, message: 'Vui lòng nhập mô tả' },
                { max: 500, message: 'Mô tả không được quá 500 ký tự' }
              ]}
            >
              <TextArea 
                rows={4} 
                placeholder="Nhập mô tả chi tiết gói dịch vụ" 
                size="large"
                className="rounded-lg"
                showCount
                maxLength={500}
              />
            </Form.Item>
          </Form>
        </div>
      </Modal>
    </div>
  );
};

export default AdminServicePackageManagement;
