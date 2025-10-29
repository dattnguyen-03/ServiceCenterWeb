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
  const [form] = Form.useForm();

  useEffect(() => {
    loadParts();
    loadChecklists();
  }, []);

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

  const loadChecklists = async () => {
    try {
      setLoading(true);
      const data = await serviceChecklistService.getMyChecklists();
      console.log('All checklists from backend:', data);
      // Chỉ lấy những checklist có status "NeedReplace"
      const needReplaceChecklists = data.filter(c => c.status === 'NeedReplace');
      console.log('Filtered checklists (NeedReplace):', needReplaceChecklists);
      setChecklists(needReplaceChecklists);
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
    setIsModalVisible(true); // Mở modal chọn phụ tùng
  };

  const handleSendQuoteRequest = async () => {
    if (!selectedChecklist || selectedParts.length === 0) {
      notification.warning({
        message: 'Thiếu thông tin',
        description: 'Vui lòng chọn checklist và ít nhất một phụ tùng'
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
        notes: `Yêu cầu báo giá từ Technician cho checklist #${selectedChecklist.checklistID} - ${selectedChecklist.itemName}`
      };

      const result = await quoteService.createQuoteFromTechnicianRequest(quoteRequest);
      showSuccess('Thành công', result);
      
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
      render: (_: any) => (
        <Tag color="orange" style={{ borderRadius: 12, fontWeight: 600 }}>
          ⚠ Cần thay thế
        </Tag>
      ),
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
      render: (_: any, record: ServiceChecklist) => (
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
          <Button
            type="primary"
            icon={<ShoppingCartOutlined />}
            onClick={() => handleSelectChecklist(record)}
            size="small"
          >
            Chọn phụ tùng
          </Button>
        </Space>
      ),
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
          Chọn checklist cần thay thế phụ tùng và gửi yêu cầu báo giá cho admin/staff
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
              title={<span style={{ color: '#64748b' }}>Checklist cần thay thế</span>}
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
            <span style={{ fontSize: '18px', fontWeight: 600 }}>Danh sách checklist cần thay thế</span>
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
          locale={{ emptyText: 'Không có checklist nào cần thay thế phụ tùng' }}
        />
      </Card>

      {/* Selected Parts Table */}
      {selectedParts.length > 0 && (
        <Card 
          title={
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <ShoppingCartOutlined style={{ color: '#10b981' }} />
                <span style={{ fontSize: '18px', fontWeight: 600 }}>Phụ tùng đã chọn</span>
              </div>
              {selectedChecklist && (
                <div style={{ fontSize: '14px', color: '#6b7280', fontWeight: 400 }}>
                  Checklist #{selectedChecklist.checklistID} - {selectedChecklist.itemName} | 
                  Khách hàng: <strong>{selectedChecklist.customerName}</strong> | 
                  Xe: <strong>{selectedChecklist.vehicleModel}</strong>
                </div>
              )}
            </div>
          }
          extra={
            <Space>
              <Button 
                icon={<PlusOutlined />} 
                onClick={() => setIsModalVisible(true)}
                disabled={!selectedChecklist}
              >
                Thêm phụ tùng
              </Button>
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