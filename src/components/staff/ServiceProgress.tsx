import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, AlertCircle, Play, Pause, RotateCcw, User, Car, Wrench, FileText } from 'lucide-react';
// import { mockServiceTickets, mockAppointments } from '../../data/mockData';

interface ServiceProgressItem {
  id: string;
  customerName: string;
  vehicleInfo: string;
  serviceType: string;
  technician: string;
  status: 'not-started' | 'in-progress' | 'paused' | 'completed';
  progress: number;
  startTime?: string;
  estimatedDuration: number;
  actualDuration?: number;
  checklist: Array<{
    id: string;
    task: string;
    completed: boolean;
    completedAt?: string;
    notes?: string;
  }>;
  issues?: string[];
  notes?: string;
}

const ServiceProgress: React.FC = () => {
  const [progressItems, setProgressItems] = useState<ServiceProgressItem[]>([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProgressItems = async () => {
      setLoading(true);
      const mockProgressItems: ServiceProgressItem[] = [
        {
          id: 'SP001',
          customerName: 'Nguyễn Văn Nam',
          vehicleInfo: 'VinFast VF8 - 30A-12345',
          serviceType: 'Bảo dưỡng định kỳ',
          technician: 'Phạm Kỹ Thuật',
          status: 'in-progress',
          progress: 65,
          startTime: '09:00',
          estimatedDuration: 120,
          actualDuration: 78,
          checklist: [
            { id: '1', task: 'Kiểm tra áp suất lốp', completed: true, completedAt: '09:15' },
            { id: '2', task: 'Kiểm tra dung lượng pin', completed: true, completedAt: '09:30' },
            { id: '3', task: 'Kiểm tra hệ thống phanh', completed: true, completedAt: '09:45' },
            { id: '4', task: 'Vệ sinh nội thất', completed: false },
            { id: '5', task: 'Kiểm tra hệ thống điện', completed: false },
            { id: '6', task: 'Kiểm tra hệ thống làm mát', completed: false }
          ],
          notes: 'Xe trong tình trạng tốt, không phát hiện vấn đề gì đặc biệt.'
        },
        {
          id: 'SP002',
          customerName: 'Trần Thị B',
          vehicleInfo: 'Tesla Model Y - 30A-54321',
          serviceType: 'Kiểm tra pin',
          technician: 'Nguyễn Văn A',
          status: 'paused',
          progress: 40,
          startTime: '10:00',
          estimatedDuration: 90,
          actualDuration: 36,
          checklist: [
            { id: '1', task: 'Kiểm tra dung lượng pin', completed: true, completedAt: '10:15' },
            { id: '2', task: 'Kiểm tra hệ thống sạc', completed: true, completedAt: '10:25' },
            { id: '3', task: 'Kiểm tra nhiệt độ pin', completed: false },
            { id: '4', task: 'Kiểm tra kết nối pin', completed: false },
            { id: '5', task: 'Test hiệu suất pin', completed: false }
          ],
          issues: ['Cần thay thế cảm biến nhiệt độ pin'],
          notes: 'Phát hiện cảm biến nhiệt độ pin hoạt động không ổn định.'
        },
        {
          id: 'SP003',
          customerName: 'Lê Minh C',
          vehicleInfo: 'VinFast VF e34 - 30A-67890',
          serviceType: 'Thay lốp',
          technician: 'Phạm Kỹ Thuật',
          status: 'completed',
          progress: 100,
          startTime: '08:00',
          estimatedDuration: 60,
          actualDuration: 55,
          checklist: [
            { id: '1', task: 'Tháo lốp cũ', completed: true, completedAt: '08:10' },
            { id: '2', task: 'Kiểm tra vành xe', completed: true, completedAt: '08:15' },
            { id: '3', task: 'Lắp lốp mới', completed: true, completedAt: '08:35' },
            { id: '4', task: 'Cân chỉnh góc lái', completed: true, completedAt: '08:50' },
            { id: '5', task: 'Kiểm tra áp suất', completed: true, completedAt: '08:55' }
          ],
          notes: 'Hoàn thành đúng thời gian dự kiến, khách hàng hài lòng.'
        }
      ];
      
      setProgressItems(mockProgressItems);
      setLoading(false);
    };

    fetchProgressItems();
  }, []);

  const filteredItems = progressItems.filter(item => {
    const matchesSearch = item.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.vehicleInfo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || item.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'not-started': return 'bg-gray-100 text-gray-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'not-started': return 'Chưa bắt đầu';
      case 'in-progress': return 'Đang thực hiện';
      case 'paused': return 'Tạm dừng';
      case 'completed': return 'Hoàn thành';
      default: return 'Không xác định';
    }
  };

  const handleStatusChange = (id: string, newStatus: string) => {
    setProgressItems(prev => prev.map(item => 
      item.id === id 
        ? { 
            ...item, 
            status: newStatus as any,
            startTime: newStatus === 'in-progress' && !item.startTime 
              ? new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
              : item.startTime
          }
        : item
    ));
  };

  const handleTaskToggle = (itemId: string, taskId: string) => {
    setProgressItems(prev => prev.map(item => 
      item.id === itemId 
        ? {
            ...item,
            checklist: item.checklist.map(task => 
              task.id === taskId 
                ? { 
                    ...task, 
                    completed: !task.completed,
                    completedAt: !task.completed 
                      ? new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
                      : undefined
                  }
                : task
            ),
            progress: item.checklist.map(task => 
              task.id === taskId 
                ? { ...task, completed: !task.completed }
                : task
            ).filter(task => task.completed).length / item.checklist.length * 100
          }
        : item
    ));
  };

  const stats = [
    { 
      label: 'Đang thực hiện', 
      value: progressItems.filter(item => item.status === 'in-progress').length.toString(), 
      color: 'from-blue-500 to-blue-600' 
    },
    { 
      label: 'Tạm dừng', 
      value: progressItems.filter(item => item.status === 'paused').length.toString(), 
      color: 'from-yellow-500 to-yellow-600' 
    },
    { 
      label: 'Hoàn thành hôm nay', 
      value: progressItems.filter(item => item.status === 'completed').length.toString(), 
      color: 'from-green-500 to-green-600' 
    },
    { 
      label: 'Hiệu suất trung bình', 
      value: `${Math.round(progressItems.reduce((sum, item) => sum + item.progress, 0) / progressItems.length)}%`, 
      color: 'from-purple-500 to-purple-600' 
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Tiến độ dịch vụ</h2>
          <p className="text-gray-600">Theo dõi và quản lý tiến độ thực hiện dịch vụ</p>
        </div>
        <button className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2">
          <Play className="w-4 h-4" />
          <span>Bắt đầu dịch vụ</span>
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
            <input
              type="text"
              placeholder="Tìm kiếm khách hàng, xe..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64"
            />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="not-started">Chưa bắt đầu</option>
              <option value="in-progress">Đang thực hiện</option>
              <option value="paused">Tạm dừng</option>
              <option value="completed">Hoàn thành</option>
            </select>
          </div>
        </div>
      </div>

      {/* Progress Items */}
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
                  <div>
                    <div className="text-lg font-bold text-gray-900">#{item.id}</div>
                    <div className="text-sm text-gray-600">{item.serviceType}</div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                    {getStatusText(item.status)}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">{item.progress.toFixed(0)}%</div>
                  <div className="text-sm text-gray-600">
                    {item.actualDuration ? `${item.actualDuration}/${item.estimatedDuration}` : `${item.estimatedDuration}`} phút
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
                  <div className="flex items-center space-x-3 mb-3">
                    <Wrench className="w-5 h-5 text-gray-400" />
                    <div>
                      <div className="text-sm text-gray-600">Kỹ thuật viên</div>
                      <div className="font-medium text-gray-900">{item.technician}</div>
                    </div>
                  </div>
                  {item.startTime && (
                    <div className="flex items-center space-x-3">
                      <Clock className="w-5 h-5 text-gray-400" />
                      <div>
                        <div className="text-sm text-gray-600">Bắt đầu lúc</div>
                        <div className="font-medium text-gray-900">{item.startTime}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full transition-all duration-500 ${
                      item.progress < 30 ? 'bg-red-500' :
                      item.progress < 70 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${item.progress}%` }}
                  ></div>
                </div>
              </div>

              {/* Checklist */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                  <FileText className="w-4 h-4 mr-2" />
                  Danh sách công việc
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {item.checklist.map((task) => (
                    <div key={task.id} className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => handleTaskToggle(item.id, task.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <div className="flex-1">
                        <div className={`text-sm ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                          {task.task}
                        </div>
                        {task.completedAt && (
                          <div className="text-xs text-gray-500">Hoàn thành: {task.completedAt}</div>
                        )}
                      </div>
                      {task.completed && (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Issues */}
              {item.issues && item.issues.length > 0 && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    <span className="text-sm font-medium text-red-800">Vấn đề phát hiện:</span>
                  </div>
                  <ul className="text-sm text-red-700">
                    {item.issues.map((issue, index) => (
                      <li key={index}>• {issue}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Notes */}
              {item.notes && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="text-sm text-blue-800">
                    <span className="font-medium">Ghi chú:</span> {item.notes}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  {item.actualDuration && (
                    <span>Thời gian thực tế: <span className="font-medium">{item.actualDuration} phút</span></span>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  {item.status === 'not-started' && (
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
                  {item.status === 'completed' && (
                    <button 
                      onClick={() => handleStatusChange(item.id, 'in-progress')}
                      className="flex items-center space-x-1 px-3 py-1 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Làm lại</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-10 text-gray-500">
            <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>Không có dịch vụ nào</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceProgress;