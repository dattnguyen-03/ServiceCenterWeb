import React, { useState, useEffect } from 'react';
import { Calendar, ClipboardList, Users, Clock, CheckCircle, AlertCircle, TrendingUp, Bell, Star, Target, Activity } from 'lucide-react';
import { mockAppointments, mockServiceTickets, mockUsers } from '../../data/mockData';

const StaffDashboard: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [notifications, setNotifications] = useState([
    { id: 1, message: 'Lịch hẹn mới từ khách hàng Nguyễn Văn A', time: '10 phút trước', type: 'appointment' },
    { id: 2, message: 'Phiếu dịch vụ #003 cần xử lý', time: '25 phút trước', type: 'service' },
    { id: 3, message: 'Nhắc nhở: Kiểm tra tồn kho phụ tùng', time: '1 giờ trước', type: 'reminder' }
  ]);
  
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const todayAppointments = mockAppointments.filter(apt => apt.date === selectedDate);
  const pendingTickets = mockServiceTickets.filter(ticket => ticket.status === 'waiting');
  const completedToday = mockServiceTickets.filter(ticket => ticket.status === 'completed');
  
  const stats = [
    { 
      label: 'Lịch hẹn hôm nay', 
      value: todayAppointments.length.toString(), 
      icon: Calendar, 
      color: 'from-blue-500 to-blue-600',
      change: '+2',
      trend: 'up'
    },
    { 
      label: 'Phiếu chờ xử lý', 
      value: pendingTickets.length.toString(), 
      icon: ClipboardList, 
      color: 'from-orange-500 to-orange-600',
      change: '-1',
      trend: 'down'
    },
    { 
      label: 'Đã hoàn thành hôm nay', 
      value: completedToday.length.toString(), 
      icon: CheckCircle, 
      color: 'from-green-500 to-green-600',
      change: '+3',
      trend: 'up'
    },
    { 
      label: 'Đánh giá trung bình', 
      value: '4.8/5', 
      icon: Star, 
      color: 'from-yellow-500 to-yellow-600',
      change: '+0.2',
      trend: 'up'
    }
  ];

  const personalStats = [
    { label: 'Mục tiêu tháng', value: '45/50', progress: 90, icon: Target },
    { label: 'Thời gian làm việc', value: '7.5h', progress: 94, icon: Clock },
    { label: 'Khách hàng phục vụ', value: '12', progress: 80, icon: Users },
    { label: 'Hiệu suất', value: '92%', progress: 92, icon: Activity }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Dashboard Nhân viên</h2>
          <p className="text-gray-600">Quản lý lịch hẹn và phiếu dịch vụ</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <div className="text-sm text-gray-600">Thời gian hiện tại</div>
            <div className="text-lg font-semibold text-gray-900">
              {currentTime.toLocaleTimeString('vi-VN')}
            </div>
          </div>
          <div className="relative">
            <button className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors duration-200">
              <Bell className="w-5 h-5" />
            </button>
            {notifications.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {notifications.length}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Stats */}
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

      {/* Personal Performance */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Star className="w-5 h-5 mr-2 text-purple-500" />
          Hiệu suất cá nhân
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {personalStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-lg flex items-center justify-center">
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="text-lg font-bold text-gray-900">{stat.value}</div>
                    <div className="text-xs text-gray-600">{stat.label}</div>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-indigo-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${stat.progress}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500 mt-1">{stat.progress}%</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Appointments */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-blue-500" />
              Lịch hẹn hôm nay
            </h3>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="space-y-3">
            {todayAppointments.length > 0 ? (
              todayAppointments.map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Clock className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{appointment.time}</div>
                      <div className="text-sm text-gray-600">Khách hàng: Nguyễn Văn Nam</div>
                      <div className="text-xs text-gray-500">{appointment.services.join(', ')}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                      appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {appointment.status === 'confirmed' ? 'Đã xác nhận' :
                       appointment.status === 'pending' ? 'Chờ xác nhận' : 'Đang thực hiện'}
                    </span>
                    <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                      Xem
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>Không có lịch hẹn nào trong ngày này</p>
              </div>
            )}
          </div>
        </div>

        {/* Service Tickets */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <ClipboardList className="w-5 h-5 mr-2 text-orange-500" />
            Phiếu dịch vụ cần xử lý
          </h3>
          
          <div className="space-y-3">
            {mockServiceTickets.map((ticket) => (
              <div key={ticket.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors duration-200">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="font-medium text-gray-900">Phiếu #{ticket.id}</div>
                    <div className="text-sm text-gray-600">VinFast VF8 - Nguyễn Văn Nam</div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    ticket.status === 'waiting' ? 'bg-yellow-100 text-yellow-800' :
                    ticket.status === 'working' ? 'bg-blue-100 text-blue-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {ticket.status === 'waiting' ? 'Chờ thực hiện' :
                     ticket.status === 'working' ? 'Đang thực hiện' : 'Hoàn thành'}
                  </span>
                </div>
                
                <div className="text-sm text-gray-600 mb-3">
                  Dịch vụ: {ticket.services.join(', ')}
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    Kỹ thuật viên: {ticket.technician}
                  </div>
                  <div className="flex space-x-2">
                    <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                      Xem chi tiết
                    </button>
                    <button className="text-green-600 hover:text-green-800 text-sm font-medium">
                      Cập nhật
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Notifications Panel */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Bell className="w-5 h-5 mr-2 text-blue-500" />
            Thông báo mới
          </h3>
          <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
            Xem tất cả
          </button>
        </div>
        <div className="space-y-3">
          {notifications.map((notification) => (
            <div key={notification.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
              <div className={`w-2 h-2 rounded-full ${
                notification.type === 'appointment' ? 'bg-blue-500' :
                notification.type === 'service' ? 'bg-orange-500' :
                'bg-yellow-500'
              }`}></div>
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900">{notification.message}</div>
                <div className="text-xs text-gray-500">{notification.time}</div>
              </div>
              <button className="text-gray-400 hover:text-gray-600">
                <CheckCircle className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Thao tác nhanh</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button className="flex flex-col items-center space-y-2 p-4 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors duration-200">
            <Calendar className="w-6 h-6" />
            <span className="font-medium">Tạo lịch hẹn</span>
          </button>
          <button className="flex flex-col items-center space-y-2 p-4 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors duration-200">
            <ClipboardList className="w-6 h-6" />
            <span className="font-medium">Tạo phiếu dịch vụ</span>
          </button>
          <button className="flex flex-col items-center space-y-2 p-4 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 transition-colors duration-200">
            <Users className="w-6 h-6" />
            <span className="font-medium">Thêm khách hàng</span>
          </button>
          <button className="flex flex-col items-center space-y-2 p-4 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors duration-200">
            <CheckCircle className="w-6 h-6" />
            <span className="font-medium">Báo cáo ngày</span>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Hoạt động gần đây</h3>
          <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
            Xem lịch sử
          </button>
        </div>
        <div className="space-y-4">
          <div className="flex items-center space-x-4 p-3 bg-green-50 rounded-lg">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <div className="font-medium text-gray-900">Xác nhận lịch hẹn #001</div>
              <div className="text-sm text-gray-600">Khách hàng Nguyễn Văn Nam - 10 phút trước</div>
            </div>
            <span className="text-xs text-green-600 font-medium">Hoàn thành</span>
          </div>
          <div className="flex items-center space-x-4 p-3 bg-blue-50 rounded-lg">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <ClipboardList className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <div className="font-medium text-gray-900">Tạo phiếu dịch vụ mới</div>
              <div className="text-sm text-gray-600">Tesla Model Y - 25 phút trước</div>
            </div>
            <span className="text-xs text-blue-600 font-medium">Đang xử lý</span>
          </div>
          <div className="flex items-center space-x-4 p-3 bg-orange-50 rounded-lg">
            <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
              <AlertCircle className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <div className="font-medium text-gray-900">Cập nhật trạng thái dịch vụ</div>
              <div className="text-sm text-gray-600">VinFast VF8 - 1 giờ trước</div>
            </div>
            <span className="text-xs text-orange-600 font-medium">Cần kiểm tra</span>
          </div>
          <div className="flex items-center space-x-4 p-3 bg-purple-50 rounded-lg">
            <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
              <Users className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <div className="font-medium text-gray-900">Thêm khách hàng mới</div>
              <div className="text-sm text-gray-600">Trần Thị B - Tesla Model 3 - 2 giờ trước</div>
            </div>
            <span className="text-xs text-purple-600 font-medium">Mới</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;