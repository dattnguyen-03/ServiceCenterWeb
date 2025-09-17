import React from 'react';
import { Card, Row, Col, Button, Statistic, Tag, Space } from 'antd';
import { CarOutlined, ThunderboltOutlined, DashboardOutlined, CalendarOutlined, PlusOutlined } from '@ant-design/icons';
import { mockVehicles } from '../../data/mockData';
import { Link } from 'react-router-dom';

const VehicleManagement: React.FC = () => {
  const vehicles = mockVehicles.filter(v => v.customerId === '1');

  const getDaysRemaining = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return `${Math.abs(diffDays)} ngày trước`;
    return `Còn ${diffDays} ngày`;
  };

  return (
    <div className="p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">Xe của tôi</h1>
        <p className="text-gray-600 text-base">Quản lý thông tin và lịch sử bảo dưỡng các xe điện</p>
      </div>

      <Row gutter={[32, 32]}>
        {vehicles.map((vehicle) => (
          <Col key={vehicle.id} xs={24} lg={12}>
            <Card
              style={{ borderRadius: '16px', overflow: 'hidden', boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }}
              bodyStyle={{ padding: 0 }}
            >
              {/* Vehicle Header */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
                <Row align="middle" gutter={16}>
                  <Col>
                    <div className="w-16 h-16 bg-white/20 rounded-lg flex items-center justify-center">
                      <CarOutlined style={{ fontSize: '32px' }} />
                    </div>
                  </Col>
                  <Col>
                    <h3 className="text-xl font-bold">{vehicle.model}</h3>
                    <p className="text-blue-100 opacity-90">VIN: {vehicle.vin}</p>
                    <p className="text-blue-100 opacity-90">Năm sản xuất: {vehicle.year}</p>
                  </Col>
                </Row>
              </div>

              {/* Vehicle Stats & Maintenance */}
              <div className="p-6">
                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <Card bodyStyle={{ padding: 16 }} className="bg-blue-50 border-blue-100">
                      <Statistic
                        title={<span className="text-gray-600">Dung lượng pin</span>}
                        value={vehicle.batteryCapacity}
                        prefix={<ThunderboltOutlined />}
                        valueStyle={{ color: '#1d4ed8', fontWeight: 600 }}
                      />
                    </Card>
                  </Col>
                  <Col span={12}>
                     <Card bodyStyle={{ padding: 16 }} className="bg-green-50 border-green-100">
                      <Statistic
                        title={<span className="text-gray-600">Quãng đường</span>}
                        value={`${vehicle.mileage.toLocaleString()} km`}
                        prefix={<DashboardOutlined />}
                        valueStyle={{ color: '#16a34a', fontWeight: 600 }}
                      />
                    </Card>
                  </Col>
                  <Col span={24}>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg mt-2">
                      <Space align="start">
                        <CalendarOutlined className="text-gray-500 mt-1" />
                        <div>
                          <div className="font-medium text-gray-900">Bảo dưỡng cuối cùng</div>
                          <div className="text-sm text-gray-600">Kiểm tra tổng thể</div>
                        </div>
                      </Space>
                      <div className="text-right">
                        <Tag>{new Date(vehicle.lastService).toLocaleDateString('vi-VN')}</Tag>
                        <div className="text-sm text-gray-500 mt-1">{getDaysRemaining(vehicle.lastService)}</div>
                      </div>
                    </div>
                  </Col>
                   <Col span={24}>
                    <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-200">
                       <Space align="start">
                        <CalendarOutlined className="text-orange-500 mt-1" />
                        <div>
                          <div className="font-medium text-gray-900">Bảo dưỡng tiếp theo</div>
                          <div className="text-sm text-gray-600">Bảo dưỡng định kỳ 20,000km</div>
                        </div>
                      </Space>
                      <div className="text-right">
                        <Tag color="orange">{new Date(vehicle.nextServiceDue).toLocaleDateString('vi-VN')}</Tag>
                        <div className="text-sm text-orange-600 font-semibold mt-1">{getDaysRemaining(vehicle.nextServiceDue)}</div>
                      </div>
                    </div>
                  </Col>
                </Row>

                {/* Actions */}
                <Row gutter={16} className="mt-6">
                  <Col span={16}>
                    <Button type="primary" block size="large" className="!bg-gradient-to-r !from-blue-600 !to-indigo-700">
                      Đặt lịch bảo dưỡng
                    </Button>
                  </Col>
                  <Col span={8}>
                    <Button block size="large">
                      Xem lịch sử
                    </Button>
                  </Col>
                </Row>
              </div>
            </Card>
          </Col>
        ))}

        {/* Add Vehicle Card */}
        <Col xs={24} lg={12} className="flex">
           <Link to="/vehicles/add" className="w-full">
            <div className="h-full flex items-center justify-center bg-white rounded-2xl border-2 border-dashed border-gray-300 p-8 text-center hover:border-blue-500 hover:bg-blue-50 transition-colors duration-300 cursor-pointer">
              <div>
                <PlusOutlined className="text-3xl text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Thêm xe mới</h3>
                <p className="text-gray-600">Đăng ký xe điện mới để quản lý bảo dưỡng</p>
              </div>
            </div>
          </Link>
        </Col>
      </Row>
    </div>
  );
};

export default VehicleManagement;