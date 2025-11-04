import React, { useState, useEffect } from 'react';
import { 
  Card, Table, Button, InputNumber, Select, Form, Modal, 
  notification, Tag, Space, Descriptions, Row, Col, Statistic 
} from 'antd';
import { 
  PlusOutlined, ShoppingCartOutlined, 
  SendOutlined, EyeOutlined, DollarOutlined, AppstoreOutlined 
} from '@ant-design/icons';
import { partService, Part } from '../../services/partService';
import { serviceChecklistService, ServiceChecklist } from '../../services/serviceChecklistService';
import { quoteService, CreateQuoteRequestFromTechnician } from '../../services/quoteService';
import { serviceOrderService, ServiceOrder } from '../../services/serviceOrderService';
import { quoteRequestService, QuoteRequest } from '../../services/quoteRequestService';
import { showSuccess, showError } from '../../utils/sweetAlert';

interface SelectedPart extends Part {
  quantity: number;
  totalPrice: number;
}

const PartsUsage: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isChecklistModalVisible, setIsChecklistModalVisible] = useState(false);
  const [selectedParts, setSelectedParts] = useState<SelectedPart[]>([]);
  const [availableParts, setAvailableParts] = useState<Part[]>([]);
  const [checklists, setChecklists] = useState<ServiceChecklist[]>([]);
  const [selectedChecklist, setSelectedChecklist] = useState<ServiceChecklist | null>(null);
  const [loading, setLoading] = useState(false);
  const [serviceOrders, setServiceOrders] = useState<ServiceOrder[]>([]);
  const [quoteRequests, setQuoteRequests] = useState<QuoteRequest[]>([]);
  const [form] = Form.useForm();

  useEffect(() => {
    loadParts();
    loadServiceOrders();
    loadChecklists();
    loadQuoteRequests();
  }, []);
  
  const loadQuoteRequests = async () => {
    try {
      const requests = await quoteRequestService.getAllQuoteRequests();
      setQuoteRequests(requests);
    } catch (error: any) {
      console.error('Error loading quote requests:', error);
      // Không hiển thị error vì không quan trọng lắm
    }
  };

  const loadParts = async () => {
    try {
      const data = await partService.getAllParts();
      setAvailableParts(data);
    } catch (error: any) {
      console.error('Error loading parts:', error);
      notification.error({
        message: 'Lỗi tải phụ tùng',
        description: error.message || 'Không thể tải danh sách phụ tùng'
      });
    }
  };

  const loadServiceOrders = async () => {
    try {
      const orders = await serviceOrderService.getMyServiceOrders();
      setServiceOrders(orders || []);
      console.log('Loaded service orders for status check:', orders);
    } catch (error: any) {
      console.error('Error loading service orders:', error);
      // Không hiển thị error vì không quan trọng lắm
    }
  };

  const loadChecklists = async () => {
    try {
      setLoading(true);
      const data = await serviceChecklistService.getMyChecklists();
      console.log('All checklists from backend:', data);
      // Lấy tất cả checklist (không chỉ NeedReplace) để có thể báo giá cho cả gói dịch vụ
      setChecklists(data);
    } catch (error: any) {
      console.error('Error loading checklists:', error);
      notification.error({
        message: 'Lỗi tải checklist',
        description: error.message || 'Không thể tải danh sách checklist'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (partID: number, quantity: number | null) => {
    setSelectedParts(prev => 
      prev.map(part => 
        part.partID === partID ? { 
          ...part, 
          quantity: quantity || 1,
          totalPrice: (quantity || 1) * part.price
        } : part
      )
    );
  };

  const handleRemovePart = (partID: number) => {
    setSelectedParts(prev => prev.filter(part => part.partID !== partID));
  };

  const handleAddPart = () => {
    form.validateFields().then(values => {
      const part = availableParts.find(p => p.partID === values.partID);
      if (part) {
        if (selectedParts.some(p => p.partID === part.partID)) {
          notification.warning({
            message: 'Phụ tùng đã tồn tại',
            description: 'Phụ tùng này đã được thêm vào danh sách. Vui lòng điều chỉnh số lượng nếu cần.',
          });
          return;
        }

        const selectedPart: SelectedPart = {
          ...part,
          quantity: values.quantity,
          totalPrice: values.quantity * part.price
        };

        setSelectedParts(prev => [...prev, selectedPart]);
        form.resetFields();
        setIsModalVisible(false);
      }
    });
  };

  const handleSelectChecklist = (checklist: ServiceChecklist) => {
    setSelectedChecklist(checklist);
    
    // Nếu status là "NeedReplace", mở modal chọn phụ tùng
    // Nếu không phải "NeedReplace", vẫn có thể gửi báo giá theo gói dịch vụ (không cần chọn phụ tùng)
    if (checklist.status === 'NeedReplace') {
      setIsModalVisible(true); // Mở modal chọn phụ tùng
    }
    // Nếu không phải NeedReplace, vẫn có thể gửi báo giá (theo gói dịch vụ, không cần phụ tùng)
  };

  const handleSendQuoteRequest = async () => {
    if (!selectedChecklist) {
      notification.warning({
        message: 'Thiếu thông tin',
        description: 'Vui lòng chọn checklist'
      });
      return;
    }

    // Nếu status là "NeedReplace", phải có ít nhất một phụ tùng
    // Nếu không phải "NeedReplace", có thể gửi báo giá theo gói dịch vụ (không cần phụ tùng)
    if (selectedChecklist.status === 'NeedReplace' && selectedParts.length === 0) {
      notification.warning({
        message: 'Thiếu thông tin',
        description: 'Checklist cần thay thế phụ tùng, vui lòng chọn ít nhất một phụ tùng'
      });
      return;
    }

    try {
      console.log('Creating quote request with:', {
        checklistID: selectedChecklist.checklistID,
        appointmentID: selectedChecklist.appointmentID,
        selectedChecklist: selectedChecklist
      });

      const quoteRequest: CreateQuoteRequestFromTechnician = {
        checklistID: selectedChecklist.checklistID,
        appointmentID: selectedChecklist.appointmentID,
        parts: selectedParts.map(part => ({
          partID: part.partID,
          quantity: part.quantity,
          unitPrice: part.price,
          totalPrice: part.price * part.quantity
        })),
        notes: selectedChecklist.status === 'NeedReplace' 
          ? `Yêu cầu báo giá từ Technician cho checklist #${selectedChecklist.checklistID} - ${selectedChecklist.itemName} (Cần thay thế phụ tùng)`
          : `Yêu cầu báo giá từ Technician cho checklist #${selectedChecklist.checklistID} - ${selectedChecklist.itemName} (Theo gói dịch vụ đã chọn)`
      };

      const result = await quoteService.createQuoteFromTechnicianRequest(quoteRequest);
      showSuccess('Thành công', result);
      
      // Reload quote requests để cập nhật trạng thái
      await loadQuoteRequests();
      
      // Reset form
      setSelectedParts([]);
      setSelectedChecklist(null);
      setIsModalVisible(false);
      
    } catch (error: any) {
      showError('Lỗi gửi yêu cầu', error.message);
    }
  };

  const calculateTotal = () => {
    return selectedParts.reduce((total, part) => total + part.totalPrice, 0);
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'partID',
      key: 'partID',
      width: 80,
      render: (id: number) => <Tag color="blue">#{id}</Tag>,
    },
    {
      title: 'Tên phụ tùng',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <strong>{text}</strong>,
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 120,
      render: (_: any, record: SelectedPart) => (
        <InputNumber
          min={1}
          value={record.quantity}
          onChange={(value) => handleQuantityChange(record.partID, value)}
          style={{ width: '100%' }}
        />
      ),
    },
    {
      title: 'Đơn giá',
      dataIndex: 'price',
      key: 'price',
      width: 150,
      render: (price: number) => (
        <span style={{ fontWeight: 600, color: '#2563eb' }}>
          {partService.formatPrice(price)}
        </span>
      ),
    },
    {
      title: 'Thành tiền',
      key: 'totalPrice',
      width: 150,
      render: (_: any, record: SelectedPart) => (
        <span style={{ fontWeight: 700, color: '#10b981' }}>
          {partService.formatPrice(record.totalPrice)}
        </span>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 100,
      render: (_: any, record: SelectedPart) => (
        <Button 
          type="text" 
          danger
          onClick={() => handleRemovePart(record.partID)}
        >
          Xóa
        </Button>
      ),
    },
  ];

  const checklistColumns = [
    {
      title: 'ID',
      dataIndex: 'checklistID',
      key: 'checklistID',
      width: 80,
      render: (id: number) => <Tag color="blue">#{id}</Tag>,
    },
    {
      title: 'Khách hàng',
      dataIndex: 'customerName',
      key: 'customerName',
      render: (text: string) => <strong>{text}</strong>,
    },
    {
      title: 'Xe',
      dataIndex: 'vehicleModel',
      key: 'vehicleModel',
    },
    {
      title: 'Hạng mục',
      dataIndex: 'itemName',
      key: 'itemName',
      render: (text: string) => (
        <Tag color="orange" style={{ borderRadius: 12 }}>
          {text}
        </Tag>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        if (status === 'NeedReplace') {
          return (
            <Tag color="orange" style={{ borderRadius: 12, fontWeight: 600 }}>
              ⚠ Cần thay thế
            </Tag>
          );
        }
        return (
          <Tag color="blue" style={{ borderRadius: 12, fontWeight: 600 }}>
            ✓ Theo gói dịch vụ
          </Tag>
        );
      },
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createDate',
      key: 'createDate',
      render: (text: string) => new Date(text).toLocaleDateString('vi-VN'),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 200,
      render: (_: any, record: ServiceChecklist) => {
        // Kiểm tra xem Service Order của checklist này đã completed chưa
        const relatedOrder = serviceOrders.find(order => {
          const orderId = order.OrderID || order.orderID;
          return orderId === record.orderID;
        });
        
        const isOrderCompleted = relatedOrder && (
          relatedOrder.status?.toLowerCase() === 'completed' || 
          relatedOrder.status?.toLowerCase() === 'done'
        );

        // Kiểm tra xem có quote request đã được duyệt cho checklist này chưa
        const approvedQuoteRequest = quoteRequests.find(qr => 
          qr.checklistID === record.checklistID && 
          qr.status?.toLowerCase() === 'approved'
        );
        
        const hasApprovedQuote = !!approvedQuoteRequest;

        return (
          <Space size="small">
            <Button
              icon={<EyeOutlined />}
              onClick={() => {
                setSelectedChecklist(record);
                setIsChecklistModalVisible(true);
              }}
              size="small"
            >
              Xem
            </Button>
            {!isOrderCompleted && !hasApprovedQuote && (
              <Button
                type="primary"
                icon={record.status === 'NeedReplace' ? <ShoppingCartOutlined /> : <SendOutlined />}
                onClick={() => {
                  if (record.status === 'NeedReplace') {
                    handleSelectChecklist(record);
                  } else {
                    // Nếu không phải NeedReplace, chọn checklist và cho phép gửi báo giá ngay
                    setSelectedChecklist(record);
                    setSelectedParts([]); // Không cần phụ tùng
                  }
                }}
                size="small"
              >
                {record.status === 'NeedReplace' ? 'Chọn phụ tùng' : 'Gửi báo giá'}
              </Button>
            )}
            {isOrderCompleted && (
              <Tag color="green" style={{ fontSize: '12px' }}>
                Đã hoàn thành
              </Tag>
            )}
            {hasApprovedQuote && (
              <Tag color="blue" style={{ fontSize: '12px' }}>
                Đã duyệt báo giá
              </Tag>
            )}
          </Space>
        );
      },
    },
  ];

  return (
    <div style={{ padding: '24px', background: '#f5f5f5', minHeight: '100vh' }}>
      {/* Header */}
      <Card 
        style={{ 
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          marginBottom: '24px',
          background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
          <ShoppingCartOutlined style={{ fontSize: '28px', color: '#3b82f6', marginRight: '12px' }} />
          <h2 style={{ fontSize: '24px', fontWeight: 700, margin: 0, color: '#1f2937' }}>
            Quản lý phụ tùng sử dụng
          </h2>
        </div>
        <p style={{ color: '#6b7280', fontSize: '15px', margin: 0 }}>
          Chọn checklist và gửi yêu cầu báo giá cho admin/staff (có thể chọn phụ tùng nếu cần thay thế, hoặc báo giá theo gói dịch vụ)
        </p>
      </Card>

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
              title={<span style={{ color: '#64748b' }}>Tổng checklist</span>}
              value={checklists.length}
              prefix={<AppstoreOutlined style={{ color: '#3b82f6' }} />}
              valueStyle={{ fontSize: '24px', fontWeight: 700, color: '#1e40af' }}
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
              title={<span style={{ color: '#64748b' }}>Phụ tùng đã chọn</span>}
              value={selectedParts.length}
              prefix={<ShoppingCartOutlined style={{ color: '#10b981' }} />}
              valueStyle={{ fontSize: '24px', fontWeight: 700, color: '#047857' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card 
            style={{ 
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
              border: 'none',
            }}
          >
            <Statistic
              title={<span style={{ color: '#64748b' }}>Tổng giá trị</span>}
              value={calculateTotal()}
              precision={0}
              prefix={<DollarOutlined style={{ color: '#f59e0b' }} />}
              formatter={(value) => partService.formatPrice(Number(value))}
              valueStyle={{ fontSize: '24px', fontWeight: 700, color: '#d97706' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Checklists Table */}
      <Card 
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AppstoreOutlined style={{ color: '#3b82f6' }} />
            <span style={{ fontSize: '18px', fontWeight: 600 }}>Danh sách checklist</span>
          </div>
        }
        style={{ 
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          marginBottom: '24px'
        }}
      >
        <Table
          columns={checklistColumns}
          dataSource={checklists}
          rowKey="checklistID"
          loading={loading}
          pagination={{ pageSize: 5 }}
          locale={{ emptyText: 'Không có checklist nào' }}
        />
      </Card>

      {/* Selected Checklist Info - Hiển thị khi đã chọn checklist */}
      {selectedChecklist && (
        <Card 
          title={
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                {selectedChecklist.status === 'NeedReplace' ? (
                  <ShoppingCartOutlined style={{ color: '#10b981' }} />
                ) : (
                  <SendOutlined style={{ color: '#3b82f6' }} />
                )}
                <span style={{ fontSize: '18px', fontWeight: 600 }}>
                  {selectedChecklist.status === 'NeedReplace' ? 'Phụ tùng đã chọn' : 'Thông tin báo giá'}
                </span>
              </div>
              {selectedChecklist && (
                <div style={{ fontSize: '14px', color: '#6b7280', fontWeight: 400 }}>
                  Checklist #{selectedChecklist.checklistID} - {selectedChecklist.itemName} | 
                  Khách hàng: <strong>{selectedChecklist.customerName}</strong> | 
                  Xe: <strong>{selectedChecklist.vehicleModel}</strong> | 
                  Trạng thái: <strong>{selectedChecklist.status === 'NeedReplace' ? 'Cần thay thế phụ tùng' : 'Theo gói dịch vụ'}</strong>
                </div>
              )}
            </div>
          }
          extra={
            <Space>
              {selectedChecklist?.status === 'NeedReplace' && (
                <Button 
                  icon={<PlusOutlined />} 
                  onClick={() => setIsModalVisible(true)}
                  disabled={!selectedChecklist}
                >
                  Thêm phụ tùng
                </Button>
              )}
              <Button 
                type="primary"
                icon={<SendOutlined />}
                onClick={handleSendQuoteRequest}
                disabled={!selectedChecklist}
              >
                Gửi yêu cầu báo giá
              </Button>
            </Space>
          }
          style={{ 
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            marginBottom: '24px'
          }}
        >
          {selectedChecklist?.status === 'NeedReplace' && selectedParts.length > 0 ? (
            <Table
              columns={columns}
              dataSource={selectedParts}
              rowKey="partID"
              pagination={false}
              footer={() => (
                <div style={{ textAlign: 'right', fontSize: '16px', fontWeight: 700, color: '#10b981' }}>
                  Tổng cộng: {partService.formatPrice(calculateTotal())}
                </div>
              )}
            />
          ) : selectedChecklist?.status !== 'NeedReplace' ? (
            <div style={{ padding: '20px', textAlign: 'center', color: '#6b7280' }}>
              <p style={{ fontSize: '16px', marginBottom: '8px' }}>
                Checklist này sẽ được báo giá theo <strong>gói dịch vụ</strong> mà khách hàng đã chọn ban đầu.
              </p>
              <p style={{ fontSize: '14px', color: '#9ca3af' }}>
                Nhấn "Gửi yêu cầu báo giá" để gửi yêu cầu đến Admin/Staff.
              </p>
            </div>
          ) : (
            <div style={{ padding: '20px', textAlign: 'center', color: '#6b7280' }}>
              <p style={{ fontSize: '16px', marginBottom: '8px' }}>
                Vui lòng chọn phụ tùng cần thay thế.
              </p>
            </div>
          )}
        </Card>
      )}

      {/* Add Part Modal */}
      <Modal
        title={
          <div>
            <div style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>
              Chọn phụ tùng cho checklist
            </div>
            {selectedChecklist && (
              <div style={{ fontSize: '13px', color: '#6b7280', fontWeight: 400 }}>
                Checklist #{selectedChecklist.checklistID} - {selectedChecklist.itemName}
              </div>
            )}
          </div>
        }
        open={isModalVisible && !!selectedChecklist}
        onOk={handleAddPart}
        onCancel={() => {
          setIsModalVisible(false);
          if (!selectedParts.length) {
            setSelectedChecklist(null);
          }
        }}
        okText="Thêm"
        cancelText="Hủy"
        width={700}
      >
        {selectedChecklist && (
          <div style={{ 
            marginBottom: '20px', 
            padding: '12px', 
            background: '#f9fafb', 
            borderRadius: '8px',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '8px' }}>
              <strong>Thông tin checklist:</strong>
            </div>
            <div style={{ fontSize: '13px', color: '#374151' }}>
              <div>Khách hàng: <strong>{selectedChecklist.customerName}</strong></div>
              <div>Xe: <strong>{selectedChecklist.vehicleModel}</strong></div>
              <div>Hạng mục: <Tag color="orange">{selectedChecklist.itemName}</Tag></div>
            </div>
          </div>
        )}
        <Form form={form} layout="vertical">
          <Form.Item
            name="partID"
            label="Chọn phụ tùng"
            rules={[{ required: true, message: 'Vui lòng chọn phụ tùng' }]}
          >
            <Select
              showSearch
              placeholder="Tìm kiếm phụ tùng"
              optionFilterProp="children"
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              options={availableParts.map(part => ({
                value: part.partID,
                label: `${part.name} - ${partService.formatPrice(part.price)}`,
              }))}
            />
          </Form.Item>
          <Form.Item
            name="quantity"
            label="Số lượng"
            initialValue={1}
            rules={[{ required: true, message: 'Vui lòng nhập số lượng' }]}
          >
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Checklist Detail Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <EyeOutlined style={{ color: '#3b82f6' }} />
            <span style={{ fontSize: '18px', fontWeight: 600 }}>Chi tiết checklist</span>
          </div>
        }
        open={isChecklistModalVisible}
        onCancel={() => {
          setIsChecklistModalVisible(false);
          setSelectedChecklist(null);
        }}
        footer={[
          <Button 
            key="close" 
            onClick={() => {
              setIsChecklistModalVisible(false);
              setSelectedChecklist(null);
            }}
          >
            Đóng
          </Button>
        ]}
        width={700}
      >
        {selectedChecklist && (
          <Descriptions bordered column={1} size="middle">
            <Descriptions.Item label="ID Checklist">
              <Tag color="blue">#{selectedChecklist.checklistID}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Order ID">
              {selectedChecklist.orderID}
            </Descriptions.Item>
            <Descriptions.Item label="Khách hàng">
              <strong>{selectedChecklist.customerName}</strong>
            </Descriptions.Item>
            <Descriptions.Item label="Xe">
              {selectedChecklist.vehicleModel}
            </Descriptions.Item>
            <Descriptions.Item label="Trung tâm">
              {selectedChecklist.centerName}
            </Descriptions.Item>
            <Descriptions.Item label="Hạng mục">
              <Tag color="orange" style={{ borderRadius: 12 }}>
                {selectedChecklist.itemName}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              <Tag color="orange" style={{ borderRadius: 12, fontWeight: 600 }}>
                ⚠ Cần thay thế
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Ghi chú">
              {selectedChecklist.notes || 'Không có ghi chú'}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày tạo">
              {new Date(selectedChecklist.createDate).toLocaleString('vi-VN')}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default PartsUsage;