import React, { useState, useEffect } from 'react';
import { staffService } from '../../services/staffService';
import { Order, OrderStatus, PaginationParams } from '../../types/api';

const StaffOrderManagement: React.FC = () => {
  // State management
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | ''>('');
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch orders function
  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params: PaginationParams & { 
        status?: OrderStatus;
        search?: string;
      } = {
        page: currentPage,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      };

      if (statusFilter) params.status = statusFilter;
      if (searchTerm) params.search = searchTerm;

      const response = await staffService.getOrders(params);
      
      if (response.success && response.data) {
        setOrders(response.data.data);
        setTotalPages(response.data.pagination.totalPages);
      }
    } catch (err) {
      setError('Không thể tải danh sách đơn hàng');
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  // Update order status
  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const response = await staffService.updateOrderStatus(orderId, {
        status: newStatus,
        notes: `Cập nhật trạng thái thành ${newStatus}`
      });

      if (response.success) {
        // Refresh orders list
        fetchOrders();
        alert('Cập nhật trạng thái thành công!');
      }
    } catch (err) {
      alert('Không thể cập nhật trạng thái đơn hàng');
      console.error('Error updating order status:', err);
    }
  };

  // Assign order to technician
  const handleAssignTechnician = async (orderId: string, technicianId: string) => {
    try {
      const response = await staffService.assignOrderToTechnician(orderId, technicianId);
      
      if (response.success) {
        fetchOrders();
        alert('Giao việc thành công!');
      }
    } catch (err) {
      alert('Không thể giao việc');
      console.error('Error assigning technician:', err);
    }
  };

  // UseEffect to fetch data on component mount and when filters change
  useEffect(() => {
    fetchOrders();
  }, [currentPage, statusFilter, searchTerm]);

  // Render loading state
  if (loading && orders.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6">Quản lý Đơn hàng</h2>

      {/* Filters */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search */}
        <div>
          <label className="block text-sm font-medium mb-2">Tìm kiếm</label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo tên khách hàng, mã đơn..."
            className="w-full p-2 border rounded-md"
          />
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium mb-2">Trạng thái</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as OrderStatus | '')}
            className="w-full p-2 border rounded-md"
          >
            <option value="">Tất cả</option>
            <option value="pending">Chờ xử lý</option>
            <option value="confirmed">Đã xác nhận</option>
            <option value="in-progress">Đang thực hiện</option>
            <option value="completed">Hoàn thành</option>
            <option value="cancelled">Đã hủy</option>
          </select>
        </div>

        {/* Refresh Button */}
        <div className="flex items-end">
          <button
            onClick={fetchOrders}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Đang tải...' : 'Làm mới'}
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Orders Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-2 text-left">Mã đơn</th>
              <th className="px-4 py-2 text-left">Khách hàng</th>
              <th className="px-4 py-2 text-left">Dịch vụ</th>
              <th className="px-4 py-2 text-left">Trạng thái</th>
              <th className="px-4 py-2 text-left">Kỹ thuật viên</th>
              <th className="px-4 py-2 text-left">Chi phí</th>
              <th className="px-4 py-2 text-left">Ngày tạo</th>
              <th className="px-4 py-2 text-left">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-2 font-mono">{order.id.slice(-8)}</td>
                <td className="px-4 py-2">{order.customer?.fullName || 'N/A'}</td>
                <td className="px-4 py-2">{order.serviceType}</td>
                <td className="px-4 py-2">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    order.status === 'completed' ? 'bg-green-100 text-green-800' :
                    order.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                    order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-4 py-2">
                  {order.technician?.fullName || 'Chưa giao'}
                </td>
                <td className="px-4 py-2">
                  {order.estimatedCost.toLocaleString('vi-VN')} VNĐ
                </td>
                <td className="px-4 py-2">
                  {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                </td>
                <td className="px-4 py-2">
                  <div className="flex space-x-2">
                    {/* View Details Button */}
                    <button
                      onClick={() => {/* Navigate to order details */}}
                      className="px-2 py-1 bg-gray-500 text-white rounded text-xs hover:bg-gray-600"
                    >
                      Xem
                    </button>
                    
                    {/* Update Status */}
                    {order.status === 'pending' && (
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'confirmed')}
                        className="px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600"
                      >
                        Xác nhận
                      </button>
                    )}
                    
                    {/* Assign Technician */}
                    {order.status === 'confirmed' && !order.assignedTechnician && (
                      <button
                        onClick={() => {
                          // Open technician selection modal
                          const technicianId = prompt('Nhập ID kỹ thuật viên:');
                          if (technicianId) {
                            handleAssignTechnician(order.id, technicianId);
                          }
                        }}
                        className="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
                      >
                        Giao việc
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-center space-x-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Trước
          </button>
          
          <span className="px-3 py-1">
            Trang {currentPage} / {totalPages}
          </span>
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Sau
          </button>
        </div>
      )}
    </div>
  );
};

export default StaffOrderManagement;