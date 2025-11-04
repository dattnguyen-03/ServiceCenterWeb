import React, { useState, useEffect } from 'react';
import {
  Table, Button, Modal, Form, Input, InputNumber, Select, DatePicker,
  Space, Popconfirm, Card, Statistic, Row, Col, Descriptions, Tag, message
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined,
  IdcardOutlined, SearchOutlined, CheckCircleOutlined,
  ClockCircleOutlined, CloseCircleOutlined, InfoCircleOutlined
} from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import {
  technicianCertificationService,
  TechnicianCertification,
  CreateTechnicianCertificationRequest,
  EditTechnicianCertificationRequest
} from '../../services/technicianCertificationService';
import { technicianListService, Technician } from '../../services/technicianListService';
import { showSuccess, showError } from '../../utils/sweetAlert';

const { TextArea } = Input;
const { Option } = Select;

const TechnicianCertificationManagement: React.FC = () => {
  const [certifications, setCertifications] = useState<TechnicianCertification[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [editingCertification, setEditingCertification] = useState<TechnicianCertification | null>(null);
  const [viewingCertification, setViewingCertification] = useState<TechnicianCertification | null>(null);
  const [form] = Form.useForm();
  const [searchForm] = Form.useForm();
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    loadCertifications();
    loadTechnicians();
  }, []);

  const loadCertifications = async () => {
    try {
      setLoading(true);
      const data = await technicianCertificationService.getAllCertifications();
      setCertifications(data);
    } catch (error: any) {
      console.error('Error loading certifications:', error);
      showError('Lỗi', error.message || 'Không thể tải danh sách chứng chỉ');
    } finally {
      setLoading(false);
    }
  };

  const loadTechnicians = async () => {
    try {
      const data = await technicianCertificationService.getTechnicians();
      setTechnicians(data);
    } catch (error: any) {
      console.error('Error loading technicians:', error);
    }
  };

  const handleSearch = async (values: { technicianId?: number; certificateCode?: string }) => {
    try {
      setSearchLoading(true);
      const params: { technicianId?: number; certificateCode?: string } = {};
      
      if (values.technicianId) {
        params.technicianId = values.technicianId;
      }
      
      if (values.certificateCode && values.certificateCode.trim()) {
        params.certificateCode = values.certificateCode.trim();
      }

      if (!params.technicianId && !params.certificateCode) {
        message.warning('Vui lòng nhập TechnicianID hoặc CertificateCode để tìm kiếm');
        return;
      }

      const data = await technicianCertificationService.searchCertifications(params);
      setCertifications(data);
      
      if (data.length === 0) {
        message.info('Không tìm thấy chứng chỉ nào');
      } else {
        message.success(`Tìm thấy ${data.length} chứng chỉ`);
      }
    } catch (error: any) {
      console.error('Error searching certifications:', error);
      showError('Lỗi', error.message || 'Không thể tìm kiếm chứng chỉ');
    } finally {
      setSearchLoading(false);
    }
  };

  const handleResetSearch = () => {
    searchForm.resetFields();
    loadCertifications();
  };

  const handleAdd = () => {
    setEditingCertification(null);
    form.resetFields();
    form.setFieldsValue({
      status: 'Valid'
    });
    setModalVisible(true);
  };

  const handleViewDetail = (certification: TechnicianCertification) => {
    setViewingCertification(certification);
    setDetailModalVisible(true);
  };

  const handleEdit = (certification: TechnicianCertification) => {
    setEditingCertification(certification);
    form.setFieldsValue({
      certificateName: certification.certificateName,
      issuedBy: certification.issuedBy || undefined,
      issueDate: certification.issueDate ? dayjs(certification.issueDate) : undefined,
      expiryDate: certification.expiryDate ? dayjs(certification.expiryDate) : undefined,
      certificateCode: certification.certificateCode || undefined,
      attachment: certification.attachment || undefined,
      status: certification.status || 'Valid',
      notes: certification.notes || undefined
    });
    setModalVisible(true);
  };

  const handleDelete = async (certificationID: number) => {
    try {
      await technicianCertificationService.deleteCertification(certificationID);
      showSuccess('Thành công', 'Xóa chứng chỉ thành công');
      loadCertifications();
    } catch (error: any) {
      showError('Lỗi', error.message || 'Không thể xóa chứng chỉ');
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      if (editingCertification) {
        const updateData: EditTechnicianCertificationRequest = {
          certificationID: editingCertification.certificationID,
          certificateName: values.certificateName,
          issuedBy: values.issuedBy || undefined,
          issueDate: values.issueDate ? values.issueDate.format('YYYY-MM-DD') : undefined,
          expiryDate: values.expiryDate ? values.expiryDate.format('YYYY-MM-DD') : undefined,
          certificateCode: values.certificateCode || undefined,
          attachment: values.attachment || undefined,
          status: values.status || 'Valid',
          notes: values.notes || undefined
        };
        
        await technicianCertificationService.updateCertification(updateData);
        showSuccess('Thành công', 'Cập nhật chứng chỉ thành công');
      } else {
        const createData: CreateTechnicianCertificationRequest = {
          technicianID: values.technicianID,
          certificateName: values.certificateName,
          issuedBy: values.issuedBy || undefined,
          issueDate: values.issueDate ? values.issueDate.format('YYYY-MM-DD') : undefined,
          expiryDate: values.expiryDate ? values.expiryDate.format('YYYY-MM-DD') : undefined,
          certificateCode: values.certificateCode || undefined,
          attachment: values.attachment || undefined,
          status: values.status || 'Valid',
          notes: values.notes || undefined
        };
        
        await technicianCertificationService.createCertification(createData);
        showSuccess('Thành công', 'Tạo chứng chỉ thành công');
      }
      
      setModalVisible(false);
      form.resetFields();
      loadCertifications();
    } catch (error: any) {
      showError('Lỗi', error.message || 'Không thể lưu chứng chỉ');
    }
  };

  const getStatusTag = (status: string | null) => {
    if (!status) return <Tag color="default">N/A</Tag>;
    
    switch (status.toUpperCase()) {
      case 'VALID':
        return <Tag color="green" icon={<CheckCircleOutlined />}>Hợp lệ</Tag>;
      case 'EXPIRED':
        return <Tag color="red" icon={<CloseCircleOutlined />}>Hết hạn</Tag>;
      case 'REVOKED':
        return <Tag color="orange" icon={<CloseCircleOutlined />}>Thu hồi</Tag>;
      default:
        return <Tag color="default">{status}</Tag>;
    }
  };

  const checkExpired = (expiryDate: string | null) => {
    if (!expiryDate) return false;
    return technicianCertificationService.isExpired(expiryDate);
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'certificationID',
      key: 'certificationID',
      width: 80,
      render: (id: number) => <Tag color="blue">#{id}</Tag>,
    },
    {
      title: 'Kỹ thuật viên',
      dataIndex: 'technicianName',
      key: 'technicianName',
      render: (name: string, record: TechnicianCertification) => (
        <div>
          <strong style={{ fontSize: '15px' }}>{name || `ID: ${record.technicianID}`}</strong>
          <br />
          <span style={{ color: '#6b7280', fontSize: '12px' }}>ID: {record.technicianID}</span>
        </div>
      ),
    },
    {
      title: 'Tên chứng chỉ',
      dataIndex: 'certificateName',
      key: 'certificateName',
      render: (text: string) => <strong style={{ fontSize: '15px' }}>{text}</strong>,
    },
    {
      title: 'Mã chứng chỉ',
      dataIndex: 'certificateCode',
      key: 'certificateCode',
      render: (code: string | null) => 
        code ? (
          <Tag color="blue" style={{ fontSize: '13px' }}>{code}</Tag>
        ) : (
          <Tag color="default" style={{ fontSize: '13px' }}>N/A</Tag>
        ),
    },
    {
      title: 'Cấp bởi',
      dataIndex: 'issuedBy',
      key: 'issuedBy',
      render: (text: string | null) => text || 'N/A',
    },
    {
      title: 'Ngày cấp',
      dataIndex: 'issueDate',
      key: 'issueDate',
      render: (date: string | null) => 
        technicianCertificationService.formatDate(date),
    },
    {
      title: 'Ngày hết hạn',
      dataIndex: 'expiryDate',
      key: 'expiryDate',
      render: (date: string | null, record: TechnicianCertification) => {
        const expired = checkExpired(date);
        const formattedDate = technicianCertificationService.formatDate(date);
        return (
          <span style={{ color: expired ? '#ef4444' : '#374151' }}>
            {formattedDate}
            {expired && <Tag color="red" style={{ marginLeft: '8px' }}>Hết hạn</Tag>}
          </span>
        );
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string | null, record: TechnicianCertification) => {
        const expired = checkExpired(record.expiryDate);
        if (expired && status === 'Valid') {
          return <Tag color="red" icon={<CloseCircleOutlined />}>Hết hạn</Tag>;
        }
        return getStatusTag(status);
      },
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 220,
      render: (_: any, record: TechnicianCertification) => (
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
            description="Bạn có chắc chắn muốn xóa chứng chỉ này?"
            onConfirm={() => handleDelete(record.certificationID)}
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
    total: certifications.length,
    valid: certifications.filter(c => c.status === 'Valid' && !checkExpired(c.expiryDate)).length,
    expired: certifications.filter(c => checkExpired(c.expiryDate) || c.status === 'Expired').length,
    revoked: certifications.filter(c => c.status === 'Revoked').length,
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
              <IdcardOutlined style={{ marginRight: '12px', color: '#3b82f6' }} />
              Quản lý chứng chỉ kỹ thuật viên
            </h2>
            <p style={{ color: '#6b7280', fontSize: '15px' }}>Quản lý chứng chỉ và bằng cấp của kỹ thuật viên</p>
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
            Thêm chứng chỉ
          </Button>
        </div>

        {/* Statistics */}
        <Row gutter={16} style={{ marginBottom: '24px' }}>
          <Col xs={24} sm={6}>
            <Card 
              style={{ 
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
                border: 'none',
              }}
            >
              <Statistic
                title={<span style={{ color: '#64748b' }}>Tổng chứng chỉ</span>}
                value={stats.total}
                prefix={<IdcardOutlined style={{ color: '#3b82f6' }} />}
                valueStyle={{ fontSize: '28px', fontWeight: 700, color: '#1e40af' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card 
              style={{ 
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                border: 'none',
              }}
            >
              <Statistic
                title={<span style={{ color: '#64748b' }}>Hợp lệ</span>}
                value={stats.valid}
                prefix={<CheckCircleOutlined style={{ color: '#10b981' }} />}
                valueStyle={{ fontSize: '28px', fontWeight: 700, color: '#047857' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card 
              style={{ 
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
                border: 'none',
              }}
            >
              <Statistic
                title={<span style={{ color: '#64748b' }}>Hết hạn</span>}
                value={stats.expired}
                prefix={<CloseCircleOutlined style={{ color: '#ef4444' }} />}
                valueStyle={{ fontSize: '28px', fontWeight: 700, color: '#dc2626' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card 
              style={{ 
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
                border: 'none',
              }}
            >
              <Statistic
                title={<span style={{ color: '#64748b' }}>Thu hồi</span>}
                value={stats.revoked}
                prefix={<ClockCircleOutlined style={{ color: '#f59e0b' }} />}
                valueStyle={{ fontSize: '28px', fontWeight: 700, color: '#d97706' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Search Form */}
        <Card 
          style={{ 
            borderRadius: '12px', 
            border: '1px solid #e5e7eb',
            marginBottom: '24px'
          }}
        >
          <Form
            form={searchForm}
            layout="inline"
            onFinish={handleSearch}
            style={{ width: '100%' }}
          >
            <Form.Item name="technicianId" label="Technician ID">
              <InputNumber
                placeholder="Nhập Technician ID"
                style={{ width: '200px' }}
                min={1}
              />
            </Form.Item>
            <Form.Item name="certificateCode" label="Mã chứng chỉ">
              <Input
                placeholder="Nhập mã chứng chỉ"
                style={{ width: '250px' }}
              />
            </Form.Item>
            <Form.Item>
              <Space>
                <Button
                  type="primary"
                  icon={<SearchOutlined />}
                  htmlType="submit"
                  loading={searchLoading}
                >
                  Tìm kiếm
                </Button>
                <Button onClick={handleResetSearch}>
                  Reset
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Card>

        {/* Table */}
        <Card style={{ borderRadius: '12px', border: '1px solid #e5e7eb' }}>
          <Table
            columns={columns}
            dataSource={certifications}
            loading={loading}
            rowKey="certificationID"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => (
                <span style={{ fontSize: '14px', fontWeight: 600 }}>
                  Tổng cộng <span style={{ color: '#3b82f6' }}>{total}</span> chứng chỉ
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
            <span style={{ fontSize: '18px', fontWeight: 600 }}>Chi tiết chứng chỉ</span>
          </div>
        }
        open={detailModalVisible}
        onCancel={() => {
          setDetailModalVisible(false);
          setViewingCertification(null);
        }}
        footer={[
          <Button 
            key="edit" 
            type="primary"
            icon={<EditOutlined />}
            onClick={() => {
              setDetailModalVisible(false);
              if (viewingCertification) {
                handleEdit(viewingCertification);
              }
            }}
          >
            Chỉnh sửa
          </Button>,
          <Button 
            key="close" 
            onClick={() => {
              setDetailModalVisible(false);
              setViewingCertification(null);
            }}
          >
            Đóng
          </Button>
        ]}
        width={700}
      >
        {viewingCertification && (
          <Descriptions bordered column={1} size="middle">
            <Descriptions.Item label="Mã chứng chỉ">
              <Tag color="blue" style={{ fontSize: '14px', padding: '4px 12px' }}>
                #{viewingCertification.certificationID}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Kỹ thuật viên">
              <div>
                <strong style={{ fontSize: '16px' }}>
                  {viewingCertification.technicianName || `ID: ${viewingCertification.technicianID}`}
                </strong>
                <br />
                <span style={{ color: '#6b7280', fontSize: '14px' }}>
                  Technician ID: {viewingCertification.technicianID}
                </span>
              </div>
            </Descriptions.Item>
            <Descriptions.Item label="Tên chứng chỉ">
              <strong style={{ fontSize: '16px' }}>{viewingCertification.certificateName}</strong>
            </Descriptions.Item>
            <Descriptions.Item label="Mã chứng chỉ">
              {viewingCertification.certificateCode ? (
                <Tag color="blue" style={{ fontSize: '14px', padding: '4px 12px' }}>
                  {viewingCertification.certificateCode}
                </Tag>
              ) : (
                <span style={{ color: '#9ca3af' }}>N/A</span>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Cấp bởi">
              {viewingCertification.issuedBy || <span style={{ color: '#9ca3af' }}>N/A</span>}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày cấp">
              {technicianCertificationService.formatDate(viewingCertification.issueDate)}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày hết hạn">
              <div>
                {technicianCertificationService.formatDate(viewingCertification.expiryDate)}
                {checkExpired(viewingCertification.expiryDate) && (
                  <Tag color="red" style={{ marginLeft: '8px' }}>Hết hạn</Tag>
                )}
              </div>
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              {getStatusTag(viewingCertification.status)}
            </Descriptions.Item>
            <Descriptions.Item label="Đính kèm">
              {viewingCertification.attachment ? (
                <a href={viewingCertification.attachment} target="_blank" rel="noopener noreferrer">
                  {viewingCertification.attachment}
                </a>
              ) : (
                <span style={{ color: '#9ca3af' }}>N/A</span>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Ghi chú">
              <div style={{ color: '#374151', lineHeight: '1.6' }}>
                {viewingCertification.notes || <span style={{ color: '#9ca3af' }}>Không có ghi chú</span>}
              </div>
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      {/* Create/Edit Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '18px', fontWeight: 600 }}>
              {editingCertification ? 'Chỉnh sửa chứng chỉ' : 'Thêm chứng chỉ mới'}
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
        width={700}
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
          {!editingCertification && (
            <Form.Item
              name="technicianID"
              label={<strong>Kỹ thuật viên</strong>}
              rules={[{ required: true, message: 'Vui lòng chọn kỹ thuật viên' }]}
            >
              <Select
                placeholder="Chọn kỹ thuật viên"
                size="large"
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) =>
                  (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
                }
              >
                {technicians.map((tech) => (
                  <Option key={tech.userID} value={tech.userID}>
                    {tech.name} (ID: {tech.userID})
                  </Option>
                ))}
              </Select>
            </Form.Item>
          )}

          <Form.Item
            name="certificateName"
            label={<strong>Tên chứng chỉ</strong>}
            rules={[{ required: true, message: 'Vui lòng nhập tên chứng chỉ' }]}
          >
            <Input 
              placeholder="Nhập tên chứng chỉ" 
              size="large"
              maxLength={100}
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="certificateCode"
                label={<strong>Mã chứng chỉ</strong>}
              >
                <Input 
                  placeholder="Nhập mã chứng chỉ" 
                  size="large"
                  maxLength={50}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="issuedBy"
                label={<strong>Cấp bởi</strong>}
              >
                <Input 
                  placeholder="Nhập tên tổ chức cấp" 
                  size="large"
                  maxLength={100}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="issueDate"
                label={<strong>Ngày cấp</strong>}
              >
                <DatePicker
                  style={{ width: '100%' }}
                  size="large"
                  format="DD/MM/YYYY"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="expiryDate"
                label={<strong>Ngày hết hạn</strong>}
              >
                <DatePicker
                  style={{ width: '100%' }}
                  size="large"
                  format="DD/MM/YYYY"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="status"
            label={<strong>Trạng thái</strong>}
            rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
          >
            <Select size="large" placeholder="Chọn trạng thái">
              <Option value="Valid">Hợp lệ</Option>
              <Option value="Expired">Hết hạn</Option>
              <Option value="Revoked">Thu hồi</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="attachment"
            label={<strong>Link đính kèm</strong>}
          >
            <Input 
              placeholder="Nhập URL file đính kèm" 
              size="large"
              maxLength={255}
            />
          </Form.Item>

          <Form.Item
            name="notes"
            label={<strong>Ghi chú</strong>}
          >
            <TextArea 
              rows={4} 
              placeholder="Nhập ghi chú"
              style={{ fontSize: '14px' }}
              maxLength={255}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TechnicianCertificationManagement;

