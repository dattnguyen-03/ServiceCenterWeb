import React, { useState, useEffect } from "react";
import { Table, Card, Input, Tag, Modal, Descriptions, Statistic, Button, Form, Select } from "antd";
import { FileTextOutlined, SearchOutlined, EyeOutlined, DeleteOutlined, EditOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { serviceChecklistService, ServiceChecklist, EditServiceChecklistRequest } from "../../services/serviceChecklistService";
import { message } from "antd";
import { showDeleteConfirm, showSuccess, showError } from "../../utils/sweetAlert";

const ServiceChecklistManagement: React.FC = () => {
  const [checklists, setChecklists] = useState<ServiceChecklist[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [selectedChecklist, setSelectedChecklist] = useState<ServiceChecklist | null>(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingChecklist, setEditingChecklist] = useState<ServiceChecklist | null>(null);
  const [editForm] = Form.useForm();

  useEffect(() => {
    fetchChecklists();
  }, []);

  const fetchChecklists = async () => {
    setLoading(true);
    try {
      const data = await serviceChecklistService.getAllChecklists();
      setChecklists(data);
    } catch (err: any) {
      console.error("Error fetching checklists:", err);
      message.error("Không thể tải danh sách checklist");
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = (checklist: ServiceChecklist) => {
    setSelectedChecklist(checklist);
    setIsDetailModalVisible(true);
  };

  const handleDeleteChecklist = async (checklistId: number) => {
    const result = await showDeleteConfirm('checklist này');
    
    if (result.isConfirmed) {
      setLoading(true);
      try {
        await serviceChecklistService.deleteChecklist(checklistId);
        showSuccess('Xóa checklist thành công!');
        await fetchChecklists();
      } catch (error: any) {
        showError('Lỗi', error.message || 'Không thể xóa checklist');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleEditChecklist = async (values: EditServiceChecklistRequest) => {
    if (!editingChecklist) return;

    setLoading(true);
    try {
      await serviceChecklistService.editChecklist(editingChecklist.checklistID, values);
      showSuccess('Cập nhật checklist thành công!');
      setIsEditModalVisible(false);
      editForm.resetFields();
      await fetchChecklists();
    } catch (error: any) {
      showError('Lỗi', error.message || 'Không thể cập nhật checklist');
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (checklist: ServiceChecklist) => {
    setEditingChecklist(checklist);
    editForm.setFieldsValue({
      itemName: checklist.itemName,
      status: checklist.status,
      notes: checklist.notes
    });
    setIsEditModalVisible(true);
  };

  const filteredChecklists = checklists.filter((checklist) => {
    if (!checklist) return false;
    const search = searchText.toLowerCase();
    return (
      (checklist.customerName || '').toLowerCase().includes(search) ||
      (checklist.vehicleModel || '').toLowerCase().includes(search) ||
      (checklist.centerName || '').toLowerCase().includes(search) ||
      (checklist.itemName || '').toLowerCase().includes(search) ||
      (checklist.status || '').toLowerCase().includes(search)
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
            style={{ color: '#10b981' }}
          />
          <Button
            type="text"
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteChecklist(record.checklistID)}
            danger
            style={{ color: '#dc2626' }}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #f0f9ff 0%, #f9fafb 100%)', padding: '24px' }}>
      {/* Header */}
      <div style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '32px',
        borderRadius: '16px',
        marginBottom: '24px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
          <FileTextOutlined style={{ fontSize: '36px', color: '#fff', marginRight: '16px' }} />
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#fff', margin: 0 }}>
            Quản lý Service Checklist
          </h1>
        </div>
        <p style={{ color: '#e0e7ff', fontSize: '16px', margin: 0 }}>
          Xem và quản lý danh sách Service Checklist toàn hệ thống
        </p>
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
            prefix={<FileTextOutlined style={{ color: '#667eea' }} />}
            valueStyle={{ color: '#667eea', fontWeight: 700 }}
          />
        </Card>
        <Card style={{ 
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          border: '1px solid #e5e7eb'
        }}>
          <Statistic
            title={<span style={{ color: '#6b7280' }}>Đã hoàn tất</span>}
            value={checklists.filter(c => c.status === 'OK' || c.status === 'good').length}
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
            title={<span style={{ color: '#6b7280' }}>Cần chú ý</span>}
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
          locale={{ emptyText: 'Chưa có checklist nào' }}
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

      {/* Edit Modal */}
      <Modal
        title={
          <div style={{ fontSize: '20px', fontWeight: 700, color: '#1f2937' }}>
            ✏️ Chỉnh sửa Checklist
          </div>
        }
        open={isEditModalVisible}
        onCancel={() => {
          setIsEditModalVisible(false);
          editForm.resetFields();
        }}
        footer={null}
        centered
        width={500}
        styles={{ body: { borderRadius: '16px' } }}
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleEditChecklist}
        >
          <Form.Item
            label="Hạng mục"
            name="itemName"
            rules={[{ required: true, message: 'Vui lòng nhập hạng mục!' }]}
          >
            <Input placeholder="Nhập hạng mục" />
          </Form.Item>

          <Form.Item
            label="Trạng thái"
            name="status"
            rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]}
          >
            <Select placeholder="Chọn trạng thái">
              <Select.Option value="OK">OK</Select.Option>
              <Select.Option value="NotOK">Không OK</Select.Option>
              <Select.Option value="NeedReplace">Cần thay thế</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Ghi chú"
            name="notes"
          >
            <Input.TextArea rows={4} placeholder="Nhập ghi chú (nếu có)" />
          </Form.Item>

          <Form.Item>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <Button onClick={() => {
                setIsEditModalVisible(false);
                editForm.resetFields();
              }}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                Cập nhật
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ServiceChecklistManagement;

