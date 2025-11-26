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
import { serviceChecklistService, ServiceChecklistGroup, ChecklistItem } from '../../services/serviceChecklistService';
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
  const [checklists, setChecklists] = useState<ServiceChecklistGroup[]>([]);
  const [selectedChecklistGroup, setSelectedChecklistGroup] = useState<ServiceChecklistGroup | null>(null);
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
      // Only show error for actual errors, not "no data" cases
      if (!error.message.includes('chưa có checklist nào')) {
        notification.error({
          message: 'Lỗi tải checklist',
          description: error.message || 'Không thể tải danh sách checklist'
        });
      }
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
        form.resetFields(); // Reset form để có thể thêm phụ tùng khác
        
        notification.success({
          message: 'Thêm thành công',
          description: `Đã thêm ${part.name} vào danh sách`,
          duration: 2
        });
        
        // Không đóng modal để có thể tiếp tục thêm phụ tùng khác
      }
    });
  };

  // handleSelectChecklist removed - using selectedChecklistGroup directly

  const handleSendQuoteRequest = async () => {
    if (!selectedChecklistGroup) {
      notification.warning({
        message: 'Thiếu thông tin',
        description: 'Vui lòng chọn nhóm checklist'
      });
      return;
    }

    try {
      setLoading(true);

      // Lấy các checklist items cần thay thế
      const needReplaceItems = selectedChecklistGroup.checklistItems.filter(
        item => item.status === 'NeedReplace'
      );

      // Chuẩn bị parts data
      const parts = selectedParts.map(part => ({
        partID: part.partID,
        quantity: part.quantity,
        unitPrice: part.price,
        totalPrice: part.totalPrice
      }));

      // Tạo notes tổng hợp cho tất cả items
      let notes = '';
      if (needReplaceItems.length > 0) {
        notes = `Yêu cầu báo giá cho Order #${selectedChecklistGroup.orderID} - ${needReplaceItems.length} hạng mục cần thay thế: ${needReplaceItems.map(item => item.itemName).join(', ')}`;
        const itemNotes = needReplaceItems.filter(item => item.notes).map(item => `${item.itemName}: ${item.notes}`);
        if (itemNotes.length > 0) {
          notes += `. Ghi chú: ${itemNotes.join('; ')}`;
        }
      } else {
        notes = `Báo giá theo gói dịch vụ cho Order #${selectedChecklistGroup.orderID} - tất cả hạng mục`;
      }

      // Sử dụng checklistID đầu tiên làm đại diện cho group
      const representativeChecklistID = selectedChecklistGroup.checklistItems[0]?.checklistID;
      
      if (!representativeChecklistID) {
        showError(
          'Lỗi dữ liệu',
          'Không tìm thấy checklistID hợp lệ'
        );
        return;
      }

      // Gửi 1 request duy nhất với checklistID đại diện
      const requestData: CreateQuoteRequestFromTechnician = {
        checklistID: representativeChecklistID,
        appointmentID: selectedChecklistGroup.appointmentID,
        parts: parts,
        notes: notes
      };

      await quoteService.createQuoteFromTechnicianRequest(requestData);
      
      showSuccess(
        'Gửi yêu cầu báo giá thành công!',
        needReplaceItems.length > 0 
          ? `Đã gửi yêu cầu báo giá cho Order #${selectedChecklistGroup.orderID} với ${needReplaceItems.length} hạng mục cần thay thế`
          : `Đã gửi yêu cầu báo giá theo gói dịch vụ cho Order #${selectedChecklistGroup.orderID}`
      );

      // Reset selections after success
      setSelectedChecklistGroup(null);
      setSelectedParts([]);
      
      // Reload data
      loadChecklists();
      loadQuoteRequests();
    } catch (error: any) {
      console.error('Error in handleSendQuoteRequest:', error);
      showError(
        'Lỗi gửi yêu cầu báo giá',
        error.message || 'Đã xảy ra lỗi không xác định'
      );
    } finally {
      setLoading(false);
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
      dataIndex: 'orderID',
      key: 'orderID',
      width: 80,
      render: (orderID: number) => <Tag color="blue">#{orderID}</Tag>,
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
      key: 'checklistItems',
      render: (_: any, record: ServiceChecklistGroup) => (
        <div>
          {record.checklistItems?.map((item: ChecklistItem) => (
            <Tag
              key={item.checklistID}
              color={item.status === 'NeedReplace' ? 'orange' : 'blue'}
              style={{ margin: '2px', borderRadius: 12 }}
            >
              {item.itemName}
            </Tag>
          ))}
          <div style={{ fontSize: '11px', color: '#666', marginTop: 4 }}>
            {record.checklistItems?.length || 0} hạng mục
          </div>
        </div>
      ),
    },
    {
      title: 'Trạng thái',
      key: 'status',
      render: (_: any, record: ServiceChecklistGroup) => {
        const needReplaceCount = record.checklistItems?.filter((item: ChecklistItem) => item.status === 'NeedReplace').length || 0;
        const completedCount = record.checklistItems?.filter((item: ChecklistItem) => item.status === 'Completed').length || 0;
        const totalCount = record.checklistItems?.length || 0;

        return (
          <div>
            {needReplaceCount > 0 && (
              <Tag color="orange" style={{ borderRadius: 12, margin: '1px' }}>
                ⚠ Cần thay thế ({needReplaceCount})
              </Tag>
            )}
            {completedCount > 0 && (
              <Tag color="blue" style={{ borderRadius: 12, margin: '1px' }}>
                ✓ Theo gói ({completedCount})
              </Tag>
            )}
            {totalCount - needReplaceCount - completedCount > 0 && (
              <Tag color="green" style={{ borderRadius: 12, margin: '1px' }}>
                ✓ Khác ({totalCount - needReplaceCount - completedCount})
              </Tag>
            )}
          </div>
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
      render: (_: any, record: ServiceChecklistGroup) => {
        // Kiểm tra xem Service Order này đã completed chưa
        const relatedOrder = serviceOrders.find(order => {
          const orderId = order.OrderID || order.orderID;
          return orderId === record.orderID;
        });
        
        const isOrderCompleted = relatedOrder && (
          relatedOrder.status?.toLowerCase() === 'completed' || 
          relatedOrder.status?.toLowerCase() === 'done'
        );

        // Kiểm tra xem có item nào cần thay thế không
        const hasNeedReplace = record.checklistItems?.some((item: ChecklistItem) => item.status === 'NeedReplace');

        // Kiểm tra xem có quote request đã được duyệt cho bất kỳ item nào không
        const hasApprovedQuote = record.checklistItems?.some((item: ChecklistItem) =>
          quoteRequests.some(qr => 
            qr.checklistID === item.checklistID && 
            qr.status?.toLowerCase() === 'approved'
          )
        );

        return (
          <Space size="small">
            <Button
              icon={<EyeOutlined />}
              onClick={() => {
                setSelectedChecklistGroup(record);
                setIsChecklistModalVisible(true);
              }}
              size="small"
            >
              Xem chi tiết
            </Button>
            {!isOrderCompleted && !hasApprovedQuote && (
              <Button
                type="primary"
                icon={hasNeedReplace ? <ShoppingCartOutlined /> : <SendOutlined />}
                onClick={() => {
                  setSelectedChecklistGroup(record);
                  setSelectedParts([]);
                  if (hasNeedReplace) {
                    setIsModalVisible(true); // Mở modal chọn phụ tùng
                  }
                }}
                size="small"
              >
                {hasNeedReplace ? 'Chọn phụ tùng' : 'Gửi báo giá'}
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

      {/* Selected Checklist Group Info */}
      {selectedChecklistGroup && (
        <Card 
          title={
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <ShoppingCartOutlined style={{ color: '#10b981' }} />
                <span style={{ fontSize: '18px', fontWeight: 600 }}>
                  Đơn hàng #{selectedChecklistGroup.orderID}
                </span>
              </div>
              <div style={{ fontSize: '14px', color: '#6b7280', fontWeight: 400 }}>
                Khách hàng: <strong>{selectedChecklistGroup.customerName}</strong> | 
                Xe: <strong>{selectedChecklistGroup.vehicleModel}</strong> | 
                Ngày tạo: <strong>{new Date(selectedChecklistGroup.createDate).toLocaleDateString('vi-VN')}</strong>
              </div>
              <div style={{ fontSize: '13px', color: '#666', marginTop: '4px' }}>
                {selectedChecklistGroup.checklistItems?.length || 0} hạng mục checklist
              </div>
            </div>
          }
          extra={
            <Space>
              {selectedChecklistGroup.checklistItems?.some(item => item.status === 'NeedReplace') && (
                <Button 
                  icon={<PlusOutlined />} 
                  onClick={() => setIsModalVisible(true)}
                  disabled={!selectedChecklistGroup}
                >
                  Thêm phụ tùng
                </Button>
              )}
              <Button 
                type="primary"
                icon={<SendOutlined />}
                onClick={handleSendQuoteRequest}
                disabled={!selectedChecklistGroup}
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
          {/* Show checklist items */}
          <div style={{ marginBottom: '16px' }}>
            <h4 style={{ marginBottom: '12px' }}>Hạng mục checklist:</h4>
            {selectedChecklistGroup.checklistItems?.map((item: ChecklistItem) => (
              <div key={item.checklistID} style={{ 
                padding: '8px 12px', 
                margin: '4px 0',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                backgroundColor: '#f9fafb'
              }}>
                <div style={{ fontWeight: 500 }}>{item.itemName}</div>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  Trạng thái: <Tag color={item.status === 'NeedReplace' ? 'orange' : 'blue'}>
                    {item.status === 'NeedReplace' ? 'Cần thay thế' : 'Theo gói dịch vụ'}
                  </Tag>
                </div>
                {item.notes && (
                  <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                    Ghi chú: {item.notes}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Show selected parts if any */}
          {selectedChecklistGroup.checklistItems?.some(item => item.status === 'NeedReplace') && selectedParts.length > 0 ? (
            <div>
              <h4 style={{ marginBottom: '12px' }}>Phụ tùng đã chọn:</h4>
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
            </div>
          ) : selectedChecklistGroup.checklistItems?.some(item => item.status === 'NeedReplace') ? (
            <div style={{ padding: '20px', textAlign: 'center', color: '#6b7280' }}>
              <p style={{ fontSize: '16px', marginBottom: '8px' }}>
                Vui lòng chọn phụ tùng cần thay thế.
              </p>
            </div>
          ) : (
            <div style={{ padding: '20px', textAlign: 'center', color: '#6b7280' }}>
              <p style={{ fontSize: '16px', marginBottom: '8px' }}>
                Các hạng mục này sẽ được báo giá theo <strong>gói dịch vụ</strong> mà khách hàng đã chọn.
              </p>
              <p style={{ fontSize: '14px', color: '#9ca3af' }}>
                Nhấn "Gửi yêu cầu báo giá" để gửi yêu cầu đến Admin/Staff.
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
            {selectedChecklistGroup && (
              <div style={{ fontSize: '13px', color: '#6b7280', fontWeight: 400 }}>
                Đơn hàng #{selectedChecklistGroup.orderID} - {selectedChecklistGroup.customerName} ({selectedChecklistGroup.vehicleModel})
              </div>
            )}
            {selectedParts.length > 0 && (
              <div style={{ fontSize: '13px', color: '#10b981', fontWeight: 500, marginTop: '4px' }}>
                Đã chọn {selectedParts.length} phụ tùng
              </div>
            )}
          </div>
        }
        open={isModalVisible && !!selectedChecklistGroup}
        onOk={handleAddPart}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        okText="Thêm phụ tùng"
        cancelText={selectedParts.length > 0 ? "Hoàn thành" : "Hủy"}
        footer={[
          <Button 
            key="cancel" 
            onClick={() => {
              setIsModalVisible(false);
              form.resetFields();
            }}
          >
            {selectedParts.length > 0 ? "Hoàn thành" : "Hủy"}
          </Button>,
          <Button 
            key="submit" 
            type="primary"
            onClick={handleAddPart}
          >
            Thêm phụ tùng
          </Button>
        ]}
        width={700}
      >
        {selectedChecklistGroup && (
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
              <div>Khách hàng: <strong>{selectedChecklistGroup.customerName}</strong></div>
              <div>Xe: <strong>{selectedChecklistGroup.vehicleModel}</strong></div>
              <div>
                Hạng mục cần phụ tùng: {selectedChecklistGroup.checklistItems?.filter(item => item.status === 'NeedReplace').map(item => (
                  <Tag key={item.checklistID} color="orange" style={{ margin: '2px' }}>{item.itemName}</Tag>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {/* Hiển thị danh sách phụ tùng đã chọn */}
        {selectedParts.length > 0 && (
          <div style={{
            marginBottom: '20px',
            padding: '12px',
            background: '#f0fdf4',
            borderRadius: '8px',
            border: '1px solid #bbf7d0'
          }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#166534', marginBottom: '8px' }}>
              Phụ tùng đã chọn:
            </div>
            <div style={{ maxHeight: '120px', overflowY: 'auto' }}>
              {selectedParts.map((part) => (
                <div key={part.partID} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '6px 8px',
                  marginBottom: '4px',
                  background: '#ffffff',
                  borderRadius: '4px',
                  border: '1px solid #e5e7eb'
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: 500, color: '#374151' }}>
                      {part.name}
                    </div>
                    <div style={{ fontSize: '11px', color: '#6b7280' }}>
                      SL: {part.quantity} - {partService.formatPrice(part.totalPrice)}
                    </div>
                  </div>
                  <Button
                    type="text"
                    size="small"
                    danger
                    onClick={() => handleRemovePart(part.partID)}
                    style={{ marginLeft: '8px' }}
                  >
                    Xóa
                  </Button>
                </div>
              ))}
            </div>
            <div style={{
              textAlign: 'right',
              fontSize: '14px',
              fontWeight: 600,
              color: '#10b981',
              marginTop: '8px',
              paddingTop: '8px',
              borderTop: '1px solid #d1fae5'
            }}>
              Tổng: {partService.formatPrice(calculateTotal())}
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
          setSelectedChecklistGroup(null);
        }}
        footer={[
          <Button 
            key="close" 
            onClick={() => {
              setIsChecklistModalVisible(false);
              setSelectedChecklistGroup(null);
            }}
          >
            Đóng
          </Button>
        ]}
        width={700}
      >
        {selectedChecklistGroup && (
          <div>
            <Descriptions bordered column={1} size="middle">
              <Descriptions.Item label="Order ID">
                <Tag color="blue">#{selectedChecklistGroup.orderID}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Khách hàng">
                <strong>{selectedChecklistGroup.customerName}</strong>
              </Descriptions.Item>
              <Descriptions.Item label="Xe">
                {selectedChecklistGroup.vehicleModel}
              </Descriptions.Item>
              <Descriptions.Item label="Trung tâm">
                {selectedChecklistGroup.centerName}
              </Descriptions.Item>
              <Descriptions.Item label="Số hạng mục cần thay thế">
                <Tag color="orange" style={{ borderRadius: 12, fontWeight: 600 }}>
                  {selectedChecklistGroup.checklistItems.filter(item => item.status === 'NeedReplace').length} hạng mục
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Tổng hạng mục">
                <Tag color="blue" style={{ borderRadius: 12 }}>
                  {selectedChecklistGroup.checklistItems.length} hạng mục
                </Tag>
              </Descriptions.Item>
            </Descriptions>
            
            <div style={{ marginTop: 16 }}>
              <h4 style={{ marginBottom: 12, color: '#1890ff' }}>Danh sách tất cả hạng mục:</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {selectedChecklistGroup.checklistItems.map((item, index) => (
                  <Tag 
                    key={index}
                    color={item.status === 'NeedReplace' ? 'orange' : item.status === 'Completed' ? 'green' : 'blue'} 
                    style={{ 
                      borderRadius: 12, 
                      padding: '4px 12px',
                      margin: '2px',
                      fontSize: '13px'
                    }}
                  >
                    {item.itemName} {item.status === 'NeedReplace' ? '(Cần thay thế)' : item.status === 'Completed' ? '(Hoàn thành)' : ''}
                  </Tag>
                ))}
              </div>
            </div>
            
            {selectedChecklistGroup.checklistItems.some(item => item.status === 'NeedReplace' && item.notes) && (
              <div style={{ marginTop: 16 }}>
                <h4 style={{ marginBottom: 8, color: '#1890ff' }}>Ghi chú hạng mục cần thay thế:</h4>
                {selectedChecklistGroup.checklistItems
                  .filter(item => item.status === 'NeedReplace' && item.notes)
                  .map((item, index) => (
                    <div key={index} style={{ marginBottom: 8, padding: '8px', backgroundColor: '#f5f5f5', borderRadius: '6px' }}>
                      <strong>{item.itemName}:</strong> {item.notes}
                    </div>
                  ))}
              </div>
            )}
            
            <Descriptions bordered column={1} size="small" style={{ marginTop: 16 }}>
              <Descriptions.Item label="Ngày tạo">
                {new Date(selectedChecklistGroup.createDate).toLocaleString('vi-VN')}
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PartsUsage;