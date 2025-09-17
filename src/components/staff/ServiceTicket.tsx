import React, { useState } from 'react';
import { Card, Button, Table, Tag, Modal, Form, Input, Select, DatePicker } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import type { Vehicle } from '../../types';

interface ServiceTicket {
  id: string;
  customerName: string;
  vehicleInfo: string;
  serviceType: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  createdAt: string;
  appointmentTime: string;
  assignedTo?: string;
}

const ServiceTicket: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  // Mock data - replace with API calls
  const tickets: ServiceTicket[] = [
    {
      id: 'SV001',
      customerName: 'Nguyễn Văn A',
      vehicleInfo: 'VinFast VF8 - 30A-12345',
      serviceType: 'Bảo dưỡng định kỳ',
      description: 'Bảo dưỡng 10,000 km',
      status: 'pending',
      createdAt: '2023-09-14',
      appointmentTime: '2023-09-15 09:00',
      assignedTo: 'Kỹ thuật viên 1'
    },
    // Add more mock tickets...
  ];

  const columns = [
    {
      title: 'Mã phiếu',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Khách hàng',
      dataIndex: 'customerName',
      key: 'customerName',
    },
    {
      title: 'Thông tin xe',
      dataIndex: 'vehicleInfo',
      key: 'vehicleInfo',
    },
    {
      title: 'Loại dịch vụ',
      dataIndex: 'serviceType',
      key: 'serviceType',
    },
    {
      title: 'Thời gian hẹn',
      dataIndex: 'appointmentTime',
      key: 'appointmentTime',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        let color = 'default';
        let text = '';
        switch (status) {
          case 'pending':
            color = 'warning';
            text = 'Chờ xử lý';
            break;
          case 'in-progress':
            color = 'processing';
            text = 'Đang thực hiện';
            break;
          case 'completed':
            color = 'success';
            text = 'Hoàn thành';
            break;
          default:
            text = status;
        }
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: 'Kỹ thuật viên',
      dataIndex: 'assignedTo',
      key: 'assignedTo',
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (text: string, record: ServiceTicket) => (
        <div className="space-x-2">
          <Button type="link">Chi tiết</Button>
          <Button type="link">Cập nhật</Button>
          <Button type="link" danger>Hủy</Button>
        </div>
      ),
    },
  ];

  const handleCreateTicket = (values: any) => {
    console.log('New service ticket:', values);
    setIsModalVisible(false);
    form.resetFields();
  };

  return (
    <div className="p-6">
      <Card>
        <div className="flex justify-between mb-4">
          <Input
            placeholder="Tìm kiếm phiếu dịch vụ..."
            prefix={<SearchOutlined />}
            className="w-64"
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsModalVisible(true)}
          >
            Tạo phiếu dịch vụ
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={tickets}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title="Tạo phiếu dịch vụ mới"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateTicket}
        >
          <Form.Item
            name="customerId"
            label="Khách hàng"
            rules={[{ required: true, message: 'Vui lòng chọn khách hàng' }]}
          >
            <Select
              placeholder="Chọn khách hàng"
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
            name="appointmentTime"
            label="Thời gian hẹn"
            rules={[{ required: true, message: 'Vui lòng chọn thời gian' }]}
          >
            <DatePicker showTime className="w-full" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Mô tả"
          >
            <Input.TextArea rows={4} />
          </Form.Item>

          <Form.Item
            name="assignedTo"
            label="Phân công kỹ thuật viên"
          >
            <Select
              placeholder="Chọn kỹ thuật viên"
              options={[
                { label: 'Kỹ thuật viên 1', value: '1' },
                { label: 'Kỹ thuật viên 2', value: '2' },
              ]}
            />
          </Form.Item>

          <Form.Item className="text-right">
            <Button type="primary" htmlType="submit">
              Tạo phiếu
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ServiceTicket;