import React, { useState, useEffect } from "react";
import { Table, Card, Input, Tag, Modal, Descriptions, Statistic, Button, Row, Col } from "antd";
import { FileTextOutlined, SearchOutlined, EyeOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { serviceChecklistService, ServiceChecklistGroup } from "../../services/serviceChecklistService";
import { showError } from "../../utils/sweetAlert";

const StaffChecklistView: React.FC = () => {
  const [checklists, setChecklists] = useState<ServiceChecklistGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [selectedChecklist, setSelectedChecklist] = useState<ServiceChecklistGroup | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");

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
      showError('Lỗi', 'Không thể tải danh sách checklist');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = (checklist: ServiceChecklistGroup) => {
    setSelectedChecklist(checklist);
    setIsDetailModalVisible(true);
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'OK':
        return { text: 'OK', color: 'green' };
      case 'NotOK':
        return { text: 'Không OK', color: 'red' };
      case 'NeedReplace':
        return { text: 'Cần thay', color: 'orange' };
      default:
        return { text: status, color: 'default' };
    }
  };

  const filteredChecklists = checklists.filter((checklistGroup) => {
    if (!checklistGroup) return false;
    const search = searchText.toLowerCase();
    
    // Search in group info
    const groupMatch = 
      (checklistGroup.customerName || '').toLowerCase().includes(search) ||
      (checklistGroup.vehicleModel || '').toLowerCase().includes(search) ||
      (checklistGroup.centerName || '').toLowerCase().includes(search);
    
    // Search in checklist items
    const itemsMatch = checklistGroup.checklistItems?.some(item => 
      (item.itemName || '').toLowerCase().includes(search) ||
      (item.notes || '').toLowerCase().includes(search) ||
      getStatusInfo(item.status).text.toLowerCase().includes(search)
    );
    
    // Status filter - check if any item matches the status filter
    const matchStatus = statusFilter === 'all' || 
      checklistGroup.checklistItems?.some(item => item.status === statusFilter);
    
    return (groupMatch || itemsMatch) && matchStatus;
  });

  // Count statistics from all items in all groups
  const allItems = filteredChecklists.flatMap(group => group.checklistItems || []);
  const okCount = allItems.filter(item => item.status === 'OK').length;
  const notOkCount = allItems.filter(item => item.status === 'NotOK').length;
  const needReplaceCount = allItems.filter(item => item.status === 'NeedReplace').length;

  const columns: ColumnsType<ServiceChecklistGroup> = [
    {
      title: "Order ID",
      dataIndex: "orderID",
      key: "orderID",
      width: 100,
      render: (orderID) => <span style={{ fontWeight: 600, color: '#1f2937' }}>#{orderID}</span>
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
      title: "Danh sách hạng mục kiểm tra",
      key: "checklistItems",
      render: (_, record) => (
        <div style={{ maxWidth: 300 }}>
          {record.checklistItems?.map((item) => {
            const statusInfo = getStatusInfo(item.status);
            return (
              <Tag 
                key={item.checklistID}
                color={statusInfo.color}
                style={{ 
                  marginBottom: 4, 
                  borderRadius: 12,
                  fontSize: '12px'
                }}
              >
                {item.itemName} ({statusInfo.text})
              </Tag>
            );
          })}
        </div>
      )
    },
    {
      title: "Tổng quan",
      key: "summary",
      width: 120,
      render: (_, record) => {
        const items = record.checklistItems || [];
        const okCount = items.filter(item => item.status === 'OK').length;
        const totalCount = items.length;
        return (
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: '#059669', fontWeight: 600 }}>{okCount}/{totalCount}</div>
            <div style={{ fontSize: '12px', color: '#6b7280' }}>OK</div>
          </div>
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
      width: 100,
      render: (_: any, record: ServiceChecklistGroup) => (
        <Button
          type="text"
          icon={<EyeOutlined />}
          onClick={() => handleViewDetail(record)}
          style={{ color: '#2563eb' }}
        />
      ),
    },
  ];

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #f0f9ff 0%, #f9fafb 100%)', padding: '24px' }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <FileTextOutlined style={{ fontSize: 28, color: '#2563eb' }} />
            <h1 className="text-3xl font-bold" style={{ color: '#1f2937' }}>
              Quản lý Checklist
            </h1>
          </div>
          <p className="text-gray-600">Xem và quản lý danh sách service checklist</p>
        </div>

        {/* Statistics */}
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} sm={12} md={6}>
            <Card style={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
              <Statistic
                title="Tổng số"
                value={filteredChecklists.length}
                prefix={<FileTextOutlined />}
                valueStyle={{ color: '#3b82f6' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card style={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
              <Statistic
                title="OK"
                value={okCount}
                valueStyle={{ color: '#10b981' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card style={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
              <Statistic
                title="Không OK"
                value={notOkCount}
                valueStyle={{ color: '#ef4444' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card style={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
              <Statistic
                title="Cần thay"
                value={needReplaceCount}
                valueStyle={{ color: '#f59e0b' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Search and Filter */}
        <Card style={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', marginBottom: 20 }}>
          <div className="flex flex-col md:flex-row gap-4">
            <Input
              placeholder="Tìm kiếm theo khách hàng, xe, trung tâm, hạng mục..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ borderRadius: 8 }}
              size="large"
            />
            <div className="flex gap-2">
              <Button
                type={statusFilter === 'all' ? 'primary' : 'default'}
                onClick={() => setStatusFilter('all')}
              >
                Tất cả
              </Button>
              <Button
                type={statusFilter === 'OK' ? 'primary' : 'default'}
                onClick={() => setStatusFilter('OK')}
              >
                OK
              </Button>
              <Button
                type={statusFilter === 'NotOK' ? 'primary' : 'default'}
                onClick={() => setStatusFilter('NotOK')}
              >
                Không OK
              </Button>
              <Button
                type={statusFilter === 'NeedReplace' ? 'primary' : 'default'}
                onClick={() => setStatusFilter('NeedReplace')}
              >
                Cần thay
              </Button>
            </div>
          </div>
        </Card>

        {/* Table */}
        <Card style={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <Table
            columns={columns}
            dataSource={filteredChecklists}
            loading={loading}
            rowKey="checklistID"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Tổng ${total} checklist`,
            }}
            locale={{
              emptyText: <div style={{ padding: '40px 0', color: '#9ca3af' }}>
                Không có checklist nào
              </div>
            }}
          />
        </Card>

        {/* Detail Modal */}
        <Modal
          title={
            <div style={{ fontSize: 20, fontWeight: 700, color: '#1f2937' }}>
              <FileTextOutlined style={{ marginRight: 8, color: '#2563eb' }} />
              Chi tiết Checklist
            </div>
          }
          open={isDetailModalVisible}
          onCancel={() => setIsDetailModalVisible(false)}
          footer={[
            <Button key="close" onClick={() => setIsDetailModalVisible(false)}>
              Đóng
            </Button>
          ]}
          width={700}
          style={{ top: 20 }}
        >
          {selectedChecklist && (
            <div>
              <Descriptions bordered column={1} labelStyle={{ fontWeight: 600, width: '40%' }}>
                <Descriptions.Item label="Order ID">
                  #{selectedChecklist.orderID}
                </Descriptions.Item>
                <Descriptions.Item label="Appointment ID">
                  #{selectedChecklist.appointmentID}
                </Descriptions.Item>
                <Descriptions.Item label="Khách hàng">
                  {selectedChecklist.customerName}
                </Descriptions.Item>
                <Descriptions.Item label="Xe">
                  {selectedChecklist.vehicleModel}
                </Descriptions.Item>
                <Descriptions.Item label="Trung tâm">
                  {selectedChecklist.centerName}
                </Descriptions.Item>
                <Descriptions.Item label="Ngày tạo">
                  {new Date(selectedChecklist.createDate).toLocaleString('vi-VN')}
                </Descriptions.Item>
              </Descriptions>
              
              <div style={{ marginTop: '24px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', color: '#1f2937' }}>
                  Danh sách hạng mục kiểm tra ({selectedChecklist.checklistItems?.length || 0} mục)
                </h3>
                <div style={{ display: 'grid', gap: '12px' }}>
                  {selectedChecklist.checklistItems?.map((item) => {
                    const statusInfo = getStatusInfo(item.status);
                    return (
                      <Card 
                        key={item.checklistID}
                        size="small"
                        style={{ 
                          border: `1px solid ${
                            statusInfo.color === 'green' ? '#10b981' :
                            statusInfo.color === 'red' ? '#ef4444' :
                            statusInfo.color === 'orange' ? '#f59e0b' : '#d1d5db'
                          }`,
                          borderRadius: '8px'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <div style={{ fontWeight: 600, color: '#1f2937' }}>
                              {item.itemName}
                            </div>
                            {item.notes && (
                              <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                                {item.notes}
                              </div>
                            )}
                          </div>
                          <Tag 
                            color={statusInfo.color}
                            style={{ borderRadius: '8px', fontWeight: 600 }}
                          >
                            {statusInfo.text}
                          </Tag>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default StaffChecklistView;

