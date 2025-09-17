import React from 'react';
import { Users, Package, DollarSign, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { mockFinancialData, mockParts, mockAppointments } from '../../data/mockData';

const AdminDashboard: React.FC = () => {
  const stats = [
    { 
      label: 'Doanh thu tháng', 
      value: `${mockFinancialData.revenue.toLocaleString('vi-VN')} đ`, 
      icon: DollarSign, 
      color: 'from-green-500 to-green-600',
      change: '+12.5%'
    },
    { 
      label: 'Khách hàng hoạt động', 
      value: '248', 
      icon: Users, 
      color: 'from-blue-500 to-blue-600',
      change: '+8.2%'
    },
    { 
      label: 'Phụ tùng thiếu', 
      value: mockParts.filter(p => p.stock < p.minThreshold).length.toString(), 
      icon: AlertTriangle, 
      color: 'from-red-500 to-red-600',
      change: '-2'
    },
    { 
      label: 'Dịch vụ hoàn thành', 
      value: mockAppointments.filter(a => a.status === 'completed').length.toString(), 
      icon: CheckCircle, 
      color: 'from-purple-500 to-purple-600',
      change: '+15.8%'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Dashboard Quản trị</h2>
        <p className="text-gray-600">Tổng quan hoạt động kinh doanh và vận hành</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-lg flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className={`text-sm font-medium px-2 py-1 rounded-full ${
                  stat.change.startsWith('+') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {stat.change}
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-blue-500" />
            Doanh thu theo dịch vụ
          </h3>
          <div className="space-y-4">
            {mockFinancialData.serviceBreakdown.map((service, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-blue-500 rounded-full opacity-80" style={{opacity: 1 - index * 0.2}}></div>
                  <span className="font-medium text-gray-900">{service.service}</span>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-900">{service.revenue.toLocaleString('vi-VN')} đ</div>
                  <div className="text-sm text-gray-600">{service.count} lần</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Parts Alert */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Package className="w-5 h-5 mr-2 text-orange-500" />
            Phụ tùng cần bổ sung
          </h3>
          <div className="space-y-3">
            {mockParts.filter(p => p.stock < p.minThreshold).map((part) => (
              <div key={part.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                <div>
                  <div className="font-medium text-gray-900">{part.name}</div>
                  <div className="text-sm text-gray-600">{part.category}</div>
                </div>
                <div className="text-right">
                  <div className="text-red-600 font-semibold">{part.stock}/{part.minThreshold}</div>
                  <div className="text-xs text-red-500">Thiếu {part.minThreshold - part.stock}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Hoạt động gần đây</h3>
        <div className="space-y-4">
          <div className="flex items-center space-x-4 p-3 bg-blue-50 rounded-lg">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <div className="font-medium text-gray-900">Hoàn thành bảo dưỡng VinFast VF8</div>
              <div className="text-sm text-gray-600">Khách hàng Nguyễn Văn Nam - 2 giờ trước</div>
            </div>
          </div>
          <div className="flex items-center space-x-4 p-3 bg-green-50 rounded-lg">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <Users className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <div className="font-medium text-gray-900">Khách hàng mới đăng ký</div>
              <div className="text-sm text-gray-600">Trần Thị B - Tesla Model 3 - 4 giờ trước</div>
            </div>
          </div>
          <div className="flex items-center space-x-4 p-3 bg-orange-50 rounded-lg">
            <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
              <Package className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <div className="font-medium text-gray-900">Nhập kho phụ tùng</div>
              <div className="text-sm text-gray-600">Lốp Michelin EV - 20 chiếc - 1 ngày trước</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;