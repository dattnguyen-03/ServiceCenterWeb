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
import { serviceCenterService } from '../../services/serviceCenterService';
import { useAuth } from '../../contexts/AuthContext';
import { showSuccess, showError } from '../../utils/sweetAlert';

const { Search } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

const StaffPartsView: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('parts');
  
  // Parts states
  const [parts, setParts] = useState<Part[]>([]);
  const [filteredParts, setFilteredParts] = useState<Part[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [viewingPart, setViewingPart] = useState<Part | null>(null);
  
  // Part Usage states
  const [partUsages, setPartUsages] = useState<PartUsage[]>([]);
  const [filteredPartUsages, setFilteredPartUsages] = useState<PartUsage[]>([]);
  const [loadingPartUsage, setLoadingPartUsage] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [partUsageModalVisible, setPartUsageModalVisible] = useState(false);
  const [partUsageDetailModalVisible, setPartUsageDetailModalVisible] = useState(false);
  const [viewingPartUsage, setViewingPartUsage] = useState<PartUsage | null>(null);
  const [serviceOrders, setServiceOrders] = useState<ServiceOrder[]>([]);
  const [form] = Form.useForm();

  useEffect(() => {
    if (activeTab === 'parts') {
      loadParts();
    } else if (activeTab === 'usage') {
      loadPartUsages();
    }
  }, [activeTab]);

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

  // Part Usage functions
  const loadPartUsages = async () => {
    try {
      setLoadingPartUsage(true);
      const centerID = user?.centerID;
      
      // Lấy tên center từ centerID
      let centerName: string | null = null;
      if (centerID) {
        try {
          const center = await serviceCenterService.getServiceCenterById(centerID);
          centerName = center?.name || null;
          console.log('[StaffPartsView] Loaded center name:', centerName, 'for centerID:', centerID);
        } catch (err) {
          console.error('Error loading center name:', err);
        }
      }
      
      const [allPartUsagesData, ordersData] = await Promise.all([
        partUsageService.getAllPartUsage().catch(err => {
          console.error('Error loading part usages:', err);
          return [];
        }),
        serviceOrderService.getAllServiceOrders().catch(err => {
          console.error('Error loading service orders:', err);
          return [];
        })
      ]);
      
      // Filter part usages by centerID (staff chỉ xem part usage của center mình)
      let filteredData = allPartUsagesData || [];
      
      if (centerID && centerName) {
        // Lọc theo centerName: tìm các order thuộc center này
        const centerOrderIDs = new Set(
          (ordersData || [])
            .filter(order => {
              // So sánh centerName (case-insensitive)
              return order.centerName && 
                     order.centerName.trim().toLowerCase() === centerName!.trim().toLowerCase();
            })
            .map(order => order.OrderID || order.orderID)
            .filter(id => id != null)
        );
        
        filteredData = (allPartUsagesData || []).filter(pu => 
          centerOrderIDs.has(pu.orderID)
        );
        
        console.log('[StaffPartsView] Filtered part usages by center:', {
          centerID,
          centerName,
          totalPartUsages: allPartUsagesData?.length || 0,
          centerOrderIDs: Array.from(centerOrderIDs),
          filteredCount: filteredData.length,
          sampleOrders: (ordersData || []).slice(0, 3).map(o => ({
            orderID: o.OrderID || o.orderID,
            centerName: o.centerName
          }))
        });
      } else if (!centerID) {
        console.warn('[StaffPartsView] No centerID found for user:', user);
      } else if (!centerName) {
        console.warn('[StaffPartsView] Could not load center name for centerID:', centerID);
      }
      
      setPartUsages(filteredData);
      setFilteredPartUsages(filteredData);
      setServiceOrders(ordersData || []);
    } catch (error: any) {
      console.error('Error loading part usage data:', error);
      showError('Lỗi', error.message || 'Không thể tải dữ liệu sử dụng phụ tùng');
    } finally {
      setLoadingPartUsage(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'usage' && searchKeyword.trim()) {
      const filtered = partUsages.filter(pu =>
        pu.partName.toLowerCase().includes(searchKeyword.toLowerCase())
      );
      setFilteredPartUsages(filtered);
    } else if (activeTab === 'usage') {
      setFilteredPartUsages(partUsages);
    }
  }, [searchKeyword, partUsages, activeTab]);

  const handleAddPartUsage = () => {
    form.resetFields();
    setPartUsageModalVisible(true);
  };

  const handleViewPartUsageDetail = (partUsage: PartUsage) => {
    setViewingPartUsage(partUsage);
    setPartUsageDetailModalVisible(true);
  };

  const handleDeletePartUsage = async (usageID: number) => {
    try {
      await partUsageService.deletePartUsage(usageID);
      showSuccess('Thành công', 'Xóa bản ghi sử dụng phụ tùng thành công. Số lượng đã được hoàn lại vào kho.');
      loadPartUsages();
    } catch (error: any) {
      showError('Lỗi', error.message || 'Không thể xóa bản ghi sử dụng phụ tùng');
    }
  };

  const handleSubmitPartUsage = async () => {
    try {
      const values = await form.validateFields();
      
      const selectedOrder = serviceOrders.find(o => 
        (o.OrderID === values.orderID) || (o.orderID === values.orderID)
      );
      if (!selectedOrder) {
        showError('Lỗi', 'Không tìm thấy đơn dịch vụ. Vui lòng chọn lại.');
        return;
      }

      // Lấy centerID từ user context (staff có centerID)
      const centerID = user?.centerID;
      if (!centerID) {
        showError('Lỗi', 'Không xác định được trung tâm dịch vụ.');
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
      
      setPartUsageModalVisible(false);
      form.resetFields();
      loadPartUsages();
    } catch (error: any) {
      showError('Lỗi', error.message || 'Không thể tạo bản ghi sử dụng phụ tùng');
    }
  };

  const partUsageColumns = [
    {
      title: 'ID',
      dataIndex: 'usageID',
      key: 'usageID',
      width: 80,
      render: (id: number) => <Tag color="blue" style={{ fontSize: '13px' }}>#{id}</Tag>,
    },
    {
      title: 'Đơn dịch vụ',
      dataIndex: 'orderID',
      key: 'orderID',
      width: 120,
      render: (orderID: number) => <Tag color="green" style={{ fontSize: '13px' }}>Order #{orderID}</Tag>,
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
      width: 150,
      render: (_: any, record: PartUsage) => (
        <Space size="small">
          <Button
            icon={<EyeOutlined />}
            onClick={() => handleViewPartUsageDetail(record)}
            size="small"
          >
            Xem
          </Button>
          <Popconfirm
            title="Xác nhận xóa"
            description="Bạn có chắc chắn muốn xóa bản ghi này? Số lượng sẽ được hoàn lại vào kho."
            onConfirm={() => handleDeletePartUsage(record.usageID)}
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

  const partUsageStats = {
    total: filteredPartUsages.length,
    totalQuantityUsed: filteredPartUsages.reduce((sum, pu) => sum + pu.quantityUsed, 0),
    uniqueParts: new Set(filteredPartUsages.map(pu => pu.partName)).size
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
            Quản lý phụ tùng
          </h2>
          <p style={{ color: '#6b7280', fontSize: '15px' }}>
            Xem danh sách phụ tùng và quản lý sử dụng phụ tùng
          </p>
        </div>

        <Tabs activeKey={activeTab} onChange={setActiveTab} style={{ marginBottom: '24px' }}>
          <TabPane 
            tab={
              <span>
                <AppstoreOutlined />
                Danh mục phụ tùng
              </span>
            } 
            key="parts"
          >

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
          </TabPane>

          <TabPane 
            tab={
              <span>
                <ToolOutlined />
                Sử dụng phụ tùng
              </span>
            } 
            key="usage"
          >
            <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Search
                placeholder="Tìm kiếm theo tên phụ tùng..."
                allowClear
                enterButton={<SearchOutlined />}
                size="large"
                onSearch={setSearchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                style={{ maxWidth: '500px' }}
              />
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAddPartUsage}
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
                    value={partUsageStats.total}
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
                    title={<span style={{ color: '#64748b' }}>Tổng số lượng đã dùng</span>}
                    value={partUsageStats.totalQuantityUsed}
                    prefix={<ToolOutlined style={{ color: '#10b981' }} />}
                    formatter={(value) => value.toLocaleString('vi-VN')}
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
                    title={<span style={{ color: '#64748b' }}>Loại phụ tùng</span>}
                    value={partUsageStats.uniqueParts}
                    prefix={<AppstoreOutlined style={{ color: '#f59e0b' }} />}
                    valueStyle={{ fontSize: '28px', fontWeight: 700, color: '#d97706' }}
                  />
                </Card>
              </Col>
            </Row>

            {/* Part Usage Table */}
            {filteredPartUsages.length === 0 ? (
              <Card style={{ borderRadius: '12px' }}>
                <Empty
                  description={
                    searchKeyword 
                      ? 'Không tìm thấy bản ghi phù hợp' 
                      : 'Chưa có bản ghi sử dụng phụ tùng nào'
                  }
                  style={{ padding: '50px 0' }}
                />
              </Card>
            ) : (
              <Card style={{ borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                <Table
                  columns={partUsageColumns}
                  dataSource={filteredPartUsages}
                  loading={loadingPartUsage}
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
                />
              </Card>
            )}
          </TabPane>
        </Tabs>
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

      {/* Part Usage Detail Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <InfoCircleOutlined style={{ color: '#3b82f6', fontSize: '20px' }} />
            <span style={{ fontSize: '18px', fontWeight: 600 }}>Chi tiết bản ghi sử dụng</span>
          </div>
        }
        open={partUsageDetailModalVisible}
        onCancel={() => {
          setPartUsageDetailModalVisible(false);
          setViewingPartUsage(null);
        }}
        footer={[
          <Button 
            key="close" 
            onClick={() => {
              setPartUsageDetailModalVisible(false);
              setViewingPartUsage(null);
            }}
            style={{ height: '40px', fontSize: '16px', fontWeight: 600 }}
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
              <Tag color="orange" style={{ fontSize: '14px', padding: '4px 12px', fontWeight: 600 }}>
                {viewingPartUsage.quantityUsed.toLocaleString('vi-VN')}
              </Tag>
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      {/* Create Part Usage Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <PlusOutlined style={{ color: '#3b82f6', fontSize: '20px' }} />
            <span style={{ fontSize: '18px', fontWeight: 600 }}>Thêm bản ghi sử dụng phụ tùng</span>
          </div>
        }
        open={partUsageModalVisible}
        onCancel={() => {
          setPartUsageModalVisible(false);
          form.resetFields();
        }}
        onOk={handleSubmitPartUsage}
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
              placeholder="Chọn đơn dịch vụ" 
              size="large"
              showSearch
              loading={serviceOrders.length === 0}
              notFoundContent={
                serviceOrders.length === 0 
                  ? "Đang tải dữ liệu..." 
                  : "Không tìm thấy đơn dịch vụ"
              }
              filterOption={(input, option) => {
                const text = (option?.children as unknown as string)?.toLowerCase() || '';
                return text.includes(input.toLowerCase());
              }}
            >
              {serviceOrders
                .filter(order => {
                  const id = order?.OrderID || order?.orderID;
                  return order && id;
                })
                .map(order => {
                  const id = order.OrderID || order.orderID;
                  const displayText = `Order #${id} - ${order.customerName || ''} - ${order.centerName || ''}`;
                  return (
                    <Option key={id} value={id}>
                      {displayText}
                    </Option>
                  );
                })}
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

          <div style={{ padding: '12px', backgroundColor: '#fff7ed', borderRadius: '8px', marginTop: '8px' }}>
            <div style={{ fontSize: '14px', color: '#ea580c', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <InfoCircleOutlined />
              <span>Sau khi tạo, số lượng phụ tùng sẽ được trừ khỏi tồn kho của trung tâm.</span>
            </div>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default StaffPartsView;