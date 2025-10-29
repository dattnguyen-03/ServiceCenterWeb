import React, { useState, useEffect } from 'react';
import { appointmentService, Appointment } from '../../services/appointmentService';
import { technicianListService, Technician } from '../../services/technicianListService';
import { serviceOrderService, CreateServiceOrderRequest } from '../../services/serviceOrderService';
import { useAuth } from '../../contexts/AuthContext';
import { User, CheckCircle, Clock, AlertCircle, RefreshCw, UserCheck, Car, Wrench, Calendar, MapPin } from 'lucide-react';
import { Card, Button, Modal, Select, Typography, Space, Tag, Tooltip, Badge, Divider, Spin, Input, Form, message, Descriptions } from 'antd';
import { ReloadOutlined, CheckCircleOutlined, ClockCircleOutlined, ExclamationCircleOutlined, UserOutlined, CarOutlined, ToolOutlined, CalendarOutlined, EnvironmentOutlined, SearchOutlined, EditOutlined, DeleteOutlined, DollarOutlined, FileTextOutlined, EyeOutlined } from '@ant-design/icons';
import Swal from 'sweetalert2';
import { httpClient } from '../../services/httpClient';
import InvoiceViewer from '../common/InvoiceViewer';

const { Title, Text } = Typography;

const AppointmentConfirmation: React.FC = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [selectedTechnician, setSelectedTechnician] = useState<number | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [form] = Form.useForm();
  const [invoiceVisible, setInvoiceVisible] = useState(false);
  const [selectedPaymentID, setSelectedPaymentID] = useState<number | undefined>(undefined);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedAppointmentForDetail, setSelectedAppointmentForDetail] = useState<Appointment | null>(null);

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
      Swal.fire({
        icon: 'warning',
        title: 'Thiếu thông tin',
        text: 'Vui lòng chọn lịch hẹn và kỹ thuật viên',
        confirmButtonColor: '#10b981',
        confirmButtonText: 'Đã hiểu'
      });
      return;
    }

    // Check user role
    if (!user || (user.role !== 'staff' && user.role !== 'admin')) {
      Swal.fire({
        icon: 'error',
        title: 'Không có quyền',
        text: 'Bạn không có quyền tạo Service Order. Chỉ Staff và Admin mới có thể thực hiện thao tác này.',
        confirmButtonColor: '#ef4444',
        confirmButtonText: 'Đã hiểu'
      });
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
      Swal.fire({
        icon: 'success',
        title: 'Thành công!',
        text: 'Tạo Service Order thành công!',
        confirmButtonColor: '#10b981',
        confirmButtonText: 'OK'
      });
      setShowAssignModal(false);
      setSelectedAppointment(null);
      setSelectedTechnician(null);
      fetchAppointments(); // Refresh the list
    } catch (err: any) {
      console.error('Error creating service order:', err);
      Swal.fire({
        icon: 'error',
        title: 'Lỗi',
        text: err.message || 'Không thể tạo Service Order',
        confirmButtonColor: '#ef4444',
        confirmButtonText: 'Đã hiểu'
      });
    }
  };

  // Open assign modal
  const openAssignModal = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowAssignModal(true);
  };

  // Search appointments
  const handleSearch = async (keyword: string) => {
    if (!keyword.trim()) {
      fetchAppointments();
      return;
    }

    setLoading(true);
    setError(null);
    try {
      console.log('Searching appointments with keyword:', keyword);
      const data = await appointmentService.searchAppointments(keyword);
      console.log('Search results:', data);
      setAppointments(data);
    } catch (err: any) {
      console.error('Error searching appointments:', err);
      setError(err.message || 'Không thể tìm kiếm lịch hẹn');
      message.error(err.message || 'Không thể tìm kiếm lịch hẹn');
    } finally {
      setLoading(false);
    }
  };

  // Edit appointment
  const handleEdit = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setShowEditModal(true);
    form.setFieldsValue({
      serviceType: appointment.serviceType,
      requestedDate: appointment.requestedDate,
      status: appointment.status,
    });
  };

  const handleUpdateAppointment = async (values: any) => {
    if (!editingAppointment) return;

    try {
      // If changing status to confirmed, require technician assignment
      if (values.status === 'confirmed' && editingAppointment.status !== 'confirmed') {
        Swal.fire({
          icon: 'warning',
          title: 'Không thể thay đổi trạng thái',
          text: 'Không thể thay đổi trạng thái thành "Confirmed" trực tiếp. Vui lòng sử dụng nút "Xác nhận" để phân công kỹ thuật viên.',
          confirmButtonColor: '#10b981',
          confirmButtonText: 'Đã hiểu'
        });
        return;
      }

      const result = await appointmentService.editAppointment({
        appointmentID: editingAppointment.appointmentID,
        serviceType: values.serviceType,
        vehicleID: editingAppointment.vehicleID || 1,
        serviceCenterID: editingAppointment.serviceCenterID || 1,
        requestedDate: values.requestedDate,
        status: values.status,
      });
      
      message.success(result);
      setShowEditModal(false);
      setEditingAppointment(null);
      form.resetFields();
      fetchAppointments();
    } catch (err: any) {
      console.error('Error updating appointment:', err);
      message.error(err.message || 'Không thể cập nhật lịch hẹn');
    }
  };

  // Handle export invoice
  const handleExportInvoice = async (appointment: Appointment) => {
    if (appointment.paymentStatus !== 'completed') {
      message.warning('Chỉ có thể xuất hóa đơn cho các thanh toán đã hoàn tất');
      return;
    }
    
    // Dùng appointmentID trực tiếp, không cần tìm paymentID
    // InvoiceService sẽ tự động tìm payment từ appointmentID
    setSelectedPaymentID(undefined);
    setSelectedAppointment(appointment);
    setInvoiceVisible(true);
  };

  // Confirm cash payment
  const handleConfirmCashPayment = async (appointment: Appointment) => {
    console.log('Appointment data for payment:', appointment);
    
    const paymentAmountText = appointment.paymentAmount 
      ? `<p><strong>Số tiền:</strong> ${appointment.paymentAmount.toLocaleString('vi-VN')} ₫</p>`
      : '<p><strong>Số tiền:</strong> Sẽ được cập nhật sau khi xác nhận</p>';

    const result = await Swal.fire({
      title: 'Xác nhận thanh toán',
      html: `
        <p>Bạn có chắc chắn khách hàng đã thanh toán?</p>
        <p><strong>Khách hàng:</strong> ${appointment.userName}</p>
        <p><strong>Xe:</strong> ${appointment.vehicleModel}</p>
        ${paymentAmountText}
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Xác nhận đã thanh toán',
      cancelButtonText: 'Hủy',
      reverseButtons: true
    });

    if (result.isConfirmed) {
      try {
        // Use appointmentID to update payment status
        const response = await httpClient.put<{ message?: string; success?: boolean }>(
          '/UpdatePaymentAPI',
          {
            appointmentID: appointment.appointmentID,
            status: 'completed'
          }
        );

        const anyRes: any = response;
        
        if (anyRes.success !== false && (anyRes.message || anyRes.success)) {
          Swal.fire({
            icon: 'success',
            title: 'Thành công!',
            text: anyRes.message || 'Đã xác nhận thanh toán thành công',
            confirmButtonColor: '#10b981',
            confirmButtonText: 'OK'
          });
          fetchAppointments();
        } else {
          throw new Error(anyRes.message || 'Không thể xác nhận thanh toán');
        }
      } catch (err: any) {
        console.error('Error confirming payment:', err);
        
        // If the first attempt failed, try creating a payment record
        if (err.message?.includes('Không tìm thấy giao dịch thanh toán')) {
          try {
            const { value: amount } = await Swal.fire({
              title: 'Tạo thanh toán mới',
              html: `
                <p>Không tìm thấy giao dịch thanh toán cho lịch hẹn này.</p>
                <p>Vui lòng nhập số tiền thanh toán:</p>
              `,
              input: 'number',
              inputLabel: 'Số tiền (VNĐ)',
              inputValue: appointment.paymentAmount || 100000,
              inputPlaceholder: 'Nhập số tiền...',
              showCancelButton: true,
              confirmButtonColor: '#10b981',
              cancelButtonColor: '#6b7280',
              confirmButtonText: 'Tạo thanh toán',
              cancelButtonText: 'Hủy',
              inputValidator: (value) => {
                if (!value || parseInt(value) <= 0) {
                  return 'Vui lòng nhập số tiền hợp lệ';
                }
                return null;
              }
            });

            if (amount) {
              // Create a new payment record
              const createResponse = await httpClient.post('/CreatePaymentAPI', {
                appointmentID: appointment.appointmentID,
                amount: parseInt(amount),
                paymentMethod: 'cash',
                status: 'completed',
                description: 'Thanh toán tiền mặt tại quầy'
              });
              
              Swal.fire({
                icon: 'success',
                title: 'Thành công!',
                text: 'Đã tạo và xác nhận thanh toán thành công',
                confirmButtonColor: '#10b981',
                confirmButtonText: 'OK'
              });
              fetchAppointments();
            }
          } catch (createErr: any) {
            console.error('Error creating payment:', createErr);
            Swal.fire({
              icon: 'error',
              title: 'Lỗi',
              text: createErr.message || 'Không thể tạo thanh toán mới. Có thể cần tạo Service Order trước.',
              confirmButtonColor: '#ef4444',
              confirmButtonText: 'Đã hiểu'
            });
          }
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Lỗi',
            text: err.message || 'Không thể xác nhận thanh toán',
            confirmButtonColor: '#ef4444',
            confirmButtonText: 'Đã hiểu'
          });
        }
      }
    }
  };

  // Delete appointment
  const handleDelete = async (appointmentID: number, appointment: Appointment) => {
    // Check if appointment can be deleted
    const canDelete = appointment.status.toLowerCase() === 'completed' || 
                      appointment.status.toLowerCase() === 'cancelled';
    
    if (!canDelete) {
      Swal.fire({
        icon: 'warning',
        title: 'Không thể xóa',
        text: `Lịch hẹn có trạng thái "${appointment.status}" không thể xóa. Chỉ có thể xóa khi lịch hẹn đã hoàn thành hoặc đã bị hủy.`,
        confirmButtonColor: '#10b981',
        confirmButtonText: 'Đã hiểu'
      });
      return;
    }

    const result = await Swal.fire({
      title: 'Xác nhận xóa',
      html: `Bạn có chắc chắn muốn xóa lịch hẹn này?<br><br><small>Nếu có Service Orders liên quan, chúng sẽ được xóa tự động.</small>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy',
      reverseButtons: true
    });

    if (result.isConfirmed) {
      try {
        // First, try to delete associated service orders
        try {
          const allServiceOrders = await serviceOrderService.getMyServiceOrders();
          const relatedOrders = allServiceOrders.filter(so => so.appointmentID === appointmentID);
          
          if (relatedOrders.length > 0) {
            for (const order of relatedOrders) {
              await serviceOrderService.deleteServiceOrder(order.OrderID || order.orderID || 0);
            }
          }
        } catch (serviceOrderError) {
          console.error('Error deleting service orders:', serviceOrderError);
          // Continue with appointment deletion even if service order deletion fails
        }

        const deleteResult = await appointmentService.deleteAppointment(appointmentID);
        Swal.fire({
          icon: 'success',
          title: 'Đã xóa!',
          text: deleteResult,
          confirmButtonColor: '#10b981',
          confirmButtonText: 'OK'
        });
        fetchAppointments();
      } catch (err: any) {
        console.error('Error deleting appointment:', err);
        Swal.fire({
          icon: 'error',
          title: 'Không thể xóa lịch hẹn',
          text: err.message || 'Không thể xóa lịch hẹn. Vui lòng thử lại sau.',
          confirmButtonColor: '#ef4444',
          confirmButtonText: 'Đã hiểu'
        });
      }
    }
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
      <div className="p-0">
        <div className="flex flex-col items-center justify-center min-h-96 space-y-6">
          <div className="w-16 h-16 bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg">
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
    <div className="p-0">
      {/* Header */}
      <div className="mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg">
                <CheckCircleOutlined className="text-white text-lg" />
              </div>
              <div>
                <Title level={3} className="!mb-0 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  Xác Nhận Dịch Vụ
                </Title>
                <Text type="secondary" className="text-sm">
                  Tổng: {appointments.length} lịch hẹn
                </Text>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                icon={<ReloadOutlined />}
                onClick={fetchAppointments}
                disabled={loading}
                className="border-gray-200 hover:border-green-500 hover:text-green-500"
                size="middle"
              >
                {loading ? 'Tải...' : 'Làm mới'}
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

      {/* Appointments Table - Simplified */}
      <Card className="border-0 shadow-sm">
        <div className="mb-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <div>
            <Title level={5} className="!mb-0 text-gray-700 flex items-center">
              <CheckCircleOutlined className="mr-2 text-green-500" />
              Danh sách lịch hẹn
            </Title>
          </div>
          <div className="w-full sm:w-48 lg:w-64">
            <Input.Search
              placeholder="Tìm kiếm..."
              size="middle"
              allowClear
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onSearch={handleSearch}
              enterButton={<SearchOutlined />}
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Khách hàng</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden md:table-cell">Xe</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden lg:table-cell">Dịch vụ</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày hẹn</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">Thanh toán</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thao tác</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {appointments.map((appointment) => (
                <tr key={appointment.appointmentID} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-2">
                      <UserOutlined className="text-blue-500" />
                      <Text strong className="text-sm">{appointment.userName}</Text>
                    </div>
                    <div className="text-xs text-gray-500 mt-1 md:hidden">{appointment.vehicleModel}</div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <div className="flex items-center space-x-2">
                      <CarOutlined className="text-green-500" />
                      <Text className="text-sm">{appointment.vehicleModel}</Text>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <Text className="text-sm">{appointment.serviceType}</Text>
                  </td>
                  <td className="px-4 py-3">
                    <Text className="text-sm">
                      {new Date(appointment.requestedDate).toLocaleDateString('vi-VN')}
                    </Text>
                  </td>
                  <td className="px-4 py-3">
                    <Tag 
                      color={
                        appointment.status.toLowerCase() === 'confirmed' ? 'green' :
                        appointment.status.toLowerCase() === 'pending' ? 'orange' : 
                        appointment.status.toLowerCase() === 'completed' ? 'blue' : 'red'
                      }
                      className="border-0"
                    >
                      {appointment.status}
                    </Tag>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    {appointment.paymentStatus === 'completed' ? (
                      <Tag color="green">Đã thanh toán</Tag>
                    ) : appointment.paymentStatus === 'pending' ? (
                      <Tag color="orange">Chờ thanh toán</Tag>
                    ) : (
                      <Text type="secondary" className="text-xs">Chưa thanh toán</Text>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Button
                      type="default"
                      icon={<EyeOutlined />}
                      onClick={() => {
                        setSelectedAppointmentForDetail(appointment);
                        setDetailModalVisible(true);
                      }}
                      size="small"
                    >
                      Chi tiết
                    </Button>
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

      {/* Edit Appointment Modal */}
      <Modal
        title={
          <div className="flex items-center py-2">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
              <EditOutlined className="text-white text-lg" />
            </div>
            <div>
              <div className="text-lg font-semibold text-gray-800">Chỉnh sửa lịch hẹn</div>
              <div className="text-sm text-gray-500">Cập nhật thông tin lịch hẹn</div>
            </div>
          </div>
        }
        open={showEditModal}
        onCancel={() => {
          setShowEditModal(false);
          setEditingAppointment(null);
          form.resetFields();
        }}
        footer={[
          <Button 
            key="cancel" 
            onClick={() => {
              setShowEditModal(false);
              setEditingAppointment(null);
              form.resetFields();
            }}
            className="px-6"
          >
            Hủy
          </Button>,
          <Button
            key="update"
            type="primary"
            icon={<CheckCircleOutlined />}
            onClick={() => form.submit()}
            className="!bg-gradient-to-r !from-blue-500 !to-purple-600 hover:!from-blue-600 hover:!to-purple-700 !border-0 px-6"
          >
            Cập nhật
          </Button>,
        ]}
        width={600}
        className="rounded-lg"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleUpdateAppointment}
        >
          <Form.Item
            name="serviceType"
            label={<span className="text-gray-700 font-medium">Loại dịch vụ</span>}
            rules={[{ required: true, message: 'Vui lòng nhập loại dịch vụ' }]}
          >
            <Input placeholder="Loại dịch vụ" size="large" />
          </Form.Item>

          <Form.Item
            name="requestedDate"
            label={<span className="text-gray-700 font-medium">Ngày hẹn</span>}
            rules={[{ required: true, message: 'Vui lòng chọn ngày hẹn' }]}
          >
            <Input placeholder="Ngày hẹn" size="large" />
          </Form.Item>

          <Form.Item
            name="status"
            label={<span className="text-gray-700 font-medium">Trạng thái</span>}
            rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
          >
            <Select placeholder="Chọn trạng thái" size="large">
              <Select.Option value="pending">Pending</Select.Option>
              <Select.Option 
                value="confirmed" 
                disabled={editingAppointment?.status !== 'confirmed'}
              >
                Confirmed {editingAppointment?.status !== 'confirmed' && '(Chỉ được phép thông qua nút Xác nhận)'}
              </Select.Option>
              <Select.Option value="cancelled">Cancelled</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

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

      {/* Detail Modal */}
      <Modal
        title={
          <div style={{ fontSize: '18px', fontWeight: 600 }}>
            Chi tiết lịch hẹn #{selectedAppointmentForDetail?.appointmentID}
          </div>
        }
        open={detailModalVisible}
        onCancel={() => {
          setDetailModalVisible(false);
          setSelectedAppointmentForDetail(null);
        }}
        footer={null}
        width={700}
      >
        {selectedAppointmentForDetail && (
          <div>
            <Descriptions bordered column={2} size="small" className="mb-4">
              <Descriptions.Item label="Khách hàng" span={2}>
                <div className="flex items-center space-x-2">
                  <UserOutlined className="text-blue-500" />
                  <Text strong>{selectedAppointmentForDetail.userName}</Text>
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="Xe">
                <div className="flex items-center space-x-2">
                  <CarOutlined className="text-green-500" />
                  <Text>{selectedAppointmentForDetail.vehicleModel}</Text>
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="Dịch vụ">
                <div className="flex items-center space-x-2">
                  <ToolOutlined className="text-orange-500" />
                  <Text>{selectedAppointmentForDetail.serviceType}</Text>
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="Trung tâm">
                <div className="flex items-center space-x-2">
                  <EnvironmentOutlined className="text-purple-500" />
                  <Text>{selectedAppointmentForDetail.centerName}</Text>
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="Ngày hẹn">
                <div className="flex items-center space-x-2">
                  <CalendarOutlined className="text-indigo-500" />
                  <Text>{new Date(selectedAppointmentForDetail.requestedDate).toLocaleDateString('vi-VN')}</Text>
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Tag 
                  color={
                    selectedAppointmentForDetail.status.toLowerCase() === 'confirmed' ? 'green' :
                    selectedAppointmentForDetail.status.toLowerCase() === 'pending' ? 'orange' : 
                    selectedAppointmentForDetail.status.toLowerCase() === 'completed' ? 'blue' : 'red'
                  }
                >
                  {selectedAppointmentForDetail.status}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Thanh toán" span={2}>
                {selectedAppointmentForDetail.paymentMethod ? (
                  <div className="space-y-2">
                    <div>
                      <Tag color={selectedAppointmentForDetail.paymentMethod === 'online' ? 'blue' : 'orange'}>
                        {selectedAppointmentForDetail.paymentMethod === 'online' ? '💳 Online' : '💵 Cash'}
                      </Tag>
                      {selectedAppointmentForDetail.paymentStatus && (
                        <Tag 
                          color={
                            selectedAppointmentForDetail.paymentStatus === 'completed' ? 'green' :
                            selectedAppointmentForDetail.paymentStatus === 'pending' ? 'orange' : 'red'
                          }
                          className="ml-2"
                        >
                          {selectedAppointmentForDetail.paymentStatus}
                        </Tag>
                      )}
                    </div>
                    {selectedAppointmentForDetail.paymentAmount && (
                      <Text strong className="text-lg text-green-600">
                        ₫{selectedAppointmentForDetail.paymentAmount.toLocaleString('vi-VN')}
                      </Text>
                    )}
                  </div>
                ) : (
                  <Text type="secondary">Chưa thanh toán</Text>
                )}
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            <div className="flex flex-wrap gap-2 justify-end">
              {selectedAppointmentForDetail.status.toLowerCase() === 'pending' && (
                <Button
                  type="primary"
                  icon={<CheckCircleOutlined />}
                  onClick={() => {
                    setDetailModalVisible(false);
                    openAssignModal(selectedAppointmentForDetail);
                  }}
                  className="!bg-green-500 hover:!bg-green-600"
                >
                  Xác nhận & Gán kỹ thuật viên
                </Button>
              )}
              {selectedAppointmentForDetail.paymentMethod === 'cash' && selectedAppointmentForDetail.paymentStatus === 'pending' && (
                <Button
                  type="primary"
                  icon={<CheckCircleOutlined />}
                  onClick={() => {
                    setDetailModalVisible(false);
                    handleConfirmCashPayment(selectedAppointmentForDetail);
                  }}
                  className="!bg-orange-500 hover:!bg-orange-600"
                >
                  Xác nhận đã nhận tiền
                </Button>
              )}
              {selectedAppointmentForDetail.paymentStatus === 'completed' && (
                <Button
                  type="default"
                  icon={<FileTextOutlined />}
                  onClick={() => {
                    setDetailModalVisible(false);
                    handleExportInvoice(selectedAppointmentForDetail);
                  }}
                  className="!bg-blue-500 !text-white hover:!bg-blue-600"
                >
                  Xuất hóa đơn
                </Button>
              )}
              <Button
                icon={<EditOutlined />}
                onClick={() => {
                  setDetailModalVisible(false);
                  handleEdit(selectedAppointmentForDetail);
                }}
              >
                Sửa
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Invoice Viewer Modal */}
      <InvoiceViewer
        appointmentID={selectedAppointment?.appointmentID}
        visible={invoiceVisible}
        onClose={() => {
          setInvoiceVisible(false);
          setSelectedPaymentID(undefined);
          setSelectedAppointment(null);
        }}
      />
    </div>
  );
};

export default AppointmentConfirmation;
