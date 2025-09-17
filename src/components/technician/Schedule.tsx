import React, { useState } from 'react';
import { Calendar, Clock, User, Car } from 'lucide-react';
import { mockAppointments, mockVehicles } from '../../data/mockData';

const TechnicianSchedule: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const todayAppointments = mockAppointments.filter(a => a.date === selectedDate);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-10 px-2 md:px-0 flex justify-center items-start">
      <div className="w-full max-w-3xl">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-extrabold text-blue-700 mb-2 drop-shadow">Lịch làm việc kỹ thuật viên</h2>
          <p className="text-gray-500 text-lg">Xem lịch hẹn và công việc trong ngày</p>
        </div>
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-100 overflow-hidden p-8">
          <div className="mb-6 flex items-center space-x-4">
            <Calendar className="w-6 h-6 text-blue-600" />
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          {todayAppointments.length > 0 ? (
            <div className="space-y-4">
              {todayAppointments.map(appt => {
                const vehicle = mockVehicles.find(v => v.id === appt.vehicleId);
                return (
                  <div key={appt.id} className="p-4 bg-blue-50 rounded-xl border border-blue-200 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Car className="w-8 h-8 text-indigo-600" />
                      <div>
                        <div className="font-bold text-blue-700">{vehicle?.model}</div>
                        <div className="text-gray-600 text-sm">VIN: {vehicle?.vin}</div>
                        <div className="text-gray-500 text-sm">Dịch vụ: {appt.services.join(', ')}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-5 h-5 text-blue-600" />
                      <span className="font-semibold text-gray-800">{appt.time}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>Không có lịch hẹn nào trong ngày này</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TechnicianSchedule;
