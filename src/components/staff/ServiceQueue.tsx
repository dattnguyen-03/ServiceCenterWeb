import React, { useState, useEffect } from 'react';
import { Clock, User, Car, AlertCircle, CheckCircle, Play, Pause, Filter, Search } from 'lucide-react';
// import { mockServiceTickets } from '../../data/mockData';

interface QueueItem {
  id: string;
  customerName: string;
  vehicleInfo: string;
  serviceType: string;
  priority: 'high' | 'medium' | 'low';
  status: 'waiting' | 'in-progress' | 'paused' | 'completed';
  estimatedTime: number;
  actualStartTime?: string;
  technician?: string;
  notes?: string;
}

const ServiceQueue: React.FC = () => {
  const [queueItems, setQueueItems] = useState<QueueItem[]>([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    const fetchQueueItems = async () => {
      setLoading(true);
      // Mock data generation
      const mockQueueItems: QueueItem[] = [
        {
          id: 'Q001',
          customerName: 'Nguyễn Văn Nam',
          vehicleInfo: 'VinFast VF8 - 30A-12345',
          serviceType: 'Bảo dưỡng định kỳ',
          priority: 'high',
          status: 'waiting',
          estimatedTime: 120,
          technician: 'Phạm Kỹ Thuật'
        },
        {
          id: 'Q002',
          customerName: 'Trần Thị B',
          vehicleInfo: 'Tesla Model Y - 30A-54321',
          serviceType: 'Kiểm tra pin',
          priority: 'medium',
          status: 'in-progress',
          estimatedTime: 90,
          actualStartTime: '09:30',
          technician: 'Nguyễn Văn A'
        },
        {
          id: 'Q003',
          customerName: 'Lê Minh C',
          vehicleInfo: 'VinFast VF e34 - 30A-67890',
          serviceType: 'Thay lốp',
          priority: 'low',
          status: 'waiting',
          estimatedTime: 60,
          technician: 'Phạm Kỹ Thuật'
        }
      ];
      
      setQueueItems(mockQueueItems);
      setLoading(false);
    };

    fetchQueueItems();
  }, []);

  const filteredItems = queueItems.filter(item => {
    const matchesSearch = item.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.vehicleInfo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || item.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'waiting': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-orange-100 text-orange-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'waiting': return 'Chờ xử lý';
      case 'in-progress': return 'Đang thực hiện';
      case 'paused': return 'Tạm dừng';
      case 'completed': return 'Hoàn thành';
      default: return 'Không xác định';
    }
  };

  const handleStatusChange = (id: string, newStatus: string) => {
    setQueueItems(prev => prev.map(item => 
      item.id === id 
        ? { 
            ...item, 
            status: newStatus as any,
            actualStartTime: newStatus === 'in-progress' && !item.actualStartTime 
              ? new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
              : item.actualStartTime
          }
        : item
    ));
  };

  const stats = [
    { label: 'Tổng hàng chờ', value: queueItems.length.toString(), color: 'from-blue-500 to-blue-600' },
    { label: 'Đang xử lý', value: queueItems.filter(item => item.status === 'in-progress').length.toString(), color: 'from-orange-500 to-orange-600' },
    { label: 'Chờ xử lý', value: queueItems.filter(item => item.status === 'waiting').length.toString(), color: 'from-green-500 to-green-600' },
    { label: 'Hoàn thành hôm nay', value: '8', color: 'from-purple-500 to-purple-600' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Hàng chờ dịch vụ</h2>
          <p className="text-gray-600">Quản lý và theo dõi tiến độ dịch vụ</p>
        </div>
        <button className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2">
          <Clock className="w-4 h-4" />
          <span>Thêm vào hàng chờ</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center space-x-4">
              <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-lg flex items-center justify-center`}>
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm khách hàng hoặc xe..."
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
              <option value="waiting">Chờ xử lý</option>
              <option value="in-progress">Đang thực hiện</option>
              <option value="paused">Tạm dừng</option>
              <option value="completed">Hoàn thành</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200">
              <Filter className="w-4 h-4" />
              <span>Bộ lọc nâng cao</span>
            </button>
          </div>
        </div>
      </div>

      {/* Queue Items */}
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
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-bold text-gray-900">#{item.id}</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(item.priority)}`}>
                      {item.priority === 'high' ? 'Ưu tiên cao' : 
                       item.priority === 'medium' ? 'Ưu tiên trung bình' : 'Ưu tiên thấp'}
                    </span>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                    {getStatusText(item.status)}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">Thời gian ước tính</div>
                  <div className="font-semibold text-gray-900">{item.estimatedTime} phút</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="flex items-center space-x-3">
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
                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-600">Kỹ thuật viên</div>
                    <div className="font-medium text-gray-900">{item.technician || 'Chưa phân công'}</div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Dịch vụ:</span> {item.serviceType}
                  {item.actualStartTime && (
                    <span className="ml-4">
                      <span className="font-medium">Bắt đầu:</span> {item.actualStartTime}
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  {item.status === 'waiting' && (
                    <button 
                      onClick={() => handleStatusChange(item.id, 'in-progress')}
                      className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                    >
                      <Play className="w-4 h-4" />
                      <span>Bắt đầu</span>
                    </button>
                  )}
                  {item.status === 'in-progress' && (
                    <>
                      <button 
                        onClick={() => handleStatusChange(item.id, 'paused')}
                        className="flex items-center space-x-1 px-3 py-1 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors duration-200"
                      >
                        <Pause className="w-4 h-4" />
                        <span>Tạm dừng</span>
                      </button>
                      <button 
                        onClick={() => handleStatusChange(item.id, 'completed')}
                        className="flex items-center space-x-1 px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Hoàn thành</span>
                      </button>
                    </>
                  )}
                  {item.status === 'paused' && (
                    <button 
                      onClick={() => handleStatusChange(item.id, 'in-progress')}
                      className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                    >
                      <Play className="w-4 h-4" />
                      <span>Tiếp tục</span>
                    </button>
                  )}
                  <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200">
                    <AlertCircle className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-10 text-gray-500">
            <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>Không có mục nào trong hàng chờ</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceQueue;