import React, { useState } from 'react';
import { Table, Card, Input, Button, Tabs, Modal, Form, Select } from 'antd';
import { SearchOutlined, UserAddOutlined, CarOutlined } from '@ant-design/icons';

const { TabPane } = Tabs;

interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  joinDate: string;
}

interface Vehicle {
  id: string;
  vin: string;
  model: string;
  year: string;
  licensePlate: string;
  customerId: string;
  lastService: string;
}

const CustomerVehicleManagement: React.FC = () => {
  const [isCustomerModalVisible, setIsCustomerModalVisible] = useState(false);
  const [isVehicleModalVisible, setIsVehicleModalVisible] = useState(false);
  const [customerForm] = Form.useForm();
  const [vehicleForm] = Form.useForm();

  // Mock data - replace with API calls
  const customers: Customer[] = [
    {
      id: '1',
      name: 'Nguyễn Văn A',
      phone: '0901234567',
      email: 'nguyenvana@email.com',
      address: 'Hà Nội',
      joinDate: '2023-01-01',
    },
    // Add more mock customers...
  ];

  const vehicles: Vehicle[] = [
    {
      id: '1',
      vin: 'VF1234567890',
      model: 'VinFast VF8',
      year: '2023',
      licensePlate: '30A-12345',
      customerId: '1',
      lastService: '2023-08-15',
    },
    // Add more mock vehicles...
  ];

  const customerColumns = [
    {
      title: 'Họ tên',
      dataIndex: 'name',
      key: 'name',
      sorter: (a: Customer, b: Customer) => a.name.localeCompare(b.name),
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Địa chỉ',
      dataIndex: 'address',
      key: 'address',
    },
    {
      title: 'Ngày tham gia',
      dataIndex: 'joinDate',
      key: 'joinDate',
      sorter: (a: Customer, b: Customer) => a.joinDate.localeCompare(b.joinDate),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, record: Customer) => (
        <div className="space-x-2">
          <Button type="link">Sửa</Button>
          <Button type="link">Xem xe</Button>
          <Button type="link" danger>Xóa</Button>
        </div>
      ),
    },
  ];

  const vehicleColumns = [
    {
      title: 'Biển số',
      dataIndex: 'licensePlate',
      key: 'licensePlate',
    },
    {
      title: 'Model',
      dataIndex: 'model',
      key: 'model',
    },
    {
      title: 'Số VIN',
      dataIndex: 'vin',
      key: 'vin',
    },
    {
      title: 'Năm sản xuất',
      dataIndex: 'year',
      key: 'year',
    },
    {
      title: 'Lần cuối bảo dưỡng',
      dataIndex: 'lastService',
      key: 'lastService',
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, record: Vehicle) => (
        <div className="space-x-2">
          <Button type="link">Sửa</Button>
          <Button type="link">Lịch sử</Button>
          <Button type="link" danger>Xóa</Button>
        </div>
      ),
    },
  ];

  const handleAddCustomer = (values: any) => {
    console.log('New customer:', values);
    setIsCustomerModalVisible(false);
    customerForm.resetFields();
  };

  const handleAddVehicle = (values: any) => {
    console.log('New vehicle:', values);
    setIsVehicleModalVisible(false);
    vehicleForm.resetFields();
  };

  return (
    <div className="p-6">
      <Tabs defaultActiveKey="customers">
        <TabPane tab="Khách hàng" key="customers">
          <Card>
            <div className="flex justify-between mb-4">
              <Input
                placeholder="Tìm kiếm khách hàng..."
                prefix={<SearchOutlined />}
                className="w-64"
              />
              <Button
                type="primary"
                icon={<UserAddOutlined />}
                onClick={() => setIsCustomerModalVisible(true)}
              >
                Thêm khách hàng
              </Button>
            </div>
            <Table
              columns={customerColumns}
              dataSource={customers}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </TabPane>

        <TabPane tab="Xe" key="vehicles">
          <Card>
            <div className="flex justify-between mb-4">
              <Input
                placeholder="Tìm kiếm xe..."
                prefix={<SearchOutlined />}
                className="w-64"
              />
              <Button
                type="primary"
                icon={<CarOutlined />}
                onClick={() => setIsVehicleModalVisible(true)}
              >
                Thêm xe
              </Button>
            </div>
            <Table
              columns={vehicleColumns}
              dataSource={vehicles}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </TabPane>
      </Tabs>

      {/* Add Customer Modal */}
      <Modal
        title="Thêm khách hàng mới"
        open={isCustomerModalVisible}
        onCancel={() => setIsCustomerModalVisible(false)}
        footer={null}
      >
        <Form
          form={customerForm}
          layout="vertical"
          onFinish={handleAddCustomer}
        >
          <Form.Item
            name="name"
            label="Họ tên"
            rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="phone"
            label="Số điện thoại"
            rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[{ type: 'email', message: 'Email không hợp lệ' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="address" label="Địa chỉ">
            <Input.TextArea />
          </Form.Item>
          <Form.Item className="text-right">
            <Button type="primary" htmlType="submit">
              Thêm khách hàng
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Add Vehicle Modal */}
      <Modal
        title="Thêm xe mới"
        open={isVehicleModalVisible}
        onCancel={() => setIsVehicleModalVisible(false)}
        footer={null}
      >
        <Form
          form={vehicleForm}
          layout="vertical"
          onFinish={handleAddVehicle}
        >
          <Form.Item
            name="customerId"
            label="Chủ xe"
            rules={[{ required: true, message: 'Vui lòng chọn chủ xe' }]}
          >
            <Select
              placeholder="Chọn khách hàng"
              options={customers.map(c => ({ label: c.name, value: c.id }))}
            />
          </Form.Item>
          <Form.Item
            name="licensePlate"
            label="Biển số xe"
            rules={[{ required: true, message: 'Vui lòng nhập biển số xe' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="model"
            label="Model"
            rules={[{ required: true, message: 'Vui lòng nhập model xe' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="vin"
            label="Số VIN"
            rules={[{ required: true, message: 'Vui lòng nhập số VIN' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="year"
            label="Năm sản xuất"
          >
            <Input />
          </Form.Item>
          <Form.Item className="text-right">
            <Button type="primary" htmlType="submit">
              Thêm xe
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CustomerVehicleManagement;