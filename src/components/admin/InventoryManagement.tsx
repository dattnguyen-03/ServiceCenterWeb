import React, { useState, useEffect } from 'react';
import { 
  Table, Button, Modal, Form, Input, InputNumber, Select,
  Space, Popconfirm, Card, Statistic, Row, Col, Descriptions, Tag, message
} from 'antd';
import { 
  PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined,
  AppstoreOutlined, DatabaseOutlined, InfoCircleOutlined, SearchOutlined
} from '@ant-design/icons';
import { inventoryService, Inventory, CreateInventoryRequest } from '../../services/inventoryService';
import { partService, Part } from '../../services/partService';
import { serviceCenterService, ServiceCenter } from '../../services/serviceCenterService';
import { showSuccess, showError } from '../../utils/sweetAlert';

const { Option } = Select;

const InventoryManagement: React.FC = () => {
  const [inventories, setInventories] = useState<Inventory[]>([]);
  const [filteredInventories, setFilteredInventories] = useState<Inventory[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [editingInventory, setEditingInventory] = useState<Inventory | null>(null);
  const [viewingInventory, setViewingInventory] = useState<Inventory | null>(null);
  const [parts, setParts] = useState<Part[]>([]);
  const [centers, setCenters] = useState<ServiceCenter[]>([]);
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
      const [inventoriesData, partsData, centersData] = await Promise.all([
        inventoryService.getAllInventories().catch(err => {
          console.error('Error loading inventories:', err);
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
      
      setInventories(inventoriesData || []);
      setFilteredInventories(inventoriesData || []);
      setParts(partsData || []);
      setCenters(centersData || []);
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
    setEditingInventory(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleViewDetail = (inventory: Inventory) => {
    setViewingInventory(inventory);
    setDetailModalVisible(true);
  };

  const handleEdit = (inventory: Inventory) => {
    setEditingInventory(inventory);
    
    // Tìm partID và centerID từ tên (vì backend ViewInventoryDTO không trả về IDs)
    const part = parts.find(p => p.name === inventory.partName);
    const center = centers.find(c => c.name === inventory.centerName);
    
    if (!part || !center) {
      showError('Lỗi', 'Không tìm thấy thông tin phụ tùng hoặc trung tâm dịch vụ. Vui lòng tải lại trang.');
      return;
    }
    
    form.setFieldsValue({
      partID: inventory.partID || part.partID,
      centerID: inventory.centerID || center.centerID,
      quantity: inventory.quantity
    });
    setModalVisible(true);
  };

  const handleDelete = async (inventoryID: number) => {
    try {
      await inventoryService.deleteInventory(inventoryID);
      showSuccess('Thành công', 'Xóa tồn kho thành công');
      loadData();
    } catch (error: any) {
      showError('Lỗi', error.message || 'Không thể xóa tồn kho');
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const data: CreateInventoryRequest = {
        partID: values.partID,
        centerID: values.centerID,
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
    <div>
      <Card>
        <div className="flex justify-between items-center mb-6">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
            size="large"
          >
            Thêm tồn kho
          </Button>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <Input
            placeholder="Tìm kiếm theo tên phụ tùng hoặc trung tâm dịch vụ..."
            prefix={<SearchOutlined />}
            size="large"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            allowClear
          />
        </div>

        {/* Statistics */}
        <Row gutter={16} className="mb-6">
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Tổng bản ghi"
                value={stats.total}
                prefix={<DatabaseOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Tồn kho thấp"
                value={stats.lowStock}
                prefix={<AppstoreOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Tổng số lượng"
                value={stats.totalQuantity}
                prefix={<AppstoreOutlined />}
                formatter={(value) => value.toLocaleString('vi-VN')}
              />
            </Card>
          </Col>
        </Row>

        {/* Table */}
        <Table
          columns={columns}
          dataSource={filteredInventories}
          loading={loading}
          rowKey="inventoryID"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng cộng ${total} bản ghi`,
          }}
        />
      </Card>

      {/* Detail Modal */}
      <Modal
        title={
          <span>
            <InfoCircleOutlined className="mr-2 text-blue-500" />
            Chi tiết tồn kho
          </span>
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
              if (viewingInventory) {
                handleEdit(viewingInventory);
              }
            }}
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
        title={editingInventory ? 'Chỉnh sửa tồn kho' : 'Thêm tồn kho mới'}
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
      >
        <Form
          form={form}
          layout="vertical"
          autoComplete="off"
        >
          <Form.Item
            name="partID"
            label="Phụ tùng"
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
            label="Trung tâm dịch vụ"
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
              {centers.map(center => (
                <Option key={center.centerID} value={center.centerID}>
                  {center.name} - {center.address}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="quantity"
            label="Số lượng"
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
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => value!.replace(/\$\s?|(,*)/g, '')}
            />
          </Form.Item>

          {!editingInventory && (
            <div className="p-3 bg-blue-50 rounded-lg mt-2 text-sm text-blue-600">
              <InfoCircleOutlined className="mr-2" />
              Nếu tồn kho đã tồn tại cho phụ tùng và trung tâm này, số lượng sẽ được cộng thêm.
            </div>
          )}
        </Form>
      </Modal>
    </div>
  );
};

export default InventoryManagement;

