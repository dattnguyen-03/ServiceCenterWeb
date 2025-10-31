import React, { useState, useEffect } from 'react';
import { 
  Table, Button, Modal, Form, InputNumber, Select,
  Card, Statistic, Row, Col, Descriptions, Tag
} from 'antd';
import { 
  PlusOutlined, EyeOutlined,
  AppstoreOutlined, ToolOutlined, InfoCircleOutlined
} from '@ant-design/icons';
import { partUsageService, PartUsage, CreatePartUsageRequest } from '../../services/partUsageService';
import { partService, Part } from '../../services/partService';
import { serviceOrderService, ServiceOrder } from '../../services/serviceOrderService';
import { serviceCenterService, ServiceCenter } from '../../services/serviceCenterService';
import { showSuccess, showError } from '../../utils/sweetAlert';
const { Option } = Select;

const TechnicianPartUsage: React.FC = () => {
  const [partUsages, setPartUsages] = useState<PartUsage[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [viewingPartUsage, setViewingPartUsage] = useState<PartUsage | null>(null);
  const [parts, setParts] = useState<Part[]>([]);
  const [myOrders, setMyOrders] = useState<ServiceOrder[]>([]);
  const [centers, setCenters] = useState<ServiceCenter[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    loadData();
  }, []);

  // Reload orders when modal opens
  useEffect(() => {
    if (modalVisible) {
      const reloadOrders = async () => {
        try {
          setLoadingOrders(true);
          const orders = await serviceOrderService.getMyServiceOrders();
          console.log('Reloaded orders when modal opened:', orders);
          console.log('Orders length:', orders?.length);
          console.log('First order:', orders?.[0]);
          setMyOrders(orders || []);
          
          // Debug: Log để kiểm tra
          if (orders && orders.length > 0) {
            const firstOrder = orders[0];
            console.log('First order keys:', Object.keys(firstOrder));
            console.log('First order OrderID:', firstOrder.OrderID);
            console.log('First order orderID:', firstOrder.orderID);
          }
        } catch (err: any) {
          console.error('Error reloading orders:', err);
        } finally {
          setLoadingOrders(false);
        }
      };
      reloadOrders();
    }
  }, [modalVisible]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [partUsagesData, partsData, centersData] = await Promise.all([
        partUsageService.getMyPartUsage().catch(err => {
          console.error('Error loading my part usages:', err);
          return [];
        }),
        partService.getAllParts().catch(err => {
          console.error('Error loading parts:', err);
          showError('Lỗi', 'Không thể tải danh sách phụ tùng. Vui lòng thử lại.');
          return [];
        }),
        serviceCenterService.getServiceCenters().catch(err => {
          console.error('Error loading centers:', err);
          showError('Lỗi', 'Không thể tải danh sách trung tâm dịch vụ. Vui lòng thử lại.');
          return [];
        })
      ]);
      
      setPartUsages(partUsagesData || []);
      setParts(partsData || []);
      setCenters(centersData || []);
      
      // Load my service orders
      try {
        setLoadingOrders(true);
        const orders = await serviceOrderService.getMyServiceOrders();
        console.log('Loaded my orders:', orders);
        setMyOrders(orders || []);
        if (!orders || orders.length === 0) {
          console.warn('No service orders found for this technician');
        }
      } catch (err: any) {
        console.error('Error loading my service orders:', err);
        // Không hiển thị error vì có thể technician chưa có order nào
      } finally {
        setLoadingOrders(false);
      }
    } catch (error: any) {
      console.error('Error loading data:', error);
      showError('Lỗi', error.message || 'Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    // Reload orders trước khi mở modal
    try {
      setLoadingOrders(true);
      const orders = await serviceOrderService.getMyServiceOrders();
      console.log('Reloaded orders for modal:', orders);
      setMyOrders(orders || []);
      
      if (!orders || orders.length === 0) {
        showError('Thông báo', 'Bạn chưa có đơn dịch vụ nào được gán. Vui lòng liên hệ quản lý để được gán đơn dịch vụ.');
        setLoadingOrders(false);
        return;
      }
    } catch (err: any) {
      console.error('Error reloading orders:', err);
      showError('Lỗi', 'Không thể tải danh sách đơn dịch vụ. Vui lòng thử lại.');
      setLoadingOrders(false);
      return;
    } finally {
      setLoadingOrders(false);
    }
    
    form.resetFields();
    setModalVisible(true);
  };

  const handleViewDetail = (partUsage: PartUsage) => {
    setViewingPartUsage(partUsage);
    setDetailModalVisible(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      // Tìm ServiceOrder để lấy CenterID (có thể là OrderID hoặc orderID)
      const selectedOrder = myOrders.find(o => 
        (o.OrderID === values.orderID) || (o.orderID === values.orderID)
      );
      if (!selectedOrder) {
        showError('Lỗi', 'Không tìm thấy đơn dịch vụ. Vui lòng chọn lại.');
        return;
      }

      // Tìm CenterID từ centerName hoặc từ form
      let centerID = values.centerID;
      
      if (!centerID) {
        const center = centers.find(c => c.name === selectedOrder.centerName);
        if (center) {
          centerID = center.centerID;
        }
      }

      if (!centerID) {
        showError('Lỗi', 'Không xác định được trung tâm dịch vụ. Vui lòng chọn trung tâm.');
        return;
      }

      const data: CreatePartUsageRequest = {
        orderID: values.orderID,
        partID: values.partID,
        quantityUsed: values.quantityUsed,
        centerID: centerID
      };
      
      await partUsageService.createPartUsage(data);
      showSuccess('Thành công', 'Tạo bản ghi sử dụng phụ tùng thành công. Số lượng đã được trừ khỏi tồn kho.');
      
      setModalVisible(false);
      form.resetFields();
      loadData();
    } catch (error: any) {
      showError('Lỗi', error.message || 'Không thể tạo bản ghi sử dụng phụ tùng');
    }
  };

  // Handler khi chọn Order, tự động set CenterID
  const handleOrderChange = (orderID: number) => {
    const order = myOrders.find(o => 
      (o.OrderID === orderID) || (o.orderID === orderID)
    );
    if (order) {
      const center = centers.find(c => c.name === order.centerName);
      if (center) {
        form.setFieldsValue({ centerID: center.centerID });
      }
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'usageID',
      key: 'usageID',
      width: 80,
      render: (id: number) => <Tag color="blue">#{id}</Tag>,
    },
    {
      title: 'Đơn dịch vụ',
      dataIndex: 'orderID',
      key: 'orderID',
      width: 120,
      render: (orderID: number) => <Tag color="green">Order #{orderID}</Tag>,
    },
    {
      title: 'Phụ tùng',
      dataIndex: 'partName',
      key: 'partName',
      render: (text: string) => <strong style={{ fontSize: '15px' }}>{text}</strong>,
    },
    {
      title: 'Số lượng đã dùng',
      dataIndex: 'quantityUsed',
      key: 'quantityUsed',
      align: 'center' as const,
      render: (quantity: number) => (
        <Tag color="orange" style={{ fontSize: '14px', padding: '4px 12px', fontWeight: 600 }}>
          {quantity.toLocaleString('vi-VN')}
        </Tag>
      ),
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 100,
      render: (_: any, record: PartUsage) => (
        <Button
          icon={<EyeOutlined />}
          onClick={() => handleViewDetail(record)}
          size="small"
        >
          Xem
        </Button>
      ),
    },
  ];

  const stats = {
    total: partUsages.length,
    totalQuantityUsed: partUsages.reduce((sum, pu) => sum + pu.quantityUsed, 0),
    uniqueParts: new Set(partUsages.map(pu => pu.partName)).size
  };

  return (
    <div style={{ padding: '24px', background: '#f5f5f5', minHeight: '100vh' }}>
      <Card 
        style={{ 
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        }}
      >
        <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '8px', color: '#1f2937' }}>
              <ToolOutlined style={{ marginRight: '12px', color: '#3b82f6' }} />
              Sử dụng phụ tùng của tôi
            </h2>
            <p style={{ color: '#6b7280', fontSize: '15px' }}>Xem và quản lý việc sử dụng phụ tùng trong các đơn dịch vụ của bạn</p>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
            size="large"
            style={{
              height: '48px',
              fontSize: '16px',
              fontWeight: 600,
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              border: 'none',
            }}
          >
            Thêm bản ghi
          </Button>
        </div>

        {/* Statistics */}
        <Row gutter={16} style={{ marginBottom: '24px' }}>
          <Col xs={24} sm={8}>
            <Card 
              style={{ 
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
                border: 'none',
              }}
            >
              <Statistic
                title={<span style={{ color: '#64748b' }}>Tổng bản ghi</span>}
                value={stats.total}
                prefix={<AppstoreOutlined style={{ color: '#3b82f6' }} />}
                valueStyle={{ fontSize: '28px', fontWeight: 700, color: '#1e40af' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card 
              style={{ 
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)',
                border: 'none',
              }}
            >
              <Statistic
                title={<span style={{ color: '#64748b' }}>Tổng số lượng đã dùng</span>}
                value={stats.totalQuantityUsed}
                prefix={<ToolOutlined style={{ color: '#f59e0b' }} />}
                formatter={(value) => value.toLocaleString('vi-VN')}
                valueStyle={{ fontSize: '28px', fontWeight: 700, color: '#d97706' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card 
              style={{ 
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                border: 'none',
              }}
            >
              <Statistic
                title={<span style={{ color: '#64748b' }}>Loại phụ tùng</span>}
                value={stats.uniqueParts}
                prefix={<AppstoreOutlined style={{ color: '#10b981' }} />}
                valueStyle={{ fontSize: '28px', fontWeight: 700, color: '#047857' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Table */}
        <Card style={{ borderRadius: '12px', border: '1px solid #e5e7eb' }}>
          <Table
            columns={columns}
            dataSource={partUsages}
            loading={loading}
            rowKey="usageID"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => (
                <span style={{ fontSize: '14px', fontWeight: 600 }}>
                  Tổng cộng <span style={{ color: '#3b82f6' }}>{total}</span> bản ghi
                </span>
              ),
            }}
            locale={{ emptyText: 'Bạn chưa có bản ghi sử dụng phụ tùng nào' }}
          />
        </Card>
      </Card>

      {/* Detail Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <InfoCircleOutlined style={{ color: '#3b82f6', fontSize: '20px' }} />
            <span style={{ fontSize: '18px', fontWeight: 600 }}>Chi tiết bản ghi sử dụng</span>
          </div>
        }
        open={detailModalVisible}
        onCancel={() => {
          setDetailModalVisible(false);
          setViewingPartUsage(null);
        }}
        footer={[
          <Button 
            key="close" 
            onClick={() => {
              setDetailModalVisible(false);
              setViewingPartUsage(null);
            }}
          >
            Đóng
          </Button>
        ]}
        width={700}
      >
        {viewingPartUsage && (
          <Descriptions bordered column={1} size="middle">
            <Descriptions.Item label="Mã bản ghi">
              <Tag color="blue" style={{ fontSize: '14px', padding: '4px 12px' }}>
                #{viewingPartUsage.usageID}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Đơn dịch vụ">
              <Tag color="green" style={{ fontSize: '14px', padding: '4px 12px' }}>
                Order #{viewingPartUsage.orderID}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Phụ tùng">
              <strong style={{ fontSize: '16px' }}>{viewingPartUsage.partName}</strong>
            </Descriptions.Item>
            <Descriptions.Item label="Số lượng đã dùng">
              <Tag color="orange" style={{ fontSize: '16px', padding: '4px 12px', fontWeight: 600 }}>
                {viewingPartUsage.quantityUsed.toLocaleString('vi-VN')}
              </Tag>
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      {/* Create Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '18px', fontWeight: 600 }}>
              Thêm bản ghi sử dụng phụ tùng
            </span>
          </div>
        }
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        onOk={handleSubmit}
        okText="Lưu"
        cancelText="Hủy"
        width={600}
        okButtonProps={{ 
          style: { height: '40px', fontSize: '16px', fontWeight: 600 }
        }}
        cancelButtonProps={{
          style: { height: '40px', fontSize: '16px' }
        }}
      >
        <Form
          form={form}
          layout="vertical"
          autoComplete="off"
        >
          <Form.Item
            name="orderID"
            label={<strong>Đơn dịch vụ</strong>}
            rules={[{ required: true, message: 'Vui lòng chọn đơn dịch vụ' }]}
          >
            <Select 
              placeholder="Chọn đơn dịch vụ của bạn" 
              size="large"
              showSearch
              loading={loadingOrders}
              notFoundContent={
                loadingOrders 
                  ? "Đang tải dữ liệu..." 
                  : myOrders.length === 0 
                    ? "Bạn chưa có đơn dịch vụ nào được gán" 
                    : "Không tìm thấy đơn dịch vụ"
              }
              onChange={(value) => {
                console.log('Selected order ID:', value);
                handleOrderChange(value);
              }}
              filterOption={(input, option) => {
                const text = (option?.children as unknown as string)?.toLowerCase() || '';
                return text.includes(input.toLowerCase());
              }}
            >
              {(() => {
                const validOrders = myOrders.filter(order => {
                  const id = order?.OrderID || order?.orderID;
                  const isValid = order && id;
                  if (!isValid) {
                    console.warn('Invalid order filtered out:', order);
                  }
                  return isValid;
                });
                
                console.log('Total orders:', myOrders.length);
                console.log('Valid orders after filter:', validOrders.length);
                
                return validOrders.map(order => {
                  const id = order.OrderID || order.orderID;
                  const displayText = `Order #${id} - ${order.customerName || ''} - ${order.centerName || ''}`;
                  console.log('Rendering option:', { id, displayText });
                  return (
                    <Option key={id} value={id}>
                      {displayText}
                    </Option>
                  );
                });
              })()}
            </Select>
          </Form.Item>

          <Form.Item
            name="centerID"
            label={<strong>Trung tâm dịch vụ</strong>}
            rules={[{ required: true, message: 'Vui lòng chọn trung tâm dịch vụ' }]}
          >
            <Select 
              placeholder="Chọn trung tâm dịch vụ" 
              size="large"
              showSearch
              loading={centers.length === 0}
              notFoundContent={centers.length === 0 ? "Đang tải dữ liệu..." : "Không tìm thấy trung tâm"}
              filterOption={(input, option) =>
                (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
              }
            >
              {centers
                .filter(center => center && center.centerID)
                .map(center => (
                  <Option key={center.centerID} value={center.centerID}>
                    {center.name || ''} - {center.address || ''}
                  </Option>
                ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="partID"
            label={<strong>Phụ tùng</strong>}
            rules={[{ required: true, message: 'Vui lòng chọn phụ tùng' }]}
          >
            <Select 
              placeholder="Chọn phụ tùng" 
              size="large"
              showSearch
              loading={parts.length === 0}
              notFoundContent={parts.length === 0 ? "Đang tải dữ liệu..." : "Không tìm thấy phụ tùng"}
              filterOption={(input, option) =>
                (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
              }
            >
              {parts
                .filter(part => part && part.partID)
                .map(part => (
                  <Option key={part.partID} value={part.partID}>
                    {part.name || ''}
                  </Option>
                ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="quantityUsed"
            label={<strong>Số lượng đã dùng</strong>}
            rules={[
              { required: true, message: 'Vui lòng nhập số lượng' },
              { type: 'number', min: 1, message: 'Số lượng phải lớn hơn 0' }
            ]}
          >
            <InputNumber
              style={{ width: '100%' }}
              placeholder="Nhập số lượng"
              size="large"
              min={1}
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            />
          </Form.Item>

          <div style={{ 
            padding: '12px', 
            background: '#fff7ed', 
            borderRadius: '8px',
            marginTop: '8px',
            fontSize: '13px',
            color: '#d97706'
          }}>
            <InfoCircleOutlined style={{ marginRight: '8px' }} />
            Sau khi tạo, số lượng phụ tùng sẽ được trừ khỏi tồn kho của trung tâm đã chọn.
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default TechnicianPartUsage;

