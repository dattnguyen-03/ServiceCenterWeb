import React, { useState, useEffect } from 'react';
import { Users, Car, Search, Filter, Plus, Eye, Edit, Trash2, Phone, Mail, Calendar, MapPin, Clock, DollarSign, Wrench } from 'lucide-react';
import { customerManagementService, CustomerWithDetails, CustomerFullDetails } from '../../services/customerManagementService';

// Use the API types
type Customer = CustomerWithDetails;

const CustomerManagement: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerFullDetails | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);

  useEffect(() => {
    const fetchCustomers = async () => {
      setLoading(true);
      try {
        const customerData = await customerManagementService.getAllCustomers();
      setCustomers(customerData);
      } catch (error) {
        console.error('Error fetching customers:', error);
        setCustomers([]);
      } finally {
      setLoading(false);
      }
    };

    fetchCustomers();
  }, []);
  
  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.email.toLowerCase().includes(searchTerm.toLowerCase());
    // TODO: Add status filtering logic when available in data
    return matchesSearch;
  });

  const handleViewDetail = async (customer: Customer) => {
    try {
      const customerDetails = await customerManagementService.getCustomerDetails(customer.userID);
      setSelectedCustomer(customerDetails);
      setDetailModalVisible(true);
    } catch (error) {
      console.error('Error fetching customer details:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Quản lý khách hàng</h2>
          <p className="text-gray-600">Quản lý thông tin khách hàng và lịch sử dịch vụ</p>
        </div>
        <button className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-2 px-4 rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Thêm khách hàng</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{customers.length}</div>
              <div className="text-sm text-gray-600">Tổng khách hàng</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
              <Car className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{customers.reduce((sum, customer) => sum + customer.vehicleCount, 0)}</div>
              <div className="text-sm text-gray-600">Tổng xe đăng ký</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">15</div>
              <div className="text-sm text-gray-600">Khách hàng mới tháng này</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">92%</div>
              <div className="text-sm text-gray-600">Tỷ lệ hài lòng</div>
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
                placeholder="Tìm kiếm khách hàng..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Hoạt động</option>
              <option value="inactive">Không hoạt động</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200">
              <Filter className="w-4 h-4" />
              <span>Bộ lọc</span>
            </button>
          </div>
        </div>
      </div>

      {/* Customer Table */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-4 px-6 font-medium text-gray-600">Khách hàng</th>
                <th className="text-left py-4 px-6 font-medium text-gray-600">Xe đăng ký</th>
                <th className="text-left py-4 px-6 font-medium text-gray-600">Lần dịch vụ cuối</th>
                <th className="text-left py-4 px-6 font-medium text-gray-600">Tổng chi tiêu</th>
                <th className="text-left py-4 px-6 font-medium text-gray-600">Trạng thái</th>
                <th className="text-left py-4 px-6 font-medium text-gray-600">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-10">Đang tải dữ liệu...</td>
                </tr>
              ) : (
                filteredCustomers.map((customer) => (
                  <tr key={customer.userID} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                            <Users className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{customer.name}</div>
                          <div className="text-sm text-gray-600">{customer.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="space-y-1">
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">{customer.vehicleCount} xe đăng ký</div>
                          <div className="text-gray-600">Click xem chi tiết để xem danh sách</div>
                          </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      {customer.lastServiceDate ? (
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {new Date(customer.lastServiceDate).toLocaleDateString('vi-VN')}
                          </div>
                          <div className="text-xs text-gray-600">
                            {customer.appointmentCount} dịch vụ
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400">Chưa có dịch vụ</span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-semibold text-gray-900">
                        {customer.totalSpent.toLocaleString('vi-VN')} đ
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Hoạt động
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => handleViewDetail(customer)}
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

      {/* Customer Details Modal */}
      {detailModalVisible && selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{selectedCustomer.name}</h3>
                  <p className="text-gray-600">{selectedCustomer.email}</p>
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
              {/* Customer Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <Users className="w-5 h-5 mr-2 text-blue-600" />
                    Thông tin cá nhân
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <Mail className="w-4 h-4 mr-2 text-gray-400" />
                      <span className="text-gray-600">Email:</span>
                      <span className="ml-2 font-medium">{selectedCustomer.email}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Phone className="w-4 h-4 mr-2 text-gray-400" />
                      <span className="text-gray-600">Điện thoại:</span>
                      <span className="ml-2 font-medium">{selectedCustomer.phone}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                      <span className="text-gray-600">Địa chỉ:</span>
                      <span className="ml-2 font-medium">{selectedCustomer.address}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <DollarSign className="w-5 h-5 mr-2 text-green-600" />
                    Thống kê dịch vụ
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <span className="text-gray-600">Tổng chi tiêu:</span>
                      <span className="ml-2 font-bold text-green-600">{formatCurrency(selectedCustomer.totalSpent)}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <span className="text-gray-600">Số lần dịch vụ:</span>
                      <span className="ml-2 font-medium">{selectedCustomer.appointmentCount}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <span className="text-gray-600">Lần cuối:</span>
                      <span className="ml-2 font-medium">
                        {selectedCustomer.lastServiceDate ? formatDate(selectedCustomer.lastServiceDate) : 'Chưa có'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Vehicles */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <Car className="w-5 h-5 mr-2 text-blue-600" />
                  Xe đăng ký ({selectedCustomer.vehicleCount})
                </h4>
                {selectedCustomer.vehicles.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedCustomer.vehicles.map((vehicle) => (
                      <div key={vehicle.vehicleID} className="bg-white rounded-lg p-4 border border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-medium text-gray-900">{vehicle.model}</h5>
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                            Hoạt động
                          </span>
                        </div>
                        <div className="space-y-1 text-sm text-gray-600">
                          <div>VIN: {vehicle.vin}</div>
                          <div>Năm sản xuất: {vehicle.year || '2023'}</div>
                          <div>Màu sắc: {vehicle.color || 'Trắng'}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">Chưa đăng ký xe nào</p>
                )}
              </div>

              {/* Service History */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <Wrench className="w-5 h-5 mr-2 text-orange-600" />
                  Lịch sử dịch vụ ({selectedCustomer.appointmentCount})
                </h4>
                {selectedCustomer.appointments.length > 0 ? (
                  <div className="space-y-3">
                    {selectedCustomer.appointments.slice(0, 5).map((appointment, index) => (
                      <div key={index} className="bg-white rounded-lg p-4 border border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                            <span className="font-medium text-gray-900">
                              {formatDate(appointment.requestedDate)}
                            </span>
                          </div>
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            {appointment.status || 'Hoàn thành'}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">
                          <div className="mb-1">
                            <span className="font-medium">Dịch vụ:</span> {appointment.serviceType}
                          </div>
                          <div className="mb-1">
                            <span className="font-medium">Mô tả:</span> {appointment.description}
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 mr-1 text-gray-400" />
                              <span>2 giờ</span>
                            </div>
                            <div className="flex items-center">
                              <DollarSign className="w-4 h-4 mr-1 text-gray-400" />
                              <span className="font-medium">{formatCurrency(appointment.cost || 0)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {selectedCustomer.appointments.length > 5 && (
                      <p className="text-center text-gray-500 py-2">
                        Và {selectedCustomer.appointments.length - 5} dịch vụ khác...
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">Chưa có lịch sử dịch vụ</p>
                )}
              </div>
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerManagement;