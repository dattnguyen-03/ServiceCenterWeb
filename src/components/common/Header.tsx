import React from 'react';
import { Layout, Avatar, Dropdown, Space, Menu } from 'antd';
import { UserOutlined, LogoutOutlined, DownOutlined } from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';

const { Header: AntHeader } = Layout;

interface HeaderProps {
  onLogout: () => Promise<void>;
}

const Header: React.FC<HeaderProps> = ({ onLogout }) => {
  const { user } = useAuth();
  
  // ✅ Hiển thị ServiceCenter info cho Staff/Technician
  const showServiceCenter = user && (user.role === 'staff' || user.role === 'technician') && user.centerID;

  const menuItems = [
    {
      key: 'logout',
      label: (
        <div className="flex items-center text-red-500">
          <LogoutOutlined className="mr-2" />
          <span>Đăng xuất</span>
        </div>
      ),
      onClick: onLogout,
    },
  ];

  return (
    <AntHeader
      style={{
        padding: '0 24px',
        background: '#fff',
        borderBottom: '1px solid #f0f0f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <div className="flex flex-col">
        <div className="text-lg font-semibold">
          Service Center Portal
        </div>
        {showServiceCenter && (
          <div className="text-xs text-gray-500 mt-1">
            ServiceCenter ID: {user.centerID}
          </div>
        )}
      </div>
      <Space align="center">
        <Avatar style={{ backgroundColor: '#1890ff' }} icon={<UserOutlined />} />
        <Dropdown menu={{ items: menuItems }} placement="bottomRight">
          <Space className="cursor-pointer">
            <span className="text-base">{user?.name || 'User'}</span>
            <DownOutlined />
          </Space>
        </Dropdown>
      </Space>
    </AntHeader>
  );
};

export default Header;