import React, { useState, useEffect } from 'react';
import { Row, Col, Button, Modal, Spin, Card, Tag, Input, Tooltip } from 'antd';
import { CarOutlined, PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, ReloadOutlined } from '@ant-design/icons';
import { VehicleResponse } from '../../types/api';
import { vehicleService } from '../../services/vehicleService';
import AddVehicleForm from './AddVehicleForm';
import { showError, showDeleteConfirm, showLoading, closeLoading, showSuccess } from '../../utils/sweetAlert';

const VehicleManagement: React.FC = () => {
  const [vehicles, setVehicles] = useState<VehicleResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<VehicleResponse | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleResponse | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [searchText, setSearchText] = useState('');

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
      showError('Lỗi tải dữ liệu', error.message || 'Không thể tải danh sách xe');
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
    const vehicle = vehicles.find(v => v.vehicleID === vehicleId);
    if (vehicle) {
      setSelectedVehicle(vehicle);
      setDetailModalVisible(true);
    }
  };

  const handleDeleteVehicle = async (vehicleId: number) => {
    const result = await showDeleteConfirm('xe này');

    if (result.isConfirmed) {
      try {
        showLoading('Đang xóa xe...');
        const response = await vehicleService.deleteVehicle(vehicleId);
        closeLoading();
        
        if (response.success) {
          showSuccess('Thành công', 'Xóa xe thành công!');
          loadVehicles();
        } else {
          showError('Không thể xóa xe', response.message || 'Có lỗi xảy ra khi xóa xe');
        }
      } catch (error: any) {
        closeLoading();
        showError('Lỗi xóa xe', error.message || 'Không thể xóa xe');
      }
    }
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
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-50 p-4 md:p-8">
      <style>{`
        @keyframes slideIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .vehicle-card { animation: slideIn 0.5s ease-out forwards; }
        .header-section { animation: fadeIn 0.6s ease-out; }
      `}</style>

      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="header-section mb-8">
          <div className="flex flex-col gap-2 mb-6">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
               Xe Của Tôi
            </h1>
            <p className="text-gray-600 text-base">
              Quản lý thông tin và lịch sử bảo dưỡng các xe điện của bạn
            </p>
          </div>

          {/* Filter & Action Bar */}
          <div className="bg-white/80 backdrop-blur-sm border border-blue-200 rounded-xl p-4 shadow-md flex flex-col md:flex-row gap-3 items-start md:items-center md:justify-between">
            <div className="flex-1 w-full md:w-auto">
              <Input.Search
                allowClear
                placeholder=" Tìm theo model, biển số..."
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                className="w-full"
                style={{
                  backgroundColor: '#f8fafc',
                  borderColor: '#bfdbfe',
                  color: '#1e293b'
                }}
              />
            </div>

            <div className="flex items-center gap-2">
              {/* <Tooltip title="Làm mới">
                <button
                  className={`h-10 px-3 flex items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:shadow-lg transition-all duration-200 ${
                    refreshing ? 'opacity-60 scale-95' : 'hover:scale-105'
                  }`}
                  onClick={async () => {
                    setRefreshing(true);
                    await loadVehicles();
                    setRefreshing(false);
                  }}
                >
                  <ReloadOutlined className={refreshing ? 'animate-spin' : ''} />
                </button>
              </Tooltip> */}

              <Button
                type="primary"
                size="large"
                icon={<PlusOutlined />}
                onClick={handleAddVehicle}
                className="!bg-gradient-to-r !from-blue-600 !to-cyan-600 hover:!from-blue-700 hover:!to-cyan-700 !border-0 !rounded-lg !h-10 !px-6 !font-semibold !shadow-md hover:!shadow-lg transition-all duration-300"
              >
                Thêm xe
              </Button>
            </div>
          </div>
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="flex justify-center items-center py-24">
            <Spin size="large" tip="Đang tải..." />
          </div>
        ) : (
          <Row gutter={[24, 24]}>
            {vehicles.length === 0 ? (
              <Col span={24}>
                <div className="text-center py-20">
                  <div className="text-6xl mb-4"></div>
                  <h3 className="text-2xl font-semibold text-gray-700 mb-3">Chưa có xe nào</h3>
                  <p className="text-gray-500 mb-8 max-w-md mx-auto leading-relaxed">
                    Hãy thêm xe đầu tiên để bắt đầu quản lý bảo dưỡng và theo dõi lịch sử dịch vụ
                  </p>
                  <Button 
                    type="primary" 
                    size="large"
                    icon={<PlusOutlined />}
                    onClick={handleAddVehicle}
                    className="!bg-gradient-to-r !from-blue-600 !to-cyan-600 hover:!from-blue-700 hover:!to-cyan-700 !border-0 !h-12 !px-8 !text-base !font-medium !rounded-lg !shadow-lg hover:!shadow-xl transition-all duration-300"
                  >
                    Thêm xe đầu tiên
                  </Button>
                </div>
              </Col>
            ) : (
          vehicles
            .filter(v => 
              !searchText || 
              v.model.toLowerCase().includes(searchText.toLowerCase()) || 
              v.licensePlate.toLowerCase().includes(searchText.toLowerCase())
            )
            .map((vehicle, idx) => (
            <Col key={vehicle.vehicleID} xs={24} sm={12} lg={8}>
              <div
                className="vehicle-card"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <Card
                  className="h-full bg-gradient-to-br from-white to-blue-50 border-blue-200 hover:border-cyan-400 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-300/30 overflow-hidden group"
                  style={{ borderRadius: 16 }}
                  bodyStyle={{ padding: 0 }}
                >
                  {/* Header with gradient */}
                  <div
                    className="p-6 bg-gradient-to-br from-blue-600 to-cyan-600 text-white relative overflow-hidden"
                  >
                    <div className="absolute inset-0 opacity-10">
                      <CarOutlined className="text-8xl absolute -right-4 -top-4" />
                    </div>
                    <div className="relative z-10">
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                          <CarOutlined className="text-xl text-white" />
                        </div>
                        <Tag className="text-xs" style={{ backgroundColor: 'rgba(255,255,255,0.2)', borderColor: '#fff', color: '#fff' }}>
                          Năm {vehicle.year}
                        </Tag>
                      </div>
                      <h3 className="text-2xl font-bold mb-2">{vehicle.model}</h3>
                      <p className="text-sm text-blue-100"> {vehicle.licensePlate}</p>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4 space-y-3">
                    {/* <div className="grid grid-cols-2 gap-2">
                      <div style={{
                        background: 'linear-gradient(135deg, #e0f2fe 0%, #f0f9ff 100%)',
                        padding: 10,
                        borderRadius: 8,
                        border: '1px solid #bae6fd'
                      }}>
                        <div style={{ fontSize: 11, color: '#0c4a6e', fontWeight: 600, marginBottom: 4 }}> Pin</div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#0284c7' }}>
                          {vehicle.batteryCapacity || 'N/A'}
                        </div>
                      </div>

                      <div style={{
                        background: 'linear-gradient(135deg, #f0fdf4 0%, #f9fafb 100%)',
                        padding: 10,
                        borderRadius: 8,
                        border: '1px solid #dcfce7'
                      }}>
                        <div style={{ fontSize: 11, color: '#166534', fontWeight: 600, marginBottom: 4 }}> Km</div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#16a34a' }}>
                          {(vehicle.odometer || 0).toLocaleString()}
                        </div>
                      </div>
                    </div> */}

                    {/* VIN */}
                    <div style={{
                      background: '#f3f4f6',
                      padding: 8,
                      borderRadius: 6,
                      fontSize: 11,
                      fontFamily: 'monospace',
                      color: '#374151',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      VIN: {vehicle.vin}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        size="small"
                        icon={<EyeOutlined />}
                        onClick={() => {
                          setSelectedVehicle(vehicle);
                          setDetailModalVisible(true);
                        }}
                        className="flex-1 !h-9 !rounded-lg !border-blue-300 !text-blue-600 hover:!border-blue-500 hover:!text-blue-700 !bg-blue-50 hover:!bg-blue-100 !font-medium"
                      >
                        Chi tiết
                      </Button>
                      <Button
                        size="small"
                        icon={<EditOutlined />}
                        onClick={() => handleEditVehicle(vehicle)}
                        className="flex-1 !h-9 !rounded-lg !border-gray-300 !text-gray-600 hover:!border-blue-400 hover:!text-blue-600 !bg-white hover:!bg-blue-50 !font-medium"
                      >
                        Sửa
                      </Button>
                    </div>

                    <Button
                      size="small"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => handleDeleteVehicle(vehicle.vehicleID)}
                      className="w-full !h-9 !rounded-lg !font-medium"
                    >
                      Xóa
                    </Button>
                  </div>
                </Card>
              </div>
            </Col>
            ))
            )}
          </Row>
        )}

      </div>

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

      {/* Vehicle Detail Modal */}
      <Modal
        title={
          <div style={{ fontSize: 18, fontWeight: 700, color: '#1f2937' }}>
             Chi tiết xe - {selectedVehicle?.model}
          </div>
        }
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={900}
        destroyOnHidden
        style={{ maxHeight: '90vh' }}
        bodyStyle={{ maxHeight: '70vh', overflowY: 'auto' }}
      >
        {selectedVehicle && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Vehicle Info */}
            <Card 
              style={{
                borderRadius: 12,
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                border: '1px solid #e5e7eb'
              }}
              bodyStyle={{ padding: 16 }}
            >
              <div style={{ fontSize: 14, fontWeight: 700, color: '#1f2937', marginBottom: 16 }}>
                 Thông tin xe
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4, fontWeight: 600 }}>Model xe</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#1f2937' }}>{selectedVehicle.model}</div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4, fontWeight: 600 }}>Năm sản xuất</div>
                  <Tag style={{ borderRadius: 6, fontWeight: 600, padding: '2px 8px' }} color="blue">
                    {selectedVehicle.year}
                  </Tag>
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4, fontWeight: 600 }}>VIN</div>
                  <code style={{
                    background: '#f3f4f6',
                    padding: '6px 10px',
                    borderRadius: 6,
                    fontSize: 13,
                    fontFamily: 'monospace',
                    color: '#1f2937',
                    display: 'block',
                    wordBreak: 'break-all'
                  }}>
                    {selectedVehicle.vin}
                  </code>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4, fontWeight: 600 }}>Biển số xe</div>
                  <Tag style={{ borderRadius: 6, fontWeight: 600, padding: '2px 8px' }} color="green">
                    {selectedVehicle.licensePlate}
                  </Tag>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4, fontWeight: 600 }}>ID xe</div>
                  <Tag style={{ borderRadius: 6, fontWeight: 600, padding: '2px 8px' }} color="purple">
                    #{selectedVehicle.vehicleID}
                  </Tag>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4, fontWeight: 600 }}>Odometer</div>
                  <Tag style={{ borderRadius: 6, fontWeight: 600, padding: '2px 8px' }} color="cyan">
                    {(selectedVehicle.odometer || 0).toLocaleString()} km
                  </Tag>
                </div>
                {selectedVehicle.notes && (
                  <div style={{ gridColumn: '1 / -1' }}>
                    <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4, fontWeight: 600 }}>Ghi chú</div>
                    <div style={{
                      background: '#f9fafb',
                      padding: 10,
                      borderRadius: 6,
                      border: '1px solid #e5e7eb',
                      color: '#4b5563',
                      fontSize: 13
                    }}>
                      {selectedVehicle.notes}
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Stats */}
            {/* <Card 
              style={{
                borderRadius: 12,
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                border: '1px solid #e5e7eb'
              }}
              bodyStyle={{ padding: 16 }}
            >
              <div style={{ fontSize: 14, fontWeight: 700, color: '#1f2937', marginBottom: 16 }}>
                Thống kê
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={{
                  background: 'linear-gradient(135deg, #e0f2fe 0%, #f0f9ff 100%)',
                  padding: 12,
                  borderRadius: 8,
                  border: '1px solid #bae6fd'
                }}>
                  <div style={{ fontSize: 11, color: '#0c4a6e', marginBottom: 4, fontWeight: 600 }}> Dung lượng pin</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#0284c7 ' }}>
                    {selectedVehicle.batteryCapacity || 'N/A'}
                  </div>
                </div>

                <div style={{
                  background: 'linear-gradient(135deg, #f0fdf4 0%, #f9fafb 100%)',
                  padding: 12,
                  borderRadius: 8,
                  border: '1px solid #dcfce7'
                }}>
                  <div style={{ fontSize: 11, color: '#166534', marginBottom: 4, fontWeight: 600 }}> Quãng đường</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#16a34a' }}>
                    {(selectedVehicle.odometer || 0).toLocaleString()} km
                  </div>
                </div>
              </div>
            </Card> */}

          </div>
        )}
      </Modal>
    </div>
  );
};

export default VehicleManagement;