import React from 'react';
import { Calendar, Wrench, CheckCircle, Clock } from 'lucide-react';
import { mockServiceTickets } from '../../data/mockData';

const TechnicianDashboard: React.FC = () => {
  const myTickets = mockServiceTickets.filter(t => t.technician === 'Phạm Kỹ Thuật');
  
  const stats = [
    { label: 'Công việc hôm nay', value: '3', icon: Calendar, color: 'from-blue-500 to-blue-600' },
    { label: 'Đang thực hiện', value: '1', icon: Wrench, color: 'from-orange-500 to-orange-600' },
    { label: 'Hoàn thành tuần', value: '12', icon: CheckCircle, color: 'from-green-500 to-green-600' },
    { label: 'Giờ làm việc', value: '7.5h', icon: Clock, color: 'from-purple-500 to-purple-600' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Dashboard Kỹ thuật viên</h2>
        <p className="text-gray-600">Theo dõi tiến độ công việc và lịch làm việc</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-lg flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Current Work */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Wrench className="w-5 h-5 mr-2 text-orange-500" />
          Công việc hiện tại
        </h3>
        <div className="space-y-4">
          {myTickets.map((ticket) => (
            <div key={ticket.id} className="border rounded-lg p-4 hover:bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="font-medium text-gray-900">Phiếu #{ticket.id}</div>
                  <div className="text-sm text-gray-600">VinFast VF8 - Khách hàng Nguyễn Văn Nam</div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    ticket.status === 'waiting' ? 'bg-yellow-100 text-yellow-800' :
                    ticket.status === 'working' ? 'bg-orange-100 text-orange-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {ticket.status === 'waiting' ? 'Chờ thực hiện' :
                     ticket.status === 'working' ? 'Đang làm' : 'Hoàn thành'}
                  </span>
                  <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                    Cập nhật
                  </button>
                </div>
              </div>
              
              <div className="text-sm text-gray-600 mb-3">
                Dịch vụ: {ticket.services.join(', ')}
              </div>
              
              {/* Progress */}
              <div className="mb-3">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Tiến độ</span>
                  <span className="text-gray-900">
                    {ticket.checklist.filter(c => c.completed).length}/{ticket.checklist.length}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${(ticket.checklist.filter(c => c.completed).length / ticket.checklist.length) * 100}%` 
                    }}
                  ></div>
                </div>
              </div>
              
              {/* Checklist */}
              <div className="space-y-2">
                {ticket.checklist.map((item) => (
                  <div key={item.id} className="flex items-center space-x-3 text-sm">
                    <input
                      type="checkbox"
                      checked={item.completed}
                      onChange={() => {}}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <span className={item.completed ? 'text-gray-500 line-through' : 'text-gray-700'}>
                      {item.task}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Today's Schedule */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Calendar className="w-5 h-5 mr-2 text-blue-500" />
          Lịch làm việc hôm nay
        </h3>
        <div className="space-y-3">
          <div className="flex items-center space-x-4 p-3 bg-blue-50 rounded-lg">
            <div className="text-blue-600 font-semibold">08:00</div>
            <div className="flex-1">
              <div className="font-medium text-gray-900">Bảo dưỡng VinFast VF8</div>
              <div className="text-sm text-gray-600">Khách hàng: Nguyễn Văn Nam</div>
            </div>
            <div className="text-blue-600 text-sm font-medium">Đang thực hiện</div>
          </div>
          
          <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
            <div className="text-gray-600 font-semibold">10:30</div>
            <div className="flex-1">
              <div className="font-medium text-gray-900">Kiểm tra Tesla Model Y</div>
              <div className="text-sm text-gray-600">Khách hàng: Trần Thị B</div>
            </div>
            <div className="text-gray-600 text-sm">Chờ thực hiện</div>
          </div>
          
          <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
            <div className="text-gray-600 font-semibold">14:00</div>
            <div className="flex-1">
              <div className="font-medium text-gray-900">Thay lốp BMW iX</div>
              <div className="text-sm text-gray-600">Khách hàng: Phạm Văn C</div>
            </div>
            <div className="text-gray-600 text-sm">Chờ thực hiện</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TechnicianDashboard;