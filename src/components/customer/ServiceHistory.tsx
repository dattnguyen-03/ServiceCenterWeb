import { Card, Row, Col, Button, Statistic, Tag, Timeline, Empty } from 'antd';
import { CarOutlined, ThunderboltOutlined, DashboardOutlined, ToolOutlined } from '@ant-design/icons';
import { mockVehicles, mockAppointments } from '../../data/mockData';
import { Link } from 'react-router-dom';

const ServiceHistory: React.FC = () => {
  const vehicle = mockVehicles.find(v => v.customerId === '1'); // Assuming one vehicle for simplicity
  const history = mockAppointments.filter(a => a.customerId === '1').sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">Lịch sử bảo dưỡng</h1>
        <p className="text-gray-600 text-base">Theo dõi toàn bộ lịch sử dịch vụ và sửa chữa cho xe của bạn.</p>
      </div>

      <Row gutter={[32, 32]}>
        {/* Vehicle Info Card */}
        {vehicle && (
          <Col xs={24} lg={8}>
            <Card
              title="Thông tin xe"
              style={{ borderRadius: '16px', boxShadow: '0 8px 30px rgba(0,0,0,0.08)', position: 'sticky', top: '2rem' }}
            >
              <div className="text-center mb-6">
                <CarOutlined style={{ fontSize: '48px', color: '#1d4ed8' }} />
                <h3 className="text-xl font-bold mt-2">{vehicle.model}</h3>
                <p className="text-gray-500">VIN: {vehicle.vin}</p>
                <Tag>{vehicle.year}</Tag>
              </div>
              <Row gutter={16}>
                <Col span={12}>
                  <Statistic
                    title="Quãng đường"
                    value={`${vehicle.mileage.toLocaleString()} km`}
                    prefix={<DashboardOutlined />}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="Pin"
                    value={vehicle.batteryCapacity}
                    prefix={<ThunderboltOutlined />}
                  />
                </Col>
              </Row>
               <Button type="primary" block size="large" className="mt-6 !bg-blue-600">
                <Link to="/booking">Đặt lịch hẹn mới</Link>
              </Button>
            </Card>
          </Col>
        )}

        {/* History Timeline */}
        <Col xs={24} lg={16}>
          <Card style={{ borderRadius: '16px', boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }}>
            {history.length > 0 ? (
              <Timeline mode="left">
                {history.map(item => (
                  <Timeline.Item 
                    key={item.id} 
                    label={<span className="font-semibold">{new Date(item.date).toLocaleDateString('vi-VN')}</span>}
                    dot={<ToolOutlined style={{ fontSize: '16px' }} />}
                  >
                    <p className="font-bold text-base">{item.services.join(', ')}</p>
                    <p><span className="font-medium">Trung tâm:</span> {item.serviceCenter}</p>
                    <p><span className="font-medium">Chi phí:</span> {item.cost?.toLocaleString('vi-VN')} VNĐ</p>
                    <Tag color={item.status === 'completed' ? 'green' : 'blue'}>{item.status}</Tag>
                  </Timeline.Item>
                ))}
              </Timeline>
            ) : (
              <Empty description="Chưa có lịch sử bảo dưỡng nào." />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ServiceHistory;
