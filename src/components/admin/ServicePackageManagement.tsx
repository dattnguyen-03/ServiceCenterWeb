import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Table, Tag, Space, Spin, message, Typography, Statistic, Modal, Descriptions, Form, Input, InputNumber } from 'antd';
import { 
  GiftOutlined, 
  EditOutlined, 
  EyeOutlined, 
  PlusOutlined,
  DeleteOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  StarOutlined,
  SaveOutlined
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

  const columns = [
    {
      title: 'ID',
      dataIndex: 'packageID',
      key: 'packageID',
      width: 80,
      render: (id: number) => (
        <Tag color="blue" className="font-mono">
          #{id}
        </Tag>
      ),
    },
    {
      title: 'Tên gói',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: ServicePackage) => (
        <div>
          <Text strong className="text-base">{name}</Text>
          <div className="text-sm text-gray-500 mt-1">
            {record.packageID === 1 ? 'Gói cơ bản' : 'Gói nâng cao'}
          </div>
        </div>
      ),
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (description: string) => (
        <Text type="secondary" className="text-sm">
          {description}
        </Text>
      ),
    },
    {
      title: 'Giá',
      dataIndex: 'price',
      key: 'price',
      width: 120,
      render: (price: number) => (
        <Text strong className="text-green-600">
          {servicePackageService.formatPrice(price)}
        </Text>
      ),
    },

    {
      title: 'Trạng thái',
      key: 'status',
      width: 100,
      render: (_: any) => (
        <Tag color="green">
          Hoạt động
        </Tag>
      ),
    },
    {
      title: 'Hành động',
      key: 'actions',
      width: 200,
      render: (_: any, record: ServicePackage) => (
        <Space>
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
            className="text-blue-600 hover:text-blue-800"
          >
            Xem
          </Button>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEditPackage(record)}
            className="text-green-600 hover:text-green-800"
          >
            Sửa
          </Button>
          <Button
            type="text"
            icon={<DeleteOutlined />}
            onClick={() => handleDeletePackage(record)}
            className="text-red-600 hover:text-red-800"
          >
            Xóa
          </Button>
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
              <GiftOutlined className="text-white text-xl" />
            </div>
            <div>
              <Title level={2} className="!mb-0 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Quản Lý Gói Dịch Vụ
              </Title>
              <Text type="secondary" className="text-lg">
                Quản lý toàn bộ gói dịch vụ bảo dưỡng
              </Text>
            </div>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="large"
            onClick={handleAddPackage}
            className="!bg-green-600 hover:!bg-green-700"
          >
            Thêm gói mới
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={6}>
          <Card className="text-center">
            <Statistic
              title="Tổng số gói"
              value={packages.length}
              prefix={<GiftOutlined className="text-blue-500" />}
              valueStyle={{ color: '#3b82f6' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card className="text-center">
            <Statistic
              title="Gói hoạt động"
              value={packages.length}
              prefix={<CheckCircleOutlined className="text-green-500" />}
              valueStyle={{ color: '#10b981' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card className="text-center">
            <Statistic
              title="Gói cao cấp"
              value={packages.filter(pkg => pkg.price > 1000000).length}
              prefix={<StarOutlined className="text-yellow-500" />}
              valueStyle={{ color: '#f59e0b' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card className="text-center">
            <Statistic
              title="Giá trung bình"
              value={packages.length > 0 ? packages.reduce((sum, pkg) => sum + pkg.price, 0) / packages.length : 0}
              formatter={(value) => servicePackageService.formatPrice(Number(value))}
              prefix={<DollarOutlined className="text-green-500" />}
              valueStyle={{ color: '#10b981' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Packages Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={packages}
          rowKey="packageID"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} gói`,
          }}
          className="rounded-lg"
        />
      </Card>

      {/* Detail Modal */}
      <Modal
        title={
          <div className="flex items-center">
            <GiftOutlined className="mr-2 text-blue-500" />
            <span>Chi tiết gói dịch vụ</span>
          </div>
        }
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
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
            className="!bg-blue-600 hover:!bg-blue-700"
          >
            Chỉnh sửa
          </Button>,
        ]}
        width={600}
      >
        {selectedPackage && (
          <div>
            <Descriptions column={1} bordered>
              <Descriptions.Item label="ID gói">
                <Tag color="blue">#{selectedPackage.packageID}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Tên gói">
                <Text strong className="text-lg">{selectedPackage.name}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Loại gói">
                <Tag color={selectedPackage.packageID === 1 ? 'green' : 'gold'}>
                  {selectedPackage.packageID === 1 ? 'Cơ bản' : 'Nâng cao'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Mô tả">
                <Text>{selectedPackage.description}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Giá">
                <Text strong className="text-green-600 text-lg">
                  {servicePackageService.formatPrice(selectedPackage.price)}
                </Text>
              </Descriptions.Item>

            </Descriptions>
          </div>
        )}
      </Modal>

      {/* Edit/Add Modal */}
      <Modal
        title={
          <div className="flex items-center">
            <GiftOutlined className="mr-2 text-blue-500" />
            <span>{selectedPackage ? 'Chỉnh sửa gói dịch vụ' : 'Thêm gói dịch vụ mới'}</span>
          </div>
        }
        open={editModalVisible || addModalVisible}
        onCancel={() => {
          setEditModalVisible(false);
          setAddModalVisible(false);
          form.resetFields();
        }}
        footer={[
          <Button key="cancel" onClick={() => {
            setEditModalVisible(false);
            setAddModalVisible(false);
            form.resetFields();
          }}>
            Hủy
          </Button>,
          <Button
            key="save"
            type="primary"
            icon={<SaveOutlined />}
            onClick={() => form.submit()}
            className="!bg-blue-600 hover:!bg-blue-700"
          >
            {selectedPackage ? 'Cập nhật' : 'Thêm mới'}
          </Button>,
        ]}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSavePackage}
        >
          <Form.Item
            label="Tên gói"
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
            <Input placeholder="Nhập tên gói dịch vụ" />
          </Form.Item>

          <Form.Item
            label="Mô tả"
            name="description"
            rules={[
              { required: true, message: 'Vui lòng nhập mô tả' },
              { max: 500, message: 'Mô tả không được quá 500 ký tự' }
            ]}
          >
            <TextArea rows={3} placeholder="Nhập mô tả chi tiết gói dịch vụ" />
          </Form.Item>

          <Form.Item
            label="Giá (VNĐ)"
            name="price"
            rules={[
              { required: true, message: 'Vui lòng nhập giá' },
              { type: 'number', min: 0, message: 'Giá không được âm' }
            ]}
          >
            <InputNumber
              placeholder="Nhập giá"
              className="w-full"
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => Number(value!.replace(/\$\s?|(,*)/g, '')) as any}
              min={0}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminServicePackageManagement;
