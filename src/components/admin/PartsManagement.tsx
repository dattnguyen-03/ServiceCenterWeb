import React, { useState, useEffect } from 'react';
import { 
  Table, Button, Modal, Form, Input, InputNumber, 
  Space, Popconfirm, Card, Statistic, Row, Col, Descriptions, Tag
} from 'antd';
import { 
  PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined,
  WarningOutlined, AppstoreOutlined, DollarOutlined, InfoCircleOutlined
} from '@ant-design/icons';
import { partService, Part } from '../../services/partService';
import { showSuccess, showError } from '../../utils/sweetAlert';

const { TextArea } = Input;

const PartsManagement: React.FC = () => {
  const [parts, setParts] = useState<Part[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [editingPart, setEditingPart] = useState<Part | null>(null);
  const [viewingPart, setViewingPart] = useState<Part | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadParts();
  }, []);

  const loadParts = async () => {
    try {
      setLoading(true);
      const data = await partService.getAllParts();
      setParts(data);
    } catch (error: any) {
      console.error('Error loading parts:', error);
      showError('Lỗi', error.message || 'Không thể tải danh sách phụ tùng');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingPart(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleViewDetail = (part: Part) => {
    setViewingPart(part);
    setDetailModalVisible(true);
  };

  const handleEdit = (part: Part) => {
    setEditingPart(part);
    form.setFieldsValue({
      name: part.name,
      description: part.description,
      price: part.price,
      minStock: part.minStock
    });
    setModalVisible(true);
  };

  const handleDelete = async (partID: number) => {
    try {
      await partService.deletePart(partID);
      showSuccess('Thành công', 'Xóa phụ tùng thành công');
      loadParts();
    } catch (error: any) {
      showError('Lỗi', error.message || 'Không thể xóa phụ tùng');
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      if (editingPart) {
        await partService.updatePart({
          partID: editingPart.partID,
          name: values.name,
          description: values.description,
          price: values.price,
          minStock: values.minStock || null
        });
        showSuccess('Thành công', 'Cập nhật phụ tùng thành công');
      } else {
        await partService.createPart({
          name: values.name,
          description: values.description,
          price: values.price,
          minStock: values.minStock || undefined
        });
        showSuccess('Thành công', 'Tạo phụ tùng thành công');
      }
      
      setModalVisible(false);
      loadParts();
    } catch (error: any) {
      showError('Lỗi', error.message || 'Không thể lưu phụ tùng');
    }
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
      render: (text: string) => <strong style={{ fontSize: '15px' }}>{text}</strong>,
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      ellipsis: { showTitle: false },
      render: (text: string) => (
        <span style={{ color: '#6b7280' }}>{text}</span>
      ),
    },
    {
      title: 'Giá',
      dataIndex: 'price',
      key: 'price',
      align: 'right' as const,
      render: (price: number) => (
        <span style={{ fontWeight: 700, color: '#2563eb', fontSize: '15px' }}>
          {partService.formatPrice(price)}
        </span>
      ),
    },
    {
      title: 'Tồn kho tối thiểu',
      dataIndex: 'minStock',
      key: 'minStock',
      align: 'center' as const,
      render: (minStock: number | null) => 
        minStock ? (
          <Tag color="blue" style={{ fontSize: '13px' }}>{minStock}</Tag>
        ) : (
          <Tag color="default" style={{ fontSize: '13px' }}>Không đặt</Tag>
        ),
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 220,
      render: (_: any, record: Part) => (
        <Space size="small">
          <Button
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
            size="small"
          >
            Xem
          </Button>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            size="small"
          >
            Sửa
          </Button>
          <Popconfirm
            title="Xác nhận xóa"
            description="Bạn có chắc chắn muốn xóa phụ tùng này?"
            onConfirm={() => handleDelete(record.partID)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Button
              danger
              icon={<DeleteOutlined />}
              size="small"
            >
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const stats = {
    total: parts.length,
    tracked: parts.filter(p => p.minStock !== null && p.minStock > 0).length,
    totalValue: parts.reduce((sum, p) => sum + p.price, 0)
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
              <AppstoreOutlined style={{ marginRight: '12px', color: '#3b82f6' }} />
              Quản lý phụ tùng
            </h2>
            <p style={{ color: '#6b7280', fontSize: '15px' }}>Quản lý kho phụ tùng cho dịch vụ bảo dưỡng xe điện</p>
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
            Thêm phụ tùng
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
                title={<span style={{ color: '#64748b' }}>Tổng phụ tùng</span>}
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
                background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                border: 'none',
              }}
            >
              <Statistic
                title={<span style={{ color: '#64748b' }}>Giá trị tồn kho</span>}
                value={stats.totalValue}
                precision={0}
                prefix={<DollarOutlined style={{ color: '#10b981' }} />}
                formatter={(value) => partService.formatPrice(Number(value))}
                valueStyle={{ fontSize: '28px', fontWeight: 700, color: '#047857' }}
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
                title={<span style={{ color: '#64748b' }}>Theo dõi tồn kho</span>}
                value={stats.tracked}
                prefix={<WarningOutlined style={{ color: '#f59e0b' }} />}
                valueStyle={{ fontSize: '28px', fontWeight: 700, color: '#d97706' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Table */}
        <Card style={{ borderRadius: '12px', border: '1px solid #e5e7eb' }}>
          <Table
            columns={columns}
            dataSource={parts}
            loading={loading}
            rowKey="partID"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => (
                <span style={{ fontSize: '14px', fontWeight: 600 }}>
                  Tổng cộng <span style={{ color: '#3b82f6' }}>{total}</span> phụ tùng
                </span>
              ),
            }}
          />
        </Card>
      </Card>

      {/* Detail Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <InfoCircleOutlined style={{ color: '#3b82f6', fontSize: '20px' }} />
            <span style={{ fontSize: '18px', fontWeight: 600 }}>Chi tiết phụ tùng</span>
          </div>
        }
        open={detailModalVisible}
        onCancel={() => {
          setDetailModalVisible(false);
          setViewingPart(null);
        }}
        footer={[
          <Button 
            key="edit" 
            type="primary"
            icon={<EditOutlined />}
            onClick={() => {
              setDetailModalVisible(false);
              if (viewingPart) {
                handleEdit(viewingPart);
              }
            }}
          >
            Chỉnh sửa
          </Button>,
          <Button 
            key="close" 
            onClick={() => {
              setDetailModalVisible(false);
              setViewingPart(null);
            }}
          >
            Đóng
          </Button>
        ]}
        width={700}
      >
        {viewingPart && (
          <Descriptions bordered column={1} size="middle">
            <Descriptions.Item label="Mã phụ tùng">
              <Tag color="blue" style={{ fontSize: '14px', padding: '4px 12px' }}>
                #{viewingPart.partID}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Tên phụ tùng">
              <strong style={{ fontSize: '16px' }}>{viewingPart.name}</strong>
            </Descriptions.Item>
            <Descriptions.Item label="Mô tả">
              <div style={{ color: '#374151', lineHeight: '1.6' }}>
                {viewingPart.description}
              </div>
            </Descriptions.Item>
            <Descriptions.Item label="Giá">
              <span style={{ fontWeight: 700, color: '#2563eb', fontSize: '18px' }}>
                {partService.formatPrice(viewingPart.price)}
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="Tồn kho tối thiểu">
              {viewingPart.minStock ? (
                <Tag color="blue" style={{ fontSize: '14px', padding: '4px 12px' }}>
                  {viewingPart.minStock} sản phẩm
                </Tag>
              ) : (
                <Tag color="default" style={{ fontSize: '14px', padding: '4px 12px' }}>
                  Không đặt
                </Tag>
              )}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      {/* Create/Edit Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '18px', fontWeight: 600 }}>
              {editingPart ? 'Chỉnh sửa phụ tùng' : 'Thêm phụ tùng mới'}
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
            name="name"
            label={<strong>Tên phụ tùng</strong>}
            rules={[{ required: true, message: 'Vui lòng nhập tên phụ tùng' }]}
          >
            <Input 
              placeholder="Nhập tên phụ tùng" 
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="description"
            label={<strong>Mô tả</strong>}
            rules={[{ required: true, message: 'Vui lòng nhập mô tả' }]}
          >
            <TextArea 
              rows={4} 
              placeholder="Nhập mô tả phụ tùng"
              style={{ fontSize: '14px' }}
            />
          </Form.Item>

          <Form.Item
            name="price"
            label={<strong>Giá (VND)</strong>}
            rules={[
              { required: true, message: 'Vui lòng nhập giá' },
              { type: 'number', min: 0, message: 'Giá phải lớn hơn 0' }
            ]}
          >
            <InputNumber
              style={{ width: '100%' }}
              placeholder="Nhập giá phụ tùng"
              size="large"
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => value!.replace(/\$\s?|(,*)/g, '')}
            />
          </Form.Item>

          <Form.Item
            name="minStock"
            label={<strong>Tồn kho tối thiểu (Tùy chọn)</strong>}
            rules={[{ type: 'number', min: 0, message: 'Tồn kho phải lớn hơn 0' }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              placeholder="Nhập số lượng tối thiểu"
              size="large"
              min={0}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default PartsManagement;