import React, { useState, useEffect } from 'react';
import { 
  Table, Input, Card, Row, Col, Statistic, Tag, Spin, Empty, 
  Modal, Descriptions, Button, Tabs, Form, InputNumber, Select, Space, Popconfirm
} from 'antd';
import { 
  SearchOutlined, AppstoreOutlined, DollarOutlined, 
  WarningOutlined, EyeOutlined, InfoCircleOutlined, 
  PlusOutlined, DeleteOutlined, ToolOutlined
} from '@ant-design/icons';
import { partService, Part } from '../../services/partService';
import { partUsageService, PartUsage, CreatePartUsageRequest } from '../../services/partUsageService';
import { serviceOrderService, ServiceOrder } from '../../services/serviceOrderService';
import { useAuth } from '../../contexts/AuthContext';
import { showSuccess, showError } from '../../utils/sweetAlert';

const { Search } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

const StaffPartsView: React.FC = () => {
  const [parts, setParts] = useState<Part[]>([]);
  const [filteredParts, setFilteredParts] = useState<Part[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [viewingPart, setViewingPart] = useState<Part | null>(null);

  useEffect(() => {
    loadParts();
  }, []);

  useEffect(() => {
    if (searchText.trim()) {
      const filtered = parts.filter(part =>
        part.name.toLowerCase().includes(searchText.toLowerCase()) ||
        part.description.toLowerCase().includes(searchText.toLowerCase())
      );
      setFilteredParts(filtered);
    } else {
      setFilteredParts(parts);
    }
  }, [searchText, parts]);

  const loadParts = async () => {
    try {
      setLoading(true);
      const data = await partService.getAllParts();
      setParts(data);
      setFilteredParts(data);
    } catch (error: any) {
      console.error('Error loading parts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  const handleViewDetail = (part: Part) => {
    setViewingPart(part);
    setDetailModalVisible(true);
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'partID',
      key: 'partID',
      width: 80,
      render: (id: number) => <Tag color="blue" style={{ fontSize: '13px' }}>#{id}</Tag>,
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
      render: (minStock: number | null) => (
        minStock ? (
          <Tag color="blue" style={{ fontSize: '13px' }}>{minStock}</Tag>
        ) : (
          <Tag color="default" style={{ fontSize: '13px' }}>Không đặt</Tag>
        )
      ),
    },
    {
      title: 'Trạng thái',
      key: 'status',
      render: (_: any, record: Part) => {
        if (record.minStock === null || record.minStock === 0) {
          return <Tag color="default">Không theo dõi</Tag>;
        }
        return <Tag color="green">Đủ hàng</Tag>;
      },
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 120,
      render: (_: any, record: Part) => (
        <Button
          type="primary"
          icon={<EyeOutlined />}
          onClick={() => handleViewDetail(record)}
          size="small"
          style={{
            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            border: 'none',
          }}
        >
          Xem chi tiết
        </Button>
      ),
    },
  ];

  const stats = {
    total: parts.length,
    tracked: parts.filter(p => p.minStock !== null && p.minStock > 0).length,
    totalValue: parts.reduce((sum, p) => sum + p.price, 0)
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px' }}>
        <Spin size="large" />
        <div style={{ marginTop: '16px', fontSize: '16px', color: '#6b7280' }}>
          Đang tải danh sách phụ tùng...
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', background: '#f5f5f5', minHeight: '100vh' }}>
      <Card 
        style={{ 
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        }}
      >
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '8px', color: '#1f2937' }}>
            <AppstoreOutlined style={{ marginRight: '12px', color: '#3b82f6' }} />
            Danh mục phụ tùng
          </h2>
          <p style={{ color: '#6b7280', fontSize: '15px' }}>
            Xem danh sách phụ tùng có sẵn cho dịch vụ bảo dưỡng
          </p>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <Search
            placeholder="Tìm kiếm phụ tùng theo tên hoặc mô tả..."
            allowClear
            enterButton={<SearchOutlined />}
            size="large"
            onSearch={handleSearch}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ maxWidth: '500px' }}
          />
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
        {filteredParts.length === 0 ? (
          <Card style={{ borderRadius: '12px' }}>
            <Empty
              description={
                searchText 
                  ? 'Không tìm thấy phụ tùng phù hợp' 
                  : 'Chưa có phụ tùng nào trong hệ thống'
              }
              style={{ padding: '50px 0' }}
            />
          </Card>
        ) : (
          <Card style={{ borderRadius: '12px', border: '1px solid #e5e7eb' }}>
            <Table
              columns={columns}
              dataSource={filteredParts}
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
        )}

        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <p style={{ color: '#6b7280', fontSize: '14px', fontWeight: 500 }}>
            Hiển thị <span style={{ color: '#3b82f6', fontWeight: 600 }}>{filteredParts.length}</span> / {parts.length} phụ tùng
          </p>
        </div>
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
            key="close" 
            onClick={() => {
              setDetailModalVisible(false);
              setViewingPart(null);
            }}
            style={{ height: '40px', fontSize: '16px', fontWeight: 600 }}
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
    </div>
  );
};

export default StaffPartsView;