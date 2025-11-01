import React, { useState, useEffect } from 'react';
import { Calendar, Wrench, CheckCircle, Clock } from 'lucide-react';
import { serviceOrderService, ServiceOrder } from '../../services/serviceOrderService';
import { useAuth } from '../../contexts/AuthContext';
import { showError } from '../../utils/sweetAlert';
import { Spin, Alert } from 'antd';

const TechnicianDashboard: React.FC = () => {
  const { user } = useAuth();
  const [serviceOrders, setServiceOrders] = useState<ServiceOrder[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetchServiceOrders();
  }, []);

  const fetchServiceOrders = async () => {
    try {
      setLoading(true);
      const orders = await serviceOrderService.getMyServiceOrders();
      setServiceOrders(orders);
    } catch (err: any) {
      showError('Lỗi', err.message || 'Không thể tải danh sách công việc');
    } finally {
      setLoading(false);
    }
  };

  // Tính toán stats từ dữ liệu thực
  const today = new Date();
  const todayOrders = serviceOrders.filter(order => {
    const orderDate = new Date(order.createDate);
    return orderDate.toDateString() === today.toDateString();
  });

  const inProgressOrders = serviceOrders.filter(order => 
    order.status.toLowerCase() === 'inprogress'
  );

  const thisWeekStart = new Date(today);
  thisWeekStart.setDate(today.getDate() - today.getDay());
  thisWeekStart.setHours(0, 0, 0, 0);
  
  const completedThisWeek = serviceOrders.filter(order => {
    const orderDate = new Date(order.createDate);
    const isCompleted = order.status.toLowerCase() === 'completed' || order.status.toLowerCase() === 'done';
    return isCompleted && orderDate >= thisWeekStart;
  });

  const stats = [
    { label: 'Công việc hôm nay', value: todayOrders.length.toString(), icon: Calendar, color: 'from-blue-500 to-blue-600' },
    { label: 'Đang thực hiện', value: inProgressOrders.length.toString(), icon: Wrench, color: 'from-orange-500 to-orange-600' },
    { label: 'Hoàn thành tuần', value: completedThisWeek.length.toString(), icon: CheckCircle, color: 'from-green-500 to-green-600' },
    { label: 'Tổng công việc', value: serviceOrders.length.toString(), icon: Clock, color: 'from-purple-500 to-purple-600' }
  ];

  const myTickets = serviceOrders.slice(0, 5); // Hiển thị 5 công việc gần nhất

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" tip="Đang tải dữ liệu..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Dashboard Kỹ thuật viên</h2>
        <p className="text-gray-600">Theo dõi tiến độ công việc và lịch làm việc</p>
        {user?.centerID && (
          <p className="text-sm text-gray-500 mt-1">
            Service Center ID: {user.centerID}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-lg flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Current Work */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Wrench className="w-5 h-5 mr-2 text-orange-500" />
          Công việc hiện tại
        </h3>
        {myTickets.length === 0 ? (
          <Alert
            message="Chưa có công việc nào"
            description="Hiện tại bạn chưa có Service Order nào được gán. Vui lòng liên hệ quản lý để được gán công việc."
            type="info"
            showIcon
          />
        ) : (
          <div className="space-y-4">
            {myTickets.map((order) => (
              <div key={order.OrderID || order.orderID} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="font-medium text-gray-900">Order #{order.OrderID || order.orderID}</div>
                    <div className="text-sm text-gray-600">{order.vehicleModel} - {order.customerName}</div>
                  </div>
                <div className="flex items-center space-x-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    order.status.toLowerCase() === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    order.status.toLowerCase() === 'inprogress' ? 'bg-orange-100 text-orange-800' :
                    (order.status.toLowerCase() === 'completed' || order.status.toLowerCase() === 'done') ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {order.status.toLowerCase() === 'pending' ? 'Chờ xử lý' :
                     order.status.toLowerCase() === 'inprogress' ? 'Đang thực hiện' : 
                     (order.status.toLowerCase() === 'completed' || order.status.toLowerCase() === 'done') ? 'Hoàn thành' :
                     order.status}
                  </span>
                </div>
              </div>
              
              <div className="text-sm text-gray-600 mb-3">
                <div>Dịch vụ: {order.serviceType}</div>
                <div>Trung tâm: {order.centerName}</div>
              </div>
              
              <div className="text-xs text-gray-500">
                Ngày tạo: {new Date(order.createDate).toLocaleDateString('vi-VN')}
              </div>
            </div>
            ))}
          </div>
        )}
      </div>

      {/* Today's Schedule */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Calendar className="w-5 h-5 mr-2 text-blue-500" />
          Công việc hôm nay
        </h3>
        {todayOrders.length === 0 ? (
          <Alert
            message="Không có công việc nào hôm nay"
            description="Bạn chưa có Service Order nào được gán cho hôm nay."
            type="info"
            showIcon
          />
        ) : (
          <div className="space-y-3">
            {todayOrders.slice(0, 5).map((order) => {
              const isInProgress = order.status.toLowerCase() === 'inprogress';
              return (
                <div key={order.OrderID || order.orderID} className={`flex items-center space-x-4 p-3 rounded-lg ${
                  isInProgress ? 'bg-blue-50' : 'bg-gray-50'
                }`}>
                  <div className={`font-semibold ${isInProgress ? 'text-blue-600' : 'text-gray-600'}`}>
                    {new Date(order.createDate).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{order.serviceType}</div>
                    <div className="text-sm text-gray-600">{order.vehicleModel} - {order.customerName}</div>
                  </div>
                  <div className={`text-sm font-medium ${
                    isInProgress ? 'text-blue-600' : 
                    (order.status.toLowerCase() === 'completed' || order.status.toLowerCase() === 'done') ? 'text-green-600' :
                    'text-gray-600'
                  }`}>
                    {isInProgress ? 'Đang thực hiện' :
                     (order.status.toLowerCase() === 'completed' || order.status.toLowerCase() === 'done') ? 'Hoàn thành' :
                     'Chờ xử lý'}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default TechnicianDashboard;