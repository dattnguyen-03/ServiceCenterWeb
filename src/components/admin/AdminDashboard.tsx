import React, { useState, useEffect } from 'react';
import { Users, Package, DollarSign, TrendingUp, AlertTriangle, CheckCircle, Activity, Calendar, Clock, BarChart3, PieChart } from 'lucide-react';
import { mockFinancialData, mockParts, mockAppointments, mockUsers, mockServiceTickets } from '../../data/mockData';

const AdminDashboard: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedPeriod, setSelectedPeriod] = useState('today');
  const [realtimeData, setRealtimeData] = useState({
    onlineStaff: 12,
    activeServices: 8,
    queueLength: 5,
    avgWaitTime: '25 phút'
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      // Simulate real-time data updates
      setRealtimeData(prev => ({
        ...prev,
        onlineStaff: Math.floor(Math.random() * 5) + 10,
        activeServices: Math.floor(Math.random() * 3) + 6,
        queueLength: Math.floor(Math.random() * 3) + 3,
        avgWaitTime: `${Math.floor(Math.random() * 10) + 20} phút`
      }));
    }, 30000); // Update every 30 seconds

    return () => clearInterval(timer);
  }, []);

  const stats = [
    { 
      label: 'Doanh thu tháng', 
      value: `${mockFinancialData.revenue.toLocaleString('vi-VN')} đ`, 
      icon: DollarSign, 
      color: 'from-green-500 to-green-600',
      change: '+12.5%',
      trend: 'up'
    },
    { 
      label: 'Khách hàng hoạt động', 
      value: mockUsers.filter(u => u.role === 'customer').length.toString(), 
      icon: Users, 
      color: 'from-blue-500 to-blue-600',
      change: '+8.2%',
      trend: 'up'
    },
    { 
      label: 'Phụ tùng thiếu', 
      value: mockParts.filter(p => p.stock < p.minThreshold).length.toString(), 
      icon: AlertTriangle, 
      color: 'from-red-500 to-red-600',
      change: '-2',
      trend: 'down'
    },
    { 
      label: 'Dịch vụ hoàn thành', 
      value: mockAppointments.filter(a => a.status === 'completed').length.toString(), 
      icon: CheckCircle, 
      color: 'from-purple-500 to-purple-600',
      change: '+15.8%',
      trend: 'up'
    }
  ];

  const realtimeStats = [
    {
      label: 'Nhân viên online',
      value: realtimeData.onlineStaff.toString(),
      icon: Activity,
      color: 'from-emerald-500 to-emerald-600'
    },
    {
      label: 'Dịch vụ đang thực hiện',
      value: realtimeData.activeServices.toString(),
      icon: Clock,
      color: 'from-blue-500 to-blue-600'
    },
    {
      label: 'Hàng chờ',
      value: realtimeData.queueLength.toString(),
      icon: Calendar,
      color: 'from-orange-500 to-orange-600'
    },
    {
      label: 'Thời gian chờ TB',
      value: realtimeData.avgWaitTime,
      icon: Clock,
      color: 'from-purple-500 to-purple-600'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Dashboard Quản trị</h2>
          <p className="text-gray-600">Tổng quan hoạt động kinh doanh và vận hành</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <div className="text-sm text-gray-600">Cập nhật lần cuối</div>
            <div className="text-lg font-semibold text-gray-900">
              {currentTime.toLocaleTimeString('vi-VN')}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-green-600 font-medium">Hoạt động</span>
          </div>
        </div>
      </div>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-lg flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className={`flex items-center space-x-1 text-sm font-medium px-2 py-1 rounded-full ${
                  stat.trend === 'up' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {stat.trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingUp className="w-3 h-3 rotate-180" />}
                  <span>{stat.change}</span>
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </div>
          );
        })}
      </div>

      {/* Real-time Stats */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-blue-500" />
            Thống kê thời gian thực
          </h3>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-600">Cập nhật tự động</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {realtimeStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 bg-gradient-to-br ${stat.color} rounded-lg flex items-center justify-center`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-lg font-bold text-gray-900">{stat.value}</div>
                    <div className="text-xs text-gray-600">{stat.label}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-blue-500" />
              Doanh thu theo dịch vụ
            </h3>
            <select 
              value={selectedPeriod} 
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
            >
              <option value="today">Hôm nay</option>
              <option value="week">Tuần này</option>
              <option value="month">Tháng này</option>
            </select>
          </div>
          <div className="space-y-4">
            {mockFinancialData.serviceBreakdown.map((service, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded-full ${
                      index === 0 ? 'bg-blue-500' :
                      index === 1 ? 'bg-green-500' :
                      index === 2 ? 'bg-yellow-500' :
                      'bg-purple-500'
                    }`}></div>
                    <span className="font-medium text-gray-900">{service.service}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">{service.revenue.toLocaleString('vi-VN')} đ</div>
                    <div className="text-sm text-gray-600">{service.count} lần</div>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      index === 0 ? 'bg-blue-500' :
                      index === 1 ? 'bg-green-500' :
                      index === 2 ? 'bg-yellow-500' :
                      'bg-purple-500'
                    }`}
                    style={{ width: `${(service.revenue / mockFinancialData.serviceBreakdown[0].revenue) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Service Queue Status */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-orange-500" />
            Trạng thái hàng chờ
          </h3>
          <div className="space-y-4">
            {mockServiceTickets.map((ticket) => (
              <div key={ticket.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">Phiếu #{ticket.id}</div>
                  <div className="text-sm text-gray-600">{ticket.services.join(', ')}</div>
                  <div className="text-xs text-gray-500">KT: {ticket.technician}</div>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    ticket.status === 'waiting' ? 'bg-yellow-100 text-yellow-800' :
                    ticket.status === 'working' ? 'bg-blue-100 text-blue-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {ticket.status === 'waiting' ? 'Chờ' :
                     ticket.status === 'working' ? 'Đang làm' : 'Hoàn thành'}
                  </span>
                  <div className="text-xs text-gray-500 mt-1">{ticket.startTime}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Parts Alert */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Package className="w-5 h-5 mr-2 text-red-500" />
            Phụ tùng cần bổ sung
          </h3>
          <div className="space-y-3">
            {mockParts.filter(p => p.stock < p.minThreshold).length > 0 ? (
              mockParts.filter(p => p.stock < p.minThreshold).map((part) => (
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
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>Tất cả phụ tùng đều đủ</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Performance Metrics & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Metrics */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <PieChart className="w-5 h-5 mr-2 text-purple-500" />
            Hiệu suất hoạt động
          </h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tỷ lệ hoàn thành dịch vụ</span>
                <span className="font-medium text-gray-900">94.5%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '94.5%' }}></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Thời gian phản hồi TB</span>
                <span className="font-medium text-gray-900">2.3 phút</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '76%' }}></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Mức độ hài lòng KH</span>
                <span className="font-medium text-gray-900">4.8/5</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-purple-500 h-2 rounded-full" style={{ width: '96%' }}></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Hiệu suất sử dụng thiết bị</span>
                <span className="font-medium text-gray-900">87.2%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-orange-500 h-2 rounded-full" style={{ width: '87.2%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Hoạt động gần đây</h3>
            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              Xem tất cả
            </button>
          </div>
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
            <div className="flex items-center space-x-4 p-3 bg-purple-50 rounded-lg">
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <div className="font-medium text-gray-900">Thanh toán hoàn tất</div>
                <div className="text-sm text-gray-600">2,500,000 đ - Tesla Model Y - 6 giờ trước</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;