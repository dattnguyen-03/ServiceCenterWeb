import React from 'react';
import { Layout, Menu, Avatar, Dropdown, Space } from 'antd';
import { Outlet, useLocation, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  DashboardOutlined,
  UserOutlined,
  CalendarOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  ToolOutlined,
  TeamOutlined,
  DollarOutlined,
  GiftOutlined,
  LogoutOutlined,
  DownOutlined,
  BankOutlined,
  ShoppingCartOutlined,
} from '@ant-design/icons';

const { Header, Sider, Content } = Layout;

const AdminLayout: React.FC = () => {
  const location = useLocation();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/', { replace: true });
  };

  const menuItems = [
    {
      key: '/admin',
      icon: <DashboardOutlined />,
      label: <Link to="/admin">Dashboard</Link>,
    },
    {
      key: '/admin/customers',
      icon: <UserOutlined />,
      label: <Link to="/admin/customers">Khách hàng & Xe</Link>,
    },
    {
      key: '/admin/appointments',
      icon: <CalendarOutlined />,
      label: <Link to="/admin/appointments">Xác nhận lịch hẹn</Link>,
    },
    {
      key: '/admin/service-packages',
      icon: <GiftOutlined />,
      label: <Link to="/admin/service-packages">Gói dịch vụ</Link>,
    },
    {
      key: '/admin/service-orders',
      icon: <ShoppingCartOutlined />,
      label: <Link to="/admin/service-orders">Quản Lý Đơn Hàng Dịch Vụ</Link>,
    },
    {
      key: '/admin/service-centers',
      icon: <BankOutlined />,
      label: <Link to="/admin/service-centers">Trung tâm dịch vụ</Link>,
    },
    {
      key: '/admin/parts',
      icon: <ToolOutlined />,
      label: <Link to="/admin/parts">Phụ tùng</Link>,
    },
    {
      key: '/admin/staff',
      icon: <TeamOutlined />,
      label: <Link to="/admin/staff">Nhân sự</Link>,
    },
    {
      key: '/admin/finance',
      icon: <DollarOutlined />,
      label: <Link to="/admin/finance">Tài chính</Link>,
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        width={250}
        theme="light"
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          borderRight: '1px solid #f0f0f0',
        }}
      >
        <div className="p-4 text-xl font-bold text-center border-b">
          Admin Portal
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          style={{ borderRight: 0 }}
          items={menuItems}
        />
      </Sider>
      <Layout style={{ marginLeft: 250 }}>
        <Header style={{ 
          padding: '0 24px', 
          background: '#fff', 
          borderBottom: '1px solid #f0f0f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div className="text-lg font-semibold">
            Service Center Management System
          </div>
          <Space align="center">
            <Avatar style={{ backgroundColor: '#1890ff' }} icon={<UserOutlined />} />
            <Dropdown menu={{ 
              items: [
                {
                  key: '1',
                  label: 'Thông tin cá nhân',
                  icon: <UserOutlined />,
                  onClick: () => navigate('/admin/profile')
                },
                {
                  key: '2',
                  label: 'Đăng xuất',
                  icon: <LogoutOutlined />,
                  onClick: handleLogout,
                  danger: true
                }
              ]
            }}>
              <Space className="cursor-pointer">
                <span className="text-base">Admin</span>
                <DownOutlined />
              </Space>
            </Dropdown>
          </Space>
        </Header>
        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            minHeight: 280,
            background: '#fff',
            borderRadius: '4px',
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
