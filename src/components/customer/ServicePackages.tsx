import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Tag, Space, Spin, Typography, Statistic } from 'antd';
import { 
  GiftOutlined, 
  ClockCircleOutlined, 
  DollarOutlined, 
  CheckCircleOutlined,
  StarOutlined,
  ShoppingCartOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import { ServicePackage } from '../../types/api';
import { servicePackageService } from '../../services/servicePackageService';
import { sweetAlert } from '../../utils/sweetAlert';

const { Title, Text, Paragraph } = Typography;

const ServicePackages: React.FC = () => {
  const [packages, setPackages] = useState<ServicePackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPackage, setSelectedPackage] = useState<ServicePackage | null>(null);

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
      sweetAlert.error('Lỗi tải dữ liệu', error.message || 'Không thể tải danh sách gói dịch vụ');
      setPackages([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPackage = (pkg: ServicePackage) => {
    setSelectedPackage(pkg);
  };

  const handleBookService = (pkg: ServicePackage) => {
    // TODO: Navigate to booking page with selected package
    sweetAlert.toast.info(`Đang chuyển đến trang đặt lịch cho gói: ${pkg.name}`);
  };

  const getPackageIcon = (packageId: number) => {
    switch (packageId) {
      case 1:
        return <CheckCircleOutlined className="text-green-500" />;
      case 2:
        return <StarOutlined className="text-yellow-500" />;
      default:
        return <GiftOutlined className="text-blue-500" />;
    }
  };

  const getPackageColor = (packageId: number) => {
    switch (packageId) {
      case 1:
        return 'green';
      case 2:
        return 'gold';
      default:
        return 'blue';
    }
  };

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
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mr-4">
            <GiftOutlined className="text-white text-xl" />
          </div>
          <div>
            <Title level={2} className="!mb-0 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Gói Dịch Vụ Bảo Dưỡng
            </Title>
            <Text type="secondary" className="text-lg">
              Chọn gói dịch vụ phù hợp với nhu cầu của bạn
            </Text>
          </div>
        </div>
      </div>

      {/* Service Packages Grid */}
      <Row gutter={[24, 24]}>
        {packages.map((pkg) => (
          <Col xs={24} lg={12} key={pkg.packageID}>
            <Card
              className={`h-full transition-all duration-300 hover:shadow-xl border-2 ${
                selectedPackage?.packageID === pkg.packageID 
                  ? 'border-blue-500 shadow-lg' 
                  : 'border-gray-200 hover:border-blue-300'
              }`}
              style={{ borderRadius: '16px' }}
            >
              {/* Package Header */}
              <div className="text-center mb-6">
                <div className="flex justify-center mb-3">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    {getPackageIcon(pkg.packageID)}
                  </div>
                </div>
                <Title level={3} className="!mb-2">
                  {pkg.name}
                </Title>
                <Tag color={getPackageColor(pkg.packageID)} className="text-sm px-3 py-1">
                  {pkg.packageID === 1 ? 'Cơ Bản' : 'Nâng Cao'}
                </Tag>
              </div>

              {/* Package Description */}
              <div className="mb-6">
                <Paragraph className="text-gray-600 text-center leading-relaxed">
                  {pkg.description}
                </Paragraph>
              </div>

              {/* Package Stats */}
              <div className="mb-6">
                <Row gutter={16}>
                  <Col span={12}>
                    <Statistic
                      title="Giá"
                      value={pkg.price}
                      formatter={(value) => servicePackageService.formatPrice(Number(value))}
                      prefix={<DollarOutlined className="text-green-500" />}
                      valueStyle={{ color: '#10b981', fontSize: '18px', fontWeight: 'bold' }}
                    />
                  </Col>
                  <Col span={12}>
                    <Statistic
                      title="Thời hạn"
                      value={pkg.durationMonths}
                      formatter={(value) => servicePackageService.formatDuration(Number(value))}
                      prefix={<ClockCircleOutlined className="text-blue-500" />}
                      valueStyle={{ color: '#3b82f6', fontSize: '18px', fontWeight: 'bold' }}
                    />
                  </Col>
                </Row>
              </div>

              {/* Package Features */}
              <div className="mb-6">
                <Title level={5} className="!mb-3 flex items-center">
                  <InfoCircleOutlined className="mr-2 text-blue-500" />
                  Bao gồm:
                </Title>
                <div className="space-y-2">
                  {pkg.packageID === 1 ? (
                    <>
                      <div className="flex items-center text-sm text-gray-600">
                        <CheckCircleOutlined className="text-green-500 mr-2" />
                        Kiểm tra định kỳ toàn diện
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <CheckCircleOutlined className="text-green-500 mr-2" />
                        Thay dầu và lọc gió
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <CheckCircleOutlined className="text-green-500 mr-2" />
                        Kiểm tra hệ thống điện
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center text-sm text-gray-600">
                        <CheckCircleOutlined className="text-green-500 mr-2" />
                        Tất cả dịch vụ gói cơ bản
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <CheckCircleOutlined className="text-green-500 mr-2" />
                        Cân chỉnh hệ thống phanh
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <CheckCircleOutlined className="text-green-500 mr-2" />
                        Kiểm tra pin chuyên sâu
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <CheckCircleOutlined className="text-green-500 mr-2" />
                        Cập nhật phần mềm xe
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button
                  type={selectedPackage?.packageID === pkg.packageID ? 'primary' : 'default'}
                  size="large"
                  block
                  icon={<ShoppingCartOutlined />}
                  onClick={() => handleSelectPackage(pkg)}
                  className={`${
                    selectedPackage?.packageID === pkg.packageID 
                      ? '!bg-blue-600 hover:!bg-blue-700' 
                      : '!border-blue-300 !text-blue-600 hover:!border-blue-500 hover:!bg-blue-50'
                  } transition-all duration-300`}
                >
                  {selectedPackage?.packageID === pkg.packageID ? 'Đã chọn' : 'Chọn gói này'}
                </Button>
                
                <Button
                  type="primary"
                  size="large"
                  block
                  icon={<ShoppingCartOutlined />}
                  onClick={() => handleBookService(pkg)}
                  className="!bg-green-600 hover:!bg-green-700 transition-all duration-300"
                >
                  Đặt lịch ngay
                </Button>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Selected Package Summary */}
      {selectedPackage && (
        <div className="mt-8">
          <Card className="border-2 border-blue-500 shadow-lg" style={{ borderRadius: '16px' }}>
            <div className="text-center">
              <Title level={4} className="!mb-2 text-blue-600">
                Gói đã chọn: {selectedPackage.name}
              </Title>
              <Space size="large">
                <Text strong className="text-lg">
                  Giá: {servicePackageService.formatPrice(selectedPackage.price)}
                </Text>
                <Text strong className="text-lg">
                  Thời hạn: {servicePackageService.formatDuration(selectedPackage.durationMonths)}
                </Text>
              </Space>
              <div className="mt-4">
                <Button
                  type="primary"
                  size="large"
                  icon={<ShoppingCartOutlined />}
                  onClick={() => handleBookService(selectedPackage)}
                  className="!bg-green-600 hover:!bg-green-700"
                >
                  Tiến hành đặt lịch
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ServicePackages;
