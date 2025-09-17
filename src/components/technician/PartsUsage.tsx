import React, { useState } from 'react';
import { Card, Input, Table, Button, InputNumber, Select, Form, Modal, notification } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import type { Part } from '../../types';

const PartsUsage: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedParts, setSelectedParts] = useState<Part[]>([]);
  const [form] = Form.useForm();

  // Mock data - thay thế bằng API call thật
  const availableParts: Part[] = [
    {
      id: '1',
      name: 'Lọc gió động cơ',
      category: 'Filters',
      stock: 15,
      minThreshold: 5,
      price: 250000,
      supplier: 'VinFast'
    },
    {
      id: '2',
      name: 'Dầu động cơ VinFast 5W-40',
      category: 'Oils',
      stock: 20,
      minThreshold: 8,
      price: 850000,
      supplier: 'VinFast'
    },
    // Thêm mock data khác...
  ];

  const columns = [
    {
      title: 'Mã phụ tùng',
      dataIndex: 'id',
      key: 'id',
      width: 120,
    },
    {
      title: 'Tên phụ tùng',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 120,
      render: (_: any, record: any) => (
        <InputNumber
          min={1}
          max={record.stock}
          defaultValue={record.quantity || 1}
          onChange={(value) => handleQuantityChange(record.id, value)}
        />
      ),
    },
    {
      title: 'Đơn giá',
      dataIndex: 'price',
      key: 'price',
      width: 150,
      render: (price: number) => price.toLocaleString('vi-VN') + ' đ',
    },
    {
      title: 'Thành tiền',
      key: 'total',
      width: 150,
      render: (record: any) => 
        ((record.quantity || 1) * record.price).toLocaleString('vi-VN') + ' đ',
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 100,
      render: (_: any, record: any) => (
        <Button 
          type="text" 
          danger
          onClick={() => handleRemovePart(record.id)}
        >
          Xóa
        </Button>
      ),
    },
  ];

  const handleQuantityChange = (partId: string, quantity: number | null) => {
    setSelectedParts(prev => 
      prev.map(part => 
        part.id === partId ? { ...part, quantity: quantity || 1 } : part
      )
    );
  };

  const handleRemovePart = (partId: string) => {
    setSelectedParts(prev => prev.filter(part => part.id !== partId));
  };

  const handleAddPart = () => {
    form.validateFields().then(values => {
      const part = availableParts.find(p => p.id === values.partId);
      if (part) {
        if (selectedParts.some(p => p.id === part.id)) {
          notification.warning({
            message: 'Phụ tùng đã tồn tại',
            description: 'Phụ tùng này đã được thêm vào danh sách. Vui lòng điều chỉnh số lượng nếu cần.',
          });
          return;
        }

        setSelectedParts(prev => [...prev, { ...part, quantity: values.quantity }]);
        form.resetFields();
        setIsModalVisible(false);
      }
    });
  };

  const calculateTotal = () => {
    return selectedParts.reduce((total, part) => 
      total + (part.price * (part.quantity || 1)), 0
    );
  };

  return (
    <div>
      <Card 
        title="Phụ tùng sử dụng" 
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalVisible(true)}>
            Thêm phụ tùng
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={selectedParts}
          rowKey="id"
          pagination={false}
          footer={() => (
            <div className="flex justify-end font-bold">
              Tổng cộng: {calculateTotal().toLocaleString('vi-VN')} đ
            </div>
          )}
        />
      </Card>

      <Modal
        title="Thêm phụ tùng"
        open={isModalVisible}
        onOk={handleAddPart}
        onCancel={() => setIsModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="partId"
            label="Chọn phụ tùng"
            rules={[{ required: true, message: 'Vui lòng chọn phụ tùng' }]}
          >
            <Select
              showSearch
              placeholder="Tìm kiếm phụ tùng"
              optionFilterProp="children"
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              options={availableParts.map(part => ({
                value: part.id,
                label: part.name,
              }))}
            />
          </Form.Item>
          <Form.Item
            name="quantity"
            label="Số lượng"
            initialValue={1}
            rules={[{ required: true, message: 'Vui lòng nhập số lượng' }]}
          >
            <InputNumber min={1} className="w-full" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default PartsUsage;