import React, { useState, useEffect } from "react";
import { Table, Card, Input, Tag, Modal, Descriptions, Statistic, Button, Form, Select } from "antd";
import { FileTextOutlined, SearchOutlined, EyeOutlined, PlusOutlined, EditOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { serviceChecklistService, ServiceChecklist, CreateServiceChecklistRequest, EditServiceChecklistRequest } from "../../services/serviceChecklistService";
import { message } from "antd";

const TechnicianChecklistView: React.FC = () => {
  const [checklists, setChecklists] = useState<ServiceChecklist[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [selectedChecklist, setSelectedChecklist] = useState<ServiceChecklist | null>(null);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingChecklist, setEditingChecklist] = useState<ServiceChecklist | null>(null);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();

  useEffect(() => {
    fetchChecklists();
  }, []);

  const fetchChecklists = async () => {
    setLoading(true);
    try {
      const data = await serviceChecklistService.getMyChecklists();
      setChecklists(data);
    } catch (err: any) {
      console.error("Error fetching checklists:", err);
      message.error("Không thể tải danh sách checklist của bạn");
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = (checklist: ServiceChecklist) => {
    setSelectedChecklist(checklist);
    setIsDetailModalVisible(true);
  };

  const handleCreateChecklist = async (values: CreateServiceChecklistRequest) => {
    setLoading(true);
    try {
      await serviceChecklistService.createChecklist(values);
      message.success('Tạo checklist thành công!');
      setIsCreateModalVisible(false);
      form.resetFields();
      await fetchChecklists();
    } catch (error: any) {
      message.error(error.message || 'Lỗi tạo checklist');
    } finally {
      setLoading(false);
    }
  };

  const handleEditChecklist = async (values: EditServiceChecklistRequest) => {
    if (!editingChecklist) return;
    
    setLoading(true);
    try {
      await serviceChecklistService.editChecklist(editingChecklist.checklistID, values);
      message.success('Cập nhật checklist thành công!');
      setIsEditModalVisible(false);
      setEditingChecklist(null);
      editForm.resetFields();
      await fetchChecklists();
    } catch (error: any) {
      message.error(error.message || 'Lỗi cập nhật checklist');
    } finally {
      setLoading(false);
    }
  };


  const openEditModal = (checklist: ServiceChecklist) => {
    setEditingChecklist(checklist);
    setIsEditModalVisible(true);
    editForm.setFieldsValue({
      orderID: checklist.orderID,
      itemName: checklist.itemName,
      status: checklist.status,
      notes: checklist.notes
    });
  };

  const filteredChecklists = checklists.filter((checklist) => {
    if (!checklist) return false;
    const search = searchText.toLowerCase();
    const statusText = checklist.status === 'OK' ? 'ok' : 
                       checklist.status === 'NotOK' ? 'not ok' : 
                       checklist.status === 'NeedReplace' ? 'cần thay thế' : 
                       checklist.status?.toLowerCase() || '';
    return (
      (checklist.customerName || '').toLowerCase().includes(search) ||
      (checklist.vehicleModel || '').toLowerCase().includes(search) ||
      (checklist.centerName || '').toLowerCase().includes(search) ||
      (checklist.itemName || '').toLowerCase().includes(search) ||
      statusText.includes(search)
    );
  });

  const columns: ColumnsType<ServiceChecklist> = [
    {
      title: "ID",
      dataIndex: "checklistID",
      key: "checklistID",
      width: 80,
    },
    {
      title: "Khách hàng",
      dataIndex: "customerName",
      key: "customerName",
      width: 150,
      render: (text) => <span style={{ fontWeight: 600, color: '#1f2937' }}>{text}</span>
    },
    {
      title: "Xe",
      dataIndex: "vehicleModel",
      key: "vehicleModel",
      width: 150,
    },
    {
      title: "Trung tâm",
      dataIndex: "centerName",
      key: "centerName",
      width: 200,
      ellipsis: true,
    },
    {
      title: "Hạng mục",
      dataIndex: "itemName",
      key: "itemName",
      width: 200,
      render: (text) => (
        <Tag color="blue" style={{ borderRadius: 12 }}>
          {text}
        </Tag>
      )
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status: string) => {
        const statusColors: Record<string, string> = {
          'OK': 'green',
          'NotOK': 'red',
          'NeedReplace': 'orange'
        };
        const statusTexts: Record<string, string> = {
          'OK': '✓ OK',
          'NotOK': '❌ Not OK',
          'NeedReplace': '⚠ Cần thay thế'
        };
        const color = statusColors[status] || 'default';
        const text = statusTexts[status] || status;
        
        return (
          <Tag color={color} style={{ borderRadius: 12, fontWeight: 600 }}>
            {text}
          </Tag>
        );
      }
    },
    {
      title: "Ngày tạo",
      dataIndex: "createDate",
      key: "createDate",
      width: 150,
      render: (text) => new Date(text).toLocaleDateString('vi-VN')
    },
    {
      title: "Thao tác",
      key: "action",
      width: 180,
      render: (_: any, record: ServiceChecklist) => (
        <div style={{ display: 'flex', gap: 12 }}>
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
            style={{ color: '#2563eb' }}
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => openEditModal(record)}
            style={{ color: '#06b6d4' }}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #f0f9ff 0%, #f9fafb 100%)', padding: '24px' }}>
      {/* Header */}
      <div style={{ 
        background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
        padding: '32px',
        borderRadius: '16px',
        marginBottom: '24px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
          <FileTextOutlined style={{ fontSize: '36px', color: '#fff', marginRight: '16px' }} />
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#fff', margin: 0 }}>
            Service Checklist Của Tôi
          </h1>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <p style={{ color: '#e0f2fe', fontSize: '16px', margin: 0 }}>
            Xem và quản lý danh sách Service Checklist mà bạn đã tạo
          </p>
          <Button
            type="primary"
            size="large"
            icon={<PlusOutlined />}
            onClick={() => setIsCreateModalVisible(true)}
            style={{
              borderRadius: 10,
              background: 'linear-gradient(90deg, #ffffff 0%, #f0f9ff 100%)',
              border: '2px solid #fff',
              color: '#0284c7',
              fontWeight: 700,
              height: 45
            }}
          >
            Thêm Checklist
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <Card 
          style={{ 
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            border: '1px solid #e5e7eb'
          }}
        >
          <Statistic
            title={<span style={{ color: '#6b7280' }}>Tổng checklist</span>}
            value={checklists.length}
            prefix={<FileTextOutlined style={{ color: '#06b6d4' }} />}
            valueStyle={{ color: '#06b6d4', fontWeight: 700 }}
          />
        </Card>
        <Card style={{ 
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          border: '1px solid #e5e7eb'
        }}>
          <Statistic
            title={<span style={{ color: '#6b7280' }}>Trạng thái OK</span>}
            value={checklists.filter(c => c.status === 'OK').length}
            prefix={<FileTextOutlined style={{ color: '#10b981' }} />}
            valueStyle={{ color: '#10b981', fontWeight: 700 }}
          />
        </Card>
        <Card style={{ 
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          border: '1px solid #e5e7eb'
        }}>
          <Statistic
            title={<span style={{ color: '#6b7280' }}>Cần thay thế</span>}
            value={checklists.filter(c => c.status === 'NeedReplace').length}
            prefix={<FileTextOutlined style={{ color: '#f59e0b' }} />}
            valueStyle={{ color: '#f59e0b', fontWeight: 700 }}
          />
        </Card>
      </div>

      {/* Table Card */}
      <Card
        style={{
          borderRadius: '16px',
          boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
          border: '1px solid #e5e7eb'
        }}
        styles={{ body: { padding: '24px' } }}
      >
        {/* Search */}
        <div style={{ marginBottom: '24px' }}>
          <Input
            placeholder="Tìm kiếm theo khách hàng, xe, trung tâm, hạng mục..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{
              borderRadius: '10px',
              padding: '12px 16px',
              fontSize: '15px'
            }}
            size="large"
          />
        </div>

        {/* Table */}
        <Table
          dataSource={filteredChecklists}
          columns={columns}
          rowKey="checklistID"
          loading={loading}
          pagination={{ pageSize: 10, position: ['bottomCenter'] }}
          style={{ borderRadius: '12px' }}
          locale={{ emptyText: 'Bạn chưa tạo checklist nào' }}
        />
      </Card>

      {/* Detail Modal */}
      <Modal
        title={
          <div style={{ fontSize: '20px', fontWeight: 700, color: '#1f2937' }}>
            📋 Chi tiết Service Checklist
          </div>
        }
        open={isDetailModalVisible}
        onCancel={() => setIsDetailModalVisible(false)}
        footer={null}
        centered
        width={600}
        styles={{ body: { borderRadius: '16px' } }}
      >
        {selectedChecklist && (
          <Descriptions bordered column={1} style={{ marginTop: '16px' }}>
            <Descriptions.Item label="ID" labelStyle={{ fontWeight: 600 }}>
              {selectedChecklist.checklistID}
            </Descriptions.Item>
            <Descriptions.Item label="Order ID" labelStyle={{ fontWeight: 600 }}>
              {selectedChecklist.orderID}
            </Descriptions.Item>
            <Descriptions.Item label="Khách hàng" labelStyle={{ fontWeight: 600 }}>
              {selectedChecklist.customerName}
            </Descriptions.Item>
            <Descriptions.Item label="Xe" labelStyle={{ fontWeight: 600 }}>
              {selectedChecklist.vehicleModel}
            </Descriptions.Item>
            <Descriptions.Item label="Trung tâm" labelStyle={{ fontWeight: 600 }}>
              {selectedChecklist.centerName}
            </Descriptions.Item>
            <Descriptions.Item label="Hạng mục" labelStyle={{ fontWeight: 600 }}>
              <Tag color="blue" style={{ borderRadius: 12 }}>
                {selectedChecklist.itemName}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái" labelStyle={{ fontWeight: 600 }}>
              <Tag 
                color={
                  selectedChecklist.status === 'OK'
                    ? 'green'
                    : selectedChecklist.status === 'NotOK'
                    ? 'red'
                    : 'orange'
                }
                style={{ borderRadius: 12, fontWeight: 600 }}
              >
                {selectedChecklist.status === 'OK' ? '✓ OK' : 
                 selectedChecklist.status === 'NotOK' ? '❌ Not OK' : 
                 selectedChecklist.status === 'NeedReplace' ? '⚠ Cần thay thế' : 
                 selectedChecklist.status}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Ghi chú" labelStyle={{ fontWeight: 600 }}>
              {selectedChecklist.notes || 'Không có ghi chú'}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày tạo" labelStyle={{ fontWeight: 600 }}>
              {new Date(selectedChecklist.createDate).toLocaleString('vi-VN')}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      {/* Create Checklist Modal */}
      <Modal
        title={
          <div style={{ fontSize: '20px', fontWeight: 700, color: '#1f2937' }}>
            ➕ Tạo Service Checklist Mới
          </div>
        }
        open={isCreateModalVisible}
        onCancel={() => {
          setIsCreateModalVisible(false);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        okText="Tạo Checklist"
        cancelText="Hủy"
        okButtonProps={{
          style: {
            borderRadius: 8,
            background: 'linear-gradient(90deg, #06b6d4 0%, #0891b2 100%)',
            border: 'none',
            fontWeight: 600,
            height: 40
          }
        }}
        cancelButtonProps={{
          style: {
            borderRadius: 8,
            fontWeight: 600,
            height: 40
          }
        }}
        width={600}
        styles={{ body: { borderRadius: '16px' } }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateChecklist}
          style={{ marginTop: '16px' }}
        >
          <Form.Item
            label={<span style={{ fontWeight: 600, color: '#1f2937' }}>Order ID</span>}
            name="orderID"
            rules={[{ required: true, message: "Vui lòng nhập Order ID" }]}
          >
            <Input
              type="number"
              placeholder="Nhập Order ID"
              size="large"
              style={{ borderRadius: 10 }}
            />
          </Form.Item>

          <Form.Item
            label={<span style={{ fontWeight: 600, color: '#1f2937' }}>Tên hạng mục</span>}
            name="itemName"
            rules={[{ required: true, message: "Vui lòng nhập tên hạng mục" }]}
          >
            <Input
              placeholder="Ví dụ: Kiểm tra pin, Kiểm tra hệ thống điện..."
              size="large"
              style={{ borderRadius: 10 }}
            />
          </Form.Item>

          <Form.Item
            label={<span style={{ fontWeight: 600, color: '#1f2937' }}>Trạng thái</span>}
            name="status"
            rules={[{ required: true, message: "Vui lòng chọn trạng thái" }]}
          >
            <Select
              placeholder="Chọn trạng thái"
              size="large"
              style={{ borderRadius: 10 }}
            >
              <Select.Option value="OK">✓ OK</Select.Option>
              <Select.Option value="NotOK">❌ Not OK</Select.Option>
              <Select.Option value="NeedReplace">⚠ Cần thay thế</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label={<span style={{ fontWeight: 600, color: '#1f2937' }}>Ghi chú</span>}
            name="notes"
          >
            <Input.TextArea
              placeholder="Nhập ghi chú (nếu có)"
              rows={4}
              style={{ borderRadius: 10 }}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit Checklist Modal */}
      <Modal
        title={
          <div style={{ fontSize: '20px', fontWeight: 700, color: '#1f2937' }}>
            ✏️ Chỉnh sửa Service Checklist
          </div>
        }
        open={isEditModalVisible}
        onCancel={() => {
          setIsEditModalVisible(false);
          setEditingChecklist(null);
          editForm.resetFields();
        }}
        onOk={() => editForm.submit()}
        okText="Cập nhật"
        cancelText="Hủy"
        okButtonProps={{
          style: {
            borderRadius: 8,
            background: 'linear-gradient(90deg, #06b6d4 0%, #0891b2 100%)',
            border: 'none',
            fontWeight: 600,
            height: 40
          }
        }}
        cancelButtonProps={{
          style: {
            borderRadius: 8,
            fontWeight: 600,
            height: 40
          }
        }}
        width={600}
        styles={{ body: { borderRadius: '16px' } }}
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleEditChecklist}
          style={{ marginTop: '16px' }}
        >
          <Form.Item
            label={<span style={{ fontWeight: 600, color: '#1f2937' }}>Order ID</span>}
            name="orderID"
            rules={[{ required: true, message: "Vui lòng nhập Order ID" }]}
          >
            <Input
              type="number"
              placeholder="Nhập Order ID"
              size="large"
              style={{ borderRadius: 10 }}
            />
          </Form.Item>

          <Form.Item
            label={<span style={{ fontWeight: 600, color: '#1f2937' }}>Tên hạng mục</span>}
            name="itemName"
            rules={[{ required: true, message: "Vui lòng nhập tên hạng mục" }]}
          >
            <Input
              placeholder="Ví dụ: Kiểm tra pin, Kiểm tra hệ thống điện..."
              size="large"
              style={{ borderRadius: 10 }}
            />
          </Form.Item>

          <Form.Item
            label={<span style={{ fontWeight: 600, color: '#1f2937' }}>Trạng thái</span>}
            name="status"
            rules={[{ required: true, message: "Vui lòng chọn trạng thái" }]}
          >
            <Select
              placeholder="Chọn trạng thái"
              size="large"
              style={{ borderRadius: 10 }}
            >
              <Select.Option value="OK">✓ OK</Select.Option>
              <Select.Option value="NotOK">❌ Not OK</Select.Option>
              <Select.Option value="NeedReplace">⚠ Cần thay thế</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label={<span style={{ fontWeight: 600, color: '#1f2937' }}>Ghi chú</span>}
            name="notes"
          >
            <Input.TextArea
              placeholder="Nhập ghi chú (nếu có)"
              rows={4}
              style={{ borderRadius: 10 }}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TechnicianChecklistView;

