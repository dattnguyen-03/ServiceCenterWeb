import React, { useEffect, useMemo, useState } from 'react';
import { Card, Row, Col, Tag, Typography, Empty, Spin, Input, Segmented, Badge, Tooltip } from 'antd';
import { CalendarOutlined, EnvironmentOutlined, CarOutlined, HourglassOutlined, ReloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { appointmentService } from '../../services/appointmentService';
import { AppointmentSummary } from '../../types/api';

const { Title, Text } = Typography;

const statusColorMap: Record<string, string> = {
  Pending: 'gold',
  Confirmed: 'blue',
  Completed: 'green',
  Cancelled: 'red',
};

const AppointmentBooking: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState<'Tất cả' | 'Chờ duyệt' | 'Đã xác nhận' | 'Hoàn tất' | 'Đã hủy'>('Tất cả');
  const [items, setItems] = useState<AppointmentSummary[]>([]);

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
    <div className="p-6 bg-gradient-to-b from-sky-50 via-white to-emerald-50 min-h-screen">
      <style>{`
        @keyframes gradientMove { 0% { background-position: 0% 50%; } 100% { background-position: 100% 50%; } }
      `}</style>
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-6">
          <div>
            <Title level={2} className="!mb-1 bg-gradient-to-r from-sky-600 to-emerald-600 bg-clip-text text-transparent">Dịch vụ của tôi</Title>
            <Text type="secondary">Xem và theo dõi các lịch hẹn dịch vụ đã đặt.</Text>
          </div>
          <div className="flex items-center gap-2">
            <Input.Search allowClear placeholder="Tìm theo xe, trung tâm, dịch vụ..." value={q} onChange={e => setQ(e.target.value)} style={{ maxWidth: 360 }} />
            <Segmented
              value={status}
              onChange={(val) => setStatus(val as any)}
              options={[ 'Tất cả', 'Chờ duyệt', 'Đã xác nhận', 'Hoàn tất', 'Đã hủy' ]}
            />
            <Tooltip title="Làm mới">
              <button
                className={`h-9 w-9 flex items-center justify-center rounded-lg border bg-white hover:bg-gray-50 transition ${refreshing ? 'opacity-60' : ''}`}
                onClick={async () => { setRefreshing(true); await fetchData(); setRefreshing(false); }}
              >
                <ReloadOutlined />
              </button>
            </Tooltip>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-24">
            <Spin size="large" />
          </div>
        ) : filtered.length === 0 ? (
          <Card className="shadow-sm">
            <Empty description="Chưa có lịch hẹn nào" />
          </Card>
        ) : (
          <Row gutter={[16, 16]}>
            {filtered.map((ap, idx) => (
              <Col xs={24} md={12} key={idx}>
                <Card className="transition-all duration-200 hover:shadow-md" style={{ borderRadius: 14 }} bodyStyle={{ padding: 14 }}>
                  <div className="h-1 w-full rounded-t-lg mb-3" style={{
                    background: 'linear-gradient(90deg, #bfdbfe 0%, #a7f3d0 100%)',
                    backgroundSize: '200% 100%',
                    animation: 'gradientMove 4s linear infinite'
                  }} />
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-gray-700">
                        <CarOutlined />
                        <Text strong>{ap.vehicleModel}</Text>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 text-sm">
                        <EnvironmentOutlined />
                        <span>{ap.centerName}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 text-sm">
                        <CalendarOutlined />
                        <span>{dayjs(ap.requestedDate).format('DD/MM/YYYY HH:mm')}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 text-sm">
                        <HourglassOutlined />
                        <span>{ap.serviceType}</span>
                      </div>
                    </div>
                    <div>
                      <Badge
                        count={<Tag color={statusColorMap[ap.status] || 'default'}>{ap.status}</Tag>}
                        style={{ backgroundColor: 'transparent' }}
                      />
                    </div>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </div>
    </div>
  );
};

export default AppointmentBooking;