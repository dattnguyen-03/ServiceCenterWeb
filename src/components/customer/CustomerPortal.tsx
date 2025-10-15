import React from 'react';
import { Layout, Menu, Dropdown, Avatar, Space, Typography, Button } from 'antd';
import { 
  UserOutlined, 
  LogoutOutlined, 
  GlobalOutlined,
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';

const { Header, Content } = Layout;
const { Title, Text } = Typography;

const SimpleMenuItem = ({ title, description }: { title: string, description: string }) => (
  <div className="flex items-start p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
    <div>
      <Text strong>{title}</Text>
      <Typography.Paragraph type="secondary" className="text-sm mb-0">{description}</Typography.Paragraph>
    </div>
  </div>
);

const CustomerPortal: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/', { replace: true }); 
  };

  const userMenuItems = [
    {
      key: 'profile',
      label: (
        <Link to="/customer/profile">
          <SimpleMenuItem title="Trang cá nhân" description="Xem và sửa thông tin" />
        </Link>
      ),
    },
    {
      key: 'booking',
      label: (
        <Link to="/customer/management-booking">
          <SimpleMenuItem title="Lịch hẹn" description="Quản lý lịch hẹn của bạn" />
        </Link>
      ),
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      label: (
        <div className="flex items-center">
          <LogoutOutlined className="mr-2" />
          <Text>Đăng xuất</Text>
        </div>
      ),
      onClick: handleLogout,
    },
  ];

  return (
    <Layout className="min-h-screen">
      <Header className="border-b sticky top-0 bg-white/80 backdrop-blur-lg z-50">
        <div className="container mx-auto px-6 py-3 flex justify-between items-center h-full">
          <div className="flex items-center">
             <div className="bg-blue-600 text-white p-2 rounded-lg mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0v-4a2 2 0 012-2h10a2 2 0 012 2v4m-6 0v-2a2 2 0 00-2-2h-2a2 2 0 00-2 2v2" />
              </svg>
            </div>
            <Title level={3} className="!mb-0 ml-2">GarageBox</Title>
          </div>
          
          {user && (
            <Menu 
              mode="horizontal" 
              className="border-b-0 flex-grow justify-center bg-transparent" 
              selectedKeys={[location.pathname]}
              items={[
                { key: '/customer/dashboard', label: <Link to="/customer/dashboard">Trang chủ</Link> },
                { key: '/customer/vehicles', label: <Link to="/customer/vehicles">Xe của tôi</Link> },
                { key: '/customer/service-packages', label: <Link to="/customer/service-packages">Gói dịch vụ</Link> },
                { key: '/customer/booking', label: <Link to="/customer/booking">Đặt lịch hẹn</Link> },
                { key: '/customer/history', label: <Link to="/customer/history">Lịch sử</Link> },
                { key: '/customer/payment', label: <Link to="/customer/payment">Thanh Toán</Link> },
                { key: '/customer/my-services', label: <Link to="/customer/my-services">Dịch Vụ</Link> },
              ]}
            />
          )}

          <div className="flex items-center space-x-4">
            <Button icon={<GlobalOutlined />}>Tiếng Việt</Button>
            {user ? (
              <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
                <a onClick={e => e.preventDefault()}>
                  <Avatar icon={<UserOutlined />} />
                </a>
              </Dropdown>
            ) : (
              <Space>
                <Link to="/login">
                  <Button>Đăng nhập</Button>
                </Link>
                <Link to="/register">
                  <Button type="primary">Đăng ký</Button>
                </Link>
              </Space>
            )}
          </div>
        </div>
      </Header>
      <Content>
        <Outlet />
      </Content>
    </Layout>
  );
};

export default CustomerPortal;
