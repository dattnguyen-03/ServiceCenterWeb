import React from 'react';
import { Card, Row, Col, Button, Statistic, Typography, Badge, Progress, List, Avatar } from 'antd';
import { 
  CarOutlined, 
  ThunderboltOutlined, 
  DashboardOutlined, 
  CalendarOutlined, 
  PlusOutlined, 
  BellOutlined, 
  RightOutlined,
  ToolOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  SettingOutlined
} from '@ant-design/icons';
import { mockVehicles } from '../../data/mockData';
import { Link } from 'react-router-dom';

const { Title, Text } = Typography;

const CustomerDashboard: React.FC = () => {
  const vehicles = mockVehicles.filter(v => v.customerId === '1');
  const currentDate = new Date();
  const formattedDate = new Intl.DateTimeFormat('vi-VN', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric'
  }).format(currentDate);

  const getDaysRemaining = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return `${Math.abs(diffDays)} ngày trước`;
    return `Còn ${diffDays} ngày`;
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

  const quickActions = [
    { 
      title: 'Đặt lịch hẹn', 
      icon: <CalendarOutlined />, 
      color: 'blue', 
      link: '/customer/booking',
      description: 'Đặt lịch bảo dưỡng xe'
    },
    { 
      title: 'Đặt lịch dịch vụ', 
      icon: <CarOutlined />, 
      color: 'green', 
      link: '/vehicles/add',
      description: 'Đặt lịch dịch vụ mói'
    },
    { 
      title: 'Quản lý hồ sơ và chi phí', 
      icon: <ThunderboltOutlined />, 
      color: 'orange', 
      link: '/charging-stations',
      description: 'Quản lý hồ sơ và chi phí'
    },
    { 
      title: 'Hỗ trợ', 
      icon: <PhoneOutlined />, 
      color: 'purple', 
      link: '/support',
      description: 'Liên hệ hỗ trợ kỹ thuật'
    }
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Welcome Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <Title level={2} className="!mb-2 !text-gray-800">
              Chào mừng trở lại, Nguyễn Văn A! 👋
            </Title>
            <Text className="text-gray-500 text-lg">{formattedDate}</Text>
          </div>
        </div>
      </div>
      
      {/* Stats Overview */}
      <Row gutter={[24, 24]} className="mb-8">
        <Col xs={24} sm={6}>
          <Card className="h-full shadow-sm hover:shadow-md transition-all duration-300" style={{ borderLeft: '4px solid #3b82f6' }}>
            <Statistic
              title={<span className="text-gray-600 font-medium">Tổng số xe</span>}
              value={vehicles.length}
              prefix={<CarOutlined className="text-blue-500" />}
              valueStyle={{ color: '#1d4ed8', fontWeight: 'bold' }}
            />
            <div className="mt-3">
              <Link to="/vehicles" className="text-blue-500 text-sm flex items-center hover:text-blue-700">
                Quản lý xe <RightOutlined className="ml-1 text-xs" />
              </Link>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card className="h-full shadow-sm hover:shadow-md transition-all duration-300" style={{ borderLeft: '4px solid #10b981' }}>
            <Statistic
              title={<span className="text-gray-600 font-medium">Bảo dưỡng tiếp theo</span>}
              value="14"
              suffix="ngày"
              prefix={<CalendarOutlined className="text-green-500" />}
              valueStyle={{ color: '#16a34a', fontWeight: 'bold' }}
            />
            <div className="mt-3">
              <Link to="/booking" className="text-green-500 text-sm flex items-center hover:text-green-700">
                Đặt lịch ngay <RightOutlined className="ml-1 text-xs" />
              </Link>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card className="h-full shadow-sm hover:shadow-md transition-all duration-300" style={{ borderLeft: '4px solid #f59e0b' }}>
            <Statistic
              title={<span className="text-gray-600 font-medium">Hiệu suất năng lượng</span>}
              value="87"
              suffix="%"
              prefix={<ThunderboltOutlined className="text-amber-500" />}
              valueStyle={{ color: '#d97706', fontWeight: 'bold' }}
            />
            <div className="mt-3">
              <Link to="/energy-reports" className="text-amber-500 text-sm flex items-center hover:text-amber-700">
                Xem báo cáo <RightOutlined className="ml-1 text-xs" />
              </Link>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card className="h-full shadow-sm hover:shadow-md transition-all duration-300" style={{ borderLeft: '4px solid #8b5cf6' }}>
            <Statistic
              title={<span className="text-gray-600 font-medium">Tiết kiệm chi phí</span>}
              value="2.8"
              suffix="tr VNĐ"
              prefix={<DashboardOutlined className="text-purple-500" />}
              valueStyle={{ color: '#7c3aed', fontWeight: 'bold' }}
            />
            <div className="mt-3">
              <Link to="/savings" className="text-purple-500 text-sm flex items-center hover:text-purple-700">
                Chi tiết <RightOutlined className="ml-1 text-xs" />
              </Link>
            </div>
          </Card>
        </Col>
      </Row>
      
      {/* Main Content */}
      <Row gutter={[24, 24]}>
        {/* Left Column - Vehicles & Activity */}
        <Col xs={24} lg={16}>
          {/* Vehicle Management */}
          <Card 
            title={
              <div className="flex items-center justify-between">
                <Title level={4} className="!m-0 flex items-center">
                  <CarOutlined className="mr-2 text-blue-500" />
                  Xe của tôi
                </Title>
                <Link to="/vehicles">
                  <Button type="link" className="text-blue-500">
                    Xem tất cả <RightOutlined />
                  </Button>
                </Link>
              </div>
            }
            className="mb-6 shadow-sm"
            bodyStyle={{ padding: '24px' }}
          >
            <Row gutter={[16, 16]}>
              {vehicles.map((vehicle) => (
                <Col key={vehicle.id} xs={24} xl={12}>
                  <Card
                    className="hover:shadow-lg transition-all duration-300 border border-gray-200"
                    bodyStyle={{ padding: 0 }}
                  >
                    {/* Vehicle Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-4 text-white">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mr-3">
                            <CarOutlined style={{ fontSize: '24px' }} />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold mb-0">{vehicle.model}</h3>
                            <p className="text-blue-100 opacity-90 mb-0 text-sm">
                              VIN: {vehicle.vin}
                            </p>
                          </div>
                        </div>
                        <Badge
                          status="success"
                          text={<span className="text-white text-xs">Hoạt động tốt</span>}
                        />
                      </div>
                    </div>
                    
                    {/* Vehicle Stats */}
                    <div className="p-4">
                      <Row gutter={[12, 12]} className="mb-4">
                        <Col span={8}>
                          <div className="text-center p-3 bg-blue-50 rounded-lg">
                            <ThunderboltOutlined className="text-blue-500 text-lg mb-1" />
                            <div className="text-sm text-gray-600">Pin</div>
                            <div className="font-bold text-blue-600">{vehicle.batteryCapacity}</div>
                          </div>
                        </Col>
                        <Col span={8}>
                          <div className="text-center p-3 bg-green-50 rounded-lg">
                            <DashboardOutlined className="text-green-500 text-lg mb-1" />
                            <div className="text-sm text-gray-600">Km</div>
                            <div className="font-bold text-green-600">{vehicle.mileage.toLocaleString()}</div>
                          </div>
                        </Col>
                        <Col span={8}>
                          <div className="text-center p-3 bg-amber-50 rounded-lg">
                            <CalendarOutlined className="text-amber-500 text-lg mb-1" />
                            <div className="text-sm text-gray-600">Bảo dưỡng</div>
                            <div className="font-bold text-amber-600">14 ngày</div>
                          </div>
                        </Col>
                      </Row>
                      
                      {/* Battery Level */}
                      <div className="mb-4">
                        <div className="flex justify-between mb-2">
                          <span className="text-sm text-gray-600">Mức pin hiện tại</span>
                          <span className="text-sm font-medium">78%</span>
                        </div>
                        <Progress 
                          percent={78} 
                          strokeColor="#10b981" 
                          trailColor="#f3f4f6"
                          size="small"
                          showInfo={false}
                        />
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button 
                          type="primary" 
                          size="small" 
                          className="flex-1 !bg-blue-600"
                          icon={<CalendarOutlined />}
                        >
                          Đặt lịch
                        </Button>
                        <Button 
                          size="small" 
                          className="flex-1"
                          icon={<ToolOutlined />}
                        >
                          Chi tiết
                        </Button>
                      </div>
                    </div>
                  </Card>
                </Col>
              ))}
              
              {/* Add Vehicle Card */}
              <Col xs={24} xl={12}>
                <Link to="/vehicles/add" className="block h-full">
                  <div className="h-full min-h-[280px] flex items-center justify-center bg-white rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-500 hover:bg-blue-50 transition-all duration-300 cursor-pointer">
                    <div className="text-center">
                      <PlusOutlined className="text-3xl text-gray-400 mb-3" />
                      <h3 className="text-lg font-medium text-gray-700 mb-2">Thêm xe mới</h3>
                      <p className="text-gray-500 text-sm">Đăng ký xe điện mới để quản lý bảo dưỡng</p>
                    </div>
                  </div>
                </Link>
              </Col>
            </Row>
          </Card>
          
          {/* Recent Activities */}
          <Card 
            title={
              <Title level={4} className="!m-0 flex items-center">
                <ClockCircleOutlined className="mr-2 text-green-500" />
                Hoạt động gần đây
              </Title>
            }
            className="shadow-sm"
            extra={<Link to="/history">Xem tất cả</Link>}
          >
            <List
              dataSource={notifications}
              renderItem={(item) => (
                <List.Item className="hover:bg-gray-50 rounded-lg p-3 transition-colors">
                  <List.Item.Meta
                    avatar={item.icon}
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
          </Card>
        </Col>
        
        {/* Right Column - Quick Actions & Info */}
        <Col xs={24} lg={8}>
          {/* Quick Actions */}
          <Card 
            title={
              <Title level={4} className="!m-0 flex items-center">
                <RightOutlined className="mr-2 text-blue-500" />
                Truy cập nhanh
              </Title>
            }
            className="mb-6 shadow-sm"
          >
            <Row gutter={[12, 12]}>
              {quickActions.map((action, index) => (
                <Col span={12} key={index}>
                  <Link to={action.link}>
                    <Card 
                      className="text-center hover:shadow-md transition-all duration-300"
                      bodyStyle={{ padding: '16px 12px' }}
                      style={{ 
                        borderColor: action.color === 'blue' ? '#3b82f6' : 
                                   action.color === 'green' ? '#10b981' : 
                                   action.color === 'orange' ? '#f59e0b' : '#8b5cf6'
                      }}
                    >
                      <div className="text-2xl mb-2" style={{ 
                        color: action.color === 'blue' ? '#3b82f6' : 
                               action.color === 'green' ? '#10b981' : 
                               action.color === 'orange' ? '#f59e0b' : '#8b5cf6'
                      }}>
                        {action.icon}
                      </div>
                      <div className="font-medium text-gray-700 text-sm mb-1">
                        {action.title}
                      </div>
                      <div className="text-xs text-gray-500">
                        {action.description}
                      </div>
                    </Card>
                  </Link>
                </Col>
              ))}
            </Row>
          </Card>
          
          {/* Charging Stations */}
          <Card 
            title={
              <Title level={4} className="!m-0 flex items-center">
                <EnvironmentOutlined className="mr-2 text-orange-500" />
                Trạm sạc gần đây
              </Title>
            }
            className="mb-6 shadow-sm"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg border border-orange-200">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center mr-3">
                    <ThunderboltOutlined className="text-white" />
                  </div>
                  <div>
                    <div className="font-medium">Trạm EVN</div>
                    <div className="text-sm text-gray-500">2.4km • Có sẵn</div>
                  </div>
                </div>
                <Button type="primary" size="small" className="!bg-orange-500">
                  Chỉ đường
                </Button>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gray-400 rounded-lg flex items-center justify-center mr-3">
                    <ThunderboltOutlined className="text-white" />
                  </div>
                  <div>
                    <div className="font-medium">Trạm VinFast</div>
                    <div className="text-sm text-gray-500">3.1km • Đang bận</div>
                  </div>
                </div>
                <Button size="small" disabled>
                  Đang bận
                </Button>
              </div>
              
              <div className="text-center pt-3">
                <Link to="/charging-stations">
                  <Button type="link" className="text-blue-500">
                    Xem bản đồ trạm sạc <RightOutlined />
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
          
          {/* Weather & Tips */}
          <Card 
            title={
              <Title level={4} className="!m-0 flex items-center">
                <ExclamationCircleOutlined className="mr-2 text-purple-500" />
                Mẹo và khuyến nghị
              </Title>
            }
            className="shadow-sm"
          >
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                <Title level={5} className="!mb-2 text-blue-700">
                  Tối ưu hóa pin cho xe điện
                </Title>
                <Text className="text-gray-600 text-sm">
                  Tránh sạc pin đến 100% thường xuyên để kéo dài tuổi thọ pin.
                </Text>
                <div className="mt-3">
                  <Button type="link" className="p-0 text-blue-600">
                    Đọc thêm →
                  </Button>
                </div>
              </div>
              
              <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                <Title level={5} className="!mb-2 text-green-700">
                  Thời tiết hôm nay
                </Title>
                <Text className="text-gray-600 text-sm">
                  Thời tiết đẹp, thích hợp cho việc di chuyển bằng xe điện.
                </Text>
                <div className="mt-3">
                  <Button type="link" className="p-0 text-green-600">
                    Xem dự báo →
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default CustomerDashboard;