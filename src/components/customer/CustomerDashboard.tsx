import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Typography, Tabs, List, Spin } from 'antd';
import {
  CarOutlined,
  CalendarOutlined,
  PlusOutlined,
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
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #f0f9ff 0%, #f9fafb 100%)' }}>
      {/* Welcome Header */}
      <div className="p-6 bg-gradient-to-r from-blue-600 to-blue-400 text-white rounded-b-3xl shadow-lg mb-8">
        <Title level={2} className="!mb-1 !text-white">
          Chào mừng trở lại, Nguyễn Văn A! 
        </Title>
        <Text className="text-blue-100 text-lg">{formattedDate}</Text>
      </div>

      <div className="px-6 pb-6">
        {/* Stats Overview */}
        <Row gutter={[24, 24]} className="mb-8">
          <Col xs={24} sm={12} lg={6}>
            <Card 
              className="shadow-sm hover:shadow-lg transition-all duration-300"
              style={{ borderRadius: 20, border: 'none' }}
              bodyStyle={{ padding: 20 }}
            >
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}></div>
                <div style={{ fontSize: 14, color: '#6b7280', marginBottom: 8 }}>Tổng số xe</div>
                <div style={{ fontSize: 32, fontWeight: 900, color: '#1d4ed8' }}>
                  {vehicles.length}
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card 
              className="shadow-sm hover:shadow-lg transition-all duration-300"
              style={{ borderRadius: 20, border: 'none', background: 'linear-gradient(135deg, #f0fdf4 0%, #f9fafb 100%)' }}
              bodyStyle={{ padding: 20 }}
            >
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}></div>
                <div style={{ fontSize: 14, color: '#6b7280', marginBottom: 8 }}>Bảo dưỡng tiếp theo</div>
                <div style={{ fontSize: 32, fontWeight: 900, color: '#16a34a' }}>
                  14 <span style={{ fontSize: 18 }}>ngày</span>
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card 
              className="shadow-sm hover:shadow-lg transition-all duration-300"
              style={{ borderRadius: 20, border: 'none', background: 'linear-gradient(135deg, #fef3c7 0%, #f9fafb 100%)' }}
              bodyStyle={{ padding: 20 }}
            >
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}></div>
                <div style={{ fontSize: 14, color: '#6b7280', marginBottom: 8 }}>Hiệu suất năng lượng</div>
                <div style={{ fontSize: 32, fontWeight: 900, color: '#d97706' }}>
                  87<span style={{ fontSize: 18 }}>%</span>
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card 
              className="shadow-sm hover:shadow-lg transition-all duration-300"
              style={{ borderRadius: 20, border: 'none', background: 'linear-gradient(135deg, #faf5ff 0%, #f9fafb 100%)' }}
              bodyStyle={{ padding: 20 }}
            >
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}></div>
                <div style={{ fontSize: 14, color: '#6b7280', marginBottom: 8 }}>Tiết kiệm chi phí</div>
                <div style={{ fontSize: 32, fontWeight: 900, color: '#7c3aed' }}>
                  2.8<span style={{ fontSize: 18 }}>tr</span>
                </div>
              </div>
            </Card>
          </Col>
        </Row>

        {/* Main Content with Tabs */}
        <Card 
          className="shadow-md"
          style={{ borderRadius: 20, border: '1px solid #e5e7eb' }}
          bodyStyle={{ padding: 0 }}
        >
          <Tabs 
            defaultActiveKey="1" 
            tabBarExtraContent={
              <Link to="/vehicles/add">
                {/* <Button 
                  type="primary" 
                  icon={<PlusOutlined />}
                  style={{
                    borderRadius: 12,
                    fontWeight: 700,
                    background: 'linear-gradient(90deg, #60a5fa 0%, #22c55e 100%)',
                    border: 'none'
                  }}
                >
                  Thêm xe mới
                </Button> */}
              </Link>
            }
            style={{ padding: '24px' }}
            tabBarStyle={{
              borderBottom: '2px solid #e5e7eb',
              marginBottom: 24
            }}
          >
            <TabPane 
              tab={
                <span className="flex items-center font-semibold">
                  <CarOutlined className="mr-2 text-blue-600" style={{ fontSize: 18 }} />
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
                      className="transition-all duration-300"
                      style={{
                        padding: 16,
                        marginBottom: 16,
                        borderRadius: 16,
                        border: '1px solid #e5e7eb',
                        background: '#fff',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
                      }}
                      actions={[
                        // <Link key="booking" to={`/customer/booking/${vehicle.vehicleID}`}>
                        //   <Button 
                        //     type="primary"
                        //     style={{
                        //       borderRadius: 10,
                        //       background: 'linear-gradient(90deg, #60a5fa 0%, #22c55e 100%)',
                        //       border: 'none',
                        //       fontWeight: 600
                        //     }}
                        //   >
                        //      Đặt lịch
                        //   </Button>
                        // </Link>,
                        <Link key="details" to={`/customer/vehicles/${vehicle.vehicleID}`}>
                          <Button 
                            style={{
                              borderRadius: 10,
                              borderColor: '#60a5fa',
                              color: '#60a5fa',
                              fontWeight: 600
                            }}
                          >
                             Chi tiết
                          </Button>
                        </Link>,
                      ]}
                    >
                      <Row align="middle" gutter={[24, 16]}>
                        <Col xs={24} md={8}>
                          <List.Item.Meta
                            title={<Link to={`/customer/vehicles/${vehicle.vehicleID}`} className="text-xl font-bold text-blue-700">{vehicle.model}</Link>}
                            description={` Biển số: ${vehicle.licensePlate}`}
                          />
                        </Col>
                        <Col xs={24} md={16}>
                          <Row gutter={[16, 16]}>
                            <Col xs={12} sm={8}>
                              <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>Quãng đường</div>
                              <div style={{ fontSize: 18, fontWeight: 700, color: '#1f2937' }}>
                                {(vehicle.mileage || 0).toLocaleString()} km
                              </div>
                            </Col>
                            <Col xs={12} sm={8}>
                              <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>Dung lượng pin</div>
                              <div style={{ fontSize: 18, fontWeight: 700, color: '#1f2937' }}>
                                {vehicle.batteryCapacity || 'N/A'} kWh
                              </div>
                            </Col>
                            <Col xs={24} sm={8}>
                              <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>Bảo dưỡng kế tiếp</div>
                              <div style={{ fontSize: 18, fontWeight: 700, color: serviceInfo.color }}>
                                {serviceInfo.text}
                              </div>
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
              // tab={
              //   <span className="flex items-center font-semibold">
              //     <ClockCircleOutlined className="mr-2 text-green-600" style={{ fontSize: 18 }} />
              //     Hoạt động gần đây
              //   </span>
              // } 
              key="2"
            >
              <List
                dataSource={notifications}
                renderItem={(item) => (
                  <List.Item 
                    className="transition-all duration-300"
                    style={{
                      padding: 16,
                      marginBottom: 12,
                      borderRadius: 16,
                      border: '1px solid #e5e7eb',
                      background: '#fff',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
                    }}
                  >
                    <List.Item.Meta
                      avatar={
                        <div style={{
                          fontSize: 32,
                          background: 'linear-gradient(135deg, #e0f2fe 0%, #f0fdf4 100%)',
                          borderRadius: 12,
                          width: 56,
                          height: 56,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          {item.icon}
                        </div>
                      }
                      title={<span className="font-bold text-gray-900">{item.title}</span>}
                      description={
                        <div>
                          <p className="text-gray-600 mb-2">{item.message}</p>
                          <span style={{ fontSize: 12, color: '#9ca3af' }}>{item.time}</span>
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
    </div>
  );
};

export default CustomerDashboard;