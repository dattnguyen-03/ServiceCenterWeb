import React, { useState, useEffect } from "react";
import { Table, Card, Input, Tag, Modal, Descriptions, Statistic, Button, Row, Col } from "antd";
import { FileTextOutlined, SearchOutlined, EyeOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { serviceChecklistService, ServiceChecklist } from "../../services/serviceChecklistService";
import { showError } from "../../utils/sweetAlert";

const StaffChecklistView: React.FC = () => {
  const [checklists, setChecklists] = useState<ServiceChecklist[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [selectedChecklist, setSelectedChecklist] = useState<ServiceChecklist | null>(null);
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

  const handleViewDetail = (checklist: ServiceChecklist) => {
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

  const filteredChecklists = checklists.filter((checklist) => {
    if (!checklist) return false;
    const search = searchText.toLowerCase();
    const matchSearch = 
      (checklist.customerName || '').toLowerCase().includes(search) ||
      (checklist.vehicleModel || '').toLowerCase().includes(search) ||
      (checklist.centerName || '').toLowerCase().includes(search) ||
      (checklist.itemName || '').toLowerCase().includes(search) ||
      (checklist.notes || '').toLowerCase().includes(search);
    
    const matchStatus = statusFilter === 'all' || checklist.status === statusFilter;
    
    return matchSearch && matchStatus;
  });

  const okCount = filteredChecklists.filter(c => c.status === 'OK').length;
  const notOkCount = filteredChecklists.filter(c => c.status === 'NotOK').length;
  const needReplaceCount = filteredChecklists.filter(c => c.status === 'NeedReplace').length;

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
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status) => {
        const { text, color } = getStatusInfo(status || '');
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: "Ghi chú",
      dataIndex: "notes",
      key: "notes",
      ellipsis: true,
      render: (text) => text || '-',
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
      render: (_: any, record: ServiceChecklist) => (
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
            <Descriptions bordered column={1} labelStyle={{ fontWeight: 600, width: '40%' }}>
              <Descriptions.Item label="ID">
                #{selectedChecklist.checklistID}
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
              <Descriptions.Item label="Hạng mục">
                <Tag color="blue">{selectedChecklist.itemName}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                {(() => {
                  const { text, color } = getStatusInfo(selectedChecklist.status || '');
                  return <Tag color={color}>{text}</Tag>;
                })()}
              </Descriptions.Item>
              <Descriptions.Item label="Ghi chú">
                {selectedChecklist.notes || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày tạo">
                {new Date(selectedChecklist.createDate).toLocaleString('vi-VN')}
              </Descriptions.Item>
            </Descriptions>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default StaffChecklistView;

