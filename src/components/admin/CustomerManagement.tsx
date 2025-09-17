import React, { useState, useEffect } from 'react';
import { Users, Car, Search, Filter, Plus, Eye, Edit, Trash2 } from 'lucide-react';
import { mockUsers, mockVehicles, mockAppointments } from '../../data/mockData';

// Define a more complete Customer type for the component's state
interface Customer {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  vehicles: any[]; // Replace 'any' with a Vehicle type
  appointments: any[]; // Replace 'any' with an Appointment type
  totalSpent: number;
  lastServiceDate?: string;
  lastServiceType?: string;
}

const CustomerManagement: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    // TODO: Replace with a single API call that returns aggregated customer data
    const fetchCustomers = async () => {
      setLoading(true);
      // const response = await api.getCustomersWithDetails();
      // setCustomers(response.data);

      // Simulating data aggregation for now
      const customerData = mockUsers
        .filter(user => user.role === 'customer')
        .map(customer => {
          const vehicles = mockVehicles.filter(v => v.customerId === customer.id);
          const appointments = mockAppointments.filter(a => a.customerId === customer.id);
          const lastAppointment = appointments.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
          const totalSpent = appointments.reduce((sum, apt) => sum + (apt.cost || 0), 0);

          return {
            ...customer,
            vehicles,
            appointments,
            totalSpent,
            lastServiceDate: lastAppointment?.date,
            lastServiceType: lastAppointment?.services[0],
          };
        });
      
      setCustomers(customerData);
      setLoading(false);
    };

    fetchCustomers();
  }, []);
  
  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.email.toLowerCase().includes(searchTerm.toLowerCase());
    // TODO: Add status filtering logic when available in data
    return matchesSearch;
  });

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
              <div className="text-2xl font-bold text-gray-900">{mockVehicles.length}</div>
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
                  <tr key={customer.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                          {customer.avatar ? (
                            <img src={customer.avatar} alt={customer.name} className="w-10 h-10 rounded-full object-cover" />
                          ) : (
                            <Users className="w-5 h-5 text-white" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{customer.name}</div>
                          <div className="text-sm text-gray-600">{customer.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="space-y-1">
                        {customer.vehicles.map((vehicle) => (
                          <div key={vehicle.id} className="text-sm">
                            <div className="font-medium text-gray-900">{vehicle.model}</div>
                            <div className="text-gray-600">VIN: {vehicle.vin}</div>
                          </div>
                        ))}
                        {customer.vehicles.length === 0 && (
                          <span className="text-gray-400">Chưa đăng ký xe</span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      {customer.lastServiceDate ? (
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {new Date(customer.lastServiceDate).toLocaleDateString('vi-VN')}
                          </div>
                          <div className="text-xs text-gray-600">
                            {customer.lastServiceType}
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
                        <button className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors duration-200">
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

      {/* Customer Details Modal would go here */}
    </div>
  );
};

export default CustomerManagement;