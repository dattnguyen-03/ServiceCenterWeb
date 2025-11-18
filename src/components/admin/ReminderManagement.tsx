import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Space,
  Tag,
  Typography,
  message,
  Popconfirm,
  Select,
  Row,
  Col,
  Statistic,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  BellOutlined,
} from '@ant-design/icons';
import { reminderService } from '../../services/reminderService';
import { ViewReminderDTO, CreateReminderRequest, EditReminderRequest } from '../../types/api';
import { showSuccess, showError } from '../../utils/sweetAlert';
import { getAllUsers } from '../../services/userService';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';

dayjs.locale('vi');

const { Title } = Typography;
const { TextArea } = Input;

interface UserOption {
  userID: number;
  name: string;
  username: string;
}

const ReminderManagement: React.FC = () => {
  const [reminders, setReminders] = useState<ViewReminderDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedReminder, setSelectedReminder] = useState<ViewReminderDTO | null>(null);
  const [createForm] = Form.useForm();
  const [editForm] = Form.useForm();

  useEffect(() => {
    loadReminders();
    loadUsers();
  }, []);

  const loadReminders = async () => {
    setLoading(true);
    try {
      const data = await reminderService.getAllReminders();
      setReminders(data);
    } catch (error: any) {
      showError('Lỗi', error.message || 'Không thể tải danh sách nhắc nhở');
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const data = await getAllUsers();
      const userOptions: UserOption[] = data.map((user: any) => ({
        userID: user.userID || user.id,
        name: user.name || user.fullName,
        username: user.username || user.email,
      }));
      setUsers(userOptions);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const handleCreate = async (values: CreateReminderRequest) => {
    try {
      await reminderService.createReminder(values);
      showSuccess('Thành công', 'Tạo nhắc nhở thành công');
      setCreateModalVisible(false);
      createForm.resetFields();
      loadReminders();
    } catch (error: any) {
      showError('Lỗi', error.message || 'Không thể tạo nhắc nhở');
    }
  };

  const handleEdit = async (values: EditReminderRequest) => {
    if (!selectedReminder) return;

    try {
      await reminderService.editReminder({
        reminderID: selectedReminder.reminderID,
        ...values,
      });
      showSuccess('Thành công', 'Cập nhật nhắc nhở thành công');
      setEditModalVisible(false);
      setSelectedReminder(null);
      editForm.resetFields();
      loadReminders();
    } catch (error: any) {
      showError('Lỗi', error.message || 'Không thể cập nhật nhắc nhở');
    }
  };

  const openEditModal = (reminder: ViewReminderDTO) => {
    if (reminder.isRead) {
      message.warning('Chỉ có thể sửa nhắc nhở chưa đọc');
      return;
    }
    setSelectedReminder(reminder);
    editForm.setFieldsValue({
      title: reminder.title,
      message: reminder.message,
    });
    setEditModalVisible(true);
  };

  const formatDate = (dateString: string) => {
    return dayjs(dateString).format('DD/MM/YYYY HH:mm');
  };

  const unreadCount = reminders.filter((r) => !r.isRead).length;
  const readCount = reminders.filter((r) => r.isRead).length;

  const columns = [
    {
      title: 'ID',
      dataIndex: 'reminderID',
      key: 'reminderID',
      width: 80,
    },
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title',
      render: (text: string, record: ViewReminderDTO) => (
        <Space>
          <span style={{ fontWeight: record.isRead ? 'normal' : 'bold' }}>{text}</span>
          {!record.isRead && <Tag color="blue">Chưa đọc</Tag>}
        </Space>
      ),
    },
    {
      title: 'Nội dung',
      dataIndex: 'message',
      key: 'message',
      ellipsis: true,
      render: (text: string) => (
        <span style={{ maxWidth: 300, display: 'block' }}>{text}</span>
      ),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (text: string) => formatDate(text),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isRead',
      key: 'isRead',
      width: 120,
      render: (isRead: boolean) => (
        <Tag color={isRead ? 'green' : 'orange'}>
          {isRead ? 'Đã đọc' : 'Chưa đọc'}
        </Tag>
      ),
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 150,
      render: (_: any, record: ViewReminderDTO) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => openEditModal(record)}
            disabled={record.isRead}
            title={record.isRead ? 'Chỉ có thể sửa nhắc nhở chưa đọc' : 'Sửa'}
          >
            Sửa
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>
          <BellOutlined style={{ marginRight: 8 }} />
          Quản lý Nhắc nhở
        </Title>
      </div>

      {/* Statistics */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card>
            <Statistic
              title="Tổng số nhắc nhở"
              value={reminders.length}
              prefix={<BellOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Chưa đọc"
              value={unreadCount}
              valueStyle={{ color: '#ff9800' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Đã đọc"
              value={readCount}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
          <Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setCreateModalVisible(true)}
            >
              Tạo nhắc nhở
            </Button>
            <Button icon={<ReloadOutlined />} onClick={loadReminders}>
              Làm mới
            </Button>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={reminders}
          loading={loading}
          rowKey="reminderID"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} nhắc nhở`,
          }}
        />
      </Card>

      {/* Create Modal */}
      <Modal
        title="Tạo nhắc nhở mới"
        open={createModalVisible}
        onCancel={() => {
          setCreateModalVisible(false);
          createForm.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={createForm}
          layout="vertical"
          onFinish={handleCreate}
        >
          <Form.Item
            name="userID"
            label="Người nhận"
            rules={[{ required: true, message: 'Vui lòng chọn người nhận' }]}
          >
            <Select
              showSearch
              placeholder="Chọn người nhận"
              optionFilterProp="children"
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              options={users.map((user) => ({
                value: user.userID,
                label: `${user.name} (${user.username})`,
              }))}
            />
          </Form.Item>

          <Form.Item
            name="title"
            label="Tiêu đề"
            rules={[
              { required: true, message: 'Vui lòng nhập tiêu đề' },
              { max: 100, message: 'Tiêu đề không được vượt quá 100 ký tự' },
            ]}
          >
            <Input placeholder="Nhập tiêu đề nhắc nhở" maxLength={100} showCount />
          </Form.Item>

          <Form.Item
            name="message"
            label="Nội dung"
            rules={[
              { required: true, message: 'Vui lòng nhập nội dung' },
              { max: 500, message: 'Nội dung không được vượt quá 500 ký tự' },
            ]}
          >
            <TextArea
              placeholder="Nhập nội dung nhắc nhở"
              rows={4}
              maxLength={500}
              showCount
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Tạo nhắc nhở
              </Button>
              <Button onClick={() => {
                setCreateModalVisible(false);
                createForm.resetFields();
              }}>
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        title="Sửa nhắc nhở"
        open={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false);
          setSelectedReminder(null);
          editForm.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleEdit}
        >
          <Form.Item
            name="title"
            label="Tiêu đề"
            rules={[
              { required: true, message: 'Vui lòng nhập tiêu đề' },
              { max: 100, message: 'Tiêu đề không được vượt quá 100 ký tự' },
            ]}
          >
            <Input placeholder="Nhập tiêu đề nhắc nhở" maxLength={100} showCount />
          </Form.Item>

          <Form.Item
            name="message"
            label="Nội dung"
            rules={[
              { required: true, message: 'Vui lòng nhập nội dung' },
              { max: 500, message: 'Nội dung không được vượt quá 500 ký tự' },
            ]}
          >
            <TextArea
              placeholder="Nhập nội dung nhắc nhở"
              rows={4}
              maxLength={500}
              showCount
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Cập nhật
              </Button>
              <Button onClick={() => {
                setEditModalVisible(false);
                setSelectedReminder(null);
                editForm.resetFields();
              }}>
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ReminderManagement;

