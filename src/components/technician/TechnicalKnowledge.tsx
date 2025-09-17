import React, { useState } from 'react';
import { Card, Input, Button, Select, Tag, Space, List, Typography, Modal, Form } from 'antd';
import { PlusOutlined, SearchOutlined, TagOutlined } from '@ant-design/icons';

const { TextArea } = Input;
const { Title, Text } = Typography;

interface TechnicalIssue {
  id: string;
  title: string;
  description: string;
  vehicleModel: string;
  tags: string[];
  solution: string;
  createdBy: string;
  createdAt: string;
}

const TechnicalKnowledge: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [form] = Form.useForm();

  // Mock data - thay thế bằng API call thật
  const technicalIssues: TechnicalIssue[] = [
    {
      id: '1',
      title: 'Lỗi hệ thống pin VF e34',
      description: 'Các triệu chứng và cách xử lý khi pin không sạc đúng dung lượng',
      vehicleModel: 'VinFast VF e34',
      tags: ['pin', 'sạc', 'điện'],
      solution: `1. Kiểm tra kết nối cáp sạc và cổng sạc
2. Đo điện áp và dòng sạc
3. Kiểm tra hệ thống quản lý pin BMS
4. Cập nhật phần mềm nếu cần
5. Liên hệ kỹ thuật cao cấp nếu vấn đề vẫn tồn tại`,
      createdBy: 'Phạm Kỹ Thuật',
      createdAt: '2024-02-15',
    },
    // Thêm mock data khác...
  ];

  // Mock tags - thay thế bằng API call thật
  const availableTags = ['pin', 'sạc', 'điện', 'động cơ', 'phanh', 'điều hòa', 'hệ thống treo'];

  const filteredIssues = technicalIssues.filter(issue => {
    const matchesSearch = issue.title.toLowerCase().includes(searchText.toLowerCase()) ||
                         issue.description.toLowerCase().includes(searchText.toLowerCase());
    const matchesTags = selectedTags.length === 0 || 
                       selectedTags.every(tag => issue.tags.includes(tag));
    return matchesSearch && matchesTags;
  });

  const handleCreateIssue = () => {
    form.validateFields().then(values => {
      console.log('New technical issue:', values);
      // Trong ứng dụng thật, gửi API request để tạo issue mới
      setIsModalVisible(false);
      form.resetFields();
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <Title level={2}>Cơ sở tri thức kỹ thuật</Title>
        <Text className="text-gray-600">
          Tra cứu và chia sẻ kiến thức kỹ thuật, giải pháp xử lý sự cố
        </Text>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input
          placeholder="Tìm kiếm vấn đề kỹ thuật..."
          prefix={<SearchOutlined />}
          onChange={e => setSearchText(e.target.value)}
          className="md:col-span-2"
        />
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={() => setIsModalVisible(true)}
        >
          Thêm vấn đề mới
        </Button>
      </div>

      <Card>
        <div className="mb-4">
          <Text strong className="mr-2">Lọc theo tag:</Text>
          <Select
            mode="multiple"
            placeholder="Chọn tags..."
            value={selectedTags}
            onChange={setSelectedTags}
            style={{ width: '100%' }}
            maxTagCount={5}
            options={availableTags.map(tag => ({ label: tag, value: tag }))}
          />
        </div>

        <List
          itemLayout="vertical"
          dataSource={filteredIssues}
          renderItem={issue => (
            <List.Item
              key={issue.id}
              actions={[
                <Space key="tags">
                  <TagOutlined />
                  {issue.tags.map(tag => (
                    <Tag key={tag} color="blue">{tag}</Tag>
                  ))}
                </Space>
              ]}
              extra={
                <div className="text-right text-sm text-gray-500">
                  <div>{issue.createdBy}</div>
                  <div>{issue.createdAt}</div>
                </div>
              }
            >
              <List.Item.Meta
                title={<a href={`/technical-issues/${issue.id}`}>{issue.title}</a>}
                description={
                  <Space direction="vertical">
                    <Text type="secondary">{issue.vehicleModel}</Text>
                    <Text>{issue.description}</Text>
                  </Space>
                }
              />
              <div className="mt-4 bg-gray-50 p-4 rounded-lg">
                <Text strong className="block mb-2">Giải pháp:</Text>
                <div className="whitespace-pre-line">{issue.solution}</div>
              </div>
            </List.Item>
          )}
        />
      </Card>

      <Modal
        title="Thêm vấn đề kỹ thuật mới"
        open={isModalVisible}
        onOk={handleCreateIssue}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        width={800}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="title"
            label="Tiêu đề"
            rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}
          >
            <Input placeholder="Nhập tiêu đề vấn đề" />
          </Form.Item>

          <Form.Item
            name="vehicleModel"
            label="Model xe"
            rules={[{ required: true, message: 'Vui lòng chọn model xe' }]}
          >
            <Select
              placeholder="Chọn model xe"
              options={[
                { label: 'VinFast VF e34', value: 'VinFast VF e34' },
                { label: 'VinFast VF 8', value: 'VinFast VF 8' },
                { label: 'VinFast VF 9', value: 'VinFast VF 9' },
              ]}
            />
          </Form.Item>

          <Form.Item
            name="description"
            label="Mô tả vấn đề"
            rules={[{ required: true, message: 'Vui lòng mô tả vấn đề' }]}
          >
            <TextArea rows={4} placeholder="Mô tả chi tiết vấn đề gặp phải" />
          </Form.Item>

          <Form.Item
            name="solution"
            label="Giải pháp"
            rules={[{ required: true, message: 'Vui lòng nhập giải pháp' }]}
          >
            <TextArea rows={6} placeholder="Nhập các bước giải quyết vấn đề" />
          </Form.Item>

          <Form.Item
            name="tags"
            label="Tags"
            rules={[{ required: true, message: 'Vui lòng chọn ít nhất một tag' }]}
          >
            <Select
              mode="multiple"
              placeholder="Chọn tags liên quan"
              options={availableTags.map(tag => ({ label: tag, value: tag }))}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TechnicalKnowledge;