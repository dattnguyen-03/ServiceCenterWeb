import React, { useState } from 'react';
import { Calendar, Clock, MapPin, Car, CheckCircle } from 'lucide-react';
import { mockVehicles } from '../../data/mockData';

const AppointmentBooking: React.FC = () => {
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [selectedCenter, setSelectedCenter] = useState('');
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  const vehicles = mockVehicles.filter(v => v.customerId === '1');
  
  const serviceCenters = [
    'Trung tâm Hà Nội - 123 Nguyễn Trãi, Thanh Xuân',
    'Trung tâm TP.HCM - 456 Lê Văn Việt, Quận 9',
    'Trung tâm Đà Nẵng - 789 Nguyễn Văn Linh, Hải Châu'
  ];

  const serviceTypes = [
    { id: 'maintenance', name: 'Bảo dưỡng định kỳ', price: 2500000 },
    { id: 'battery', name: 'Kiểm tra pin', price: 1500000 },
    { id: 'tires', name: 'Thay lốp', price: 3500000 },
    { id: 'electrical', name: 'Kiểm tra hệ thống điện', price: 2000000 },
    { id: 'software', name: 'Cập nhật phần mềm', price: 500000 },
    { id: 'cleaning', name: 'Vệ sinh tổng thể', price: 800000 }
  ];

  const timeSlots = [
    '08:00', '09:00', '10:00', '11:00', 
    '13:00', '14:00', '15:00', '16:00', '17:00'
  ];

  const handleServiceToggle = (serviceId: string) => {
    if (selectedServices.includes(serviceId)) {
      setSelectedServices(selectedServices.filter(s => s !== serviceId));
    } else {
      setSelectedServices([...selectedServices, serviceId]);
    }
  };

  const getTotalCost = () => {
    return selectedServices.reduce((total, serviceId) => {
      const service = serviceTypes.find(s => s.id === serviceId);
      return total + (service?.price || 0);
    }, 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle appointment booking
    alert('Đặt lịch thành công! Chúng tôi sẽ liên hệ xác nhận trong thời gian sớm nhất.');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">Đặt Lịch Hẹn Dịch Vụ</h1>
          <p className="mt-2 text-lg text-gray-600">Nhanh chóng, tiện lợi và chuyên nghiệp.</p>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Form Inputs, static column */ }
          <div className="lg:col-span-2 space-y-4">
            {/* Vehicle Selection */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <Car className="w-6 h-6 mr-3 text-blue-600" />
                1. Chọn xe của bạn
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {vehicles.map((vehicle) => (
                  <label key={vehicle.id} className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${selectedVehicle === vehicle.id ? 'bg-blue-50 border-blue-500 shadow-sm' : 'hover:bg-gray-50'}`}>
                    <input
                      type="radio"
                      name="vehicle"
                      value={vehicle.id}
                      checked={selectedVehicle === vehicle.id}
                      onChange={(e) => setSelectedVehicle(e.target.value)}
                      className="w-5 h-5 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="ml-4">
                      <div className="font-bold text-gray-900">{vehicle.model}</div>
                      <div className="text-sm text-gray-500">Biển số: {vehicle.vin}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Service Center */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <MapPin className="w-6 h-6 mr-3 text-green-600" />
                2. Chọn trung tâm dịch vụ
              </h3>
              <select
                value={selectedCenter}
                onChange={(e) => setSelectedCenter(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                required
              >
                <option value="" disabled>Chọn một trung tâm</option>
                {serviceCenters.map((center) => (
                  <option key={center} value={center}>{center}</option>
                ))}
              </select>
            </div>

            {/* Service Types */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">3. Chọn dịch vụ</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {serviceTypes.map((service) => (
                  <label
                    key={service.id}
                    className={`flex flex-col items-center justify-center p-4 border rounded-lg cursor-pointer transition-all ${selectedServices.includes(service.id) ? 'bg-blue-50 border-blue-500 shadow-sm' : 'hover:bg-gray-50'}`}
                    onClick={() => handleServiceToggle(service.id)}
                  >
                    <CheckCircle className={`w-8 h-8 mb-2 ${selectedServices.includes(service.id) ? 'text-blue-600' : 'text-gray-300'}`} />
                    <span className="text-center font-medium text-gray-800">{service.name}</span>
                    <span className="text-sm text-gray-500">{service.price.toLocaleString('vi-VN')} VNĐ</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Date & Time Selection */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">4. Chọn ngày và giờ</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Date Selection */}
                <div>
                  <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <Calendar className="w-5 h-5 mr-2 text-gray-500" />
                    Ngày hẹn
                  </label>
                  <input
                    type="date"
                    id="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    required
                  />
                </div>
                {/* Time Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <Clock className="w-5 h-5 mr-2 text-gray-500" />
                    Khung giờ
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {timeSlots.map((time) => (
                      <button
                        key={time}
                        type="button"
                        onClick={() => setSelectedTime(time)}
                        className={`p-2 border rounded-lg text-sm transition-all ${selectedTime === time ? 'bg-blue-600 text-white font-semibold' : 'bg-white hover:bg-gray-100'}`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Summary & Booking, dynamic column */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-4">Tóm tắt lịch hẹn</h3>
              
              <div className="space-y-4">
                {selectedVehicle && (
                  <div className="flex items-start">
                    <Car className="w-5 h-5 mr-3 mt-1 text-blue-600 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-gray-800">{vehicles.find(v => v.id === selectedVehicle)?.model}</p>
                      <p className="text-sm text-gray-500">Biển số: {vehicles.find(v => v.id === selectedVehicle)?.vin}</p>
                    </div>
                  </div>
                )}

                {selectedCenter && (
                  <div className="flex items-start">
                    <MapPin className="w-5 h-5 mr-3 mt-1 text-green-600 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-gray-800">Trung tâm</p>
                      <p className="text-sm text-gray-500">{selectedCenter}</p>
                    </div>
                  </div>
                )}

                {(selectedDate || selectedTime) && (
                  <div className="flex items-start">
                    <Calendar className="w-5 h-5 mr-3 mt-1 text-gray-600 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-gray-800">Thời gian</p>
                      <p className="text-sm text-gray-500">{selectedDate} lúc {selectedTime}</p>
                    </div>
                  </div>
                )}

                {selectedServices.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                      <CheckCircle className="w-5 h-5 mr-3 text-gray-600" />
                      Dịch vụ đã chọn
                    </h4>
                    <ul className="space-y-2 pl-8">
                      {selectedServices.map(serviceId => {
                        return (
                          <li key={serviceId} className="flex justify-between text-sm">
                            <span className="text-gray-600">{serviceTypes.find(s => s.id === serviceId)?.name}</span>
                            <span className="font-medium text-gray-800">{serviceTypes.find(s => s.id === serviceId)?.price.toLocaleString('vi-VN')} VNĐ</span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
              </div>

              <div className="border-t my-6"></div>

              <div className="flex justify-between items-center text-xl font-bold">
                <span>Tổng cộng:</span>
                <span>{getTotalCost().toLocaleString('vi-VN')} VNĐ</span>
              </div>

              <button 
                type="submit"
                className="w-full mt-6 bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition-all disabled:bg-gray-400 flex items-center justify-center"
                disabled={!selectedVehicle || !selectedCenter || !selectedDate || !selectedTime || selectedServices.length === 0}
              >
                <CheckCircle className="w-5 h-5 mr-2" />
                Xác nhận đặt lịch
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AppointmentBooking;