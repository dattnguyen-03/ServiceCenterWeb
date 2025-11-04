import React, { useEffect, useMemo, useState } from 'react';
import { Card, Row, Col, Tag, Typography, Empty, Spin, Input, Segmented, Tooltip, Divider, Modal, Button } from 'antd';
import { CalendarOutlined, EnvironmentOutlined, CarOutlined, HourglassOutlined, ReloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { appointmentService } from '../../services/appointmentService';
import { AppointmentSummary } from '../../types/api';
import { showDeleteConfirm, showSuccess, showError } from '../../utils/sweetAlert';

const { Title, Text } = Typography;

const statusColorMap: Record<string, string> = {
  Pending: '#f59e0b',
  Confirmed: '#3b82f6',
  Completed: '#10b981',
  Cancelled: '#ef4444',
};

const AppointmentBooking: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState<'Tất cả' | 'Chờ duyệt' | 'Đã xác nhận' | 'Hoàn tất' | 'Đã hủy'>('Tất cả');
  const [items, setItems] = useState<AppointmentSummary[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentSummary | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);

  const fetchData = async () => {
    try {
      const data = await appointmentService.getMyAppointments();
      setItems(data);
    } catch (e) {
      console.error(e);
    }
  };


  useEffect(() => {
    (async () => {
      setLoading(true);
      await fetchData();
      setLoading(false);
    })();
  }, []);

  const filtered = useMemo(() => {
    const mapVN: Record<string, string> = {
      Pending: 'Chờ duyệt',
      Confirmed: 'Đã xác nhận',
      Completed: 'Hoàn tất',
      Cancelled: 'Đã hủy',
    };
    const qn = q.trim().toLowerCase();
    return items.filter(it => {
      const matchText = !qn || `${it.vehicleModel} ${it.centerName} ${it.serviceType}`.toLowerCase().includes(qn);
      const matchStatus = status === 'Tất cả' || mapVN[it.status] === status;
      return matchText && matchStatus;
    });
  }, [items, q, status]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-50 p-4 md:p-8">
      <style>{`
        @keyframes slideIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .appointment-card { animation: slideIn 0.5s ease-out forwards; }
        .header-section { animation: fadeIn 0.6s ease-out; }
      `}</style>
      
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="header-section mb-8">
          <div className="flex flex-col gap-2 mb-6">
            <Title level={2} className="!mb-0 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Lịch Hẹn Dịch Vụ Của Tôi
            </Title>
            <Text className="text-gray-600 text-base">
              Quản lý và theo dõi các cuộc hẹn dịch vụ của bạn
            </Text>
          </div>

          {/* Filter Bar */}
          <div className="bg-white/80 backdrop-blur-sm border border-blue-200 rounded-xl p-4 shadow-md">
            <div className="flex flex-col md:flex-row gap-3 items-start md:items-center md:justify-between">
              <div className="flex-1 w-full md:w-auto">
                <Input.Search
                  allowClear
                  placeholder=" Tìm theo xe, trung tâm, dịch vụ..."
                  value={q}
                  onChange={e => setQ(e.target.value)}
                  className="w-full"
                  style={{
                    backgroundColor: '#f8fafc',
                    borderColor: '#bfdbfe',
                    color: '#1e293b'
                  }}
                />
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto">
                <Segmented
                  value={status}
                  onChange={(val) => setStatus(val as any)}
                  options={['Tất cả', 'Chờ duyệt', 'Đã xác nhận', 'Hoàn tất', 'Đã hủy']}
                  className="bg-blue-100/50"
                  style={{ color: '#1e293b' }}
                />

                <Tooltip title="Làm mới">
                  <button
                    className={`h-10 px-3 flex items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:shadow-lg transition-all duration-200 ${
                      refreshing ? 'opacity-60 scale-95' : 'hover:scale-105'
                    }`}
                    onClick={async () => {
                      setRefreshing(true);
                      await fetchData();
                      setRefreshing(false);
                    }}
                  >
                    <ReloadOutlined className={refreshing ? 'animate-spin' : ''} />
                  </button>
                </Tooltip>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="flex justify-center items-center py-24">
            <Spin size="large" tip="Đang tải..." />
          </div>
        ) : filtered.length === 0 ? (
          <Card
            className="bg-white border-blue-200 shadow-md"
            style={{ borderRadius: 16 }}
            bodyStyle={{ padding: 40 }}
          >
            <Empty
              description={
                <div className="text-gray-600">
                  <div className="text-lg font-semibold">Chưa có lịch hẹn nào</div>
                  <p className="text-sm text-gray-500 mt-2">Hãy đặt lịch hẹn dịch vụ để bắt đầu</p>
                </div>
              }
            />
          </Card>
        ) : (
          <Row gutter={[20, 20]}>
            {filtered.map((ap, idx) => (
              <Col xs={24} sm={12} lg={8} key={idx}>
                <div
                  className="appointment-card"
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <Card
                    className="h-full bg-gradient-to-br from-white to-blue-50 border-blue-200 hover:border-cyan-400 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-300/30 overflow-hidden group cursor-pointer"
                    style={{ borderRadius: 16 }}
                    bodyStyle={{ padding: 0 }}
                  >
                    {/* Status Header */}
                    <div
                      className="h-1 w-full transition-all duration-300"
                      style={{
                        background: `linear-gradient(90deg, ${statusColorMap[ap.status]} 0%, ${statusColorMap[ap.status]}dd 100%)`,
                      }}
                    />

                    <div className="p-4 space-y-4">
                      {/* Status Badge */}
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Trạng Thái
                        </span>
                        <Tag
                          color={statusColorMap[ap.status]}
                          className="text-xs font-bold"
                          style={{
                            backgroundColor: statusColorMap[ap.status] + '15',
                            borderColor: statusColorMap[ap.status],
                            color: statusColorMap[ap.status],
                          }}
                        >
                          {ap.status}
                        </Tag>
                      </div>

                      <Divider className="!my-2 bg-blue-100" />

                      {/* Vehicle Info */}
                      <div className="space-y-3">
                        <div className="flex items-start gap-3 group/item">
                          <div
                            className="flex items-center justify-center w-8 h-8 rounded-lg"
                            style={{
                              backgroundColor: statusColorMap[ap.status] + '10',
                            }}
                          >
                            <CarOutlined style={{ color: statusColorMap[ap.status], fontSize: 16 }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <Text className="text-xs text-gray-500">Xe</Text>
                            <Text
                              strong
                              className="block text-gray-800 truncate group-hover/item:text-cyan-600 transition-colors"
                            >
                              {ap.vehicleModel}
                            </Text>
                          </div>
                        </div>

                        {/* Center Info */}
                        <div className="flex items-start gap-3 group/item">
                          <div
                            className="flex items-center justify-center w-8 h-8 rounded-lg"
                            style={{
                              backgroundColor: statusColorMap[ap.status] + '10',
                            }}
                          >
                            <EnvironmentOutlined style={{ color: statusColorMap[ap.status], fontSize: 16 }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <Text className="text-xs text-gray-500">Trung Tâm</Text>
                            <Text
                              strong
                              className="block text-gray-800 truncate group-hover/item:text-cyan-600 transition-colors"
                            >
                              {ap.centerName}
                            </Text>
                          </div>
                        </div>

                        {/* Date Time Info */}
                        <div className="flex items-start gap-3 group/item">
                          <div
                            className="flex items-center justify-center w-8 h-8 rounded-lg"
                            style={{
                              backgroundColor: statusColorMap[ap.status] + '10',
                            }}
                          >
                            <CalendarOutlined style={{ color: statusColorMap[ap.status], fontSize: 16 }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <Text className="text-xs text-gray-500">Thời Gian</Text>
                            <Text className="block text-gray-800 font-semibold">
                              {dayjs(ap.requestedDate).format('DD/MM/YYYY')}
                            </Text>
                            <Text className="text-xs text-gray-500">
                              {dayjs(ap.requestedDate).format('HH:mm')}
                            </Text>
                          </div>
                        </div>

                        {/* Service Info */}
                        <div className="flex items-start gap-3 group/item">
                          <div
                            className="flex items-center justify-center w-8 h-8 rounded-lg"
                            style={{
                              backgroundColor: statusColorMap[ap.status] + '10',
                            }}
                          >
                            <HourglassOutlined style={{ color: statusColorMap[ap.status], fontSize: 16 }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <Text className="text-xs text-gray-500">Dịch Vụ</Text>
                            <Text
                              strong
                              className="block text-gray-800 truncate group-hover/item:text-cyan-600 transition-colors"
                            >
                              {ap.serviceType}
                            </Text>
                          </div>
                        </div>
                      </div>

                      <Divider className="!my-2 bg-blue-100" />

                      <div className="flex gap-2 pt-2">
                        <button 
                          onClick={() => {
                            setSelectedAppointment(ap);
                            setDetailModalVisible(true);
                          }}
                          className="flex-1 px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg text-sm font-medium transition-all duration-200 border border-blue-300 hover:border-blue-400">
                          Chi Tiết
                        </button>
                      </div>
                    </div>
                  </Card>
                </div>
              </Col>
            ))}
          </Row>
        )}
      </div>

      {/* Detail Modal */}
      <Modal
        title={
          <div style={{ fontSize: 18, fontWeight: 700, color: '#1f2937' }}>
             Chi tiết lịch hẹn
          </div>
        }
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={600}
        destroyOnHidden
      >
        {selectedAppointment && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Status */}
            <div style={{
              background: statusColorMap[selectedAppointment.status] + '15',
              padding: 16,
              borderRadius: 12,
              border: `2px solid ${statusColorMap[selectedAppointment.status]}`
            }}>
              <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4, fontWeight: 600 }}>TRẠNG THÁI</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    backgroundColor: statusColorMap[selectedAppointment.status]
                  }}
                />
                <div style={{ fontSize: 16, fontWeight: 700, color: statusColorMap[selectedAppointment.status] }}>
                  {selectedAppointment.status}
                </div>
              </div>
            </div>

            {/* Vehicle */}
            <div style={{
              background: '#f9fafb',
              padding: 14,
              borderRadius: 10,
              border: '1px solid #e5e7eb'
            }}>
              <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 6, fontWeight: 600 }}> XE</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#1f2937' }}>
                {selectedAppointment.vehicleModel}
              </div>
            </div>

            {/* Service Center */}
            <div style={{
              background: '#f9fafb',
              padding: 14,
              borderRadius: 10,
              border: '1px solid #e5e7eb'
            }}>
              <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 6, fontWeight: 600 }}> TRUNG TÂM DỊch VỤ</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#1f2937' }}>
                {selectedAppointment.centerName}
              </div>
            </div>

            {/* Date & Time */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={{
                background: '#f9fafb',
                padding: 14,
                borderRadius: 10,
                border: '1px solid #e5e7eb'
              }}>
                <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 6, fontWeight: 600 }}> NGÀY</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#1f2937' }}>
                  {dayjs(selectedAppointment.requestedDate).format('DD/MM/YYYY')}
                </div>
              </div>

              <div style={{
                background: '#f9fafb',
                padding: 14,
                borderRadius: 10,
                border: '1px solid #e5e7eb'
              }}>
                <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 6, fontWeight: 600 }}> GIỜ</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#1f2937' }}>
                  {dayjs(selectedAppointment.requestedDate).format('HH:mm')}
                </div>
              </div>
            </div>

            {/* Service Type */}
            <div style={{
              background: '#f0f9ff',
              padding: 14,
              borderRadius: 10,
              border: '1px solid #bfdbfe'
            }}>
              <div style={{ fontSize: 12, color: '#0c4a6e', marginBottom: 6, fontWeight: 600 }}> LOẠI DỊCH VỤ</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#0284c7' }}>
                {selectedAppointment.serviceType}
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              {selectedAppointment.status === 'Pending' && (
                <Button 
                  danger 
                  size="large"
                  onClick={async () => {
                    setDetailModalVisible(false);
                    const result = await showDeleteConfirm('lịch hẹn này');
                    
                    if (result.isConfirmed) {
                      try {
                        await appointmentService.cancelAppointment(selectedAppointment.appointmentID);
                        showSuccess('Hủy lịch hẹn thành công!');
                        await fetchData();
                      } catch (error: any) {
                        showError('Lỗi', error.message || 'Không thể hủy lịch hẹn');
                      }
                    }
                  }}
                  style={{
                    flex: 1,
                    borderRadius: 8,
                    fontWeight: 600,
                    height: 40
                  }}
                >
                  Hủy lịch hẹn
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AppointmentBooking;