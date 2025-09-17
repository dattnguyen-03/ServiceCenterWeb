import React, { useState } from 'react';
import { 
  Clock, 
  Play, 
  CheckCircle,
  AlertTriangle,
  User
} from 'lucide-react';
import { mockServiceTickets, mockVehicles } from '../../data/mockData';
import type { ServiceTicket, Vehicle } from '../../types';

interface Column {
  id: 'waiting' | 'working' | 'completed';
  title: string;
  color: string;
  icon: any;
  iconColor: string;
}

const ServiceProgress: React.FC = () => {
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  
  const columns: Column[] = [
    { id: 'waiting', title: 'Chờ thực hiện', color: 'bg-yellow-50 border-yellow-200', icon: Clock, iconColor: 'text-yellow-600' },
    { id: 'working', title: 'Đang thực hiện', color: 'bg-blue-50 border-blue-200', icon: Play, iconColor: 'text-blue-600' },
    { id: 'completed', title: 'Hoàn thành', color: 'bg-green-50 border-green-200', icon: CheckCircle, iconColor: 'text-green-600' }
  ];

  const getTicketsByStatus = (status: 'waiting' | 'working' | 'completed'): ServiceTicket[] => {
    return mockServiceTickets.filter(ticket => ticket.status === status);
  };

  const getVehicleInfo = (vehicleId: string): Vehicle | undefined => {
    return mockVehicles.find(v => v.id === vehicleId);
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, ticketId: string) => {
    setDraggedItem(ticketId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, newStatus: 'waiting' | 'working' | 'completed') => {
    e.preventDefault();
    if (draggedItem) {
      // Here you would update the ticket status
      console.log(`Moving ticket ${draggedItem} to ${newStatus}`);
      setDraggedItem(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Tiến độ dịch vụ</h2>
        <p className="text-gray-600">Theo dõi và quản lý tiến độ các phiếu dịch vụ</p>
      </div>
       {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {getTicketsByStatus('waiting').length}
              </div>
              <div className="text-sm text-gray-600">Chờ thực hiện</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Play className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {getTicketsByStatus('working').length}
              </div>
              <div className="text-sm text-gray-600">Đang thực hiện</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {getTicketsByStatus('completed').length}
              </div>
              <div className="text-sm text-gray-600">Hoàn thành</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">2.5h</div>
              <div className="text-sm text-gray-600">Thời gian TB</div>
            </div>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {columns.map((column) => {
          const Icon = column.icon;
          const tickets = getTicketsByStatus(column.id);
          
          return (
            <div
              key={column.id}
              className={`${column.color} rounded-xl border-2 border-dashed p-4 min-h-[600px]`}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, column.id)}
            >
              <div className="flex items-center space-x-3 mb-4">
                <Icon className={`w-6 h-6 ${column.iconColor}`} />
                <h3 className="text-lg font-semibold text-gray-900">{column.title}</h3>
                <span className="bg-white px-2 py-1 rounded-full text-sm font-medium text-gray-600">
                  {tickets.length}
                </span>
              </div>

              <div className="space-y-4">
                {tickets.map((ticket) => {
                  const vehicle = getVehicleInfo(ticket.vehicleId);
                  const completedTasks = ticket.checklist.filter(item => item.completed).length;
                  const totalTasks = ticket.checklist.length;
                  const progress = (completedTasks / totalTasks) * 100;

                  return (
                    <div
                      key={ticket.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, ticket.id)}
                      className="bg-white rounded-lg shadow-md p-4 cursor-move hover:shadow-lg transition-shadow duration-200 border border-gray-200"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="font-semibold text-gray-900">Phiếu #{ticket.id}</div>
                        <div className="flex items-center space-x-2">
                          {ticket.status === 'working' && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                          )}
                          <span className="text-xs text-gray-500">
                            {ticket.startTime}
                          </span>
                        </div>
                      </div>

                      <div className="mb-3">
                        <div className="font-medium text-gray-800">{vehicle?.model}</div>
                        <div className="text-sm text-gray-600">VIN: {vehicle?.vin}</div>
                      </div>

                      <div className="mb-3">
                        <div className="text-sm text-gray-600 mb-1">Dịch vụ:</div>
                        <div className="flex flex-wrap gap-1">
                          {ticket.services.map((service, index) => (
                            <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                              {service}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="mb-3">
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <User className="w-4 h-4" />
                          <span>{ticket.technician}</span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mb-3">
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

                      {/* Checklist Preview */}
                      <div className="space-y-1">
                        {ticket.checklist.slice(0, 3).map((item) => (
                          <div key={item.id} className="flex items-center space-x-2 text-sm">
                            <div className={`w-3 h-3 rounded-full ${
                              item.completed ? 'bg-green-500' : 'bg-gray-300'
                            }`}></div>
                            <span className={item.completed ? 'text-gray-500 line-through' : 'text-gray-700'}>
                              {item.task}
                            </span>
                          </div>
                        ))}
                        {ticket.checklist.length > 3 && (
                          <div className="text-xs text-gray-500 ml-5">
                            +{ticket.checklist.length - 3} mục khác
                          </div>
                        )}
                      </div>

                      {/* Cost */}
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Chi phí:</span>
                          <span className="font-semibold text-gray-900">
                            {ticket.cost.toLocaleString('vi-VN')} đ
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="mt-3 flex space-x-2">
                        <button className="flex-1 text-blue-600 hover:text-blue-800 text-sm font-medium py-1">
                          Chi tiết
                        </button>
                        {ticket.status === 'waiting' && (
                          <button className="flex-1 bg-blue-600 text-white text-sm font-medium py-1 px-2 rounded hover:bg-blue-700 transition-colors duration-200">
                            Bắt đầu
                          </button>
                        )}
                        {ticket.status === 'working' && (
                          <button className="flex-1 bg-green-600 text-white text-sm font-medium py-1 px-2 rounded hover:bg-green-700 transition-colors duration-200">
                            Hoàn thành
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}

                {tickets.length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    <Icon className="w-12 h-12 mx-auto mb-3" />
                    <p>Không có phiếu dịch vụ nào</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ServiceProgress;