import React, { useState, useEffect } from 'react';
import { serviceOrderService, ServiceOrder, UpdateServiceOrderRequest } from '../../services/serviceOrderService';
import { useAuth } from '../../contexts/AuthContext';
import { Wrench, Clock, CheckCircle, AlertTriangle, Car, User, Calendar } from 'lucide-react';
import Swal from 'sweetalert2';

const ServiceOrderProgress: React.FC = () => {
  const { user } = useAuth();
  const [serviceOrders, setServiceOrders] = useState<ServiceOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<ServiceOrder | null>(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [newStatus, setNewStatus] = useState<string>('');

  // Fetch service orders
  const fetchServiceOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await serviceOrderService.getMyServiceOrders();
      setServiceOrders(data);
    } catch (err: any) {
      setError(err.message || 'Không thể tải danh sách Service Order');
    } finally {
      setLoading(false);
    }
  };

  // Update service order status
  const handleUpdateStatus = async () => {
    if (!selectedOrder || !newStatus) {
      Swal.fire({
        icon: 'warning',
        title: 'Thiếu thông tin',
        text: 'Vui lòng chọn trạng thái mới',
        confirmButtonColor: '#10b981',
        confirmButtonText: 'Đã hiểu'
      });
      return;
    }

    // Check user role
    if (!user || user.role !== 'technician') {
      Swal.fire({
        icon: 'error',
        title: 'Không có quyền',
        text: 'Bạn không có quyền cập nhật Service Order. Chỉ Technician mới có thể thực hiện thao tác này.',
        confirmButtonColor: '#ef4444',
        confirmButtonText: 'Đã hiểu'
      });
      return;
    }

    try {
      // Backend now returns OrderID with capital O
      const orderId = selectedOrder.OrderID || selectedOrder.orderID;
      
      if (!orderId) {
        Swal.fire({
          icon: 'error',
          title: 'Lỗi',
          text: 'Không tìm thấy Order ID. Vui lòng thử lại.',
          confirmButtonColor: '#ef4444',
          confirmButtonText: 'Đã hiểu'
        });
        return;
      }

      // Map frontend status to backend status
      const statusMap: { [key: string]: string } = {
        'Pending': 'Pending',
        'InProgress': 'InProgress', 
        'Completed': 'Done',  // Frontend "Completed" -> Backend "Done"
        'Cancelled': 'Closed'  // Frontend "Cancelled" -> Backend "Closed"
      };
      
      const backendStatus = statusMap[newStatus] || newStatus;
      
      const request: UpdateServiceOrderRequest = {
        OrderID: orderId,
        Status: backendStatus
      };

      console.log('=== DEBUG UPDATE SERVICE ORDER ===');
      console.log('Original newStatus:', newStatus);
      console.log('Mapped backendStatus:', backendStatus);
      console.log('Request object:', request);
      console.log('Request OrderID:', request.OrderID);
      console.log('Request Status:', request.Status);
      console.log('Selected order:', selectedOrder);
      console.log('Current user:', user);
      console.log('Current user role:', user?.role);
      console.log('Technician ID from order:', selectedOrder.technicianID);
      console.log('Technician ID from user:', user?.id || 'Not available');
      console.log('OrderID type:', typeof selectedOrder.OrderID);
      console.log('OrderID value:', selectedOrder.OrderID);
      console.log('orderID type:', typeof selectedOrder.orderID);
      console.log('orderID value:', selectedOrder.orderID);
      console.log('Final orderId:', orderId);
      console.log('Access Token:', localStorage.getItem('accessToken'));
      console.log('=== END DEBUG ===');
      
      await serviceOrderService.updateServiceOrderStatus(request);
      Swal.fire({
        icon: 'success',
        title: 'Thành công!',
        text: 'Cập nhật trạng thái thành công!',
        confirmButtonColor: '#10b981',
        confirmButtonText: 'OK'
      });
      setShowUpdateModal(false);
      setSelectedOrder(null);
      setNewStatus('');
      fetchServiceOrders(); // Refresh the list
    } catch (err: any) {
      Swal.fire({
        icon: 'error',
        title: 'Lỗi',
        text: err.message || 'Không thể cập nhật trạng thái',
        confirmButtonColor: '#ef4444',
        confirmButtonText: 'Đã hiểu'
      });
    }
  };

  // Open update modal
  const openUpdateModal = (order: ServiceOrder) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setShowUpdateModal(true);
  };

  useEffect(() => {
    fetchServiceOrders();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'done':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'inprogress':
        return <Clock className="w-5 h-5 text-blue-500" />;
      case 'pending':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'cancelled':
      case 'closed':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'done':
        return 'bg-green-100 text-green-800';
      case 'inprogress':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
      case 'closed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'Chờ';
      case 'inprogress':
        return 'Đang bảo dưỡng';
      case 'completed':
      case 'done':
        return 'Hoàn tất';
      case 'cancelled':
      case 'closed':
        return 'Đã hủy';
      default:
        return status;
    }
  };

  if (loading && serviceOrders.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Đang tải danh sách công việc...</div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Cập nhật tiến độ bảo dưỡng</h2>
        <div className="flex space-x-2">
          <button
            onClick={fetchServiceOrders}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Đang tải...' : 'Làm mới'}
          </button>
          <button
            onClick={() => {
              console.log('=== DEBUG INFO ===');
              console.log('Service Orders:', serviceOrders);
              console.log('Current User:', user);
              console.log('User Role:', user?.role);
              console.log('Access Token:', localStorage.getItem('accessToken'));
              console.log('==================');
            }}
            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
          >
            Debug Info
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Service Orders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {serviceOrders.map((order) => (
          <div key={order.orderID} className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  {getStatusIcon(order.status)}
                  <span className={`ml-2 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                    {getStatusText(order.status)}
                  </span>
                </div>
                <span className="text-sm text-gray-500">#{order.orderID}</span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center text-sm">
                  <User className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="text-gray-600">Khách hàng:</span>
                  <span className="ml-2 font-medium">{order.customerName}</span>
                </div>

                <div className="flex items-center text-sm">
                  <Car className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="text-gray-600">Xe:</span>
                  <span className="ml-2 font-medium">{order.vehicleModel}</span>
                </div>

                <div className="text-sm">
                  <span className="text-gray-600">Dịch vụ:</span>
                  <span className="ml-2 font-medium">{order.serviceType}</span>
                </div>

                <div className="text-sm">
                  <span className="text-gray-600">Trung tâm:</span>
                  <span className="ml-2 font-medium">{order.centerName}</span>
                </div>

                <div className="flex items-center text-sm">
                  <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="text-gray-600">Ngày yêu cầu:</span>
                  <span className="ml-2 font-medium">
                    {new Date(order.requestDate).toLocaleDateString('vi-VN')}
                  </span>
                </div>

                <div className="text-sm">
                  <span className="text-gray-600">Ngày tạo:</span>
                  <span className="ml-2 font-medium">
                    {new Date(order.createDate).toLocaleDateString('vi-VN')}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <button
                  onClick={() => openUpdateModal(order)}
                  className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                >
                  Cập nhật tiến độ
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {serviceOrders.length === 0 && !loading && (
        <div className="text-center py-8">
          <Wrench className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Không có công việc nào</h3>
          <p className="text-gray-600 mb-4">Hiện tại không có Service Order nào được giao cho bạn</p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-md mx-auto">
            <p className="text-sm text-yellow-800">
              <strong>Lưu ý:</strong> Để có Service Order, Staff cần:
              <br />1. Vào trang "Xác nhận dịch vụ"
              <br />2. Chọn appointment và technician
              <br />3. Tạo Service Order
            </p>
          </div>
        </div>
      )}

      {/* Update Status Modal */}
      {showUpdateModal && selectedOrder && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Cập nhật tiến độ công việc
              </h3>
              
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Thông tin công việc:</h4>
                <p><strong>ID:</strong> #{selectedOrder.OrderID || selectedOrder.orderID}</p>
                <p><strong>Khách hàng:</strong> {selectedOrder.customerName}</p>
                <p><strong>Xe:</strong> {selectedOrder.vehicleModel}</p>
                <p><strong>Dịch vụ:</strong> {selectedOrder.serviceType}</p>
                <p><strong>Trạng thái hiện tại:</strong> {getStatusText(selectedOrder.status)}</p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Trạng thái mới:
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Pending">Chờ</option>
                  <option value="InProgress">Đang bảo dưỡng</option>
                  <option value="Completed">Hoàn tất</option>
                  <option value="Cancelled">Đã hủy</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowUpdateModal(false);
                    setSelectedOrder(null);
                    setNewStatus('');
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Hủy
                </button>
                <button
                  onClick={handleUpdateStatus}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  Cập nhật
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceOrderProgress;
