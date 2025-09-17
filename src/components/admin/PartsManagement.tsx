import React, { useState, useEffect } from 'react';
import { Package, AlertTriangle, TrendingDown, Plus } from 'lucide-react';
import { mockParts } from '../../data/mockData';

// Define Part type
interface Part {
  id: string;
  name: string;
  category: string;
  stock: number;
  minThreshold: number;
  price: number;
  supplier: string;
}

const PartsManagement: React.FC = () => {
  const [parts, setParts] = useState<Part[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Replace with API call
    const fetchParts = async () => {
      setLoading(true);
      // const response = await api.getParts();
      // setParts(response.data);
      setParts(mockParts); // Using mock data for now
      setLoading(false);
    };

    fetchParts();
  }, []);

  const lowStockParts = parts.filter(p => p.stock < p.minThreshold);
  const totalStockValue = parts.reduce((total, p) => total + (p.stock * p.price), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Quản lý phụ tùng</h2>
          <p className="text-gray-600">Theo dõi tồn kho và quản lý phụ tùng xe điện</p>
        </div>
        <button className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-2 px-4 rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Thêm phụ tùng</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{loading ? '...' : parts.length}</div>
              <div className="text-sm text-gray-600">Tổng số phụ tùng</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {loading ? '...' : lowStockParts.length}
              </div>
              <div className="text-sm text-gray-600">Phụ tùng thiếu</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
              <TrendingDown className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {loading ? '...' : totalStockValue.toLocaleString('vi-VN')} đ
              </div>
              <div className="text-sm text-gray-600">Giá trị tồn kho</div>
            </div>
          </div>
        </div>
      </div>

      {/* Parts Table */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Danh sách phụ tùng</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-6 font-medium text-gray-600">Tên phụ tùng</th>
                <th className="text-left py-3 px-6 font-medium text-gray-600">Danh mục</th>
                <th className="text-left py-3 px-6 font-medium text-gray-600">Tồn kho</th>
                <th className="text-left py-3 px-6 font-medium text-gray-600">Ngưỡng tối thiểu</th>
                <th className="text-left py-3 px-6 font-medium text-gray-600">Giá</th>
                <th className="text-left py-3 px-6 font-medium text-gray-600">Nhà cung cấp</th>
                <th className="text-left py-3 px-6 font-medium text-gray-600">Trạng thái</th>
                <th className="text-left py-3 px-6 font-medium text-gray-600">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="text-center py-10">Đang tải...</td></tr>
              ) : (
                parts.map((part) => {
                  const isLowStock = part.stock < part.minThreshold;
                  return (
                    <tr key={part.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-6">
                        <div className="font-medium text-gray-900">{part.name}</div>
                      </td>
                      <td className="py-4 px-6 text-gray-600">{part.category}</td>
                      <td className="py-4 px-6">
                        <span className={`font-semibold ${isLowStock ? 'text-red-600' : 'text-gray-900'}`}>
                          {part.stock}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-gray-600">{part.minThreshold}</td>
                      <td className="py-4 px-6 text-gray-900 font-medium">
                        {part.price.toLocaleString('vi-VN')} đ
                      </td>
                      <td className="py-4 px-6 text-gray-600">{part.supplier}</td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          isLowStock 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {isLowStock ? 'Thiếu hàng' : 'Đủ hàng'}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex space-x-2">
                          <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                            Sửa
                          </button>
                          <button className="text-green-600 hover:text-green-800 text-sm font-medium">
                            Nhập kho
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Low Stock Alert */}
      {!loading && lowStockParts.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-4">
            <AlertTriangle className="w-6 h-6 text-red-600" />
            <h3 className="text-lg font-semibold text-red-800">Cảnh báo tồn kho thấp</h3>
          </div>
          <div className="space-y-2">
            {lowStockParts.map((part) => (
              <div key={part.id} className="flex items-center justify-between text-sm">
                <span className="text-red-700">{part.name} ({part.category})</span>
                <span className="font-medium text-red-600">
                  Còn {part.stock} - Cần ít nhất {part.minThreshold}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PartsManagement;