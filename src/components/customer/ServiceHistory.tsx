import { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Tag, Timeline, Spin, Select, Empty, message } from 'antd';
import { CalendarOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { vehicleService, VehicleResponse } from '../../services/vehicleService';
import { customerService } from '../../services/customerService';
import { ServiceHistoryItem, ServiceChecklistItem, PartUsageItem } from '../../types/api';

const ServiceHistory: React.FC = () => {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState<VehicleResponse[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(null);
  const [history, setHistory] = useState<ServiceHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Load vehicles
  useEffect(() => {
    const loadVehicles = async () => {
      try {
        setLoading(true);
        const data = await vehicleService.getVehiclesByCustomer();
        setVehicles(data);
        // Auto-select vehicle đầu tiên nếu có
        if (data.length > 0 && !selectedVehicleId) {
          setSelectedVehicleId(data[0].vehicleID);
        }
      } catch (error: any) {
        console.error('Error loading vehicles:', error);
        message.error('Không thể tải danh sách xe');
      } finally {
        setLoading(false);
      }
    };

    loadVehicles();
  }, []);

  // Load service history khi có vehicle
  useEffect(() => {
    const loadServiceHistory = async () => {
      if (!selectedVehicleId || !user?.id) return;

      try {
        setLoadingHistory(true);
        const userId = typeof user.id === 'string' ? parseInt(user.id) : user.id;
        const data = await customerService.getServiceHistory(userId, selectedVehicleId);
        // Sắp xếp theo ngày mới nhất
        const sortedData = data.sort((a, b) => 
          new Date(b.requestedDate).getTime() - new Date(a.requestedDate).getTime()
        );
        setHistory(sortedData);
      } catch (error: any) {
        // Chỉ hiển thị error message nếu không phải là "không có lịch sử"
        const errorMessage = error.message || '';
        if (!errorMessage.includes('Không có lịch sử') && !errorMessage.includes('404')) {
          console.error('Error loading service history:', error);
          message.error(errorMessage || 'Không thể tải lịch sử bảo dưỡng');
        }
        // Luôn set empty array để hiển thị empty state
        setHistory([]);
      } finally {
        setLoadingHistory(false);
      }
    };

    loadServiceHistory();
  }, [selectedVehicleId, user?.id]);

  const selectedVehicle = vehicles.find(v => v.vehicleID === selectedVehicleId);

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
          {loading ? (
            <Col xs={24} lg={8}>
              <Card style={{ borderRadius: '20px', boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }}>
                <div className="flex justify-center py-8">
                  <Spin />
                </div>
              </Card>
            </Col>
          ) : vehicles.length > 0 ? (
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
                {/* Chọn xe */}
                {vehicles.length > 1 && (
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#374151' }}>
                      Chọn xe:
                    </label>
                    <Select
                      value={selectedVehicleId}
                      onChange={setSelectedVehicleId}
                      style={{ width: '100%' }}
                      placeholder="Chọn xe"
                    >
                      {vehicles.map(v => (
                        <Select.Option key={v.vehicleID} value={v.vehicleID}>
                          {v.model} - {v.licensePlate}
                        </Select.Option>
                      ))}
                    </Select>
                  </div>
                )}

                {selectedVehicle && (
                  <>
                    <div style={{ textAlign: 'center', marginBottom: 24 }}>
                      <div style={{
                        fontSize: 48,
                        marginBottom: 12,
                        background: 'linear-gradient(135deg, #60a5fa 0%, #22c55e 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                      }}>
                        
                      </div>
                      <h3 style={{ fontSize: 20, fontWeight: 700, color: '#1f2937', marginBottom: 4 }}>
                        {selectedVehicle.model}
                      </h3>
                      <p style={{ color: '#6b7280', fontSize: 14 }}>VIN: {selectedVehicle.vin}</p>
                      <Tag style={{ marginTop: 8, borderRadius: 20 }} color="blue">
                        {selectedVehicle.year}
                      </Tag>
                    </div>
                    
                    <div style={{ 
                      background: 'linear-gradient(135deg, #f0fdf4 0%, #f9fafb 100%)',
                      padding: 16,
                      borderRadius: 12,
                      marginBottom: 16,
                      border: '1px solid #86efac'
                    }}>
                      <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}> Biển số xe</div>
                      <div style={{ fontSize: 20, fontWeight: 700, color: '#16a34a' }}>
                        {selectedVehicle.licensePlate}
                      </div>
                    </div>

                    {selectedVehicle.lastServiceDate && (
                      <div style={{ 
                        background: 'linear-gradient(135deg, #e0f2fe 0%, #f9fafb 100%)',
                        padding: 16,
                        borderRadius: 12,
                        marginBottom: 16,
                        border: '1px solid #7dd3fc'
                      }}>
                        <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>Lần bảo dưỡng cuối</div>
                        <div style={{ fontSize: 16, fontWeight: 700, color: '#0284c7' }}>
                          {new Date(selectedVehicle.lastServiceDate).toLocaleDateString('vi-VN')}
                        </div>
                      </div>
                    )}

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
                         Đặt lịch hẹn mới
                      </Button>
                    </Link>
                  </>
                )}
              </Card>
            </Col>
          ) : (
            <Col xs={24} lg={8}>
              <Card style={{ borderRadius: '20px', boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }}>
                <Empty description="Chưa có xe nào" />
                <Link to="/customer/vehicles">
                  <Button type="primary" block style={{ marginTop: 16 }}>
                    Thêm xe mới
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
              {loadingHistory ? (
                <div className="flex justify-center py-8">
                  <Spin size="large" />
                </div>
              ) : !selectedVehicleId ? (
                <div style={{ textAlign: 'center', padding: 40 }}>
                  <div style={{ fontSize: 48, marginBottom: 16 }}></div>
                  <p style={{ fontSize: 16, fontWeight: 600, color: '#6b7280', marginBottom: 8 }}>
                    Vui lòng chọn xe để xem lịch sử
                  </p>
                </div>
              ) : history.length > 0 ? (
                <Timeline
                  items={history.map((item) => ({
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
                              {item.serviceType}
                            </p>
                            <p style={{ fontSize: 12, color: '#6b7280', margin: 0 }}>
                               {new Date(item.requestedDate).toLocaleDateString('vi-VN')}
                            </p>
                            <p style={{ fontSize: 12, color: '#6b7280', margin: '4px 0 0 0' }}>
                               Đơn hàng: #{item.orderID}
                            </p>
                          </div>
                          <Tag 
                            color={
                              item.appointmentStatus?.toLowerCase() === 'completed' ? 'green' :
                              item.appointmentStatus?.toLowerCase() === 'confirmed' ? 'blue' :
                              'orange'
                            } 
                            style={{ borderRadius: 8 }}
                          >
                            {item.appointmentStatus === 'Completed' ? '✓ Hoàn tất' : 
                             item.appointmentStatus === 'Confirmed' ? '✓ Đã xác nhận' : 
                             ' Chờ xử lý'}
                          </Tag>
                        </div>
                        
                        <div style={{ paddingTop: 12, borderTop: '1px solid #e5e7eb' }}>
                          <p style={{ fontSize: 13, margin: '8px 0', color: '#374151' }}>
                            <span style={{ fontWeight: 600 }}>Trung tâm:</span> {item.centerName}
                            {item.centerAddress && <span style={{ color: '#6b7280' }}> - {item.centerAddress}</span>}
                          </p>
                          {item.technicianName && (
                            <p style={{ fontSize: 13, margin: '8px 0', color: '#374151' }}>
                              <span style={{ fontWeight: 600 }}>Kỹ thuật viên:</span> {item.technicianName}
                            </p>
                          )}
                          
                          {/* Checklist Items */}
                          {item.checklistItems && item.checklistItems.length > 0 && (
                            <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #f3f4f6' }}>
                              <p style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 8 }}>
                                 Checklist đã kiểm tra:
                              </p>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                {item.checklistItems.map((checklist: ServiceChecklistItem, idx: number) => (
                                  <Tag 
                                    key={idx}
                                    color={checklist.status === 'Completed' ? 'green' : 'orange'}
                                    style={{ fontSize: 11 }}
                                  >
                                    {checklist.itemName} - {checklist.status}
                                  </Tag>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {/* Parts Used */}
                          {item.partUsages && item.partUsages.length > 0 && (
                            <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #f3f4f6' }}>
                              <p style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 8 }}>
                                 Phụ tùng đã thay:
                              </p>
                              <div style={{ fontSize: 12, color: '#6b7280' }}>
                                {item.partUsages.map((part: PartUsageItem, idx: number) => (
                                  <div key={idx} style={{ marginBottom: 4 }}>
                                    • {part.partName} x{part.quantityUsed} - ₫{part.total.toLocaleString('vi-VN')}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {/* Total Amount */}
                          {item.totalAmount && (
                            <p style={{ fontSize: 14, margin: '12px 0 0 0', color: '#374151' }}>
                              <span style={{ fontWeight: 600 }}>Chi phí:</span> 
                              <span style={{ color: '#dc2626', fontWeight: 700, marginLeft: 8 }}>
                                ₫{item.totalAmount.toLocaleString('vi-VN')}
                              </span>
                              {item.paymentStatus && (
                                <Tag 
                                  color={item.paymentStatus === 'completed' ? 'green' : 'orange'}
                                  style={{ marginLeft: 8 }}
                                >
                                  {item.paymentStatus === 'completed' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                                </Tag>
                              )}
                            </p>
                          )}
                        </div>
                      </div>
                    )
                  }))}
                />
              ) : (
                <div style={{ textAlign: 'center', padding: 40 }}>
                  <div style={{ fontSize: 48, marginBottom: 16 }}></div>
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
