import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Modal, 
  Form, 
  Input, 
  Space, 
  message, 
  Typography, 
  Tag,
  Popconfirm,
  Tooltip,
  Divider
} from 'antd';
import { 
  TagsOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  SaveOutlined,
  InfoCircleOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { Category, CreateCategoryRequest, EditCategoryRequest } from '../../types/api';
import { categoryService } from '../../services/categoryService';

const { Title, Text } = Typography;
const { TextArea } = Input;

interface CategoryManagementProps {
  onCategorySelect?: (category: Category) => void;
  selectedCategories?: number[];
  mode?: 'selection' | 'management';
}

const CategoryManagement: React.FC<CategoryManagementProps> = ({ 
  onCategorySelect, 
  selectedCategories = [],
  mode = 'management'
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [searchText, setSearchText] = useState('');
  const [form] = Form.useForm();

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await categoryService.getCategories();
      setCategories(data);
    } catch (error: any) {
      message.error(error.message || 'Không thể tải danh sách categories');
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = () => {
    setEditingCategory(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    form.setFieldsValue({
      name: category.name,
      description: category.description,
    });
    setModalVisible(true);
  };

  const handleSaveCategory = async (values: CreateCategoryRequest) => {
    try {
      if (editingCategory) {
        // Edit existing category
        const editData: EditCategoryRequest = {
          categoryID: editingCategory.categoryID,
          name: values.name,
          description: values.description,
        };
        await categoryService.editCategory(editData);
        message.success('Cập nhật category thành công!');
      } else {
        // Create new category
        await categoryService.createCategory(values);
        message.success('Tạo category thành công!');
      }
      
      setModalVisible(false);
      form.resetFields();
      await loadCategories();
    } catch (error: any) {
      message.error(error.message || 'Có lỗi xảy ra khi lưu category');
    }
  };

  const handleDeleteCategory = async (categoryID: number, categoryName: string) => {
    try {
      await categoryService.deleteCategory(categoryID);
      message.success(`Đã xóa category: ${categoryName}`);
      await loadCategories();
    } catch (error: any) {
      message.error(error.message || 'Không thể xóa category này');
    }
  };

  const handleSearch = async () => {
    if (!searchText.trim()) {
      await loadCategories();
      return;
    }
    
    try {
      setLoading(true);
      const results = await categoryService.searchCategories({
        name: searchText,
        description: searchText
      });
      setCategories(results);
    } catch (error: any) {
      message.error(error.message || 'Có lỗi xảy ra khi tìm kiếm');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Tên Category',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: Category) => (
        <div className="flex items-center space-x-2">
          <TagsOutlined className="text-blue-500" />
          <div>
            <div className="font-medium text-gray-800">{name}</div>
            <div className="text-xs text-gray-500">ID: {record.categoryID}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      render: (description: string) => (
        <Text className="text-gray-600">
          {description || <span className="text-gray-400 italic">Chưa có mô tả</span>}
        </Text>
      ),
    },
    // {
    //   title: 'Ngày tạo',
    //   dataIndex: 'createdAt',
    //   key: 'createdAt',
    //   render: (date: string) => (
    //     <Text className="text-gray-500">
    //       {new Date(date).toLocaleDateString('vi-VN')}
    //     </Text>
    //   ),
    // },
    // {
    //   title: 'Trạng thái',
    //   key: 'status',
    //   render: (_: any, record: Category) => {
    //     const isSelected = selectedCategories.includes(record.categoryID);
    //     return (
    //       <Tag color={isSelected ? 'green' : 'default'}>
    //         {isSelected ? 'Đã chọn' : 'Chưa chọn'}
    //       </Tag>
    //     );
    //   },
    // },
    ...(mode === 'management' ? [{
      title: 'Hành động',
      key: 'actions',
      render: (_: any, record: Category) => (
        <Space size="small">
          <Tooltip title="Chỉnh sửa">
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => handleEditCategory(record)}
              className="text-blue-500 hover:text-blue-700"
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Popconfirm
              title="Xác nhận xóa"
              description={`Bạn có chắc chắn muốn xóa category "${record.name}"?`}
              onConfirm={() => handleDeleteCategory(record.categoryID, record.name)}
              okText="Xóa"
              cancelText="Hủy"
              okType="danger"
            >
              <Button
                type="link"
                icon={<DeleteOutlined />}
                className="text-red-500 hover:text-red-700"
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    }] : []),
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="border-0 shadow-sm">
        <div className="flex justify-between items-center">
          <div>
            <Title level={4} className="!mb-0 text-gray-700">
              <TagsOutlined className="mr-2 text-blue-500" />
              {mode === 'selection' ? 'Chọn Categories' : 'Quản lý Categories'}
            </Title>
            <Text type="secondary" className="text-sm">
              {mode === 'selection' 
                ? 'Chọn các categories cho gói dịch vụ' 
                : 'Quản lý danh mục dịch vụ trong hệ thống'}
            </Text>
          </div>
          
          {mode === 'management' && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreateCategory}
              className="!bg-blue-600 hover:!bg-blue-700"
            >
              Thêm Category
            </Button>
          )}
        </div>
      </Card>

      {/* Search Bar */}
      <Card className="border-0 shadow-sm">
        <div className="flex space-x-4 items-center">
          <div className="flex-1">
            <Input.Search
              placeholder="Tìm kiếm category theo tên hoặc mô tả..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onSearch={handleSearch}
              enterButton={<SearchOutlined />}
              size="large"
              className="rounded-lg"
            />
          </div>
          <Button
            icon={<ReloadOutlined />}
            onClick={loadCategories}
            size="large"
            className="border-gray-200 hover:border-blue-500 hover:text-blue-500"
          >
            Làm mới
          </Button>
        </div>
      </Card>

      {/* Categories Table */}
      <Card className="border-0 shadow-sm">
        <Table
          columns={columns}
          dataSource={categories}
          rowKey="categoryID"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} categories`,
          }}
          rowClassName={(record) => {
            const isSelected = selectedCategories.includes(record.categoryID);
            return `hover:bg-gray-50 transition-colors duration-200 ${
              mode === 'selection' && isSelected ? 'bg-blue-50' : ''
            }`;
          }}
          onRow={(record) => ({
            onClick: () => {
              if (mode === 'selection' && onCategorySelect) {
                onCategorySelect(record);
              }
            },
            style: mode === 'selection' ? { cursor: 'pointer' } : {},
          })}
        />
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        title={
          <div className="flex items-center py-2">
            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg flex items-center justify-center mr-3">
              <TagsOutlined className="text-white text-lg" />
            </div>
            <div>
              <div className="text-lg font-semibold text-gray-800">
                {editingCategory ? 'Chỉnh sửa Category' : 'Thêm Category mới'}
              </div>
              <div className="text-sm text-gray-500">
                {editingCategory ? 'Cập nhật thông tin category' : 'Tạo category mới cho hệ thống'}
              </div>
            </div>
          </div>
        }
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        footer={[
          <Button 
            key="cancel" 
            onClick={() => {
              setModalVisible(false);
              form.resetFields();
            }}
          >
            Hủy
          </Button>,
          <Button
            key="save"
            type="primary"
            icon={<SaveOutlined />}
            onClick={() => form.submit()}
            className="!bg-blue-600 hover:!bg-blue-700"
          >
            {editingCategory ? 'Cập nhật' : 'Tạo mới'}
          </Button>,
        ]}
        width={600}
      >
        <div className="py-4">
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSaveCategory}
            className="space-y-6"
          >
            <Form.Item
              label={
                <span className="text-gray-700 font-medium">
                  <TagsOutlined className="mr-2 text-blue-500" />
                  Tên Category
                </span>
              }
              name="name"
              rules={[
                { required: true, message: 'Vui lòng nhập tên category' },
                { max: 100, message: 'Tên category không được quá 100 ký tự' },
              ]}
            >
              <Input 
                placeholder="Nhập tên category" 
                size="large"
                className="rounded-lg"
              />
            </Form.Item>

            <Form.Item
              label={
                <span className="text-gray-700 font-medium">
                  <InfoCircleOutlined className="mr-2 text-blue-500" />
                  Mô tả
                </span>
              }
              name="description"
              rules={[
                { max: 500, message: 'Mô tả không được quá 500 ký tự' }
              ]}
            >
              <TextArea 
                rows={4} 
                placeholder="Nhập mô tả category (tùy chọn)" 
                size="large"
                className="rounded-lg"
                showCount
                maxLength={500}
              />
            </Form.Item>
          </Form>
        </div>
      </Modal>
    </div>
  );
};

export default CategoryManagement;