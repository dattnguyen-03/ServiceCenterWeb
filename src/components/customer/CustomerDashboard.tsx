import React, { useState, useEffect, useMemo } from 'react';
import { Card, Row, Col, Typography, Tabs, List, Spin } from 'antd';
import {
  CalendarOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  SettingOutlined,
  DollarCircleOutlined,
  BarChartOutlined,
  PieChartOutlined
} from '@ant-design/icons';
import { LineChart, Line, PieChart as RechartsPieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { paymentService, Payment } from '../../services/paymentService';
import { appointmentService } from '../../services/appointmentService';
import { AppointmentSummary } from '../../types/api';
import { useAuth } from '../../contexts/AuthContext';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

interface ServicePackage {
  serviceType: string;
  count: number;
  totalSpent: number;
  lastUsed: string;
}

const CustomerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [appointments, setAppointments] = useState<AppointmentSummary[]>([]);
  const [servicePackages, setServicePackages] = useState<ServicePackage[]>([]);
  const [paymentStats, setPaymentStats] = useState({
    totalSpent: 0,
    thisMonthSpent: 0,
    averagePerService: 0,
    totalServices: 0
  });
  const currentDate = new Date();
  const formattedDate = new Intl.DateTimeFormat('vi-VN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(currentDate);

  // Load data from APIs
  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadPaymentData(),
        loadAppointmentData()
      ]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPaymentData = async () => {
    try {
      console.log('Loading payment data...');
      const data = await paymentService.getPaymentHistory();
      console.log('Payment data received:', data);
      setPayments(data || []);
      
      // Calculate payment statistics from real data
      const completedPayments = (data || []).filter(payment => payment.status === 'completed');
      const totalSpent = completedPayments.reduce((sum, payment) => sum + payment.amount, 0);
      
      const thisMonth = new Date().getMonth();
      const thisMonthPayments = completedPayments.filter(payment => 
        new Date(payment.createdAt).getMonth() === thisMonth
      );
      const thisMonthSpent = thisMonthPayments.reduce((sum, payment) => sum + payment.amount, 0);
      
      setPaymentStats({
        totalSpent,
        thisMonthSpent,
        averagePerService: completedPayments.length > 0 ? totalSpent / completedPayments.length : 0,
        totalServices: completedPayments.length
      });
      console.log('Payment stats calculated:', { totalSpent, thisMonthSpent, totalServices: completedPayments.length });
      console.log('Sample payments:', completedPayments.slice(0, 3));
    } catch (error) {
      console.error('Error loading payment data:', error);
      setPayments([]);
    }
  };

  const loadAppointmentData = async () => {
    try {
      console.log('Loading appointment data...');
      const data = await appointmentService.getMyAppointments();
      console.log('Appointment data received:', data);
      setAppointments(data || []);
      
      // Process appointments to create service package statistics
      const serviceTypeMap = new Map<string, { count: number; totalSpent: number; lastUsed: string }>();
      
      (data || []).forEach(appointment => {
        if (appointment.serviceType) {
          const existing = serviceTypeMap.get(appointment.serviceType) || { 
            count: 0, 
            totalSpent: 0, 
            lastUsed: appointment.requestedDate 
          };
          serviceTypeMap.set(appointment.serviceType, {
            count: existing.count + 1,
            totalSpent: existing.totalSpent, // We don't have cost info in appointments
            lastUsed: appointment.requestedDate > existing.lastUsed ? appointment.requestedDate : existing.lastUsed
          });
        }
      });
      
      const packages: ServicePackage[] = Array.from(serviceTypeMap.entries()).map(([serviceType, stats]) => ({
        serviceType,
        count: stats.count,
        totalSpent: stats.totalSpent,
        lastUsed: stats.lastUsed
      }));
      
      setServicePackages(packages);
      console.log('Service packages calculated:', packages);
    } catch (error) {
      console.error('Error loading appointment data:', error);
      setAppointments([]);
      setServicePackages([]);
    }
  };

  // Calculate monthly payment data for chart
  const monthlyPaymentData = useMemo(() => {
    const completedPayments = payments.filter(p => p.status === 'completed');
    console.log('Calculating monthly data from payments:', completedPayments);
    
    const monthlyData = new Map<string, number>();
    
    completedPayments.forEach(payment => {
      const date = new Date(payment.createdAt);
      const monthKey = `${date.getMonth() + 1}/${date.getFullYear()}`;
      const currentAmount = monthlyData.get(monthKey) || 0;
      monthlyData.set(monthKey, currentAmount + payment.amount);
      console.log(`Added payment ${payment.paymentID}: ${payment.amount} to month ${monthKey}`);
    });
    
    const result = Array.from(monthlyData.entries())
      .map(([month, totalAmount]) => ({
        date: month,
        amount: totalAmount // Convert to millions
      }))
      .sort((a, b) => {
        const [monthA, yearA] = a.date.split('/').map(Number);
        const [monthB, yearB] = b.date.split('/').map(Number);
        return yearA - yearB || monthA - monthB;
      });
      
    console.log('Monthly chart data:', result);
    return result;
  }, [payments]);

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
                <DollarCircleOutlined style={{ fontSize: 32, color: '#1d4ed8', marginBottom: 8 }} />
                <div style={{ fontSize: 14, color: '#6b7280', marginBottom: 8 }}>Tổng chi tiêu</div>
                <div style={{ fontSize: 28, fontWeight: 900, color: '#1d4ed8' }}>
                  {paymentStats.totalSpent.toLocaleString('vi-VN')} đ
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
                <CalendarOutlined style={{ fontSize: 32, color: '#16a34a', marginBottom: 8 }} />
                <div style={{ fontSize: 14, color: '#6b7280', marginBottom: 8 }}>Chi tiêu tháng này</div>
                <div style={{ fontSize: 28, fontWeight: 900, color: '#16a34a' }}>
                  {paymentStats.thisMonthSpent.toLocaleString('vi-VN')} đ
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
                <BarChartOutlined style={{ fontSize: 32, color: '#d97706', marginBottom: 8 }} />
                <div style={{ fontSize: 14, color: '#6b7280', marginBottom: 8 }}>Trung bình mỗi dịch vụ</div>
                <div style={{ fontSize: 28, fontWeight: 900, color: '#d97706' }}>
                  {paymentStats.averagePerService.toLocaleString('vi-VN')} đ
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
                <SettingOutlined style={{ fontSize: 32, color: '#7c3aed', marginBottom: 8 }} />
                <div style={{ fontSize: 14, color: '#6b7280', marginBottom: 8 }}>Tổng dịch vụ đã sử dụng</div>
                <div style={{ fontSize: 32, fontWeight: 900, color: '#7c3aed' }}>
                  {paymentStats.totalServices}
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
            style={{ padding: '24px' }}
            tabBarStyle={{
              borderBottom: '2px solid #e5e7eb',
              marginBottom: 24
            }}
          >
            <TabPane 
              tab={
                <span className="flex items-center font-semibold">
                  <DollarCircleOutlined className="mr-2 text-blue-600" style={{ fontSize: 18 }} />
                  Lịch sử thanh toán
                </span>
              } 
              key="1"
            >
              {/* Payment History Chart */}
              <div className="mb-6">
                <Card className="shadow-sm" style={{ borderRadius: 16 }}>
                  <Title level={4} className="mb-4">Biểu đồ chi tiêu theo thời gian</Title>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={monthlyPaymentData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip formatter={(value: number) => [`${value.toFixed(1)} VNĐ`, 'Tổng chi tiêu']} />
                      <Legend />
                      <Line type="monotone" dataKey="amount" stroke="#0088FE" strokeWidth={2} name="Chi tiêu trong tháng " />
                    </LineChart>
                  </ResponsiveContainer>
                </Card>
              </div>

              <List
                itemLayout="vertical"
                dataSource={payments.filter(p => p.status === 'completed')}
                renderItem={(payment) => (
                  <List.Item
                    key={payment.paymentID}
                    className="transition-all duration-300"
                    style={{
                      padding: 16,
                      marginBottom: 16,
                      borderRadius: 16,
                      border: '1px solid #e5e7eb',
                      background: '#fff',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
                    }}
                  >
                    <Row align="middle" gutter={[24, 16]}>
                      <Col xs={24} md={8}>
                        <List.Item.Meta
                          avatar={<DollarCircleOutlined style={{ fontSize: 24, color: '#0088FE' }} />}
                          title={<span className="text-xl font-bold text-gray-900">{payment.description}</span>}
                          description={`Ngày: ${new Date(payment.createdAt).toLocaleDateString('vi-VN')}`}
                        />
                      </Col>
                      <Col xs={24} md={16}>
                        <Row gutter={[16, 16]}>
                          <Col xs={12} sm={8}>
                            <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>Số tiền</div>
                            <div style={{ fontSize: 18, fontWeight: 700, color: '#1f2937' }}>
                              {payment.amount.toLocaleString('vi-VN')} đ
                            </div>
                          </Col>
                          <Col xs={12} sm={8}>
                            <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>Phương thức</div>
                            <div style={{ fontSize: 18, fontWeight: 700, color: '#1f2937' }}>
                              {payment.paymentMethod || 'Không xác định'}
                            </div>
                          </Col>
                          <Col xs={24} sm={8}>
                            <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>Trạng thái</div>
                            <div style={{ fontSize: 18, fontWeight: 700, color: payment.status === 'completed' ? '#16a34a' : '#d97706' }}>
                              {payment.status === 'completed' ? 'Đã thanh toán' : payment.status}
                            </div>
                          </Col>
                        </Row>
                      </Col>
                    </Row>
                  </List.Item>
                )}
              />
            </TabPane>

            <TabPane 
              tab={
                <span className="flex items-center font-semibold">
                  <PieChartOutlined className="mr-2 text-purple-600" style={{ fontSize: 18 }} />
                  Gói dịch vụ
                </span>
              } 
              key="2"
            >
              {/* Service Package Chart */}
              <div className="mb-6">
                <Card className="shadow-sm" style={{ borderRadius: 16 }}>
                  <Title level={4} className="mb-4">Phân tích sử dụng gói dịch vụ</Title>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                      <Pie
                        data={servicePackages.map(pkg => ({ name: pkg.serviceType, value: pkg.count }))}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }: any) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {servicePackages.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => [`${value} lần`, 'Số lần sử dụng']} />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </Card>
              </div>

              <List
                dataSource={servicePackages}
                renderItem={(servicePackage, index) => (
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
                          background: `${COLORS[index % COLORS.length]}20`,
                          borderRadius: 12,
                          width: 56,
                          height: 56,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: COLORS[index % COLORS.length]
                        }}>
                          <SettingOutlined />
                        </div>
                      }
                      title={<span className="font-bold text-gray-900">{servicePackage.serviceType}</span>}
                      description={
                        <div>
                          <Row gutter={16}>
                            <Col span={8}>
                              <div className="text-sm text-gray-600">Sử dụng: <strong>{servicePackage.count} lần</strong></div>
                            </Col>
                            <Col span={8}>
                              <div className="text-sm text-gray-600">Tổng chi: <strong>{servicePackage.totalSpent.toLocaleString('vi-VN')} đ</strong></div>
                            </Col>
                            <Col span={8}>
                              <div className="text-sm text-gray-600">Lần cuối: <strong>{new Date(servicePackage.lastUsed).toLocaleDateString('vi-VN')}</strong></div>
                            </Col>
                          </Row>
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            </TabPane>

            <TabPane 
              tab={
                <span className="flex items-center font-semibold">
                  <ClockCircleOutlined className="mr-2 text-green-600" style={{ fontSize: 18 }} />
                  Hoạt động gần đây
                </span>
              } 
              key="3"
            >
              <List
                dataSource={appointments.slice(0, 10)} // Show latest 10 appointments
                renderItem={(appointment) => {
                  const getStatusIcon = (status: string) => {
                    switch (status.toLowerCase()) {
                      case 'completed': return <CheckCircleOutlined className="text-green-500" />;
                      case 'confirmed': return <CalendarOutlined className="text-blue-500" />;
                      case 'pending': return <ClockCircleOutlined className="text-amber-500" />;
                      case 'cancelled': return <ClockCircleOutlined className="text-red-500" />;
                      default: return <SettingOutlined className="text-gray-500" />;
                    }
                  };

                  const getStatusText = (status: string) => {
                    switch (status.toLowerCase()) {
                      case 'completed': return 'Dịch vụ đã hoàn thành';
                      case 'confirmed': return 'Lịch hẹn đã được xác nhận';
                      case 'pending': return 'Lịch hẹn đang chờ xác nhận';
                      case 'cancelled': return 'Lịch hẹn đã bị hủy';
                      default: return 'Trạng thái không xác định';
                    }
                  };

                  return (
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
                            {getStatusIcon(appointment.status)}
                          </div>
                        }
                        title={<span className="font-bold text-gray-900">{appointment.serviceType}</span>}
                        description={
                          <div>
                            <p className="text-gray-600 mb-2">
                              {getStatusText(appointment.status)} - {appointment.vehicleModel} tại {appointment.centerName}
                            </p>
                            <span style={{ fontSize: 12, color: '#9ca3af' }}>
                              {new Date(appointment.requestedDate).toLocaleString('vi-VN')}
                            </span>
                          </div>
                        }
                      />
                    </List.Item>
                  );
                }}
              />
            </TabPane>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default CustomerDashboard;