import React, { useState, useEffect } from 'react';
import { Car, Search, Filter, Plus, Eye, Edit, Trash2, Phone, Mail, MapPin, Calendar, FileText, User } from 'lucide-react';
import vehicleManagementService, { type VehicleListItem } from '../../services/vehicleManagementService';

type Vehicle = VehicleListItem;

const VehicleManagement: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);

  useEffect(() => {
    const fetchVehicles = async () => {
      setLoading(true);
      try {
        const data = await vehicleManagementService.getAllVehicles();
        setVehicles(data);
      } catch (error: any) {
        console.error('Error fetching vehicles:', error);
        setVehicles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchVehicles();
  }, []);
  
  // Handle search with API call
  const handleSearch = async (keyword: string) => {
    if (!keyword.trim()) {
      // If empty, fetch all vehicles
      const data = await vehicleManagementService.getAllVehicles();
      setVehicles(data);
      return;
    }

    try {
      const data = await vehicleManagementService.searchVehicles(keyword);
      setVehicles(data);
    } catch (error: any) {
      console.error('Error searching vehicles:', error);
    }
  };

  const handleViewDetail = async (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setDetailModalVisible(true);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Chưa có';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Quản lý xe trong hệ thống</h2>
          <p className="text-gray-600">Quản lý thông tin các phương tiện và lịch sử bảo dưỡng</p>
        </div>
        <button className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-2 px-4 rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Thêm xe</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <Car className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{vehicles.length}</div>
              <div className="text-sm text-gray-600">Tổng số xe</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {vehicles.filter(v => v.nextServiceDate && new Date(v.nextServiceDate) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)).length}
              </div>
              <div className="text-sm text-gray-600">Sắp bảo dưỡng</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {vehicles.filter(v => v.lastServiceDate).length}
              </div>
              <div className="text-sm text-gray-600">Đã bảo dưỡng</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {new Set(vehicles.map(v => v.ownerName)).size}
              </div>
              <div className="text-sm text-gray-600">Chủ sở hữu</div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm theo Model, biển số, tên chủ xe..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  handleSearch(e.target.value);
                }}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-80"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200">
              <Filter className="w-4 h-4" />
              <span>Bộ lọc</span>
            </button>
          </div>
        </div>
      </div>

      {/* Vehicle Table */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-4 px-6 font-medium text-gray-600">Thông tin xe</th>
                <th className="text-left py-4 px-6 font-medium text-gray-600">Chủ sở hữu</th>
                <th className="text-left py-4 px-6 font-medium text-gray-600">Biển số</th>
                <th className="text-left py-4 px-6 font-medium text-gray-600">Năm sản xuất</th>
                <th className="text-left py-4 px-6 font-medium text-gray-600">Bảo dưỡng cuối</th>
                <th className="text-left py-4 px-6 font-medium text-gray-600">Bảo dưỡng tiếp</th>
                <th className="text-left py-4 px-6 font-medium text-gray-600">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-10">Đang tải dữ liệu...</td>
                </tr>
              ) : vehicles.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-gray-500">Không có dữ liệu xe</td>
                </tr>
              ) : (
                vehicles.map((vehicle) => (
                  <tr key={vehicle.vehicleID} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                          <Car className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{vehicle.model}</div>
                          <div className="text-sm text-gray-600">VIN: {vehicle.vin}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-medium text-gray-900">{vehicle.ownerName}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-semibold text-blue-600">{vehicle.licensePlate}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-gray-900">{vehicle.year || 'Chưa có'}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm">
                        {vehicle.lastServiceDate ? (
                          <span className="text-green-600 font-medium">
                            {formatDate(vehicle.lastServiceDate)}
                          </span>
                        ) : (
                          <span className="text-gray-500">Chưa có</span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm">
                        {vehicle.nextServiceDate ? (
                          <span className={`font-medium ${
                            new Date(vehicle.nextServiceDate) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                              ? 'text-orange-600' 
                              : 'text-blue-600'
                          }`}>
                            {formatDate(vehicle.nextServiceDate)}
                          </span>
                        ) : (
                          <span className="text-gray-500">Chưa đặt lịch</span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => handleViewDetail(vehicle)}
                          className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors duration-200">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors duration-200">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Vehicle Details Modal */}
      {detailModalVisible && selectedVehicle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                  <Car className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{selectedVehicle.model}</h3>
                  <p className="text-gray-600">Biển số: {selectedVehicle.licensePlate}</p>
                </div>
              </div>
              <button
                onClick={() => setDetailModalVisible(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Vehicle Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <Car className="w-5 h-5 mr-2 text-blue-600" />
                    Thông tin xe
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <span className="text-gray-600 w-24">Model:</span>
                      <span className="ml-2 font-medium">{selectedVehicle.model}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <span className="text-gray-600 w-24">VIN:</span>
                      <span className="ml-2 font-medium">{selectedVehicle.vin}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <span className="text-gray-600 w-24">Biển số:</span>
                      <span className="ml-2 font-medium text-blue-600">{selectedVehicle.licensePlate}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <span className="text-gray-600 w-24">Năm:</span>
                      <span className="ml-2 font-medium">{selectedVehicle.year || 'Chưa có'}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <span className="text-gray-600 w-24">Odometer:</span>
                      <span className="ml-2 font-medium text-green-600">
                        {(selectedVehicle.odometer || 0).toLocaleString()} km
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <User className="w-5 h-5 mr-2 text-blue-600" />
                    Chủ sở hữu
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <span className="text-gray-600 w-24">Tên:</span>
                      <span className="ml-2 font-medium">{selectedVehicle.ownerName}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Service History */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                  Lịch bảo dưỡng
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-600">Bảo dưỡng cuối:</span>
                    <div className="font-medium text-green-600">
                      {formatDate(selectedVehicle.lastServiceDate)}
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Bảo dưỡng tiếp theo:</span>
                    <div className={`font-medium ${
                      selectedVehicle.nextServiceDate && new Date(selectedVehicle.nextServiceDate) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                        ? 'text-orange-600' 
                        : 'text-blue-600'
                    }`}>
                      {formatDate(selectedVehicle.nextServiceDate)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {selectedVehicle.notes && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-blue-600" />
                    Ghi chú
                  </h4>
                  <p className="text-gray-700 text-sm">{selectedVehicle.notes}</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setDetailModalVisible(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
              >
                Đóng
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200">
                Chỉnh sửa
              </button>
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200">
                Đặt lịch bảo dưỡng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleManagement;