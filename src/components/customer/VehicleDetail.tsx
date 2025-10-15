import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Card, 
  Row, 
  Col, 
  Button, 
  Spin, 
  Tag, 
  Descriptions, 
  Timeline, 
  Statistic,
  Divider,
  Space
} from 'antd';
import { 
  CarOutlined, 
  ThunderboltOutlined, 
  DashboardOutlined, 
  CalendarOutlined, 
  EditOutlined, 
  DeleteOutlined,
  ArrowLeftOutlined,
  ToolOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { VehicleResponse } from '../../types/api';
import { vehicleService } from '../../services/vehicleService';
import { sweetAlert } from '../../utils/sweetAlert';

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
      sweetAlert.error('Lỗi tải thông tin xe', error.message || 'Không thể tải thông tin xe');
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
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center mb-6">
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate('/customer/vehicles')}
            className="mr-4 !border-gray-300 !text-gray-600 hover:!border-blue-400 hover:!text-blue-600 !rounded-xl !h-10 !font-medium !bg-white hover:!bg-blue-50 transition-all duration-300"
          >
            Quay lại
          </Button>
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mr-4">
              <CarOutlined className="text-white text-xl" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-1">
                Chi tiết xe {vehicle.model}
              </h1>
              <p className="text-gray-600">Thông tin chi tiết và lịch sử bảo dưỡng</p>
            </div>
          </div>
        </div>
      </div>

      <Row gutter={[24, 24]}>
        {/* Vehicle Information */}
        <Col xs={24} lg={16}>
          <Card 
            className="rounded-2xl shadow-lg border border-gray-100"
            title={
              <div className="flex items-center">
                <CarOutlined className="text-blue-500 mr-3" />
                <span className="text-lg font-semibold">Thông tin xe</span>
              </div>
            }
          >
            <Descriptions column={2} size="middle">
              <Descriptions.Item label="Model xe" className="font-medium">
                <span className="text-lg font-bold text-gray-900">{vehicle.model}</span>
              </Descriptions.Item>
              <Descriptions.Item label="Năm sản xuất">
                <Tag color="blue">{vehicle.year}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="VIN" span={2}>
                <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                  {vehicle.vin}
                </code>
              </Descriptions.Item>
              <Descriptions.Item label="Biển số xe">
                <Tag color="green" className="text-base font-medium">
                  {vehicle.licensePlate}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="ID xe">
                <Tag color="purple">#{vehicle.vehicleID}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Ghi chú" span={2}>
                <div className="bg-gray-50 p-3 rounded-lg">
                  {vehicle.notes || 'Không có ghi chú'}
                </div>
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* Maintenance History */}
          <Card 
            className="rounded-2xl shadow-lg border border-gray-100 mt-6"
            title={
              <div className="flex items-center">
                <ToolOutlined className="text-orange-500 mr-3" />
                <span className="text-lg font-semibold">Lịch sử bảo dưỡng</span>
              </div>
            }
          >
            <Timeline>
              <Timeline.Item 
                dot={<CheckCircleOutlined className="text-green-500" />}
                color="green"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium text-gray-900">Bảo dưỡng cuối cùng</div>
                    <div className="text-sm text-gray-600">Kiểm tra tổng thể</div>
                  </div>
                  <div className="text-right">
                    <Tag color="green">
                      {vehicle.lastServiceDate ? new Date(vehicle.lastServiceDate).toLocaleDateString('vi-VN') : 'Chưa có'}
                    </Tag>
                    <div className="text-sm text-gray-500 mt-1">
                      {vehicle.lastServiceDate ? getDaysRemaining(vehicle.lastServiceDate) : 'Chưa có dữ liệu'}
                    </div>
                  </div>
                </div>
              </Timeline.Item>
              
              <Timeline.Item 
                dot={<ClockCircleOutlined className={`text-${maintenanceStatus.color}-500`} />}
                color={maintenanceStatus.color}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium text-gray-900">Bảo dưỡng tiếp theo</div>
                    <div className="text-sm text-gray-600">Bảo dưỡng định kỳ</div>
                  </div>
                  <div className="text-right">
                    <Tag color={maintenanceStatus.color}>
                      {vehicle.nextServiceDate ? new Date(vehicle.nextServiceDate).toLocaleDateString('vi-VN') : 'Chưa có'}
                    </Tag>
                    <div className={`text-sm font-medium mt-1 text-${maintenanceStatus.color}-600`}>
                      {vehicle.nextServiceDate ? getDaysRemaining(vehicle.nextServiceDate) : 'Chưa có dữ liệu'}
                    </div>
                  </div>
                </div>
              </Timeline.Item>
            </Timeline>
          </Card>
        </Col>

        {/* Vehicle Stats & Actions */}
        <Col xs={24} lg={8}>
          {/* Vehicle Stats */}
          <Card 
            className="rounded-2xl shadow-lg border border-gray-100 mb-6"
            title={
              <div className="flex items-center">
                <DashboardOutlined className="text-green-500 mr-3" />
                <span className="text-lg font-semibold">Thống kê</span>
              </div>
            }
          >
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
                <Statistic
                  title={<span className="text-gray-600">Dung lượng pin</span>}
                  value={vehicle.batteryCapacity || 'N/A'}
                  prefix={<ThunderboltOutlined className="text-blue-500" />}
                  valueStyle={{ color: '#1d4ed8', fontWeight: 600 }}
                />
              </div>
              
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
                <Statistic
                  title={<span className="text-gray-600">Quãng đường</span>}
                  value={`${(vehicle.mileage || 0).toLocaleString()} km`}
                  prefix={<DashboardOutlined className="text-green-500" />}
                  valueStyle={{ color: '#16a34a', fontWeight: 600 }}
                />
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-amber-100 p-4 rounded-xl border border-orange-200">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Trạng thái bảo dưỡng</div>
                    <div className="text-lg font-bold text-orange-700">{maintenanceStatus.text}</div>
                  </div>
                  <CalendarOutlined className={`text-2xl text-${maintenanceStatus.color}-500`} />
                </div>
              </div>
            </div>
          </Card>

          {/* Actions */}
          <Card 
            className="rounded-2xl shadow-lg border border-gray-100"
            title={
              <div className="flex items-center">
                <ToolOutlined className="text-blue-500 mr-3" />
                <span className="text-lg font-semibold">Thao tác</span>
              </div>
            }
          >
            <div className="space-y-3">
              <Button 
                type="primary" 
                size="large" 
                block
                className="!bg-gradient-to-r !from-blue-600 !to-indigo-600 hover:!from-blue-700 hover:!to-indigo-700 !border-0 !rounded-xl !h-12 !font-medium !shadow-md hover:!shadow-lg transition-all duration-300"
              >
                Đặt lịch bảo dưỡng
              </Button>
              
              <Button 
                size="large" 
                block
                className="!border-gray-300 !text-gray-700 hover:!border-blue-400 hover:!text-blue-600 !rounded-xl !h-12 !font-medium !bg-white hover:!bg-blue-50 transition-all duration-300"
              >
                Xem lịch sử chi tiết
              </Button>
              
              <Divider className="my-4" />
              
              <div className="grid grid-cols-2 gap-3">
                <Button
                  size="middle"
                  icon={<EditOutlined />}
                  className="!border-gray-300 !text-gray-600 hover:!border-blue-400 hover:!text-blue-600 !rounded-xl !h-10 !font-medium !bg-white hover:!bg-blue-50 transition-all duration-300"
                >
                  Chỉnh sửa
                </Button>
                <Button
                  size="middle"
                  danger
                  icon={<DeleteOutlined />}
                  className="!border-red-300 !text-red-600 hover:!border-red-500 hover:!text-red-700 !rounded-xl !h-10 !font-medium !bg-white hover:!bg-red-50 transition-all duration-300"
                >
                  Xóa
                </Button>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default VehicleDetail;
