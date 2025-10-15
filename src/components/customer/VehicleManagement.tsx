import React, { useState, useEffect } from 'react';
import { Row, Col, Button, Modal, Spin } from 'antd';
import { CarOutlined, ThunderboltOutlined, DashboardOutlined, CalendarOutlined, PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { VehicleResponse } from '../../types/api';
import { vehicleService } from '../../services/vehicleService';
import AddVehicleForm from './AddVehicleForm';
import { useNavigate } from 'react-router-dom';
import { sweetAlert } from '../../utils/sweetAlert';

const VehicleManagement: React.FC = () => {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState<VehicleResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<VehicleResponse | null>(null);

  // Load vehicles from API
  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    try {
      setLoading(true);
      const vehicles = await vehicleService.getVehiclesByCustomer();
      setVehicles(vehicles);
    } catch (error: any) {
      console.error('Error loading vehicles:', error);
      sweetAlert.error('Lỗi tải dữ liệu', error.message || 'Không thể tải danh sách xe');
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddVehicle = () => {
    setShowAddForm(true);
  };

  const handleAddSuccess = () => {
    setShowAddForm(false);
    loadVehicles();
  };

  const handleEditVehicle = (vehicle: VehicleResponse) => {
    setEditingVehicle(vehicle);
  };

  const handleViewDetail = (vehicleId: number) => {
    navigate(`/customer/vehicles/${vehicleId}`);
  };

  const handleDeleteVehicle = async (vehicleId: number) => {
    const result = await sweetAlert.confirmDelete(
      'Xác nhận xóa xe',
      'Bạn có chắc chắn muốn xóa xe này? Hành động này không thể hoàn tác.',
      'Xóa',
      'Hủy'
    );

    if (result.isConfirmed) {
      try {
        sweetAlert.loading('Đang xóa xe...', 'Vui lòng đợi trong giây lát');
        const response = await vehicleService.deleteVehicle(vehicleId);
        sweetAlert.close();
        
        if (response.success) {
          sweetAlert.toast.success('Xóa xe thành công!');
          loadVehicles();
        } else {
          sweetAlert.error('Không thể xóa xe', response.message || 'Có lỗi xảy ra khi xóa xe');
        }
      } catch (error: any) {
        sweetAlert.close();
        sweetAlert.error('Lỗi xóa xe', error.message || 'Không thể xóa xe');
      }
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

  if (loading) {
    return (
      <div className="p-4 md:p-8">
        <div className="flex justify-center items-center h-64">
          <Spin size="large" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <div className="mb-10">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-6">
          <div>
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mr-4">
                <CarOutlined className="text-white text-lg" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Xe của tôi
              </h1>
            </div>
            <p className="text-gray-600 text-base leading-relaxed max-w-2xl">
              Quản lý thông tin và lịch sử bảo dưỡng các xe điện của bạn một cách dễ dàng và hiệu quả
            </p>
          </div>
          <Button
            type="primary"
            size="large"
            icon={<PlusOutlined />}
            onClick={handleAddVehicle}
            className="!bg-gradient-to-r !from-blue-600 !to-indigo-600 hover:!from-blue-700 hover:!to-indigo-700 !border-0 !h-12 !px-6 !text-base !font-medium !rounded-xl !shadow-lg hover:!shadow-xl transition-all duration-300 !min-w-[160px]"
          >
            Thêm xe mới
          </Button>
        </div>
      </div>

      <Row gutter={[24, 24]}>
        {vehicles.length === 0 ? (
          <Col span={24}>
            <div className="text-center py-20">
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
                <CarOutlined className="text-4xl text-blue-400" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-700 mb-3">Chưa có xe nào</h3>
              <p className="text-gray-500 mb-8 max-w-md mx-auto leading-relaxed">
                Hãy thêm xe đầu tiên để bắt đầu quản lý bảo dưỡng và theo dõi lịch sử dịch vụ
              </p>
              <Button 
                type="primary" 
                size="large"
                icon={<PlusOutlined />}
                onClick={handleAddVehicle}
                className="!bg-gradient-to-r !from-blue-600 !to-indigo-600 hover:!from-blue-700 hover:!to-indigo-700 !border-0 !h-12 !px-8 !text-base !font-medium !rounded-xl !shadow-lg hover:!shadow-xl transition-all duration-300"
              >
                Thêm xe đầu tiên
              </Button>
            </div>
          </Col>
        ) : (
          vehicles.map((vehicle) => (
          <Col key={vehicle.vehicleID} xs={24} lg={12} xl={8}>
            <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 group">
              {/* Vehicle Header */}
              <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-6 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
                
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center group-hover:bg-white/30 transition-colors duration-300">
                      <CarOutlined className="text-2xl" />
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-blue-100 font-medium uppercase tracking-wide">Năm {vehicle.year}</div>
                      <div className="text-xs text-blue-200 mt-1">ID: {vehicle.vehicleID}</div>
                    </div>
                  </div>
                  
                  <h3 className="text-2xl font-bold mb-2">{vehicle.model}</h3>
                  <div className="text-sm text-blue-100 flex items-center">
                    <span className="w-2 h-2 bg-blue-200 rounded-full mr-2"></span>
                    Biển số: {vehicle.licensePlate}
                  </div>
                </div>
              </div>

              {/* Vehicle Summary */}
              <div className="p-6">
                {/* <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
                    <div className="flex items-center mb-2">
                      <ThunderboltOutlined className="text-blue-500 text-lg mr-2" />
                      <span className="text-sm font-medium text-gray-600">Dung lượng pin</span>
                    </div>
                    <div className="text-xl font-bold text-blue-700">
                      {vehicle.batteryCapacity || 'N/A'}
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
                    <div className="flex items-center mb-2">
                      <DashboardOutlined className="text-green-500 text-lg mr-2" />
                      <span className="text-sm font-medium text-gray-600">Quãng đường</span>
                    </div>
                    <div className="text-xl font-bold text-green-700">
                      {(vehicle.mileage || 0).toLocaleString()} km
                    </div>
                  </div>
                </div> */}

                {/* Quick Status */}
                {/* <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-4 rounded-xl border border-orange-200 mb-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <CalendarOutlined className="text-orange-500 mr-3" />
                      <div>
                        <div className="font-medium text-gray-900 text-sm">Bảo dưỡng tiếp theo</div>
                        <div className="text-xs text-gray-600">Bảo dưỡng định kỳ</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="bg-orange-500 text-white px-3 py-1 rounded-lg text-xs font-medium">
                        {vehicle.nextServiceDate ? new Date(vehicle.nextServiceDate).toLocaleDateString('vi-VN') : 'Chưa có'}
                      </div>
                      <div className="text-xs text-orange-600 font-medium mt-1">
                        {vehicle.nextServiceDate ? getDaysRemaining(vehicle.nextServiceDate) : 'Chưa có dữ liệu'}
                      </div>
                    </div>
                  </div>
                </div> */}

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    type="primary" 
                    size="large" 
                    className="!bg-gradient-to-r !from-blue-600 !to-indigo-600 hover:!from-blue-700 hover:!to-indigo-700 !border-0 !rounded-xl !h-11 !font-medium !shadow-md hover:!shadow-lg transition-all duration-300"
                  >
                    Đặt lịch
                  </Button>
                  <Button 
                    size="large" 
                    icon={<EyeOutlined />}
                    onClick={() => handleViewDetail(vehicle.vehicleID)}
                    className="!border-gray-300 !text-gray-700 hover:!border-blue-400 hover:!text-blue-600 !rounded-xl !h-11 !font-medium !bg-white hover:!bg-blue-50 transition-all duration-300"
                  >
                    Chi tiết
                  </Button>
                </div>
                
                <div className="flex gap-2 mt-3">
                  <Button
                    size="middle"
                    icon={<EditOutlined />}
                    onClick={() => handleEditVehicle(vehicle)}
                    className="flex-1 !border-gray-300 !text-gray-600 hover:!border-blue-400 hover:!text-blue-600 !rounded-xl !h-10 !font-medium !bg-white hover:!bg-blue-50 transition-all duration-300"
                  >
                    Chỉnh sửa
                  </Button>
                  <Button
                    size="middle"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleDeleteVehicle(vehicle.vehicleID)}
                    className="flex-1 !border-red-300 !text-red-600 hover:!border-red-500 hover:!text-red-700 !rounded-xl !h-10 !font-medium !bg-white hover:!bg-red-50 transition-all duration-300"
                  >
                    Xóa
                  </Button>
                </div>
              </div>
            </div>
        </Col>
          ))
        )}

      </Row>

      {/* Add Vehicle Modal */}
      <Modal
        title="Thêm xe mới"
        open={showAddForm}
        onCancel={() => setShowAddForm(false)}
        footer={null}
        width={800}
        destroyOnHidden
      >
        <AddVehicleForm 
          onSuccess={handleAddSuccess}
          onCancel={() => setShowAddForm(false)}
        />
      </Modal>

      {/* Edit Vehicle Modal */}
      <Modal
        title="Chỉnh sửa xe"
        open={!!editingVehicle}
        onCancel={() => setEditingVehicle(null)}
        footer={null}
        width={800}
        destroyOnHidden
      >
        {editingVehicle && (
          <AddVehicleForm 
            initialData={editingVehicle}
            onSuccess={() => {
              setEditingVehicle(null);
              loadVehicles();
            }}
            onCancel={() => setEditingVehicle(null)}
          />
        )}
      </Modal>
    </div>
  );
};

export default VehicleManagement;