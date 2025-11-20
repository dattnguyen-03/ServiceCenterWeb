import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Tag, Button, Modal, Descriptions, Statistic, Select, Spin, Empty, Tooltip, Alert } from 'antd';
import { ToolOutlined, ReloadOutlined, CheckCircleOutlined, ClockCircleOutlined, WarningOutlined, CloseCircleOutlined, CarOutlined, UserOutlined, BuildOutlined } from '@ant-design/icons';
import { serviceOrderService, ServiceOrder, UpdateServiceOrderRequest } from '../../services/serviceOrderService';
import { useAuth } from '../../contexts/AuthContext';
import { showSuccess, showError, showWarning } from '../../utils/sweetAlert';

const ServiceOrderProgress: React.FC = () => {
  const { user } = useAuth();
  const [serviceOrders, setServiceOrders] = useState<ServiceOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<ServiceOrder | null>(null);
  const [isUpdateModalVisible, setIsUpdateModalVisible] = useState(false);
  const [newStatus, setNewStatus] = useState<string>('');

  const fetchServiceOrders = async () => {
    setLoading(true);
    try {
      const data = await serviceOrderService.getMyServiceOrders();
      setServiceOrders(data);
    } catch (err: any) {
      showError('Lỗi', err.message || 'Không thể tải danh sách Service Order');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedOrder || !newStatus) {
      showWarning('Thiếu thông tin', 'Vui lòng chọn trạng thái mới');
      return;
    }

    if (!user || user.role !== 'technician') {
      showError('Không có quyền', 'Chỉ Technician mới có thể cập nhật Service Order');
      return;
    }

    try {
      const orderId = selectedOrder.OrderID || selectedOrder.orderID;
      
      if (!orderId) {
        showError('Lỗi', 'Không tìm thấy Order ID');
        return;
      }

      const statusMap: { [key: string]: string } = {
        'Pending': 'Pending',
        'InProgress': 'InProgress', 
        'Completed': 'Done',
        'Cancelled': 'Closed'
      };
      
      const backendStatus = statusMap[newStatus] || newStatus;
      
      const request: UpdateServiceOrderRequest = {
        OrderID: orderId,
        Status: backendStatus
      };

      await serviceOrderService.updateServiceOrderStatus(request);
      showSuccess('Cập nhật thành công!');
      setIsUpdateModalVisible(false);
      setSelectedOrder(null);
      setNewStatus('');
      await fetchServiceOrders();
    } catch (err: any) {
      showError('Lỗi', err.message || 'Không thể cập nhật trạng thái');
    }
  };

  const openUpdateModal = (order: ServiceOrder) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setIsUpdateModalVisible(true);
  };

  useEffect(() => {
    fetchServiceOrders();
  }, []);

  const getStatusInfo = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'done':
        return { icon: <CheckCircleOutlined />, color: 'green', text: '✓ Hoàn tất' };
      case 'inprogress':
        return { icon: <ClockCircleOutlined />, color: 'blue', text: 'Đang bảo dưỡng' };
      // case 'pending':
      //   return { icon: <WarningOutlined />, color: 'orange', text: 'Chờ xử lý' };
      case 'cancelled':
      case 'closed':
        return { icon: <CloseCircleOutlined />, color: 'red', text: 'Đã hủy' };
      default:
        return { icon: <ClockCircleOutlined />, color: 'default', text: status };
    }
  };

  const getStatusColor = (status: string) => {
    const statusColors: Record<string, string> = {
      'completed': '#10b981',
      'done': '#10b981',
      'inprogress': '#3b82f6',
      'pending': '#f59e0b',
      'cancelled': '#ef4444',
      'closed': '#ef4444'
    };
    return statusColors[status.toLowerCase()] || '#6b7280';
  };

  const totalOrders = serviceOrders.length;
  const completedOrders = serviceOrders.filter(o => 
    o.status.toLowerCase() === 'completed' || o.status.toLowerCase() === 'done'
  ).length;
  const inProgressOrders = serviceOrders.filter(o => 
    o.status.toLowerCase() === 'inprogress'
  ).length;
  const pendingOrders = serviceOrders.filter(o => 
    o.status.toLowerCase() === 'pending'
  ).length;

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #f0f9ff 0%, #f9fafb 100%)', padding: '24px' }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div style={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '32px',
          borderRadius: '16px',
          marginBottom: '24px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <ToolOutlined style={{ fontSize: '36px', color: '#fff', marginRight: '16px' }} />
              <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#fff', margin: 0 }}>
                Cập nhật tiến độ bảo dưỡng
              </h1>
            </div>
          </div>
          <p style={{ color: '#e0e7ff', fontSize: '16px', margin: 0 }}>
            Quản lý và cập nhật trạng thái các Service Order của bạn
          </p>
        </div>

        {/* Statistics */}
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} sm={12} md={6}>
            <Card style={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
              <Statistic
                title={<span style={{ color: '#6b7280' }}>Tổng đơn</span>}
                value={totalOrders}
                prefix={<BuildOutlined style={{ color: '#667eea' }} />}
                valueStyle={{ color: '#667eea', fontWeight: 700 }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card style={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
              <Statistic
                title={<span style={{ color: '#6b7280' }}>Hoàn tất</span>}
                value={completedOrders}
                prefix={<CheckCircleOutlined style={{ color: '#10b981' }} />}
                valueStyle={{ color: '#10b981', fontWeight: 700 }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card style={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
              <Statistic
                title={<span style={{ color: '#6b7280' }}>Đang bảo dưỡng</span>}
                value={inProgressOrders}
                prefix={<ClockCircleOutlined style={{ color: '#3b82f6' }} />}
                valueStyle={{ color: '#3b82f6', fontWeight: 700 }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card style={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
              {/* <Statistic
                title={<span style={{ color: '#6b7280' }}>Chờ xử lý</span>}
                value={pendingOrders}
                prefix={<WarningOutlined style={{ color: '#f59e0b' }} />}
                valueStyle={{ color: '#f59e0b', fontWeight: 700 }}
              /> */}
            </Card>
          </Col>
        </Row>

        {/* Service Orders Grid */}
        {loading && serviceOrders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <Spin size="large" />
            <p style={{ marginTop: '16px', color: '#6b7280' }}>Đang tải danh sách công việc...</p>
          </div>
        ) : serviceOrders.length === 0 ? (
          <Card style={{ borderRadius: '16px', border: 'none', boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }}>
            <Empty
              image={<BuildOutlined style={{ fontSize: '64px', color: '#d1d5db' }} />}
              description={
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#1f2937', marginBottom: '8px' }}>
                    Không có công việc nào
                  </h3>
                  <p style={{ color: '#6b7280', marginBottom: '24px' }}>
                    Hiện tại không có Service Order nào được giao cho bạn
                  </p>
                  <Alert
                    message="Lưu ý"
                    description="Để có Service Order, Staff cần: Vào trang 'Xác nhận dịch vụ' → Chọn appointment và technician → Tạo Service Order"
                    type="info"
                    showIcon
                    style={{ maxWidth: '600px', margin: '0 auto' }}
                  />
                </div>
              }
            />
          </Card>
        ) : (
          <Row gutter={[16, 16]}>
            {serviceOrders.map((order) => {
              const statusInfo = getStatusInfo(order.status);
              const statusColor = getStatusColor(order.status);
              
              return (
                <Col xs={24} sm={12} lg={8} key={order.orderID}>
                  <Card
                    style={{
                      borderRadius: '12px',
                      border: '1px solid #e5e7eb',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                      transition: 'all 0.3s ease'
                    }}
                    bodyStyle={{ padding: '20px' }}
                    hoverable
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                      <Tag 
                        icon={statusInfo.icon} 
                        color={statusInfo.color}
                        style={{ borderRadius: '12px', fontSize: '13px', padding: '4px 12px', fontWeight: 600 }}
                      >
                        {statusInfo.text}
                      </Tag>
                      <span style={{ fontSize: '13px', color: '#9ca3af', fontWeight: 600 }}>
                        #{order.OrderID || order.orderID}
                      </span>
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', fontSize: '14px' }}>
                        <UserOutlined style={{ color: '#3b82f6', marginRight: '8px' }} />
                        <span style={{ color: '#6b7280' }}>KH:</span>
                        <span style={{ marginLeft: '8px', fontWeight: 600, color: '#1f2937' }}>
                          {order.customerName}
                        </span>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', fontSize: '14px' }}>
                        <CarOutlined style={{ color: '#3b82f6', marginRight: '8px' }} />
                        <span style={{ color: '#6b7280' }}>Xe:</span>
                        <span style={{ marginLeft: '8px', fontWeight: 600, color: '#1f2937' }}>
                          {order.vehicleModel}
                        </span>
                      </div>
                      
                      <div style={{ marginBottom: '8px', fontSize: '14px' }}>
                        <span style={{ color: '#6b7280' }}>Dịch vụ: </span>
                        <span style={{ fontWeight: 600, color: '#1f2937' }}>{order.serviceType}</span>
                      </div>
                      
                      <div style={{ marginBottom: '8px', fontSize: '14px' }}>
                        <span style={{ color: '#6b7280' }}>Trung tâm: </span>
                        <span style={{ fontWeight: 600, color: '#1f2937' }}>{order.centerName}</span>
                      </div>
                      
                      <div style={{ fontSize: '14px' }}>
                        <ClockCircleOutlined style={{ color: '#9ca3af', marginRight: '8px' }} />
                        <span style={{ color: '#6b7280' }}>Ngày: </span>
                        <span style={{ fontWeight: 600, color: '#1f2937' }}>
                          {new Date(order.requestDate).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                    </div>

                    <Button
                      type="primary"
                      block
                      onClick={() => openUpdateModal(order)}
                      style={{
                        borderRadius: '8px',
                        fontWeight: 600,
                        height: '40px',
                        background: statusColor,
                        borderColor: statusColor
                      }}
                    >
                      Cập nhật tiến độ
                    </Button>
                  </Card>
                </Col>
              );
            })}
          </Row>
        )}

        {/* Update Status Modal */}
        <Modal
          title={
            <div style={{ fontSize: '20px', fontWeight: 700, color: '#1f2937' }}>
              ⚙️ Cập nhật tiến độ công việc
            </div>
          }
          open={isUpdateModalVisible}
          onCancel={() => {
            setIsUpdateModalVisible(false);
            setSelectedOrder(null);
            setNewStatus('');
          }}
          footer={null}
          centered
          width={600}
          styles={{ body: { borderRadius: '16px' } }}
        >
          {selectedOrder && (
            <>
              <Descriptions bordered column={1} style={{ marginBottom: '24px' }}>
                <Descriptions.Item label="ID" labelStyle={{ fontWeight: 600 }}>
                  #{selectedOrder.OrderID || selectedOrder.orderID}
                </Descriptions.Item>
                <Descriptions.Item label="Khách hàng" labelStyle={{ fontWeight: 600 }}>
                  {selectedOrder.customerName}
                </Descriptions.Item>
                <Descriptions.Item label="Xe" labelStyle={{ fontWeight: 600 }}>
                  {selectedOrder.vehicleModel}
                </Descriptions.Item>
                <Descriptions.Item label="Dịch vụ" labelStyle={{ fontWeight: 600 }}>
                  {selectedOrder.serviceType}
                </Descriptions.Item>
                <Descriptions.Item label="Trung tâm" labelStyle={{ fontWeight: 600 }}>
                  {selectedOrder.centerName}
                </Descriptions.Item>
                <Descriptions.Item label="Trạng thái hiện tại" labelStyle={{ fontWeight: 600 }}>
                  {(() => {
                    const { icon, color, text } = getStatusInfo(selectedOrder.status);
                    return <Tag icon={icon} color={color}>{text}</Tag>;
                  })()}
                </Descriptions.Item>
              </Descriptions>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#1f2937' }}>
                  Trạng thái mới:
                </label>
                <Select
                  value={newStatus}
                  onChange={setNewStatus}
                  style={{ width: '100%' }}
                  size="large"
                  placeholder="Chọn trạng thái mới"
                >
                  {/* <Select.Option value="Pending">
                    <WarningOutlined style={{ marginRight: '8px' }} /> Chờ xử lý
                  </Select.Option> */}
                  <Select.Option value="InProgress">
                    <ClockCircleOutlined style={{ marginRight: '8px' }} /> Đang bảo dưỡng
                  </Select.Option>
                  <Select.Option value="Completed">
                    <CheckCircleOutlined style={{ marginRight: '8px' }} /> Hoàn tất
                  </Select.Option>
                  <Select.Option value="Cancelled">
                    <CloseCircleOutlined style={{ marginRight: '8px' }} /> Đã hủy
                  </Select.Option>
                </Select>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <Button onClick={() => {
                  setIsUpdateModalVisible(false);
                  setSelectedOrder(null);
                  setNewStatus('');
                }}>
                  Hủy
                </Button>
                <Button 
                  type="primary" 
                  onClick={handleUpdateStatus}
                  loading={loading}
                  style={{ borderRadius: '8px', fontWeight: 600 }}
                >
                  Cập nhật
                </Button>
              </div>
            </>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default ServiceOrderProgress;
