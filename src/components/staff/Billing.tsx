import React, { useState } from 'react';
import { Card, Table, Button, Input, Tag, Modal, Form, InputNumber, Space, Select } from 'antd';
import { 
  SearchOutlined, 
  PlusOutlined, 
  PrinterOutlined, 
  DollarOutlined
} from '@ant-design/icons';

interface Invoice {
  id: string;
  customerId: string;
  customerName: string;
  vehicleInfo: string;
  services: string[];
  parts: {
    name: string;
    quantity: number;
    price: number;
  }[];
  laborCost: number;
  totalAmount: number;
  status: 'pending' | 'paid' | 'cancelled';
  paymentMethod?: string;
  createdAt: string;
  paidAt?: string;
}

const Billing: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [form] = Form.useForm();

  // Mock data - replace with API calls
  const invoices: Invoice[] = [
    {
      id: 'INV001',
      customerId: '1',
      customerName: 'Nguyễn Văn A',
      vehicleInfo: 'VinFast VF8 - 30A-12345',
      services: ['Bảo dưỡng định kỳ', 'Thay dầu'],
      parts: [
        { name: 'Lọc dầu', quantity: 1, price: 350000 },
        { name: 'Dầu động cơ', quantity: 5, price: 250000 },
      ],
      laborCost: 500000,
      totalAmount: 2100000,
      status: 'pending',
      createdAt: '2023-09-14',
    },
    // Add more invoices...
  ];

  const columns = [
    {
      title: 'Mã hóa đơn',
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
      title: 'Tổng tiền',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (amount: number) => amount.toLocaleString('vi-VN') + ' đ',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const colors = {
          pending: 'warning',
          paid: 'success',
          cancelled: 'error',
        };
        const texts = {
          pending: 'Chờ thanh toán',
          paid: 'Đã thanh toán',
          cancelled: 'Đã hủy',
        };
        return (
          <Tag color={colors[status as keyof typeof colors]}>
            {texts[status as keyof typeof texts]}
          </Tag>
        );
      },
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, record: Invoice) => (
        <Space>
          <Button
            icon={<DollarOutlined />}
            type="primary"
            onClick={() => handlePayment(record)}
            disabled={record.status !== 'pending'}
          >
            Thanh toán
          </Button>
          <Button
            icon={<PrinterOutlined />}
            onClick={() => handlePrint(record)}
          >
            In
          </Button>
        </Space>
      ),
    },
  ];

  const handlePayment = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    form.setFieldsValue({
      amount: invoice.totalAmount,
      paymentMethod: 'cash',
    });
    setIsModalVisible(true);
  };

  const handlePrint = (invoice: Invoice) => {
    console.log('Printing invoice:', invoice.id);
    // Implement printing logic
  };

  const onFinishPayment = (values: any) => {
    console.log('Payment completed:', values);
    setIsModalVisible(false);
    form.resetFields();
  };

  const calculateTotal = (values: any) => {
    let total = 0;
    if (values.parts) {
      total += values.parts.reduce((sum: number, part: any) => 
        sum + (part.quantity * part.price), 0);
    }
    if (values.laborCost) {
      total += values.laborCost;
    }
    return total;
  };

  return (
    <div className="p-6">
      <Card title="Quản lý hóa đơn">
        <div className="mb-4 flex justify-between">
          <Input
            placeholder="Tìm kiếm hóa đơn..."
            prefix={<SearchOutlined />}
            className="w-64"
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setSelectedInvoice(null);
              form.resetFields();
              setIsModalVisible(true);
            }}
          >
            Tạo hóa đơn
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={invoices}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={selectedInvoice ? "Xác nhận thanh toán" : "Tạo hóa đơn mới"}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={form.submit}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinishPayment}
        >
          {!selectedInvoice && (
            <>
              <Form.Item
                name="customerId"
                label="Khách hàng"
                rules={[{ required: true }]}
              >
                <Select
                  showSearch
                  placeholder="Chọn khách hàng"
                  optionFilterProp="children"
                >
                  <Select.Option value="1">Nguyễn Văn A</Select.Option>
                  <Select.Option value="2">Trần Thị B</Select.Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="vehicleId"
                label="Xe"
                rules={[{ required: true }]}
              >
                <Select placeholder="Chọn xe">
                  <Select.Option value="1">VF8 - 30A-12345</Select.Option>
                  <Select.Option value="2">VF e34 - 30A-54321</Select.Option>
                </Select>
              </Form.Item>

              <Form.List name="parts">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map(field => (
                      <Space key={field.key} className="flex mb-2">
                        <Form.Item
                          {...field}
                          name={[field.name, 'name']}
                          rules={[{ required: true, message: 'Nhập tên phụ tùng' }]}
                        >
                          <Input placeholder="Tên phụ tùng" />
                        </Form.Item>
                        <Form.Item
                          {...field}
                          name={[field.name, 'quantity']}
                          rules={[{ required: true, message: 'Nhập số lượng' }]}
                        >
                          <InputNumber min={1} placeholder="Số lượng" />
                        </Form.Item>
                        <Form.Item
                          {...field}
                          name={[field.name, 'price']}
                          rules={[{ required: true, message: 'Nhập đơn giá' }]}
                        >
                          <InputNumber 
                            min={0}
                            placeholder="Đơn giá"
                            formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={(value: string | undefined): 0 => (value ? Number(value.replace(/\$\s?|(,*)/g, '')) || 0 : 0) as 0}
                          />
                        </Form.Item>
                        <Button onClick={() => remove(field.name)} type="text" danger>
                          Xóa
                        </Button>
                      </Space>
                    ))}
                    <Form.Item>
                      <Button type="dashed" onClick={() => add()} block>
                        Thêm phụ tùng
                      </Button>
                    </Form.Item>
                  </>
                )}
              </Form.List>

              <Form.Item
                name="laborCost"
                label="Chi phí nhân công"
                rules={[{ required: true }]}
              >
                <InputNumber
                  className="w-full"
                  min={0}
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value: string | undefined): 0 => (value ? Number(value.replace(/\$\s?|(,*)/g, '')) || 0 : 0) as 0}
                />
              </Form.Item>
            </>
          )}

          <Form.Item
            name="paymentMethod"
            label="Phương thức thanh toán"
            rules={[{ required: true }]}
          >
            <Select>
              <Select.Option value="cash">Tiền mặt</Select.Option>
              <Select.Option value="card">Thẻ</Select.Option>
              <Select.Option value="transfer">Chuyển khoản</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="amount"
            label="Số tiền thanh toán"
            rules={[{ required: true }]}
          >
            <InputNumber
              className="w-full"
              min={0}
              readOnly={!!selectedInvoice}
              formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value: string | undefined): 0 => (value ? Number(value.replace(/\$\s?|(,*)/g, '')) || 0 : 0) as 0}
            />
          </Form.Item>

          {!selectedInvoice && (
            <Form.Item
              shouldUpdate
              className="text-right font-bold"
            >
              {() => (
                <div>
                  Tổng cộng: {calculateTotal(form.getFieldsValue()).toLocaleString('vi-VN')} đ
                </div>
              )}
            </Form.Item>
          )}
        </Form>
      </Modal>
    </div>
  );
};

export default Billing;