import React, { useState } from 'react';
import { Wrench, Clock, CheckCircle, AlertTriangle, User, Car } from 'lucide-react';
import { mockServiceTickets, mockVehicles } from '../../data/mockData';

const WorkOrders: React.FC = () => {
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  
  const myTickets = mockServiceTickets.filter(t => t.technician === 'Phạm Kỹ Thuật');
  
  const getVehicleInfo = (vehicleId: string) => {
    return mockVehicles.find(v => v.id === vehicleId);
  };

  const updateChecklistItem = (ticketId: string, itemId: string, completed: boolean) => {
    // In a real app, this would update the backend
    console.log(`Updating checklist item ${itemId} in ticket ${ticketId} to ${completed}`);
  };

  const updateTicketStatus = (ticketId: string, newStatus: string) => {
    // In a real app, this would update the backend
    console.log(`Updating ticket ${ticketId} status to ${newStatus}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Lệnh công việc</h2>
        <p className="text-gray-600">Quản lý và cập nhật tiến độ công việc được giao</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Work Orders List */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Danh sách công việc</h3>
          
          {myTickets.map((ticket) => {
            const vehicle = getVehicleInfo(ticket.vehicleId);
            const completedTasks = ticket.checklist.filter(item => item.completed).length;
            const totalTasks = ticket.checklist.length;
            const progress = (completedTasks / totalTasks) * 100;
            
            return (
              <div
                key={ticket.id}
                onClick={() => setSelectedTicket(ticket.id)}
                className={`bg-white rounded-lg shadow-md p-4 cursor-pointer transition-all duration-200 border-2 ${
                  selectedTicket === ticket.id ? 'border-blue-500 shadow-lg' : 'border-gray-200 hover:shadow-lg'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="font-semibold text-gray-900">Phiếu #{ticket.id}</div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    ticket.status === 'waiting' ? 'bg-yellow-100 text-yellow-800' :
                    ticket.status === 'working' ? 'bg-blue-100 text-blue-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {ticket.status === 'waiting' ? 'Chờ thực hiện' :
                     ticket.status === 'working' ? 'Đang làm' : 'Hoàn thành'}
                  </span>
                </div>

                <div className="mb-3">
                  <div className="font-medium text-gray-800">{vehicle?.model}</div>
                  <div className="text-sm text-gray-600">VIN: {vehicle?.vin}</div>
                </div>

                <div className="mb-3">
                  <div className="text-sm text-gray-600 mb-1">Dịch vụ:</div>
                  <div className="flex flex-wrap gap-1">
                    {ticket.services.slice(0, 2).map((service, index) => (
                      <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                        {service}
                      </span>
                    ))}
                    {ticket.services.length > 2 && (
                      <span className="text-xs text-gray-500">+{ticket.services.length - 2}</span>
                    )}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Tiến độ</span>
                    <span className="font-medium">{completedTasks}/{totalTasks}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        progress === 100 ? 'bg-green-500' : 
                        progress > 50 ? 'bg-blue-500' : 'bg-yellow-500'
                      }`}
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>

                <div className="text-sm text-gray-500">
                  {ticket.startTime ? `Bắt đầu: ${ticket.startTime}` : 'Chưa bắt đầu'}
                </div>
              </div>
            );
          })}
        </div>

        {/* Work Order Details */}
        <div className="lg:col-span-2">
          {selectedTicket ? (
            (() => {
              const ticket = myTickets.find(t => t.id === selectedTicket);
              const vehicle = getVehicleInfo(ticket?.vehicleId || '');
              
              if (!ticket) return null;
              
              return (
                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Phiếu dịch vụ #{ticket.id}</h3>
                      <p className="text-gray-600">{vehicle?.model} - VIN: {vehicle?.vin}</p>
                    </div>
                    <div className="flex space-x-2">
                      {ticket.status === 'waiting' && (
                        <button
                          onClick={() => updateTicketStatus(ticket.id, 'working')}
                          className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                        >
                          Bắt đầu làm việc
                        </button>
                      )}
                      {ticket.status === 'working' && (
                        <button
                          onClick={() => updateTicketStatus(ticket.id, 'completed')}
                          className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors duration-200"
                        >
                          Hoàn thành
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Vehicle Info */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <Car className="w-5 h-5 mr-2 text-blue-500" />
                      Thông tin xe
                    </h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Model:</span>
                        <span className="ml-2 font-medium">{vehicle?.model}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Năm:</span>
                        <span className="ml-2 font-medium">{vehicle?.year}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">VIN:</span>
                        <span className="ml-2 font-medium">{vehicle?.vin}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Km đã đi:</span>
                        <span className="ml-2 font-medium">{vehicle?.mileage.toLocaleString()} km</span>
                      </div>
                    </div>
                  </div>

                  {/* Services */}
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 mb-3">Dịch vụ yêu cầu</h4>
                    <div className="flex flex-wrap gap-2">
                      {ticket.services.map((service, index) => (
                        <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                          {service}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Checklist */}
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
                      Danh sách công việc
                    </h4>
                    <div className="space-y-3">
                      {ticket.checklist.map((item) => (
                        <div key={item.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                          <input
                            type="checkbox"
                            checked={item.completed}
                            onChange={(e) => updateChecklistItem(ticket.id, item.id, e.target.checked)}
                            className="w-5 h-5 text-blue-600 rounded mt-0.5"
                          />
                          <div className="flex-1">
                            <div className={`font-medium ${item.completed ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                              {item.task}
                            </div>
                            {item.notes && (
                              <div className="text-sm text-gray-600 mt-1">{item.notes}</div>
                            )}
                          </div>
                          {item.completed && (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Notes Section */}
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 mb-3">Ghi chú kỹ thuật</h4>
                    <textarea
                      placeholder="Thêm ghi chú về tình trạng xe, vấn đề phát hiện, hoặc khuyến nghị..."
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows={4}
                      defaultValue={ticket.notes}
                    />
                  </div>

                  {/* Time Tracking */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <Clock className="w-5 h-5 text-blue-600" />
                        <span className="font-medium text-blue-900">Thời gian bắt đầu</span>
                      </div>
                      <div className="text-lg font-bold text-blue-900">
                        {ticket.startTime || 'Chưa bắt đầu'}
                      </div>
                    </div>
                    
                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="font-medium text-green-900">Thời gian kết thúc</span>
                      </div>
                      <div className="text-lg font-bold text-green-900">
                        {ticket.endTime || 'Chưa hoàn thành'}
                      </div>
                    </div>
                    
                    <div className="bg-purple-50 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <AlertTriangle className="w-5 h-5 text-purple-600" />
                        <span className="font-medium text-purple-900">Chi phí dự kiến</span>
                      </div>
                      <div className="text-lg font-bold text-purple-900">
                        {ticket.cost.toLocaleString('vi-VN')} đ
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end space-x-3">
                    <button className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                      Lưu nháp
                    </button>
                    <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200">
                      Cập nhật tiến độ
                    </button>
                  </div>
                </div>
              );
            })()
          ) : (
            <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100 text-center">
              <Wrench className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Chọn lệnh công việc</h3>
              <p className="text-gray-600">Chọn một phiếu dịch vụ từ danh sách để xem chi tiết và cập nhật tiến độ</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkOrders;