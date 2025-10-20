import React, { useState } from 'react';
import { Calendar, Card, Badge, Modal, Form, Select, DatePicker, Input, Button, TimePicker } from 'antd';
import type { Dayjs } from 'dayjs';
import type { BadgeProps } from 'antd';
import { CalendarOutlined } from '@ant-design/icons';

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
          switch (item.status) {
            case 'confirmed':
              color = 'green';
              break;
            case 'pending':
              color = 'orange';
              break;
            case 'cancelled':
              color = 'red';
              break;
          }
          return (
            <li key={item.id} className="mb-1">
              <Badge
                color={color}
                text={`${item.time} - ${item.customerName}`}
              />
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
    <div className="p-6">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Quản lý lịch hẹn - Admin</h2>
        <p className="text-gray-600">Quản lý và theo dõi tất cả lịch hẹn trong hệ thống</p>
      </div>

      <Card title="Lịch hẹn hệ thống" className="mb-4">
        <Calendar
          dateCellRender={dateCellRender}
          onSelect={handleDateSelect}
        />
      </Card>

      <Modal
        title="Tạo lịch hẹn mới"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateAppointment}
          initialValues={{ date: selectedDate }}
        >
          <Form.Item
            name="customerId"
            label="Khách hàng"
            rules={[{ required: true, message: 'Vui lòng chọn khách hàng' }]}
          >
            <Select
              placeholder="Chọn khách hàng"
              showSearch
              options={[
                { label: 'Nguyễn Văn A', value: '1' },
                { label: 'Trần Thị B', value: '2' },
                { label: 'Lê Minh C', value: '3' },
              ]}
            />
          </Form.Item>

          <Form.Item
            name="vehicleId"
            label="Xe"
            rules={[{ required: true, message: 'Vui lòng chọn xe' }]}
          >
            <Select
              placeholder="Chọn xe"
              options={[
                { label: 'VinFast VF8 - 30A-12345', value: '1' },
                { label: 'VinFast VF e34 - 30A-54321', value: '2' },
                { label: 'Tesla Model Y - 30A-67890', value: '3' },
              ]}
            />
          </Form.Item>

          <Form.Item
            name="date"
            label="Ngày hẹn"
            rules={[{ required: true, message: 'Vui lòng chọn ngày' }]}
          >
            <DatePicker className="w-full" />
          </Form.Item>

          <Form.Item
            name="time"
            label="Thời gian"
            rules={[{ required: true, message: 'Vui lòng chọn giờ' }]}
          >
            <TimePicker
              format="HH:mm"
              className="w-full"
              minuteStep={15}
            />
          </Form.Item>

          <Form.Item
            name="serviceType"
            label="Loại dịch vụ"
            rules={[{ required: true, message: 'Vui lòng chọn loại dịch vụ' }]}
          >
            <Select
              placeholder="Chọn dịch vụ"
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
            label="Ghi chú"
          >
            <Input.TextArea rows={4} />
          </Form.Item>

          <Form.Item className="text-right mb-0">
            <Button type="primary" htmlType="submit" icon={<CalendarOutlined />}>
              Tạo lịch hẹn
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminAppointmentManagement;
