import React from 'react';
import { 
  Home, Calendar, Car, FileText, Users, Package, 
  DollarSign, Settings, Wrench, ClipboardList 
} from 'lucide-react';
import { UserOutlined } from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  const { user } = useAuth();

  const getMenuItems = () => {
    switch (user?.role) {
      case 'customer':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: Home },
          { id: 'vehicles', label: 'Xe của tôi', icon: Car },
          { id: 'appointments', label: 'Đặt lịch dịch vụ', icon: Calendar },
          { id: 'profile', label: 'Hồ sơ & Chi phí', icon: FileText }
        ];
      case 'staff':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: Home },
          { id: 'customers', label: 'Khách hàng & Xe', icon: Users },
          { id: 'appointments', label: 'Lịch hẹn', icon: Calendar },
          { id: 'service-tickets', label: 'Phiếu dịch vụ', icon: ClipboardList },
          { id: 'progress', label: 'Tiến độ dịch vụ', icon: Wrench },
          { id: 'invoices', label: 'Thanh toán', icon: DollarSign }
        ];
      case 'technician':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: Home },
          { id: 'schedule', label: 'Lịch làm việc', icon: Calendar },
          { id: 'work-orders', label: 'Lệnh công việc', icon: Wrench },
          { id: 'service-order-progress', label: 'Cập nhật tiến độ', icon: ClipboardList },
          { id: 'parts-usage', label: 'Kiểm Tra Phụ Tùng', icon: Car },
          { id: 'profile', label: 'Hồ sơ cá nhân', icon: UserOutlined }
        ];
      case 'admin':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: Home },
          { id: 'customers', label: 'Khách hàng', icon: Users },
          { id: 'parts', label: 'Phụ tùng', icon: Package },
          { id: 'staff', label: 'Nhân sự', icon: Users },
          { id: 'finance', label: 'Báo cáo tài chính', icon: DollarSign },
          { id: 'settings', label: 'Cài đặt', icon: Settings }
        ];
      default:
        return [];
    }
  };

  const menuItems = getMenuItems();

  return (
    <aside className="w-64 bg-white shadow-sm border-r border-gray-200 h-full overflow-y-auto">
      <nav className="p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;