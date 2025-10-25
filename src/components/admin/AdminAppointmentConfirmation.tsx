import React, { useState, useEffect } from 'react';
import { appointmentService, Appointment } from '../../services/appointmentService';
import { technicianListService, Technician } from '../../services/technicianListService';
import { serviceOrderService, CreateServiceOrderRequest } from '../../services/serviceOrderService';
import { useAuth } from '../../contexts/AuthContext';
import { User, CheckCircle, Clock, AlertCircle, RefreshCw, UserCheck, Car, Wrench, Calendar, MapPin } from 'lucide-react';
import { Card, Button, Modal, Select, Typography, Space, Tag, Tooltip, Badge, Divider, Spin } from 'antd';
import { ReloadOutlined, CheckCircleOutlined, ClockCircleOutlined, ExclamationCircleOutlined, UserOutlined, CarOutlined, ToolOutlined, CalendarOutlined, EnvironmentOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const AdminAppointmentConfirmation: React.FC = () => {
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
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="flex flex-col items-center justify-center min-h-96 space-y-6">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
            <CheckCircleOutlined className="text-white text-2xl" />
          </div>
          <div className="text-center">
            <Title level={3} className="text-gray-700 mb-2">Đang tải danh sách lịch hẹn...</Title>
            <Text type="secondary">Vui lòng chờ trong giây lát</Text>
          </div>
          <Spin size="large" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg">
                <CheckCircleOutlined className="text-white text-2xl" />
              </div>
              <div>
                <Title level={2} className="!mb-1 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  Xác Nhận Dịch Vụ
                </Title>
                <Text type="secondary" className="text-base">
                  Xác nhận và gán kỹ thuật viên cho các lịch hẹn
                </Text>
                <div className="flex items-center space-x-4 mt-2">
                  <div className="flex items-center space-x-1 text-sm text-gray-500">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Hệ thống hoạt động bình thường</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    Tổng cộng: {appointments.length} lịch hẹn
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                icon={<ReloadOutlined />}
                onClick={fetchAppointments}
                disabled={loading}
                className="border-gray-200 hover:border-blue-500 hover:text-blue-500"
                size="large"
              >
                {loading ? 'Đang tải...' : 'Làm mới'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <div className="flex items-center space-x-2 text-red-700">
            <ExclamationCircleOutlined className="text-red-500" />
            <Text className="text-red-700">{error}</Text>
          </div>
        </Card>
      )}

      {/* Appointments Table */}
      <Card className="border-0 shadow-sm">
        <div className="mb-4">
          <Title level={4} className="!mb-0 text-gray-700">
            <CheckCircleOutlined className="mr-2 text-green-500" />
            Danh sách lịch hẹn cần xác nhận
          </Title>
          <Text type="secondary" className="text-sm">
            Quản lý và xác nhận các lịch hẹn dịch vụ
          </Text>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto">
            <thead>
              <tr className="bg-gray-50">
                {/* <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th> */}
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Khách hàng
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Xe
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Dịch vụ
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Trung tâm
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Ngày hẹn
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {appointments.map((appointment) => (
                <tr key={appointment.appointmentID} className="hover:bg-gray-50 transition-colors duration-200">
                  {/* <td className="px-6 py-4 whitespace-nowrap">
                    <Badge 
                      count={appointment.appointmentID} 
                      style={{ backgroundColor: '#1890ff' }}
                      className="!bg-blue-500"
                    />
                  </td> */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <UserOutlined className="text-blue-500 text-sm" />
                      <Text strong className="text-gray-900">{appointment.userName}</Text>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <CarOutlined className="text-green-500 text-sm" />
                      <Text className="text-gray-900">{appointment.vehicleModel}</Text>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <ToolOutlined className="text-orange-500 text-sm" />
                      <Text className="text-gray-900">{appointment.serviceType}</Text>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <EnvironmentOutlined className="text-purple-500 text-sm" />
                      <Text className="text-gray-900">{appointment.centerName}</Text>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <CalendarOutlined className="text-indigo-500 text-sm" />
                      <Text className="text-gray-900">
                        {new Date(appointment.requestedDate).toLocaleDateString('vi-VN')}
                      </Text>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(appointment.status)}
                      <Tag 
                        color={
                          appointment.status.toLowerCase() === 'confirmed' ? 'green' :
                          appointment.status.toLowerCase() === 'pending' ? 'orange' : 'red'
                        }
                        className="border-0"
                      >
                        {appointment.status}
                      </Tag>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {appointment.status.toLowerCase() === 'pending' && (
                      <Button
                        type="primary"
                        icon={<CheckCircleOutlined />}
                        onClick={() => openAssignModal(appointment)}
                        className="!bg-gradient-to-r !from-green-500 !to-emerald-600 hover:!from-green-600 hover:!to-emerald-700 !border-0"
                        size="small"
                      >
                        Xác nhận & Gán kỹ thuật viên
                      </Button>
                    )}
                    {appointment.status.toLowerCase() === 'confirmed' && (
                      <div className="flex items-center space-x-1 text-green-600">
                        <CheckCircleOutlined />
                        <Text className="text-green-600 font-medium">Đã xác nhận</Text>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {appointments.length === 0 && !loading && (
        <Card className="text-center py-12">
          <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-10 h-10 text-gray-400" />
          </div>
          <Title level={3} className="text-gray-700 mb-2">Không có lịch hẹn nào</Title>
          <Text type="secondary" className="text-base">Hiện tại không có lịch hẹn nào cần xác nhận</Text>
        </Card>
      )}

      {/* Assign Technician Modal */}
      <Modal
        title={
          <div className="flex items-center py-2">
            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center mr-3">
              <CheckCircleOutlined className="text-white text-lg" />
            </div>
            <div>
              <div className="text-lg font-semibold text-gray-800">Xác nhận dịch vụ và gán kỹ thuật viên</div>
              <div className="text-sm text-gray-500">Gán kỹ thuật viên phù hợp cho lịch hẹn</div>
            </div>
          </div>
        }
        open={showAssignModal}
        onCancel={() => {
          setShowAssignModal(false);
          setSelectedAppointment(null);
          setSelectedTechnician(null);
        }}
        footer={[
          <Button 
            key="cancel" 
            onClick={() => {
              setShowAssignModal(false);
              setSelectedAppointment(null);
              setSelectedTechnician(null);
            }}
            className="px-6"
          >
            Hủy
          </Button>,
          <Button
            key="confirm"
            type="primary"
            icon={<CheckCircleOutlined />}
            onClick={handleCreateServiceOrder}
            disabled={!selectedTechnician}
            className="!bg-gradient-to-r !from-green-500 !to-emerald-600 hover:!from-green-600 hover:!to-emerald-700 !border-0 px-6"
          >
            Xác nhận & Tạo Service Order
          </Button>,
        ]}
        width={600}
        className="rounded-lg"
      >
        {selectedAppointment && (
          <div className="py-4">
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <Title level={5} className="text-gray-700 mb-4 flex items-center">
                <CalendarOutlined className="mr-2 text-blue-500" />
                Thông tin lịch hẹn
              </Title>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <UserOutlined className="text-blue-500" />
                    <Text strong>Khách hàng:</Text>
                    <Text>{selectedAppointment.userName}</Text>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CarOutlined className="text-green-500" />
                    <Text strong>Xe:</Text>
                    <Text>{selectedAppointment.vehicleModel}</Text>
                  </div>
                  <div className="flex items-center space-x-2">
                    <ToolOutlined className="text-orange-500" />
                    <Text strong>Dịch vụ:</Text>
                    <Text>{selectedAppointment.serviceType}</Text>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <EnvironmentOutlined className="text-purple-500" />
                    <Text strong>Trung tâm:</Text>
                    <Text>{selectedAppointment.centerName}</Text>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CalendarOutlined className="text-indigo-500" />
                    <Text strong>Ngày hẹn:</Text>
                    <Text>{new Date(selectedAppointment.requestedDate).toLocaleDateString('vi-VN')}</Text>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <Text strong className="text-gray-700 mb-2 block">
                Chọn kỹ thuật viên:
              </Text>
              <Select
                value={selectedTechnician}
                onChange={setSelectedTechnician}
                placeholder="-- Chọn kỹ thuật viên --"
                className="w-full"
                size="large"
                showSearch
                optionFilterProp="children"
              >
                {technicians.map((tech) => (
                  <Select.Option key={tech.userID} value={tech.userID}>
                    <div className="flex items-center space-x-2">
                      <UserOutlined className="text-blue-500" />
                      <span>{tech.name}</span>
                      <span className="text-gray-500">- {tech.phone}</span>
                    </div>
                  </Select.Option>
                ))}
              </Select>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminAppointmentConfirmation;
