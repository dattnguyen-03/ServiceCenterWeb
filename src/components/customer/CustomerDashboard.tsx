import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Statistic, Typography, Tabs, List, Spin, Space } from 'antd';
import {
  CarOutlined,
  ThunderboltOutlined,
  DashboardOutlined,
  CalendarOutlined,
  PlusOutlined,
  RightOutlined,
  ToolOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  SettingOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { vehicleService } from '../../services/vehicleService';
import { VehicleResponse } from '../../types/api';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const CustomerDashboard: React.FC = () => {
  const [vehicles, setVehicles] = useState<VehicleResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const currentDate = new Date();
  const formattedDate = new Intl.DateTimeFormat('vi-VN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(currentDate);

  // Load vehicles from API
  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    try {
      setLoading(true);
      const vehiclesData = await vehicleService.getVehiclesByCustomer();
      setVehicles(vehiclesData);
    } catch (error: any) {
      console.error('Error loading vehicles:', error);
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  };

  const getDaysRemaining = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) return { text: `Quá hạn ${Math.abs(diffDays)} ngày`, color: 'red' };
    if (diffDays <= 14) return { text: `Còn ${diffDays} ngày`, color: 'orange' };
    return { text: `Còn ${diffDays} ngày`, color: 'green' };
  };

  const notifications = [
    {
      id: 1,
      title: 'Lịch bảo dưỡng sắp tới',
      message: 'Tesla Model Y của bạn cần bảo dưỡng trong vòng 14 ngày',
      time: '2 giờ trước',
      type: 'warning',
      icon: <CalendarOutlined className="text-amber-500" />
    },
    {
      id: 2,
      title: 'Cập nhật phần mềm',
      message: 'Phần mềm mới đã sẵn sàng cho VinFast VF8',
      time: '1 ngày trước',
      type: 'info',
      icon: <SettingOutlined className="text-blue-500" />
    },
    {
      id: 3,
      title: 'Lịch hẹn đã xác nhận',
      message: 'Lịch hẹn bảo dưỡng đã được xác nhận cho ngày 20/09',
      time: '3 ngày trước',
      type: 'success',
      icon: <CheckCircleOutlined className="text-green-500" />
    }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-100px)]">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Welcome Header */}
      <div className="mb-8">
        <Title level={2} className="!mb-1 !text-gray-800">
          Chào mừng trở lại, Nguyễn Văn A! 👋
        </Title>
        <Text className="text-gray-500 text-lg">{formattedDate}</Text>
      </div>

      {/* Stats Overview */}
      <Row gutter={[24, 24]} className="mb-8">
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-sm hover:shadow-md transition-shadow duration-300">
            <Statistic
              title={<span className="text-gray-600 font-medium">Tổng số xe</span>}
              value={vehicles.length}
              prefix={<CarOutlined className="text-blue-500" />}
              valueStyle={{ color: '#1d4ed8', fontWeight: 'bold' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-sm hover:shadow-md transition-shadow duration-300">
            <Statistic
              title={<span className="text-gray-600 font-medium">Bảo dưỡng tiếp theo</span>}
              value="14"
              suffix="ngày"
              prefix={<CalendarOutlined className="text-green-500" />}
              valueStyle={{ color: '#16a34a', fontWeight: 'bold' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-sm hover:shadow-md transition-shadow duration-300">
            <Statistic
              title={<span className="text-gray-600 font-medium">Hiệu suất năng lượng</span>}
              value="87"
              suffix="%"
              prefix={<ThunderboltOutlined className="text-amber-500" />}
              valueStyle={{ color: '#d97706', fontWeight: 'bold' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-sm hover:shadow-md transition-shadow duration-300">
            <Statistic
              title={<span className="text-gray-600 font-medium">Tiết kiệm chi phí</span>}
              value="2.8"
              suffix="tr VNĐ"
              prefix={<DashboardOutlined className="text-purple-500" />}
              valueStyle={{ color: '#7c3aed', fontWeight: 'bold' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Main Content with Tabs */}
      <Card className="shadow-sm">
        <Tabs 
          defaultActiveKey="1" 
          tabBarExtraContent={
            <Link to="/vehicles/add">
              <Button type="primary" icon={<PlusOutlined />}>
                Thêm xe mới
              </Button>
            </Link>
          }
        >
          <TabPane 
            tab={
              <span className="flex items-center">
                <CarOutlined className="mr-2" />
                Xe của tôi
              </span>
            } 
            key="1"
          >
            <List
              itemLayout="vertical"
              dataSource={vehicles}
              renderItem={(vehicle) => {
                const serviceInfo = vehicle.nextServiceDate 
                  ? getDaysRemaining(vehicle.nextServiceDate) 
                  : { text: 'Chưa có', color: 'gray' };
                
                return (
                  <List.Item
                    key={vehicle.vehicleID}
                    className="!p-4 hover:bg-gray-50 rounded-lg transition-colors"
                    actions={[
                      <Link to={`/customer/booking/${vehicle.vehicleID}`}>
                        <Button type="primary" icon={<CalendarOutlined />}>Đặt lịch</Button>
                      </Link>,
                      <Link to={`/customer/vehicles/${vehicle.vehicleID}`}>
                        <Button icon={<ToolOutlined />}>Chi tiết</Button>
                      </Link>,
                    ]}
                  >
                    <Row align="middle" gutter={[24, 16]}>
                      <Col xs={24} md={8}>
                        <List.Item.Meta
                          title={<Link to={`/customer/vehicles/${vehicle.vehicleID}`} className="text-lg font-bold text-blue-700">{vehicle.model}</Link>}
                          description={`Biển số: ${vehicle.licensePlate}`}
                        />
                      </Col>
                      <Col xs={24} md={16}>
                        <Row gutter={[16, 16]}>
                          <Col xs={12} sm={8}>
                             <Statistic title="Quãng đường" value={`${(vehicle.mileage || 0).toLocaleString()} km`} />
                          </Col>
                           <Col xs={12} sm={8}>
                             <Statistic title="Dung lượng pin" value={`${vehicle.batteryCapacity || 'N/A'} kWh`} />
                          </Col>
                           <Col xs={24} sm={8}>
                             <Statistic 
                                title="Bảo dưỡng kế tiếp" 
                                value={serviceInfo.text} 
                                valueStyle={{ color: serviceInfo.color, fontSize: '16px' }}
                              />
                          </Col>
                        </Row>
                      </Col>
                    </Row>
                  </List.Item>
                )
              }}
            />
          </TabPane>
          <TabPane 
            tab={
              <span className="flex items-center">
                <ClockCircleOutlined className="mr-2" />
                Hoạt động gần đây
              </span>
            } 
            key="2"
          >
            <List
              dataSource={notifications}
              renderItem={(item) => (
                <List.Item className="hover:bg-gray-50 rounded-lg p-3 transition-colors">
                  <List.Item.Meta
                    avatar={<span className="text-2xl">{item.icon}</span>}
                    title={<span className="font-medium">{item.title}</span>}
                    description={
                      <div>
                        <p className="text-gray-600 mb-1">{item.message}</p>
                        <span className="text-xs text-gray-400">{item.time}</span>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default CustomerDashboard;