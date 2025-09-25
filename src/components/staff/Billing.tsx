import React, { useState, useEffect } from 'react';
import { DollarSign, CreditCard, Receipt, Download, Calculator, User, Car } from 'lucide-react';

interface BillingItem {
  id: string;
  customerName: string;
  vehicleInfo: string;
  services: string[];
  parts: Array<{
    name: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  laborHours: number;
  laborRate: number;
  subtotal: number;
  tax: number;
  total: number;
  status: 'pending' | 'paid' | 'overdue';
  dueDate: string;
  createdAt: string;
  paymentMethod?: string;
}

const Billing: React.FC = () => {
  const [billingItems, setBillingItems] = useState<BillingItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [filterStatus] = useState('all');
  const [searchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBillingItems = async () => {
      setLoading(true);
      const mockBillingItems: BillingItem[] = [
        {
          id: 'B001',
          customerName: 'Nguyễn Văn Nam',
      vehicleInfo: 'VinFast VF8 - 30A-12345',
          services: ['Bảo dưỡng định kỳ', 'Kiểm tra pin'],
      parts: [
            { name: 'Dầu phanh EV', quantity: 2, unitPrice: 250000, total: 500000 },
            { name: 'Lọc không khí', quantity: 1, unitPrice: 180000, total: 180000 }
          ],
          laborHours: 2.5,
          laborRate: 800000,
          subtotal: 2000000,
          tax: 200000,
          total: 2200000,
      status: 'pending',
          dueDate: '2024-01-25',
          createdAt: '2024-01-20',
          paymentMethod: 'Tiền mặt'
        },
        {
          id: 'B002',
          customerName: 'Trần Thị B',
          vehicleInfo: 'Tesla Model Y - 30A-54321',
          services: ['Thay lốp', 'Cân chỉnh góc lái'],
          parts: [
            { name: 'Lốp Michelin EV 235/55R19', quantity: 4, unitPrice: 3500000, total: 14000000 }
          ],
          laborHours: 1.5,
          laborRate: 800000,
          subtotal: 15200000,
          tax: 1520000,
          total: 16720000,
          status: 'paid',
          dueDate: '2024-01-22',
          createdAt: '2024-01-18',
          paymentMethod: 'Chuyển khoản'
        }
      ];
      
      setBillingItems(mockBillingItems);
      setLoading(false);
    };

    fetchBillingItems();
  }, []);

  const filteredItems = billingItems.filter(item => {
    const matchesSearch = item.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.vehicleInfo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || item.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'paid': return 'bg-green-100 text-green-800 border-green-200';
      case 'overdue': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Chờ thanh toán';
      case 'paid': return 'Đã thanh toán';
      case 'overdue': return 'Quá hạn';
      default: return 'Không xác định';
    }
  };

  const handleSelectItem = (id: string) => {
    setSelectedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  // const handleSelectAll = () => {
  //   setSelectedItems(
  //     selectedItems.length === filteredItems.length 
  //       ? [] 
  //       : filteredItems.map(item => item.id)
  //   );
  // };

  const handleStatusChange = (id: string, newStatus: string) => {
    setBillingItems(prev => prev.map(item => 
      item.id === id ? { ...item, status: newStatus as any } : item
    ));
  };

  const stats = [
    { 
      label: 'Tổng doanh thu tháng', 
      value: `${billingItems.reduce((sum, item) => sum + item.total, 0).toLocaleString('vi-VN')} đ`, 
      color: 'from-green-500 to-green-600' 
    },
    { 
      label: 'Chờ thanh toán', 
      value: billingItems.filter(item => item.status === 'pending').length.toString(), 
      color: 'from-yellow-500 to-yellow-600' 
    },
    { 
      label: 'Đã thanh toán', 
      value: billingItems.filter(item => item.status === 'paid').length.toString(), 
      color: 'from-blue-500 to-blue-600' 
    },
    { 
      label: 'Quá hạn', 
      value: billingItems.filter(item => item.status === 'overdue').length.toString(), 
      color: 'from-red-500 to-red-600' 
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Quản lý hóa đơn</h2>
          <p className="text-gray-600">Theo dõi và quản lý thanh toán dịch vụ</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2">
            <Calculator className="w-4 h-4" />
            <span>Tạo hóa đơn</span>
          </button>
          <button className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center space-x-2">
            <Receipt className="w-4 h-4" />
            <span>Xuất báo cáo</span>
          </button>
        </div>
        </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center space-x-4">
              <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-lg flex items-center justify-center`}>
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Billing Items */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-gray-600 mt-4">Đang tải dữ liệu...</p>
          </div>
        ) : filteredItems.length > 0 ? (
          filteredItems.map((item) => (
            <div key={item.id} className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(item.id)}
                    onChange={() => handleSelectItem(item.id)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <div className="text-lg font-bold text-gray-900">Hóa đơn #{item.id}</div>
                    <div className="text-sm text-gray-600">
                      Tạo ngày: {new Date(item.createdAt).toLocaleDateString('vi-VN')}
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(item.status)}`}>
                    {getStatusText(item.status)}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">
                    {item.total.toLocaleString('vi-VN')} đ
                  </div>
                  <div className="text-sm text-gray-600">
                    Hạn thanh toán: {new Date(item.dueDate).toLocaleDateString('vi-VN')}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                <div>
                  <div className="flex items-center space-x-3 mb-3">
                    <User className="w-5 h-5 text-gray-400" />
                    <div>
                      <div className="text-sm text-gray-600">Khách hàng</div>
                      <div className="font-medium text-gray-900">{item.customerName}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Car className="w-5 h-5 text-gray-400" />
                    <div>
                      <div className="text-sm text-gray-600">Xe</div>
                      <div className="font-medium text-gray-900">{item.vehicleInfo}</div>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-2">Dịch vụ thực hiện:</div>
                  <div className="space-y-1">
                    {item.services.map((service, index) => (
                      <div key={index} className="text-sm text-gray-900">• {service}</div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-gray-600">
                  {item.paymentMethod && (
                    <span>Phương thức thanh toán: <span className="font-medium">{item.paymentMethod}</span></span>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  {item.status === 'pending' && (
                    <button 
                      onClick={() => handleStatusChange(item.id, 'paid')}
                      className="flex items-center space-x-1 px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>Đánh dấu đã thanh toán</span>
                    </button>
                  )}
                  <button className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200">
                    <Receipt className="w-4 h-4" />
                    <span>In hóa đơn</span>
                  </button>
                  <button className="flex items-center space-x-1 px-3 py-1 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200">
                    <Download className="w-4 h-4" />
                    <span>Xuất PDF</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-10 text-gray-500">
            <Receipt className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>Không có hóa đơn nào</p>
                </div>
              )}
      </div>
    </div>
  );
};

export default Billing;