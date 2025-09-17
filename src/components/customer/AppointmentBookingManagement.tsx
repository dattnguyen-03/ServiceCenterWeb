import React, { useState } from "react";
import { Table, Button, Modal, Form, Input, DatePicker, Select, Tag, Space } from "antd";
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

  const columns: ColumnsType<Appointment> = [
    {
      title: "Xe",
      dataIndex: "car",
      key: "car",
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
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: Appointment["status"]) => (
        <Tag color={statusColors[status]} style={{ textTransform: "capitalize" }}>
          {status === "pending"
            ? "Chờ xử lý"
            : status === "in_progress"
            ? "Đang thực hiện"
            : "Hoàn tất"}
        </Tag>
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-10 px-2 md:px-0 flex justify-center items-start">
      <div className="w-full max-w-3xl">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-extrabold text-blue-700 mb-2 drop-shadow">Quản lý lịch hẹn</h2>
          <p className="text-gray-500 text-lg">Xem, tạo và quản lý các lịch hẹn dịch vụ của bạn</p>
        </div>
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-100 overflow-hidden p-8">
          <div className="flex items-center justify-between mb-6">
            <Button type="primary" size="large" className="rounded-xl px-6 py-2 text-base font-semibold shadow" onClick={() => setIsModalVisible(true)}>
              + Đặt lịch mới
            </Button>
          </div>
          <Table
            dataSource={appointments}
            columns={columns}
            rowKey="id"
            pagination={{ pageSize: 5 }}
            className="rounded-xl shadow border border-gray-100"
          />
        </div>
        <Modal
          title={<span className="text-xl font-bold text-blue-700">Đặt lịch dịch vụ</span>}
          open={isModalVisible}
          onOk={handleAddAppointment}
          onCancel={() => setIsModalVisible(false)}
          okText={<span className="px-6 py-2 text-base font-semibold">Xác nhận</span>}
          cancelText={<span className="px-6 py-2 text-base font-semibold">Hủy</span>}
          centered
          bodyStyle={{ padding: 24, borderRadius: 16, background: "#f8fafc" }}
          className="rounded-2xl"
        >
          <Form form={form} layout="vertical">
            <Form.Item
              label={<span className="font-semibold text-blue-700">Xe</span>}
              name="car"
              rules={[{ required: true, message: "Vui lòng nhập tên xe" }]}
            >
              <Input placeholder="Ví dụ: VinFast VF8" className="rounded-xl px-4 py-2" />
            </Form.Item>
            <Form.Item
              label={<span className="font-semibold text-blue-700">Dịch vụ</span>}
              name="service"
              rules={[{ required: true, message: "Vui lòng chọn dịch vụ" }]}
            >
              <Select placeholder="Chọn dịch vụ" className="rounded-xl">
                <Option value="Bảo dưỡng định kỳ">Bảo dưỡng định kỳ</Option>
                <Option value="Sửa chữa">Sửa chữa</Option>
                <Option value="Kiểm tra pin">Kiểm tra pin</Option>
              </Select>
            </Form.Item>
            <Form.Item
              label={<span className="font-semibold text-blue-700">Ngày giờ</span>}
              name="date"
              rules={[{ required: true, message: "Vui lòng chọn ngày giờ" }]}
            >
              <DatePicker showTime format="YYYY-MM-DD HH:mm" style={{ width: "100%" }} className="rounded-xl px-4 py-2" />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </div>
  );
};

export default AppointmentPage;
