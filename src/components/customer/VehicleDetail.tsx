import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Card, 
  Row, 
  Col, 
  Button, 
  Spin, 
  Tag, 
  Timeline
} from 'antd';
import { 
  CarOutlined, 
  EditOutlined, 
  DeleteOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { VehicleResponse } from '../../types/api';
import { vehicleService } from '../../services/vehicleService';
import { showError } from '../../utils/sweetAlert';

const VehicleDetail: React.FC = () => {
  const { vehicleId } = useParams<{ vehicleId: string }>();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState<VehicleResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (vehicleId) {
      loadVehicleDetail();
    }
  }, [vehicleId]);

  const loadVehicleDetail = async () => {
    try {
      setLoading(true);
      const vehicleData = await vehicleService.getVehicle(parseInt(vehicleId!));
      setVehicle(vehicleData);
    } catch (error: any) {
      console.error('Error loading vehicle detail:', error);
      showError('Lỗi tải thông tin xe', error.message || 'Không thể tải thông tin xe');
      navigate('/customer/vehicles');
    } finally {
      setLoading(false);
    }
  };

  const getDaysRemaining = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return `${Math.abs(diffDays)} ngày trước`;
    return `Còn ${diffDays} ngày`;
  };

  const getMaintenanceStatus = (nextServiceDate?: string) => {
    if (!nextServiceDate) return { status: 'warning', text: 'Chưa có lịch', color: 'orange' };
    
    const today = new Date();
    const due = new Date(nextServiceDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { status: 'error', text: 'Quá hạn', color: 'red' };
    if (diffDays <= 30) return { status: 'warning', text: 'Sắp đến hạn', color: 'orange' };
    return { status: 'success', text: 'Bình thường', color: 'green' };
  };

  if (loading) {
    return (
      <div className="p-4 md:p-8">
        <div className="flex justify-center items-center h-64">
          <Spin size="large" />
        </div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="p-4 md:p-8">
        <div className="text-center py-20">
          <ExclamationCircleOutlined className="text-6xl text-gray-300 mb-4" />
          <h3 className="text-xl font-medium text-gray-500 mb-2">Không tìm thấy xe</h3>
          <p className="text-gray-400 mb-6">Xe bạn tìm kiếm không tồn tại hoặc đã bị xóa</p>
          <Button type="primary" onClick={() => navigate('/customer/vehicles')}>
            Quay lại danh sách xe
          </Button>
        </div>
      </div>
    );
  }

  const maintenanceStatus = getMaintenanceStatus(vehicle.nextServiceDate);

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #f0f9ff 0%, #f9fafb 100%)' }}>
      {/* Gradient Header */}
      <div className="p-6 bg-gradient-to-r from-blue-600 to-blue-400 text-white rounded-b-3xl shadow-lg mb-8">
        <div className="flex items-center mb-3">
          <CarOutlined style={{ fontSize: 32, marginRight: 12 }} />
          <h1 className="text-4xl font-bold">Chi tiết xe {vehicle.model}</h1>
        </div>
        <p className="text-blue-100 text-lg">Thông tin chi tiết và lịch sử bảo dưỡng</p>
      </div>

      <div className="px-6 pb-6">
        <Row gutter={[24, 24]}>
          {/* Vehicle Information */}
          <Col xs={24} lg={16}>
            <Card 
              style={{
                borderRadius: 20,
                boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
                border: '1px solid #e5e7eb'
              }}
              bodyStyle={{ padding: 24 }}
            >
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1f2937', marginBottom: 20 }}>
                 Thông tin xe
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
                <div>
                  <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4, fontWeight: 600 }}>Model xe</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#1f2937' }}>{vehicle.model}</div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4, fontWeight: 600 }}>Năm sản xuất</div>
                  <Tag style={{ borderRadius: 20, fontWeight: 600, padding: '4px 12px' }} color="blue">
                    {vehicle.year}
                  </Tag>
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4, fontWeight: 600 }}>VIN</div>
                  <code style={{
                    background: '#f3f4f6',
                    padding: '8px 12px',
                    borderRadius: 8,
                    fontSize: 14,
                    fontFamily: 'monospace',
                    color: '#1f2937',
                    display: 'block'
                  }}>
                    {vehicle.vin}
                  </code>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4, fontWeight: 600 }}>Biển số xe</div>
                  <Tag style={{ borderRadius: 20, fontWeight: 600, padding: '4px 12px' }} color="green">
                    {vehicle.licensePlate}
                  </Tag>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4, fontWeight: 600 }}>ID xe</div>
                  <Tag style={{ borderRadius: 20, fontWeight: 600, padding: '4px 12px' }} color="purple">
                    #{vehicle.vehicleID}
                  </Tag>
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4, fontWeight: 600 }}>Ghi chú</div>
                  <div style={{
                    background: '#f9fafb',
                    padding: 12,
                    borderRadius: 10,
                    border: '1px solid #e5e7eb',
                    color: '#4b5563'
                  }}>
                    {vehicle.notes || 'Không có ghi chú'}
                  </div>
                </div>
              </div>
            </Card>

            {/* Maintenance History */}
            <Card 
              style={{
                borderRadius: 20,
                boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
                border: '1px solid #e5e7eb',
                marginTop: 24
              }}
              bodyStyle={{ padding: 24 }}
            >
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1f2937', marginBottom: 20 }}>
                 Lịch sử bảo dưỡng
              </h3>
              <Timeline
                items={[
                  {
                    dot: (
                      <div style={{
                        width: 40,
                        height: 40,
                        background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                        borderRadius: 50,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontWeight: 700,
                        boxShadow: '0 2px 8px rgba(34, 197, 94, 0.3)'
                      }}>
                        ✓
                      </div>
                    ),
                    children: (
                      <div style={{
                        background: 'linear-gradient(135deg, #f0fdf4 0%, #f9fafb 100%)',
                        border: '2px solid #86efac',
                        borderRadius: 12,
                        padding: 16,
                        marginLeft: 16
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 12 }}>
                          <div>
                            <p style={{ fontWeight: 700, fontSize: 16, color: '#1f2937', margin: 0, marginBottom: 4 }}>
                              Bảo dưỡng cuối cùng
                            </p>
                            <p style={{ fontSize: 13, color: '#6b7280', margin: 0 }}>Kiểm tra tổng thể</p>
                          </div>
                          <Tag style={{ borderRadius: 20, fontWeight: 600 }} color="green">
                             Hoàn tất
                          </Tag>
                        </div>
                        <p style={{ fontSize: 13, color: '#374151', margin: 0 }}>
                           {vehicle.lastServiceDate ? new Date(vehicle.lastServiceDate).toLocaleDateString('vi-VN') : 'Chưa có'}
                        </p>
                        {vehicle.lastServiceDate && (
                          <p style={{ fontSize: 12, color: '#6b7280', margin: '8px 0 0 0' }}>
                            {getDaysRemaining(vehicle.lastServiceDate)}
                          </p>
                        )}
                      </div>
                    )
                  },
                  {
                    dot: (
                      <div style={{
                        width: 40,
                        height: 40,
                        background: `linear-gradient(135deg, ${maintenanceStatus.color === 'green' ? '#22c55e 0%, #16a34a' : maintenanceStatus.color === 'orange' ? '#f59e0b 0%, #d97706' : '#ef4444 0%, #dc2626'} 100%)`,
                        borderRadius: 50,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontWeight: 700,
                        boxShadow: `0 2px 8px rgba(${maintenanceStatus.color === 'green' ? '34, 197, 94' : maintenanceStatus.color === 'orange' ? '245, 158, 11' : '239, 68, 68'}, 0.3)`
                      }}>
                        ⏱
                      </div>
                    ),
                    children: (
                      <div style={{
                        background: maintenanceStatus.color === 'green' ? 'linear-gradient(135deg, #f0fdf4 0%, #f9fafb 100%)' : maintenanceStatus.color === 'orange' ? 'linear-gradient(135deg, #fefce8 0%, #f9fafb 100%)' : 'linear-gradient(135deg, #fee2e2 0%, #f9fafb 100%)',
                        border: `2px solid ${maintenanceStatus.color === 'green' ? '#86efac' : maintenanceStatus.color === 'orange' ? '#fcd34d' : '#fca5a5'}`,
                        borderRadius: 12,
                        padding: 16,
                        marginLeft: 16
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 12 }}>
                          <div>
                            <p style={{ fontWeight: 700, fontSize: 16, color: '#1f2937', margin: 0, marginBottom: 4 }}>
                              Bảo dưỡng tiếp theo
                            </p>
                            <p style={{ fontSize: 13, color: '#6b7280', margin: 0 }}>Bảo dưỡng định kỳ</p>
                          </div>
                          <Tag style={{ borderRadius: 20, fontWeight: 600 }} color={maintenanceStatus.color}>
                            {maintenanceStatus.text}
                          </Tag>
                        </div>
                        <p style={{ fontSize: 13, color: '#374151', margin: 0 }}>
                          {vehicle.nextServiceDate ? new Date(vehicle.nextServiceDate).toLocaleDateString('vi-VN') : 'Chưa có'}
                        </p>
                        {vehicle.nextServiceDate && (
                          <p style={{ fontSize: 12, color: '#6b7280', margin: '8px 0 0 0', fontWeight: 600 }}>
                            {getDaysRemaining(vehicle.nextServiceDate)}
                          </p>
                        )}
                      </div>
                    )
                  }
                ]}
              />
            </Card>
          </Col>

          {/* Vehicle Stats & Actions */}
          <Col xs={24} lg={8}>
            {/* Vehicle Stats */}
            <Card 
              style={{
                borderRadius: 20,
                boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
                border: '1px solid #e5e7eb',
                marginBottom: 24
              }}
              bodyStyle={{ padding: 24 }}
            >
              {/* <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1f2937', marginBottom: 20 }}>
                 Thống kê
              </h3>
              
              <div style={{
                background: 'linear-gradient(135deg, #e0f2fe 0%, #f0f9ff 100%)',
                padding: 16,
                borderRadius: 12,
                marginBottom: 16,
                border: '2px solid #7dd3fc'
              }}>
                <div style={{ fontSize: 12, color: '#0c4a6e', marginBottom: 4, fontWeight: 600 }}>⚡ Dung lượng pin</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#0284c7' }}>
                  {vehicle.batteryCapacity || 'N/A'}
                </div>
              </div>

              <div style={{
                background: 'linear-gradient(135deg, #f0fdf4 0%, #f9fafb 100%)',
                padding: 16,
                borderRadius: 12,
                marginBottom: 16,
                border: '2px solid #86efac'
              }}>
                <div style={{ fontSize: 12, color: '#166534', marginBottom: 4, fontWeight: 600 }}> Quãng đường</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#16a34a' }}>
                  {(vehicle.mileage || 0).toLocaleString()} km
                </div>
              </div> */}

              <div style={{
                background: maintenanceStatus.color === 'green' ? 'linear-gradient(135deg, #f0fdf4 0%, #f9fafb 100%)' : maintenanceStatus.color === 'orange' ? 'linear-gradient(135deg, #fefce8 0%, #f9fafb 100%)' : 'linear-gradient(135deg, #fee2e2 0%, #f9fafb 100%)',
                padding: 16,
                borderRadius: 12,
                border: `2px solid ${maintenanceStatus.color === 'green' ? '#86efac' : maintenanceStatus.color === 'orange' ? '#fcd34d' : '#fca5a5'}`
              }}>
                <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4, fontWeight: 600 }}> Trạng thái bảo dưỡng</div>
                <div style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: maintenanceStatus.color === 'green' ? '#16a34a' : maintenanceStatus.color === 'orange' ? '#d97706' : '#dc2626'
                }}>
                  {maintenanceStatus.text}
                </div>
              </div>
            </Card>

            {/* Actions */}
            <Card 
              style={{
                borderRadius: 20,
                boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
                border: '1px solid #e5e7eb'
              }}
              bodyStyle={{ padding: 24 }}
            >
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1f2937', marginBottom: 20 }}>
                 Thao tác
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <Button 
                  type="primary" 
                  size="large" 
                  style={{
                    borderRadius: 10,
                    background: 'linear-gradient(90deg, #60a5fa 0%, #22c55e 100%)',
                    border: 'none',
                    fontWeight: 700,
                    height: 44
                  }}
                >
                   Đặt lịch bảo dưỡng
                </Button>
                
                <Button 
                  size="large"
                  style={{
                    borderRadius: 10,
                    borderColor: '#d1d5db',
                    color: '#4b5563',
                    fontWeight: 600,
                    height: 44,
                    background: '#fff'
                  }}
                >
                   Xem lịch sử chi tiết
                </Button>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <Button
                    size="large"
                    icon={<EditOutlined />}
                    style={{
                      borderRadius: 10,
                      borderColor: '#d1d5db',
                      color: '#4b5563',
                      fontWeight: 600,
                      height: 44,
                      background: '#fff'
                    }}
                  >
                    Sửa
                  </Button>
                  <Button
                    size="large"
                    danger
                    icon={<DeleteOutlined />}
                    style={{
                      borderRadius: 10,
                      fontWeight: 600,
                      height: 44
                    }}
                  >
                    Xóa
                  </Button>
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default VehicleDetail;
