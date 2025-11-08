import React, { useState, useEffect } from 'react';
import { 
  Table, Button, Modal, Form, Input, InputNumber, Select,
  Space, Popconfirm, Card, Statistic, Row, Col, Descriptions, Tag
} from 'antd';
import { 
  PlusOutlined, DeleteOutlined, EyeOutlined,
  AppstoreOutlined, ToolOutlined, InfoCircleOutlined, SearchOutlined
} from '@ant-design/icons';
import { partUsageService, PartUsage, CreatePartUsageRequest } from '../../services/partUsageService';
import { partService, Part } from '../../services/partService';
import { serviceOrderService, ServiceOrder } from '../../services/serviceOrderService';
import { serviceCenterService, ServiceCenter } from '../../services/serviceCenterService';
import { showSuccess, showError } from '../../utils/sweetAlert';

const { Option } = Select;

const PartUsageManagement: React.FC = () => {
  const [partUsages, setPartUsages] = useState<PartUsage[]>([]);
  const [filteredPartUsages, setFilteredPartUsages] = useState<PartUsage[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [viewingPartUsage, setViewingPartUsage] = useState<PartUsage | null>(null);
  const [parts, setParts] = useState<Part[]>([]);
  const [serviceOrders, setServiceOrders] = useState<ServiceOrder[]>([]);
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
      setFilteredPartUsages(partUsages);
    }
  }, [searchKeyword, partUsages]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [partUsagesData, partsData, centersData] = await Promise.all([
        partUsageService.getAllPartUsage().catch(err => {
          console.error('Error loading part usages:', err);
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
      setFilteredPartUsages(partUsagesData || []);
      setParts(partsData || []);
      setCenters(centersData || []);
      
      // Load service orders
      try {
        const orders = await serviceOrderService.getAllServiceOrders();
        setServiceOrders(orders || []);
      } catch (err) {
        console.error('Error loading service orders:', err);
      }
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
        setFilteredPartUsages(partUsages);
        return;
      }

      const results = await partUsageService.searchPartUsage(keyword);
      setFilteredPartUsages(results);
    } catch (error: any) {
      console.error('Error searching part usages:', error);
      showError('Lỗi', error.message || 'Không thể tìm kiếm bản ghi sử dụng phụ tùng');
    }
  };

  const handleAdd = () => {
    form.resetFields();
    setModalVisible(true);
  };

  const handleViewDetail = (partUsage: PartUsage) => {
    setViewingPartUsage(partUsage);
    setDetailModalVisible(true);
  };

  const handleDelete = async (usageID: number) => {
    try {
      await partUsageService.deletePartUsage(usageID);
      showSuccess('Thành công', 'Xóa bản ghi sử dụng phụ tùng thành công. Số lượng đã được hoàn lại vào kho.');
      loadData();
    } catch (error: any) {
      showError('Lỗi', error.message || 'Không thể xóa bản ghi sử dụng phụ tùng');
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      // Tìm ServiceOrder để lấy CenterID từ Appointment (có thể là OrderID hoặc orderID)
      const selectedOrder = serviceOrders.find(o => 
        (o.OrderID === values.orderID) || (o.orderID === values.orderID)
      );
      if (!selectedOrder) {
        showError('Lỗi', 'Không tìm thấy đơn dịch vụ. Vui lòng chọn lại.');
        return;
      }

      // Cần tìm CenterID từ Order - có thể từ centerName hoặc cần load từ Appointment
      // Tạm thời dùng centerID từ form, hoặc tìm center từ tên
      let centerID = values.centerID;
      
      if (!centerID) {
        // Nếu không có centerID, tìm từ centerName
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
    const order = serviceOrders.find(o => 
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
      width: 150,
      render: (_: any, record: PartUsage) => (
        <Space size="small">
          <Button
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
            size="small"
          >
            Xem
          </Button>
          <Popconfirm
            title="Xác nhận xóa"
            description="Bạn có chắc chắn muốn xóa bản ghi này? Số lượng sẽ được hoàn lại vào kho."
            onConfirm={() => handleDelete(record.usageID)}
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
    total: filteredPartUsages.length,
    totalQuantityUsed: filteredPartUsages.reduce((sum, pu) => sum + pu.quantityUsed, 0),
    uniqueParts: new Set(filteredPartUsages.map(pu => pu.partName)).size
  };

  return (
    <div>
      <Card>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              <ToolOutlined className="mr-2 text-blue-500" />
              Quản lý sử dụng phụ tùng
            </h2>
            <p className="text-gray-600">Quản lý việc sử dụng phụ tùng trong các đơn dịch vụ</p>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
            size="large"
          >
            Thêm bản ghi
          </Button>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <Input
            placeholder="Tìm kiếm theo tên phụ tùng..."
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
                prefix={<AppstoreOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Tổng số lượng đã dùng"
                value={stats.totalQuantityUsed}
                prefix={<ToolOutlined />}
                formatter={(value) => value.toLocaleString('vi-VN')}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Loại phụ tùng"
                value={stats.uniqueParts}
                prefix={<AppstoreOutlined />}
              />
            </Card>
          </Col>
        </Row>

        {/* Table */}
        <Table
          columns={columns}
          dataSource={filteredPartUsages}
          loading={loading}
          rowKey="usageID"
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
            Chi tiết bản ghi sử dụng
          </span>
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
              <Tag color="blue">#{viewingPartUsage.usageID}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Đơn dịch vụ">
              <Tag color="green">Order #{viewingPartUsage.orderID}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Phụ tùng">
              <strong>{viewingPartUsage.partName}</strong>
            </Descriptions.Item>
            <Descriptions.Item label="Số lượng đã dùng">
              <Tag color="orange">
                {viewingPartUsage.quantityUsed.toLocaleString('vi-VN')}
              </Tag>
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      {/* Create Modal */}
      <Modal
        title="Thêm bản ghi sử dụng phụ tùng"
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
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
            name="orderID"
            label="Đơn dịch vụ"
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
              onChange={handleOrderChange}
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
            label="Số lượng đã dùng"
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

          <div className="p-3 bg-orange-50 rounded-lg mt-2 text-sm text-orange-600">
            <InfoCircleOutlined className="mr-2" />
            Sau khi tạo, số lượng phụ tùng sẽ được trừ khỏi tồn kho của trung tâm đã chọn.
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default PartUsageManagement;

