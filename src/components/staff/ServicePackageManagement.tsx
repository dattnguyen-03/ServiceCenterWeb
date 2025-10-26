import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Table, Tag, Space, Spin, message, Typography, Statistic, Modal, Descriptions } from 'antd';
import { 
  GiftOutlined, 
  EyeOutlined, 
  DollarOutlined,
  ClockCircleOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
  UserOutlined
} from '@ant-design/icons';
import { ServicePackage } from '../../types/api';
import { servicePackageService } from '../../services/servicePackageService';

const { Title, Text } = Typography;

const ServicePackageManagement: React.FC = () => {
  const [packages, setPackages] = useState<ServicePackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPackage, setSelectedPackage] = useState<ServicePackage | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);

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
      width: 200,
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
      width: 300,
      ellipsis: {
        showTitle: false,
      },
      render: (description: string) => (
        <Text type="secondary" className="text-sm" title={description}>
          {description}
        </Text>
      ),
    },
    {
      title: 'Giá',
      dataIndex: 'price',
      key: 'price',
      width: 140,
      render: (price: number) => (
        <Text strong className="text-green-600">
          {servicePackageService.formatPrice(price)}
        </Text>
      ),
    },
    {
      title: 'Thời hạn',
      dataIndex: 'durationMonths',
      key: 'durationMonths',
      width: 150,
      render: (months: number) => (
        <Tag color="blue" icon={<ClockCircleOutlined />}>
          {servicePackageService.formatDuration(months)}
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
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg mr-4">
              <GiftOutlined className="text-white text-2xl" />
            </div>
            <div>
              <Title level={2} className="!mb-0 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Gói Dịch Vụ
              </Title>
              <Text type="secondary" className="text-base">
                Xem gói dịch vụ và tiếp nhận yêu cầu từ khách hàng
              </Text>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={6}>
          <Card className="text-center rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-center mb-2">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <GiftOutlined className="text-2xl text-blue-500" />
              </div>
            </div>
            <Statistic
              title="Tổng số gói"
              value={packages.length}
              valueStyle={{ color: '#3b82f6', fontWeight: 'bold' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card className="text-center rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-center mb-2">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <DollarOutlined className="text-2xl text-green-500" />
              </div>
            </div>
            <Statistic
              title="Giá trung bình"
              value={packages.length > 0 ? packages.reduce((sum, pkg) => sum + pkg.price, 0) / packages.length : 0}
              formatter={(value) => servicePackageService.formatPrice(Number(value))}
              valueStyle={{ color: '#10b981', fontWeight: 'bold' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card className="text-center rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-center mb-2">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <ClockCircleOutlined className="text-2xl text-orange-500" />
              </div>
            </div>
            <Statistic
              title="Thời hạn trung bình"
              value={packages.length > 0 ? Math.round(packages.reduce((sum, pkg) => sum + pkg.durationMonths, 0) / packages.length) : 0}
              formatter={(value) => servicePackageService.formatDuration(Number(value))}
              valueStyle={{ color: '#f59e0b', fontWeight: 'bold' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card className="text-center rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-center mb-2">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <UserOutlined className="text-2xl text-purple-500" />
              </div>
            </div>
            <Statistic
              title="Yêu cầu hôm nay"
              value={0}
              valueStyle={{ color: '#8b5cf6', fontWeight: 'bold' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Packages Table */}
      <Card className="rounded-2xl shadow-sm border border-gray-100" title={
        <div className="flex items-center">
          <GiftOutlined className="mr-2 text-blue-500 text-lg" />
          <span className="text-lg font-semibold">Danh sách gói dịch vụ</span>
        </div>
      }>
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
              <Descriptions.Item label="Thời hạn">
                <Tag color="blue" icon={<ClockCircleOutlined />}>
                  {servicePackageService.formatDuration(selectedPackage.durationMonths)}
                </Tag>
              </Descriptions.Item>
            </Descriptions>

            <div className="mt-4">
              {/* <div className="space-y-2">
                {selectedPackage.packageID === 1 ? (
                  <>
                    <div className="flex items-center text-sm">
                      <CheckCircleOutlined className="text-green-500 mr-2" />
                      Kiểm tra định kỳ toàn diện
                    </div>
                    <div className="flex items-center text-sm">
                      <CheckCircleOutlined className="text-green-500 mr-2" />
                      Thay dầu và lọc gió
                    </div>
                    <div className="flex items-center text-sm">
                      <CheckCircleOutlined className="text-green-500 mr-2" />
                      Kiểm tra hệ thống điện
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center text-sm">
                      <CheckCircleOutlined className="text-green-500 mr-2" />
                      Tất cả dịch vụ gói cơ bản
                    </div>
                    <div className="flex items-center text-sm">
                      <CheckCircleOutlined className="text-green-500 mr-2" />
                      Cân chỉnh hệ thống phanh
                    </div>
                    <div className="flex items-center text-sm">
                      <CheckCircleOutlined className="text-green-500 mr-2" />
                      Kiểm tra pin chuyên sâu
                    </div>
                    <div className="flex items-center text-sm">
                      <CheckCircleOutlined className="text-green-500 mr-2" />
                      Cập nhật phần mềm xe
                    </div>
                  </>
                )}
              </div> */}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ServicePackageManagement;
