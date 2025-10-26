import React, { useState, useEffect } from 'react';
import { serviceOrderService, ServiceOrder } from '../../services/serviceOrderService';
import { Wrench, AlertTriangle } from 'lucide-react';
import { Card, Button, Table, Tag, message } from 'antd';

const ServiceOrderManagement: React.FC = () => {
  const [serviceOrders, setServiceOrders] = useState<ServiceOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all service orders
  const fetchServiceOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await serviceOrderService.getAllServiceOrders();
      setServiceOrders(data);
      if (data.length === 0) {
        message.info('Chưa có Service Order nào trong hệ thống');
      }
    } catch (err: any) {
      setError(err.message || 'Không thể tải danh sách Service Order');
      message.error(err.message || 'Không thể tải danh sách Service Order');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServiceOrders();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'done':
        return 'success';
      case 'inprogress':
        return 'processing';
      case 'pending':
        return 'warning';
      case 'cancelled':
      case 'closed':
        return 'error';
      default:
        return 'default';
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
      <div className="p-6 bg-gray-50 min-h-screen flex flex-col items-center justify-center">
        <div className="text-lg">Đang tải danh sách Service Order...</div>
      </div>
    );
  }

  const columns = [
    {
      title: 'ID',
      dataIndex: 'OrderID',
      key: 'OrderID',
      width: 80,
    },
    {
      title: 'Khách hàng',
      dataIndex: 'customerName',
      key: 'customerName',
      width: 150,
    },
    {
      title: 'Xe',
      dataIndex: 'vehicleModel',
      key: 'vehicleModel',
      width: 150,
    },
    {
      title: 'Dịch vụ',
      dataIndex: 'serviceType',
      key: 'serviceType',
      width: 200,
    },
    {
      title: 'Trung tâm',
      dataIndex: 'centerName',
      key: 'centerName',
      width: 200,
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createDate',
      key: 'createDate',
      width: 150,
      render: (date: string) => new Date(date).toLocaleDateString('vi-VN'),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>
      ),
    },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                <Wrench className="text-white text-2xl" />
              </div>
              <div>
                <h2 className="!mb-1 text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Danh Sách Service Order
                </h2>
                <p className="text-gray-600 text-base">
                  Xem danh sách các Service Orders trong hệ thống
                </p>
                <div className="flex items-center space-x-4 mt-2">
                  <div className="flex items-center space-x-1 text-sm text-gray-500">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Hệ thống hoạt động bình thường</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    Tổng cộng: {serviceOrders.length} Service Orders
                  </div>
                </div>
              </div>
            </div>
            <Button
              onClick={fetchServiceOrders}
              disabled={loading}
              className="border-gray-200 hover:border-blue-500 hover:text-blue-500"
              size="large"
            >
              {loading ? 'Đang tải...' : 'Làm mới'}
            </Button>
          </div>
        </div>
      </div>

      {error && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <div className="flex items-center space-x-2 text-red-700">
            <AlertTriangle className="text-red-500" />
            <span>{error}</span>
          </div>
        </Card>
      )}

      {/* Service Orders Table */}
      <Card className="border-0 shadow-sm">
        <Table
          columns={columns}
          dataSource={serviceOrders}
          loading={loading}
          rowKey={(record) => record.OrderID?.toString() || record.orderID?.toString() || ''}
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </div>
  );
};

export default ServiceOrderManagement;

