import React, { useState } from "react";
import { Table, Button, Modal, Form, Input, DatePicker, Select, Tag, Space, Card } from "antd";
import { PlusOutlined, CalendarOutlined, DeleteOutlined, EditOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";

const { Option } = Select;

interface Appointment {
  id: number;
  car: string;
  service: string;
  date: string;
  status: "pending" | "in_progress" | "completed";
}

const AppointmentPage: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>([
    {
      id: 1,
      car: "VinFast VF8",
      service: "Bảo dưỡng định kỳ",
      date: "2025-09-20 09:00",
      status: "pending",
    },
    {
      id: 2,
      car: "Tesla Model 3",
      service: "Kiểm tra pin",
      date: "2025-09-25 14:00",
      status: "in_progress",
    },
  ]);

  const [form] = Form.useForm();

  const statusColors: Record<Appointment["status"], string> = {
    pending: "orange",
    in_progress: "blue",
    completed: "green",
  };

  const statusEmoji: Record<Appointment["status"], string> = {
    pending: "⏳ Chờ xử lý",
    in_progress: "⚙️ Đang thực hiện",
    completed: "✅ Hoàn tất",
  };

  const columns: ColumnsType<Appointment> = [
    {
      title: "Xe",
      dataIndex: "car",
      key: "car",
      render: (text) => <span style={{ fontWeight: 600, color: '#1f2937' }}>{text}</span>
    },
    {
      title: "Dịch vụ",
      dataIndex: "service",
      key: "service",
    },
    {
      title: "Ngày hẹn",
      dataIndex: "date",
      key: "date",
      render: (text) => <span>📅 {text}</span>
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: Appointment["status"]) => (
        <Tag 
          color={statusColors[status]} 
          style={{ borderRadius: 20, fontWeight: 600 }}
        >
          {statusEmoji[status]}
        </Tag>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      render: () => (
        <Space size="small">
          <Button 
            type="text" 
            icon={<EditOutlined />} 
            size="small"
            style={{ color: '#2563eb' }}
          >
            Sửa
          </Button>
          <Button 
            type="text" 
            icon={<DeleteOutlined />} 
            size="small" 
            danger
          >
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  const handleAddAppointment = () => {
    form
      .validateFields()
      .then((values) => {
        const newAppointment: Appointment = {
          id: appointments.length + 1,
          car: values.car,
          service: values.service,
          date: values.date.format("YYYY-MM-DD HH:mm"),
          status: "pending",
        };
        setAppointments([...appointments, newAppointment]);
        setIsModalVisible(false);
        form.resetFields();
      })
      .catch((info) => {
        console.log("Validate Failed:", info);
      });
  };

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #f0f9ff 0%, #f9fafb 100%)' }}>
      {/* Gradient Header */}
      <div className="p-6 bg-gradient-to-r from-cyan-600 to-teal-500 text-white rounded-b-3xl shadow-lg mb-8">
        <div className="flex items-center mb-3">
          <CalendarOutlined style={{ fontSize: 32, marginRight: 12 }} />
          <h1 className="text-4xl font-bold">Quản lý lịch hẹn</h1>
        </div>
        <p className="text-cyan-100 text-lg">Xem, tạo và quản lý các lịch hẹn dịch vụ của bạn</p>
      </div>

      <div className="px-6 pb-6 max-w-6xl mx-auto">
        <Card
          style={{
            borderRadius: 20,
            boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
            border: '1px solid #e5e7eb'
          }}
          bodyStyle={{ padding: 24 }}
        >
          <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1f2937', margin: 0 }}>
              📋 Danh sách lịch hẹn
            </h2>
            <Button 
              type="primary" 
              size="large"
              icon={<PlusOutlined />}
              onClick={() => setIsModalVisible(true)}
              style={{
                borderRadius: 10,
                background: 'linear-gradient(90deg, #06b6d4 0%, #14b8a6 100%)',
                border: 'none',
                fontWeight: 600,
                paddingLeft: 24,
                paddingRight: 24
              }}
            >
              Đặt lịch mới
            </Button>
          </div>

          <Table
            dataSource={appointments}
            columns={columns}
            rowKey="id"
            pagination={{ pageSize: 5, position: ['bottomCenter'] }}
            style={{ borderRadius: 12 }}
          />
        </Card>
      </div>

      {/* Add Appointment Modal */}
      <Modal
        title={
          <div style={{ fontSize: 18, fontWeight: 700, color: '#1f2937' }}>
            📅 Đặt lịch dịch vụ
          </div>
        }
        open={isModalVisible}
        onOk={handleAddAppointment}
        onCancel={() => setIsModalVisible(false)}
        centered
        bodyStyle={{ borderRadius: 16 }}
        okText="Xác nhận"
        cancelText="Hủy"
        okButtonProps={{
          style: {
            borderRadius: 10,
            background: 'linear-gradient(90deg, #06b6d4 0%, #14b8a6 100%)',
            border: 'none',
            fontWeight: 600
          }
        }}
        cancelButtonProps={{
          style: {
            borderRadius: 10,
            fontWeight: 600
          }
        }}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            label={<span style={{ fontWeight: 600, color: '#1f2937' }}>Xe</span>}
            name="car"
            rules={[{ required: true, message: "Vui lòng nhập tên xe" }]}
          >
            <Input 
              placeholder="Ví dụ: VinFast VF8" 
              size="large"
              style={{ borderRadius: 10, borderColor: '#e5e7eb' }}
            />
          </Form.Item>
          <Form.Item
            label={<span style={{ fontWeight: 600, color: '#1f2937' }}>Dịch vụ 🔧</span>}
            name="service"
            rules={[{ required: true, message: "Vui lòng chọn dịch vụ" }]}
          >
            <Select 
              placeholder="Chọn dịch vụ"
              size="large"
              style={{ borderRadius: 10 }}
            >
              <Option value="Bảo dưỡng định kỳ">Bảo dưỡng định kỳ</Option>
              <Option value="Sửa chữa">Sửa chữa</Option>
              <Option value="Kiểm tra pin">Kiểm tra pin</Option>
            </Select>
          </Form.Item>
          <Form.Item
            label={<span style={{ fontWeight: 600, color: '#1f2937' }}>Ngày giờ 📅</span>}
            name="date"
            rules={[{ required: true, message: "Vui lòng chọn ngày giờ" }]}
          >
            <DatePicker 
              showTime 
              format="YYYY-MM-DD HH:mm" 
              style={{ width: "100%", borderRadius: 10, borderColor: '#e5e7eb' }}
              size="large"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AppointmentPage;
