import React from 'react';
import { Layout, Avatar, Dropdown, Space } from 'antd';
import { UserOutlined, LogoutOutlined, DownOutlined } from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';

const { Header: AntHeader } = Layout;

interface HeaderProps {
  onLogout: () => Promise<void>;
}

const Header: React.FC<HeaderProps> = ({ onLogout }) => {
  const { user } = useAuth();

  const menu = (
    <div className="bg-white rounded-xl shadow-2xl border p-2" style={{ width: 200 }}>
      <div
        onClick={onLogout}
        className="flex items-center p-2 hover:bg-gray-50 rounded-lg cursor-pointer text-red-500"
      >
        <LogoutOutlined className="mr-2" />
        <span>Đăng xuất</span>
      </div>
    </div>
  );

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
      <div className="text-lg font-semibold">
        Service Center Portal
      </div>
      <Space align="center">
        <Avatar style={{ backgroundColor: '#1890ff' }} icon={<UserOutlined />} />
        <Dropdown overlay={menu} placement="bottomRight">
          <Space className="cursor-pointer">
            <span className="text-base">{user?.name || 'Staff'}</span>
            <DownOutlined />
          </Space>
        </Dropdown>
      </Space>
    </AntHeader>
  );
};

export default Header;