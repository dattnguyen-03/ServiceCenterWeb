import React, { useState, useEffect } from 'react';
import { Users, Car, Search, Filter, Plus, Eye, Edit, Trash2, Phone, Mail, MapPin } from 'lucide-react';
import { getAllUsers, searchUsers, type UserListItem } from '../../api/users';

// Use the API types
type Customer = UserListItem;

const CustomerManagement: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);

  useEffect(() => {
    const fetchCustomers = async () => {
      setLoading(true);
      try {
        const data = await getAllUsers();
        setCustomers(data);
      } catch (error: any) {
        console.error('Error fetching customers:', error);
        setCustomers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);
  
  // Handle search with API call
  const handleSearch = async (keyword: string) => {
    if (!keyword.trim()) {
      // If empty, fetch all users
      const data = await getAllUsers();
      setCustomers(data);
      return;
    }

    try {
      const data = await searchUsers(keyword);
      setCustomers(data);
    } catch (error: any) {
      console.error('Error searching users:', error);
    }
  };

  const filteredCustomers = customers.filter(customer => {
    // Filter by role if needed (only show customers)
    const isCustomer = customer.role === 'Customer';
    return isCustomer;
  });

  const handleViewDetail = async (customer: Customer) => {
    setSelectedCustomer(customer);
    setDetailModalVisible(true);
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
              <div className="text-2xl font-bold text-gray-900">{customers.length}</div>
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
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  handleSearch(e.target.value);
                }}
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
                <th className="text-left py-4 px-6 font-medium text-gray-600">Liên hệ</th>
                <th className="text-left py-4 px-6 font-medium text-gray-600">Thông tin</th>
                <th className="text-left py-4 px-6 font-medium text-gray-600">Loại</th>
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
                          <div className="font-medium text-gray-900">{customer.phone}</div>
                          <div className="text-gray-600">{customer.address}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {customer.role}
                        </div>
                        <div className="text-xs text-gray-600">
                          {customer.username}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-semibold text-gray-900">
                        Khách hàng
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
                    <Users className="w-5 h-5 mr-2 text-blue-600" />
                    Thông tin tài khoản
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <span className="text-gray-600">Username:</span>
                      <span className="ml-2 font-medium">{selectedCustomer.username}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <span className="text-gray-600">Role:</span>
                      <span className="ml-2 font-medium">{selectedCustomer.role}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <span className="text-gray-600">User ID:</span>
                      <span className="ml-2 font-medium">{selectedCustomer.userID}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <Car className="w-5 h-5 mr-2 text-blue-600" />
                  Thông tin bổ sung
                </h4>
                <p className="text-gray-500 text-sm">
                  Để xem thông tin chi tiết về xe và lịch sử dịch vụ, vui lòng sử dụng các chức năng quản lý xe và lịch hẹn riêng biệt.
                </p>
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