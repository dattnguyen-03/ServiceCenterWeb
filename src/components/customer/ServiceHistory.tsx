import { Card, Row, Col, Button, Tag, Timeline } from 'antd';
import { CalendarOutlined } from '@ant-design/icons';
import { mockVehicles, mockAppointments } from '../../data/mockData';
import { Link } from 'react-router-dom';

const ServiceHistory: React.FC = () => {
  const vehicle = mockVehicles.find(v => v.customerId === '1'); // Assuming one vehicle for simplicity
  const history = mockAppointments.filter(a => a.customerId === '1').sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #f0f9ff 0%, #f9fafb 100%)' }}>
      {/* Gradient Header */}
      <div className="p-6 bg-gradient-to-r from-blue-600 to-blue-400 text-white rounded-b-3xl shadow-lg mb-8">
        <div className="flex items-center mb-3">
          <CalendarOutlined style={{ fontSize: 32, marginRight: 12 }} />
          <h1 className="text-4xl font-bold">Lịch sử bảo dưỡng</h1>
        </div>
        <p className="text-blue-100 text-lg">Theo dõi toàn bộ lịch sử dịch vụ và sửa chữa cho xe của bạn</p>
      </div>

      <div className="px-6 pb-6">
        <Row gutter={[32, 32]}>
          {/* Vehicle Info Card */}
          {vehicle && (
            <Col xs={24} lg={8}>
              <Card
                style={{ 
                  borderRadius: '20px', 
                  boxShadow: '0 8px 30px rgba(0,0,0,0.08)', 
                  border: '1px solid #e5e7eb',
                  position: 'sticky', 
                  top: '2rem'
                }}
                bodyStyle={{ padding: 24 }}
              >
                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                  <div style={{
                    fontSize: 48,
                    marginBottom: 12,
                    background: 'linear-gradient(135deg, #60a5fa 0%, #22c55e 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}>
                    🚗
                  </div>
                  <h3 style={{ fontSize: 20, fontWeight: 700, color: '#1f2937', marginBottom: 4 }}>
                    {vehicle.model}
                  </h3>
                  <p style={{ color: '#6b7280', fontSize: 14 }}>VIN: {vehicle.vin}</p>
                  <Tag style={{ marginTop: 8, borderRadius: 20 }} color="blue">
                    {vehicle.year}
                  </Tag>
                </div>
                
                <div style={{ 
                  background: 'linear-gradient(135deg, #f0fdf4 0%, #f9fafb 100%)',
                  padding: 16,
                  borderRadius: 12,
                  marginBottom: 16,
                  border: '1px solid #86efac'
                }}>
                  <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>📍 Quãng đường</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: '#16a34a' }}>
                    {(vehicle.mileage || 0).toLocaleString()} km
                  </div>
                </div>

                <div style={{ 
                  background: 'linear-gradient(135deg, #e0f2fe 0%, #f9fafb 100%)',
                  padding: 16,
                  borderRadius: 12,
                  marginBottom: 16,
                  border: '1px solid #7dd3fc'
                }}>
                  <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>⚡ Dung lượng pin</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: '#0284c7' }}>
                    {vehicle.batteryCapacity || 'N/A'}
                  </div>
                </div>

                <Link to="/customer/booking">
                  <Button 
                    type="primary" 
                    block 
                    size="large"
                    style={{
                      borderRadius: 12,
                      background: 'linear-gradient(90deg, #60a5fa 0%, #22c55e 100%)',
                      border: 'none',
                      fontWeight: 700,
                      height: 44
                    }}
                  >
                    📅 Đặt lịch hẹn mới
                  </Button>
                </Link>
              </Card>
            </Col>
          )}

          {/* History Timeline */}
          <Col xs={24} lg={16}>
            <Card 
              style={{ 
                borderRadius: '20px', 
                boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
                border: '1px solid #e5e7eb'
              }}
              bodyStyle={{ padding: 24 }}
            >
              {history.length > 0 ? (
                <Timeline
                  items={history.map(item => ({
                    dot: (
                      <div style={{
                        width: 40,
                        height: 40,
                        background: 'linear-gradient(135deg, #60a5fa 0%, #22c55e 100%)',
                        borderRadius: 50,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontSize: 18,
                        boxShadow: '0 2px 8px rgba(96, 165, 250, 0.3)'
                      }}>
                        🔧
                      </div>
                    ),
                    children: (
                      <div style={{
                        background: '#fff',
                        border: '1px solid #e5e7eb',
                        borderRadius: 12,
                        padding: 16,
                        marginLeft: 16,
                        marginBottom: 16
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 12 }}>
                          <div>
                            <p style={{ fontWeight: 700, fontSize: 16, color: '#1f2937', margin: 0, marginBottom: 4 }}>
                              {item.services.join(', ')}
                            </p>
                            <p style={{ fontSize: 12, color: '#6b7280', margin: 0 }}>
                              📅 {new Date(item.date).toLocaleDateString('vi-VN')}
                            </p>
                          </div>
                          <Tag color={item.status === 'completed' ? 'green' : 'blue'} style={{ borderRadius: 8 }}>
                            {item.status === 'completed' ? '✓ Hoàn tất' : '⏳ Chờ xử lý'}
                          </Tag>
                        </div>
                        
                        <div style={{ paddingTop: 12, borderTop: '1px solid #e5e7eb' }}>
                          <p style={{ fontSize: 13, margin: '8px 0', color: '#374151' }}>
                            <span style={{ fontWeight: 600 }}>Trung tâm:</span> {item.serviceCenter}
                          </p>
                          <p style={{ fontSize: 13, margin: '8px 0', color: '#374151' }}>
                            <span style={{ fontWeight: 600 }}>Chi phí:</span> <span style={{ color: '#dc2626', fontWeight: 700 }}>
                              {item.cost?.toLocaleString('vi-VN')} VNĐ
                            </span>
                          </p>
                        </div>
                      </div>
                    )
                  }))}
                />
              ) : (
                <div style={{ textAlign: 'center', padding: 40 }}>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
                  <p style={{ fontSize: 16, fontWeight: 600, color: '#6b7280', marginBottom: 8 }}>
                    Chưa có lịch sử bảo dưỡng
                  </p>
                  <p style={{ fontSize: 14, color: '#9ca3af' }}>
                    Các lịch sử dịch vụ sẽ xuất hiện ở đây
                  </p>
                </div>
              )}
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default ServiceHistory;
