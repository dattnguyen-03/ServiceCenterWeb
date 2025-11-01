import React, { useState, useEffect } from 'react';
import { 
  Table, Button, Modal, Form, Input, InputNumber, Select,
  Space, Popconfirm, Card, Statistic, Row, Col, Descriptions, Tag
} from 'antd';
import { 
  PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined,
  AppstoreOutlined, DatabaseOutlined, InfoCircleOutlined, SearchOutlined
} from '@ant-design/icons';
import { inventoryService, Inventory, CreateInventoryRequest } from '../../services/inventoryService';
import { partService, Part } from '../../services/partService';
import { serviceCenterService, ServiceCenter } from '../../services/serviceCenterService';
import { useAuth } from '../../contexts/AuthContext';
import { showSuccess, showError } from '../../utils/sweetAlert';

const { Option } = Select;

const StaffInventoryManagement: React.FC = () => {
  const { user } = useAuth(); // ✅ Lấy thông tin user để biết CenterID
  const [inventories, setInventories] = useState<Inventory[]>([]);
  const [filteredInventories, setFilteredInventories] = useState<Inventory[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [editingInventory, setEditingInventory] = useState<Inventory | null>(null);
  const [viewingInventory, setViewingInventory] = useState<Inventory | null>(null);
  const [parts, setParts] = useState<Part[]>([]);
  const [myCenter, setMyCenter] = useState<ServiceCenter | null>(null); // ✅ Chỉ lưu trung tâm của Staff
  const [searchKeyword, setSearchKeyword] = useState('');
  const [form] = Form.useForm();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (searchKeyword.trim()) {
      handleSearch(searchKeyword);
    } else {
      setFilteredInventories(inventories);
    }
  }, [searchKeyword, inventories]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // ✅ Load inventory - backend tự động filter theo CenterID của Staff
      const [inventoriesData, partsData] = await Promise.all([
        inventoryService.getAllInventories().catch(err => {
          console.error('Error loading inventories:', err);
          return [];
        }),
        partService.getAllParts().catch(err => {
          console.error('Error loading parts:', err);
          showError('Lỗi', 'Không thể tải danh sách phụ tùng. Vui lòng thử lại.');
          return [];
        })
      ]);
      
      // ✅ Load thông tin trung tâm của Staff (để hiển thị và lock trong form)
      if (user?.centerID) {
        try {
          const centers = await serviceCenterService.getServiceCenters();
          const center = centers.find(c => c.centerID === user.centerID);
          if (center) {
            setMyCenter(center);
          }
        } catch (err) {
          console.error('Error loading center:', err);
        }
      }
      
      setInventories(inventoriesData || []);
      setFilteredInventories(inventoriesData || []);
      setParts(partsData || []);
    } catch (error: any) {
      console.error('Error loading data:', error);
      showError('Lỗi', error.message || 'Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (keyword: string) => {
    try {
      if (!keyword.trim()) {
        setFilteredInventories(inventories);
        return;
      }

      const results = await inventoryService.searchInventories(keyword);
      setFilteredInventories(results);
    } catch (error: any) {
      console.error('Error searching inventories:', error);
      showError('Lỗi', error.message || 'Không thể tìm kiếm tồn kho');
    }
  };

  const handleAdd = () => {
    if (!user?.centerID) {
      showError('Lỗi', 'Bạn chưa được gán vào trung tâm dịch vụ nào. Vui lòng liên hệ Admin.');
      return;
    }
    
    setEditingInventory(null);
    form.resetFields();
    // ✅ Set centerID mặc định là trung tâm của Staff
    form.setFieldsValue({
      centerID: user.centerID
    });
    setModalVisible(true);
  };

  const handleViewDetail = (inventory: Inventory) => {
    setViewingInventory(inventory);
    setDetailModalVisible(true);
  };

  const handleEdit = (inventory: Inventory) => {
    if (!user?.centerID) {
      showError('Lỗi', 'Bạn chưa được gán vào trung tâm dịch vụ nào.');
      return;
    }
    
    // ✅ Chỉ cho phép edit inventory của trung tâm mình
    if (inventory.centerID !== user.centerID) {
      showError('Lỗi', 'Bạn chỉ có thể chỉnh sửa tồn kho của trung tâm dịch vụ của mình.');
      return;
    }
    
    setEditingInventory(inventory);
    
    // Tìm partID từ tên
    const part = parts.find(p => p.name === inventory.partName);
    
    if (!part) {
      showError('Lỗi', 'Không tìm thấy thông tin phụ tùng. Vui lòng tải lại trang.');
      return;
    }
    
    form.setFieldsValue({
      partID: inventory.partID || part.partID,
      centerID: user.centerID, // ✅ Lock centerID là trung tâm của Staff
      quantity: inventory.quantity
    });
    setModalVisible(true);
  };

  const handleDelete = async (inventoryID: number) => {
    try {
      // ✅ Kiểm tra lại trước khi xóa
      const inventory = inventories.find(inv => inv.inventoryID === inventoryID);
      if (inventory && inventory.centerID !== user?.centerID) {
        showError('Lỗi', 'Bạn chỉ có thể xóa tồn kho của trung tâm dịch vụ của mình.');
        return;
      }
      
      await inventoryService.deleteInventory(inventoryID);
      showSuccess('Thành công', 'Xóa tồn kho thành công');
      loadData();
    } catch (error: any) {
      showError('Lỗi', error.message || 'Không thể xóa tồn kho');
    }
  };

  const handleSubmit = async () => {
    try {
      if (!user?.centerID) {
        showError('Lỗi', 'Bạn chưa được gán vào trung tâm dịch vụ nào.');
        return;
      }
      
      const values = await form.validateFields();
      const data: CreateInventoryRequest = {
        partID: values.partID,
        centerID: user.centerID, // ✅ Luôn dùng centerID của Staff (đã check null ở trên)
        quantity: values.quantity
      };
      
      if (editingInventory) {
        await inventoryService.updateInventory(editingInventory.inventoryID, data);
        showSuccess('Thành công', 'Cập nhật tồn kho thành công');
      } else {
        await inventoryService.createInventory(data);
        showSuccess('Thành công', 'Tạo tồn kho thành công');
      }
      
      setModalVisible(false);
      form.resetFields();
      loadData();
    } catch (error: any) {
      showError('Lỗi', error.message || 'Không thể lưu tồn kho');
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'inventoryID',
      key: 'inventoryID',
      width: 80,
      render: (id: number) => <Tag color="blue">#{id}</Tag>,
    },
    {
      title: 'Phụ tùng',
      dataIndex: 'partName',
      key: 'partName',
      render: (text: string) => <strong style={{ fontSize: '15px' }}>{text}</strong>,
    },
    {
      title: 'Trung tâm dịch vụ',
      dataIndex: 'centerName',
      key: 'centerName',
      render: (text: string) => <span style={{ color: '#6b7280' }}>{text}</span>,
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity',
      align: 'center' as const,
      render: (quantity: number, record: Inventory) => {
        // Tìm minStock của part
        const part = parts.find(p => p.partID === record.partID);
        const minStock = part?.minStock;
        
        let color = 'blue';
        if (minStock && quantity < minStock) {
          color = 'red';
        } else if (minStock && quantity < minStock * 1.2) {
          color = 'orange';
        }

        return (
          <Tag color={color} style={{ fontSize: '14px', padding: '4px 12px', fontWeight: 600 }}>
            {quantity.toLocaleString('vi-VN')}
            {minStock && quantity < minStock && (
              <span style={{ marginLeft: '4px', fontSize: '11px' }}>
                (Thấp)
              </span>
            )}
          </Tag>
        );
      },
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 220,
      render: (_: any, record: Inventory) => (
        <Space size="small">
          <Button
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
            size="small"
          >
            Xem
          </Button>
          {/* ✅ Chỉ hiện nút Sửa/Xóa cho inventory của trung tâm mình */}
          {/* {record.centerID === user?.centerID && (
            <>
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
                description="Bạn có chắc chắn muốn xóa tồn kho này?"
                onConfirm={() => handleDelete(record.inventoryID)}
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
            </>
          )} */}
        </Space>
      ),
    },
  ];

  const stats = {
    total: filteredInventories.length,
    lowStock: filteredInventories.filter(inv => {
      const part = parts.find(p => p.partID === inv.partID);
      return part?.minStock && inv.quantity < part.minStock;
    }).length,
    totalQuantity: filteredInventories.reduce((sum, inv) => sum + inv.quantity, 0)
  };

  return (
    <div style={{ padding: '24px', background: '#f5f5f5', minHeight: '100vh' }}>
      <Card 
        style={{ 
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        }}
      >
        {/* <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '8px', color: '#1f2937' }}>
              <DatabaseOutlined style={{ marginRight: '12px', color: '#3b82f6' }} />
              Quản lý tồn kho
            </h2>
            <p style={{ color: '#6b7280', fontSize: '15px' }}>
              Quản lý tồn kho phụ tùng của trung tâm dịch vụ {myCenter ? `"${myCenter.name}"` : 'của bạn'}
            </p>
          </div>
          {user?.centerID && (
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
              Thêm tồn kho
            </Button>
          )}
        </div> */}

        {/* Search Bar */}
        <Card style={{ marginBottom: '24px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
          <Input
            placeholder="Tìm kiếm theo tên phụ tùng..."
            prefix={<SearchOutlined />}
            size="large"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            allowClear
            style={{ borderRadius: '8px' }}
          />
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
                title={<span style={{ color: '#64748b' }}>Tổng bản ghi</span>}
                value={stats.total}
                prefix={<DatabaseOutlined style={{ color: '#3b82f6' }} />}
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
                title={<span style={{ color: '#64748b' }}>Tồn kho thấp</span>}
                value={stats.lowStock}
                prefix={<AppstoreOutlined style={{ color: '#f59e0b' }} />}
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
                title={<span style={{ color: '#64748b' }}>Tổng số lượng</span>}
                value={stats.totalQuantity}
                prefix={<AppstoreOutlined style={{ color: '#10b981' }} />}
                formatter={(value) => value.toLocaleString('vi-VN')}
                valueStyle={{ fontSize: '28px', fontWeight: 700, color: '#047857' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Table */}
        <Card style={{ borderRadius: '12px', border: '1px solid #e5e7eb' }}>
          <Table
            columns={columns}
            dataSource={filteredInventories}
            loading={loading}
            rowKey="inventoryID"
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
      </Card>

      {/* Detail Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <InfoCircleOutlined style={{ color: '#3b82f6', fontSize: '20px' }} />
            <span style={{ fontSize: '18px', fontWeight: 600 }}>Chi tiết tồn kho</span>
          </div>
        }
        open={detailModalVisible}
        onCancel={() => {
          setDetailModalVisible(false);
          setViewingInventory(null);
        }}
        footer={[
          <Button 
            key="edit" 
            type="primary"
            icon={<EditOutlined />}
            onClick={() => {
              setDetailModalVisible(false);
              if (viewingInventory && viewingInventory.centerID === user?.centerID) {
                handleEdit(viewingInventory);
              } else {
                showError('Lỗi', 'Bạn chỉ có thể chỉnh sửa tồn kho của trung tâm dịch vụ của mình.');
              }
            }}
            disabled={viewingInventory?.centerID !== user?.centerID}
          >
            Chỉnh sửa
          </Button>,
          <Button 
            key="close" 
            onClick={() => {
              setDetailModalVisible(false);
              setViewingInventory(null);
            }}
          >
            Đóng
          </Button>
        ]}
        width={700}
      >
        {viewingInventory && (() => {
          const part = parts.find(p => p.partID === viewingInventory.partID);
          const minStock = part?.minStock;
          const isLowStock = minStock && viewingInventory.quantity < minStock;
          
          return (
            <Descriptions bordered column={1} size="middle">
              <Descriptions.Item label="Mã tồn kho">
                <Tag color="blue" style={{ fontSize: '14px', padding: '4px 12px' }}>
                  #{viewingInventory.inventoryID}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Phụ tùng">
                <strong style={{ fontSize: '16px' }}>{viewingInventory.partName}</strong>
              </Descriptions.Item>
              <Descriptions.Item label="Trung tâm dịch vụ">
                <div style={{ color: '#374151', lineHeight: '1.6' }}>
                  {viewingInventory.centerName}
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="Số lượng">
                <div>
                  <Tag 
                    color={isLowStock ? 'red' : 'blue'} 
                    style={{ fontSize: '16px', padding: '4px 12px', fontWeight: 600 }}
                  >
                    {viewingInventory.quantity.toLocaleString('vi-VN')}
                  </Tag>
                  {minStock && (
                    <span style={{ marginLeft: '12px', color: '#6b7280', fontSize: '14px' }}>
                      (Tối thiểu: {minStock})
                    </span>
                  )}
                </div>
              </Descriptions.Item>
              {isLowStock && (
                <Descriptions.Item label="Cảnh báo">
                  <Tag color="red" style={{ fontSize: '14px', padding: '4px 12px' }}>
                    Tồn kho dưới mức tối thiểu
                  </Tag>
                </Descriptions.Item>
              )}
            </Descriptions>
          );
        })()}
      </Modal>

      {/* Create/Edit Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '18px', fontWeight: 600 }}>
              {editingInventory ? 'Chỉnh sửa tồn kho' : 'Thêm tồn kho mới'}
            </span>
          </div>
        }
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
          setEditingInventory(null);
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
              {parts.map(part => (
                <Option key={part.partID} value={part.partID}>
                  {part.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="centerID"
            label={<strong>Trung tâm dịch vụ</strong>}
            rules={[{ required: true, message: 'Vui lòng chọn trung tâm dịch vụ' }]}
          >
            <Select 
              placeholder="Trung tâm dịch vụ" 
              size="large"
              disabled={true} // ✅ Disable vì Staff chỉ có thể tạo cho trung tâm mình
            >
              {myCenter && (
                <Option key={myCenter.centerID} value={myCenter.centerID}>
                  {myCenter.name} - {myCenter.address}
                </Option>
              )}
            </Select>
            <div style={{ marginTop: '8px', fontSize: '12px', color: '#6b7280' }}>
              <InfoCircleOutlined style={{ marginRight: '4px' }} />
              Bạn chỉ có thể quản lý tồn kho của trung tâm dịch vụ được gán.
            </div>
          </Form.Item>

          <Form.Item
            name="quantity"
            label={<strong>Số lượng</strong>}
            rules={[
              { required: true, message: 'Vui lòng nhập số lượng' },
              { type: 'number', min: 0, message: 'Số lượng phải lớn hơn hoặc bằng 0' }
            ]}
          >
            <InputNumber
              style={{ width: '100%' }}
              placeholder="Nhập số lượng"
              size="large"
              min={0}
            />
          </Form.Item>

          {!editingInventory && (
            <div style={{ 
              padding: '12px', 
              background: '#f0f9ff', 
              borderRadius: '8px',
              marginTop: '8px',
              fontSize: '13px',
              color: '#0369a1'
            }}>
              <InfoCircleOutlined style={{ marginRight: '8px' }} />
              Nếu tồn kho đã tồn tại cho phụ tùng này, số lượng sẽ được cộng thêm.
            </div>
          )}
        </Form>
      </Modal>
    </div>
  );
};

export default StaffInventoryManagement;

