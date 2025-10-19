import React, { useState, useEffect } from 'react';
import { appointmentService, Appointment } from '../../services/appointmentService';
import { technicianListService, Technician } from '../../services/technicianListService';
import { serviceOrderService, CreateServiceOrderRequest } from '../../services/serviceOrderService';
import { useAuth } from '../../contexts/AuthContext';
import { User, CheckCircle, Clock, AlertCircle } from 'lucide-react';

const AppointmentConfirmation: React.FC = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [selectedTechnician, setSelectedTechnician] = useState<number | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);

  // Fetch appointments
  const fetchAppointments = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Fetching appointments...');
      const data = await appointmentService.getAllAppointments();
      console.log('Appointments fetched:', data);
      setAppointments(data);
    } catch (err: any) {
      console.error('Error fetching appointments:', err);
      setError(err.message || 'Không thể tải danh sách lịch hẹn');
    } finally {
      setLoading(false);
    }
  };

  // Fetch technicians
  const fetchTechnicians = async () => {
    try {
      console.log('Fetching technicians...');
      const data = await technicianListService.getAllTechnicians();
      console.log('Technicians fetched:', data);
      setTechnicians(data);
    } catch (err: any) {
      console.error('Error fetching technicians:', err);
    }
  };

  // Create service order
  const handleCreateServiceOrder = async () => {
    if (!selectedAppointment || !selectedTechnician) {
      alert('Vui lòng chọn lịch hẹn và kỹ thuật viên');
      return;
    }

    // Check user role
    if (!user || (user.role !== 'staff' && user.role !== 'admin')) {
      alert('Bạn không có quyền tạo Service Order. Chỉ Staff và Admin mới có thể thực hiện thao tác này.');
      return;
    }

    try {
      const request: CreateServiceOrderRequest = {
        appointmentID: selectedAppointment.appointmentID,
        technicianID: selectedTechnician
      };

      console.log('Creating service order with:', request);
      console.log('Current user:', user);
      console.log('Current user role:', user?.role);
      console.log('Access token:', localStorage.getItem('accessToken'));
      
      const result = await serviceOrderService.createServiceOrder(request);
      console.log('Service order created:', result);
      alert('Tạo Service Order thành công!');
      setShowAssignModal(false);
      setSelectedAppointment(null);
      setSelectedTechnician(null);
      fetchAppointments(); // Refresh the list
    } catch (err: any) {
      console.error('Error creating service order:', err);
      alert(err.message || 'Không thể tạo Service Order');
    }
  };

  // Open assign modal
  const openAssignModal = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowAssignModal(true);
  };

  useEffect(() => {
    fetchAppointments();
    fetchTechnicians();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'cancelled':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading && appointments.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Đang tải danh sách lịch hẹn...</div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Xác nhận dịch vụ</h2>
        <button
          onClick={fetchAppointments}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Đang tải...' : 'Làm mới'}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Appointments Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                Khách hàng
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                Xe
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                Dịch vụ
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                Trung tâm
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                Ngày hẹn
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                Trạng thái
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {appointments.map((appointment) => (
              <tr key={appointment.appointmentID} className="hover:bg-gray-50">
                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  #{appointment.appointmentID}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  {appointment.userName}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  {appointment.vehicleModel}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  {appointment.serviceType}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  {appointment.centerName}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(appointment.requestedDate).toLocaleDateString('vi-VN')}
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {getStatusIcon(appointment.status)}
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                      {appointment.status}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                  {appointment.status.toLowerCase() === 'pending' && (
                    <button
                      onClick={() => openAssignModal(appointment)}
                      className="text-blue-600 hover:text-blue-900 bg-blue-100 hover:bg-blue-200 px-3 py-1 rounded-md transition-colors"
                    >
                      Xác nhận & Gán kỹ thuật viên
                    </button>
                  )}
                  {appointment.status.toLowerCase() === 'confirmed' && (
                    <span className="text-green-600">Đã xác nhận</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {appointments.length === 0 && !loading && (
        <div className="text-center py-8">
          <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Không có lịch hẹn nào</h3>
          <p className="text-gray-600">Hiện tại không có lịch hẹn nào cần xác nhận</p>
        </div>
      )}

      {/* Assign Technician Modal */}
      {showAssignModal && selectedAppointment && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Xác nhận dịch vụ và gán kỹ thuật viên
              </h3>
              
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Thông tin lịch hẹn:</h4>
                <p><strong>Khách hàng:</strong> {selectedAppointment.userName}</p>
                <p><strong>Xe:</strong> {selectedAppointment.vehicleModel}</p>
                <p><strong>Dịch vụ:</strong> {selectedAppointment.serviceType}</p>
                <p><strong>Trung tâm:</strong> {selectedAppointment.centerName}</p>
                <p><strong>Ngày hẹn:</strong> {new Date(selectedAppointment.requestedDate).toLocaleDateString('vi-VN')}</p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chọn kỹ thuật viên:
                </label>
                <select
                  value={selectedTechnician || ''}
                  onChange={(e) => setSelectedTechnician(Number(e.target.value))}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">-- Chọn kỹ thuật viên --</option>
                  {technicians.map((tech) => (
                    <option key={tech.userID} value={tech.userID}>
                      {tech.name} - {tech.phone}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowAssignModal(false);
                    setSelectedAppointment(null);
                    setSelectedTechnician(null);
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Hủy
                </button>
                <button
                  onClick={handleCreateServiceOrder}
                  disabled={!selectedTechnician}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
                >
                  Xác nhận & Tạo Service Order
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentConfirmation;
