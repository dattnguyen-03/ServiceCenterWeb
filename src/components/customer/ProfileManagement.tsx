import React, { useState } from 'react';
import { User, CreditCard, FileText, Download, Eye, Calendar } from 'lucide-react';
import { mockUsers, mockAppointments } from '../../data/mockData';

const ProfileManagement: React.FC = () => {
  const [activeSection, setActiveSection] = useState('profile');
  const user = mockUsers.find(u => u.id === '1');
  
  const invoiceHistory = [
    { id: 'INV-001', date: '2024-01-15', service: 'Bảo dưỡng định kỳ', amount: 2500000, status: 'paid' },
    { id: 'INV-002', date: '2024-02-20', service: 'Kiểm tra pin', amount: 1500000, status: 'paid' },
    { id: 'INV-003', date: '2024-03-10', service: 'Thay lốp', amount: 3500000, status: 'pending' }
  ];

  const paymentMethods = [
    { id: '1', type: 'visa', last4: '4242', expiry: '12/25', isDefault: true },
    { id: '2', type: 'mastercard', last4: '8888', expiry: '08/26', isDefault: false }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-10 px-2 md:px-0 flex justify-center items-start">
      <div className="w-full max-w-4xl">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-extrabold text-blue-700 mb-2 drop-shadow">Hồ sơ & Chi phí</h2>
          <p className="text-gray-500 text-lg">Quản lý thông tin cá nhân và theo dõi chi phí dịch vụ</p>
        </div>
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
          <div className="flex border-b border-gray-200">
            {[ 
              { id: 'profile', label: 'Thông tin cá nhân', icon: User },
              { id: 'payment', label: 'Phương thức thanh toán', icon: CreditCard },
              { id: 'invoices', label: 'Lịch sử hóa đơn', icon: FileText }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveSection(tab.id)}
                  className={`flex-1 flex items-center justify-center space-x-2 py-5 px-6 font-semibold text-lg transition-colors duration-200 ${
                    activeSection === tab.id
                      ? 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 border-b-4 border-blue-600 shadow-inner'
                      : 'text-gray-500 hover:text-blue-700 hover:bg-blue-50'
                  }`}
                >
                  <Icon className="w-6 h-6" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
          <div className="p-8">
            {activeSection === 'profile' && (
              <div className="space-y-8">
                <div className="flex flex-col md:flex-row items-center md:space-x-8 space-y-4 md:space-y-0">
                  <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg border-4 border-white">
                    {user?.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-32 h-32 rounded-full object-cover" />
                    ) : (
                      <User className="w-16 h-16 text-white" />
                    )}
                  </div>
                  <div className="text-center md:text-left">
                    <h3 className="text-2xl font-bold text-blue-700 mb-1">{user?.name}</h3>
                    <p className="text-gray-500 text-lg">{user?.email}</p>
                    <button className="mt-3 text-blue-600 hover:text-indigo-700 font-semibold underline underline-offset-2">
                      Thay đổi ảnh đại diện
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-sm font-semibold text-blue-700 mb-2">Họ và tên</label>
                    <input
                      type="text"
                      defaultValue={user?.name}
                      className="w-full px-5 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-white/70 shadow"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-blue-700 mb-2">Email</label>
                    <input
                      type="email"
                      defaultValue={user?.email}
                      className="w-full px-5 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-white/70 shadow"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-blue-700 mb-2">Số điện thoại</label>
                    <input
                      type="tel"
                      defaultValue="0901234567"
                      className="w-full px-5 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-white/70 shadow"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-blue-700 mb-2">Địa chỉ</label>
                    <input
                      type="text"
                      defaultValue="123 Nguyễn Trãi, Hà Nội"
                      className="w-full px-5 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-white/70 shadow"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-4">
                  <button className="px-7 py-3 border border-gray-300 text-gray-600 rounded-xl hover:bg-gray-100 font-semibold transition-colors duration-200">
                    Hủy
                  </button>
                  <button className="px-7 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-indigo-700 shadow transition-all duration-200">
                    Lưu thay đổi
                  </button>
                </div>
              </div>
            )}
            {activeSection === 'payment' && (
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-blue-700">Phương thức thanh toán</h3>
                  <button className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-2 px-6 rounded-xl font-semibold hover:from-blue-600 hover:to-indigo-700 shadow transition-all duration-200">
                    Thêm thẻ mới
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {paymentMethods.map((method) => (
                    <div key={method.id} className="border rounded-2xl p-7 bg-white/90 hover:shadow-xl transition-shadow duration-200">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          <div className={`w-14 h-10 rounded-xl ${
                            method.type === 'visa' ? 'bg-blue-600' : 'bg-red-600'
                          } flex items-center justify-center shadow-md`}>
                            <span className="text-white text-base font-bold">
                              {method.type.toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <div className="font-semibold text-lg">**** **** **** {method.last4}</div>
                            <div className="text-sm text-gray-500">Hết hạn {method.expiry}</div>
                          </div>
                        </div>
                        {method.isDefault && (
                          <span className="bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full">
                            Mặc định
                          </span>
                        )}
                      </div>
                      <div className="flex space-x-3">
                        <button className="flex-1 text-blue-600 hover:text-indigo-700 text-sm font-semibold">
                          Chỉnh sửa
                        </button>
                        <button className="flex-1 text-red-600 hover:text-red-800 text-sm font-semibold">
                          Xóa
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {activeSection === 'invoices' && (
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-blue-700">Lịch sử hóa đơn</h3>
                  <div className="flex space-x-4">
                    <select className="px-5 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-white/70 shadow">
                      <option>Tất cả trạng thái</option>
                      <option>Đã thanh toán</option>
                      <option>Chờ thanh toán</option>
                    </select>
                    <button className="px-5 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 shadow transition-colors duration-200 flex items-center space-x-2">
                      <Download className="w-5 h-5" />
                      <span>Xuất Excel</span>
                    </button>
                  </div>
                </div>
                <div className="overflow-hidden border border-gray-200 rounded-2xl bg-white/90 shadow">
                  <table className="w-full">
                    <thead className="bg-blue-50">
                      <tr>
                        <th className="text-left py-5 px-7 font-semibold text-blue-700">Mã hóa đơn</th>
                        <th className="text-left py-5 px-7 font-semibold text-blue-700">Ngày</th>
                        <th className="text-left py-5 px-7 font-semibold text-blue-700">Dịch vụ</th>
                        <th className="text-left py-5 px-7 font-semibold text-blue-700">Số tiền</th>
                        <th className="text-left py-5 px-7 font-semibold text-blue-700">Trạng thái</th>
                        <th className="text-left py-5 px-7 font-semibold text-blue-700">Hành động</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoiceHistory.map((invoice) => (
                        <tr key={invoice.id} className="border-b border-gray-100 hover:bg-blue-50 transition-colors">
                          <td className="py-5 px-7 font-semibold text-gray-900">{invoice.id}</td>
                          <td className="py-5 px-7 text-gray-500">
                            {new Date(invoice.date).toLocaleDateString('vi-VN')}
                          </td>
                          <td className="py-5 px-7 text-gray-500">{invoice.service}</td>
                          <td className="py-5 px-7 font-bold text-blue-700">
                            {invoice.amount.toLocaleString('vi-VN')} đ
                          </td>
                          <td className="py-5 px-7">
                            <span className={`px-4 py-2 rounded-full text-xs font-semibold ${
                              invoice.status === 'paid' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {invoice.status === 'paid' ? 'Đã thanh toán' : 'Chờ thanh toán'}
                            </span>
                          </td>
                          <td className="py-5 px-7">
                            <div className="flex space-x-3">
                              <button className="text-blue-600 hover:text-indigo-700 p-2 rounded-lg bg-blue-50">
                                <Eye className="w-5 h-5" />
                              </button>
                              <button className="text-green-600 hover:text-green-700 p-2 rounded-lg bg-green-50">
                                <Download className="w-5 h-5" />
                              </button>
                              {invoice.status === 'pending' && (
                                <button className="text-orange-600 hover:text-orange-800 text-sm font-semibold px-3 py-2 rounded-lg bg-yellow-50">
                                  Thanh toán
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {/* Payment Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
                  <div className="bg-blue-100 rounded-2xl p-8 border border-blue-200 shadow">
                    <div className="text-blue-600 text-sm font-semibold mb-2">Tổng chi phí năm nay</div>
                    <div className="text-2xl font-extrabold text-blue-900">
                      {invoiceHistory.reduce((sum, inv) => sum + inv.amount, 0).toLocaleString('vi-VN')} đ
                    </div>
                  </div>
                  <div className="bg-green-100 rounded-2xl p-8 border border-green-200 shadow">
                    <div className="text-green-600 text-sm font-semibold mb-2">Đã thanh toán</div>
                    <div className="text-2xl font-extrabold text-green-900">
                      {invoiceHistory.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.amount, 0).toLocaleString('vi-VN')} đ
                    </div>
                  </div>
                  <div className="bg-yellow-100 rounded-2xl p-8 border border-yellow-200 shadow">
                    <div className="text-yellow-600 text-sm font-semibold mb-2">Chờ thanh toán</div>
                    <div className="text-2xl font-extrabold text-yellow-900">
                      {invoiceHistory.filter(inv => inv.status === 'pending').reduce((sum, inv) => sum + inv.amount, 0).toLocaleString('vi-VN')} đ
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileManagement;