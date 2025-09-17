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

const AppointmentManagement: React.FC = () => {
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
    // Add more appointments...
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
      <Card title="Quản lý lịch hẹn" className="mb-4">
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

export default AppointmentManagement;