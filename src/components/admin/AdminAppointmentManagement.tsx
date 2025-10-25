import React, { useState } from 'react';
import { Calendar, Card, Badge, Modal, Form, Select, DatePicker, Input, Button, TimePicker, Typography, Space, Tag, Tooltip, Divider } from 'antd';
import type { Dayjs } from 'dayjs';
import type { BadgeProps } from 'antd';
import { CalendarOutlined, PlusOutlined, ReloadOutlined, ClockCircleOutlined, UserOutlined, CarOutlined, ToolOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

interface Appointment {
  id: string;
  customerName: string;
  vehicleInfo: string;
  date: string;
  time: string;
  serviceType: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  notes?: string;
}

const AdminAppointmentManagement: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
  const [form] = Form.useForm();

  // Mock data - replace with API calls
  const appointments: Appointment[] = [
    {
      id: 'APT001',
      customerName: 'Nguyễn Văn A',
      vehicleInfo: 'VinFast VF8 - 30A-12345',
      date: '2023-09-14',
      time: '09:00',
      serviceType: 'Bảo dưỡng định kỳ',
      status: 'confirmed',
      notes: 'Bảo dưỡng 10,000 km',
    },
    {
      id: 'APT002',
      customerName: 'Trần Thị B',
      vehicleInfo: 'Tesla Model Y - 30A-54321',
      date: '2023-09-14',
      time: '14:00',
      serviceType: 'Kiểm tra pin',
      status: 'pending',
      notes: 'Kiểm tra hiệu suất pin',
    },
    {
      id: 'APT003',
      customerName: 'Lê Minh C',
      vehicleInfo: 'VinFast VF e34 - 30A-67890',
      date: '2023-09-15',
      time: '10:30',
      serviceType: 'Thay lốp',
      status: 'confirmed',
      notes: 'Thay lốp mùa hè',
    },
  ];

  const getListData = (value: Dayjs) => {
    const dateStr = value.format('YYYY-MM-DD');
    return appointments.filter(apt => apt.date === dateStr);
  };

  const dateCellRender = (value: Dayjs) => {
    const listData = getListData(value);
    return (
      <ul className="events p-0 m-0 list-none">
        {listData.map((item) => {
          let color: BadgeProps['color'] = 'blue';
          let bgColor = 'bg-blue-50';
          let textColor = 'text-blue-700';
          let borderColor = 'border-blue-200';
          
          switch (item.status) {
            case 'confirmed':
              color = 'green';
              bgColor = 'bg-green-50';
              textColor = 'text-green-700';
              borderColor = 'border-green-200';
              break;
            case 'pending':
              color = 'orange';
              bgColor = 'bg-orange-50';
              textColor = 'text-orange-700';
              borderColor = 'border-orange-200';
              break;
            case 'cancelled':
              color = 'red';
              bgColor = 'bg-red-50';
              textColor = 'text-red-700';
              borderColor = 'border-red-200';
              break;
          }
          return (
            <li key={item.id} className="mb-2">
              <div className={`${bgColor} ${borderColor} ${textColor} p-2 rounded-lg border text-xs hover:shadow-sm transition-all duration-200 cursor-pointer`}>
                <div className="flex items-center space-x-1">
                  <ClockCircleOutlined className="text-xs" />
                  <span className="font-medium">{item.time}</span>
                </div>
                <div className="mt-1 font-semibold truncate">{item.customerName}</div>
                <div className="text-xs opacity-75 truncate">{item.serviceType}</div>
              </div>
            </li>
          );
        })}
      </ul>
    );
  };

  const handleDateSelect = (date: Dayjs) => {
    setSelectedDate(date);
    setIsModalVisible(true);
  };

  const handleCreateAppointment = (values: any) => {
    console.log('New appointment:', values);
    setIsModalVisible(false);
    form.resetFields();
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                <CalendarOutlined className="text-white text-2xl" />
              </div>
              <div>
                <Title level={2} className="!mb-1 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Quản Lý Lịch Hẹn
                </Title>
                <Text type="secondary" className="text-base">
                  Quản lý và theo dõi tất cả lịch hẹn trong hệ thống
                </Text>
                <div className="flex items-center space-x-4 mt-2">
                  <div className="flex items-center space-x-1 text-sm text-gray-500">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Hệ thống hoạt động bình thường</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    Cập nhật lần cuối: {new Date().toLocaleDateString('vi-VN')}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                icon={<ReloadOutlined />}
                className="border-gray-200 hover:border-blue-500 hover:text-blue-500"
                size="large"
              >
                Làm mới
              </Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                size="large"
                className="!bg-gradient-to-r !from-green-500 !to-emerald-600 hover:!from-green-600 hover:!to-emerald-700 !border-0 shadow-lg"
              >
                Tạo lịch hẹn
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Card */}
      <Card 
        className="border-0 shadow-sm mb-6"
        title={
          <div className="flex items-center space-x-2">
            <CalendarOutlined className="text-blue-500" />
            <span className="text-lg font-semibold text-gray-700">Lịch hẹn hệ thống</span>
          </div>
        }
        extra={
          <Space>
            <Text type="secondary" className="text-sm">
              Tổng cộng: {appointments.length} lịch hẹn
            </Text>
          </Space>
        }
      >
        <div className="calendar-container">
          <Calendar
            dateCellRender={dateCellRender}
            onSelect={handleDateSelect}
            className="modern-calendar"
          />
        </div>
      </Card>

      <Modal
        title={
          <div className="flex items-center py-2">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
              <CalendarOutlined className="text-white text-lg" />
            </div>
            <div>
              <div className="text-lg font-semibold text-gray-800">Tạo lịch hẹn mới</div>
              <div className="text-sm text-gray-500">Thêm lịch hẹn mới vào hệ thống</div>
            </div>
          </div>
        }
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={700}
        className="rounded-lg"
      >
        <div className="py-4">
          <Form
            form={form}
            layout="vertical"
            onFinish={handleCreateAppointment}
            initialValues={{ date: selectedDate }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Form.Item
                name="customerId"
                label={
                  <span className="text-gray-700 font-medium">
                    <UserOutlined className="mr-2 text-blue-500" />
                    Khách hàng
                  </span>
                }
                rules={[{ required: true, message: 'Vui lòng chọn khách hàng' }]}
              >
                <Select
                  placeholder="Chọn khách hàng"
                  showSearch
                  size="large"
                  className="rounded-lg"
                  options={[
                    { label: 'Nguyễn Văn A', value: '1' },
                    { label: 'Trần Thị B', value: '2' },
                    { label: 'Lê Minh C', value: '3' },
                  ]}
                />
              </Form.Item>

              <Form.Item
                name="vehicleId"
                label={
                  <span className="text-gray-700 font-medium">
                    <CarOutlined className="mr-2 text-green-500" />
                    Xe
                  </span>
                }
                rules={[{ required: true, message: 'Vui lòng chọn xe' }]}
              >
                <Select
                  placeholder="Chọn xe"
                  size="large"
                  className="rounded-lg"
                  options={[
                    { label: 'VinFast VF8 - 30A-12345', value: '1' },
                    { label: 'VinFast VF e34 - 30A-54321', value: '2' },
                    { label: 'Tesla Model Y - 30A-67890', value: '3' },
                  ]}
                />
              </Form.Item>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Form.Item
                name="date"
                label={
                  <span className="text-gray-700 font-medium">
                    <CalendarOutlined className="mr-2 text-purple-500" />
                    Ngày hẹn
                  </span>
                }
                rules={[{ required: true, message: 'Vui lòng chọn ngày' }]}
              >
                <DatePicker className="w-full rounded-lg" size="large" />
              </Form.Item>

              <Form.Item
                name="time"
                label={
                  <span className="text-gray-700 font-medium">
                    <ClockCircleOutlined className="mr-2 text-orange-500" />
                    Thời gian
                  </span>
                }
                rules={[{ required: true, message: 'Vui lòng chọn giờ' }]}
              >
                <TimePicker
                  format="HH:mm"
                  className="w-full rounded-lg"
                  size="large"
                  minuteStep={15}
                />
              </Form.Item>
            </div>

            <Form.Item
              name="serviceType"
              label={
                <span className="text-gray-700 font-medium">
                  <ToolOutlined className="mr-2 text-red-500" />
                  Loại dịch vụ
                </span>
              }
              rules={[{ required: true, message: 'Vui lòng chọn loại dịch vụ' }]}
            >
              <Select
                placeholder="Chọn dịch vụ"
                size="large"
                className="rounded-lg"
                options={[
                  { label: 'Bảo dưỡng định kỳ', value: 'maintenance' },
                  { label: 'Sửa chữa', value: 'repair' },
                  { label: 'Kiểm tra', value: 'inspection' },
                  { label: 'Thay lốp', value: 'tire_change' },
                  { label: 'Kiểm tra pin', value: 'battery_check' },
                ]}
              />
            </Form.Item>

            <Form.Item
              name="notes"
              label={
                <span className="text-gray-700 font-medium">
                  <span className="mr-2">📝</span>
                  Ghi chú
                </span>
              }
            >
              <Input.TextArea 
                rows={4} 
                size="large"
                className="rounded-lg"
                placeholder="Nhập ghi chú cho lịch hẹn..."
              />
            </Form.Item>

            <Divider />

            <Form.Item className="text-right mb-0">
              <Space>
                <Button onClick={() => setIsModalVisible(false)} size="large">
                  Hủy
                </Button>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  icon={<CalendarOutlined />}
                  size="large"
                  className="!bg-gradient-to-r !from-blue-500 !to-purple-600 hover:!from-blue-600 hover:!to-purple-700 !border-0"
                >
                  Tạo lịch hẹn
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </div>
      </Modal>
    </div>
  );
};

export default AdminAppointmentManagement;
