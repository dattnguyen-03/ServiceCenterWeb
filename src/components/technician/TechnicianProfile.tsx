import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Button, notification, Spin, Tabs, Space, Modal } from 'antd';
import { UserOutlined, LockOutlined, SaveOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { authService } from '../../services/authService';

const { TabPane } = Tabs;

interface TechnicianProfileType {
  username: string;
  name: string;
  email: string;
  phone: string;
  address: string;
}

interface ChangePasswordData {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const TechnicianProfile: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<TechnicianProfileType | null>(null);
  const [profileForm] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const rawProfileData = await authService.getProfile();
      const profileData = {
        username: rawProfileData.username,
        name: rawProfileData.name,
        email: rawProfileData.email,
        phone: rawProfileData.phone,
        address: rawProfileData.address
      };
      setProfile(profileData);
      profileForm.setFieldsValue(profileData);
    } catch (error) {
      notification.error({
        message: 'Lỗi',
        description: 'Không thể tải thông tin profile!',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (values: TechnicianProfileType) => {
    try {
      setLoading(true);
      await authService.updateProfile(values);
      notification.success({
        message: 'Thành công',
        description: 'Cập nhật thông tin thành công!',
      });
      setProfile(values);
    } catch (error: any) {
      notification.error({
        message: 'Lỗi',
        description: error.message || 'Không thể cập nhật thông tin!',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (values: ChangePasswordData) => {
    if (values.oldPassword === values.newPassword) {
      notification.error({
        message: 'Lỗi',
        description: 'Mật khẩu mới phải khác với mật khẩu hiện tại!',
      });
      return;
    }
    if (values.newPassword !== values.confirmPassword) {
      notification.error({
        message: 'Lỗi',
        description: 'Mật khẩu xác nhận không khớp!',
      });
      return;
    }
    try {
      setLoading(true);
      const changePasswordData = {
        CurrentPassword: values.oldPassword,
        NewPassword: values.newPassword,
        ConfirmPassword: values.confirmPassword
      };
      await authService.changePassword(changePasswordData);
      Modal.success({
        title: 'Đổi mật khẩu thành công!',
        content: 'Bạn sẽ được đăng xuất. Vui lòng đăng nhập lại với mật khẩu mới.',
        okText: 'Đồng ý',
        onOk: async () => {
          await logout();
          navigate('/login', { replace: true });
        },
        onCancel: async () => {
          await logout();
          navigate('/login', { replace: true });
        }
      });
    } catch (error: any) {
      notification.error({
        message: 'Lỗi',
        description: error.message || 'Không thể đổi mật khẩu!',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!profile) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card title="Thông tin tài khoản Kỹ thuật viên" className="shadow-lg">
        <Tabs defaultActiveKey="1">
          <TabPane
            tab={
              <span>
                <UserOutlined />
                Thông tin cá nhân
              </span>
            }
            key="1"
          >
            <Form
              form={profileForm}
              layout="vertical"
              onFinish={handleUpdateProfile}
              initialValues={profile}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Form.Item
                  name="username"
                  label="Tên đăng nhập"
                >
                  <Input prefix={<UserOutlined />} disabled className="bg-gray-100" />
                </Form.Item>
                <Form.Item
                  name="name"
                  label="Họ và tên"
                  rules={[
                    { required: true, message: 'Vui lòng nhập họ và tên!' }
                  ]}
                >
                  <Input prefix={<UserOutlined />} />
                </Form.Item>
                <Form.Item
                  name="email"
                  label="Email"
                  rules={[
                    { required: true, message: 'Vui lòng nhập email!' },
                    { type: 'email', message: 'Email không hợp lệ!' }
                  ]}
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  name="phone"
                  label="Số điện thoại"
                  rules={[
                    { required: true, message: 'Vui lòng nhập số điện thoại!' }
                  ]}
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  name="address"
                  label="Địa chỉ"
                  className="md:col-span-2"
                >
                  <Input.TextArea rows={3} />
                </Form.Item>
              </div>
              <Form.Item>
                <Space>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    icon={<SaveOutlined />}
                  >
                    Cập nhật thông tin
                  </Button>
                  <Button onClick={() => profileForm.setFieldsValue(profile)}>
                    Hủy bỏ
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </TabPane>
          <TabPane
            tab={
              <span>
                <LockOutlined />
                Đổi mật khẩu
              </span>
            }
            key="2"
          >
            <Form
              form={passwordForm}
              layout="vertical"
              onFinish={handleChangePassword}
              className="max-w-md"
            >
              <Form.Item
                name="oldPassword"
                label="Mật khẩu hiện tại"
                rules={[
                  { required: true, message: 'Vui lòng nhập mật khẩu hiện tại!' }
                ]}
              >
                <Input.Password prefix={<LockOutlined />} />
              </Form.Item>
              <Form.Item
                name="newPassword"
                label="Mật khẩu mới"
                rules={[
                  { required: true, message: 'Vui lòng nhập mật khẩu mới!' },
                  { min: 1, message: 'Mật khẩu phải có ít nhất 8 ký tự!' },
                  { max: 100, message: 'Mật khẩu không được quá 100 ký tự!' },
                  {
                    validator: (_, value) => {
                      if (!value) return Promise.resolve();
                      if (/\s/.test(value)) {
                        return Promise.reject(new Error('Mật khẩu không được chứa khoảng trắng!'));
                      }
                      if (/(.)\1{2,}/.test(value)) {
                        return Promise.reject(new Error('Mật khẩu không được có ký tự lặp liên tiếp quá 2 lần!'));
                      }
                      const weakPasswords = [
                        '12345678', 'password', 'Password123', 'admin123',
                        'qwerty123', '123456789', 'password123', 'Admin@123'
                      ];
                      if (weakPasswords.some(weak => value.toLowerCase().includes(weak.toLowerCase()))) {
                        return Promise.reject(new Error('Mật khẩu quá yếu, vui lòng chọn mật khẩu khác!'));
                      }
                      return Promise.resolve();
                    }
                  }
                ]}
              >
                <Input.Password prefix={<LockOutlined />} />
              </Form.Item>
              <Form.Item
                name="confirmPassword"
                label="Xác nhận mật khẩu mới"
                dependencies={['newPassword']}
                rules={[
                  { required: true, message: 'Vui lòng xác nhận mật khẩu mới!' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value) {
                        return Promise.resolve();
                      }
                      const newPassword = getFieldValue('newPassword');
                      if (newPassword === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('Mật khẩu xác nhận không khớp với mật khẩu mới!'));
                    },
                  }),
                ]}
              >
                <Input.Password prefix={<LockOutlined />} />
              </Form.Item>
              <Form.Item>
                <Space>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    icon={<SaveOutlined />}
                  >
                    Đổi mật khẩu
                  </Button>
                  <Button onClick={() => passwordForm.resetFields()}>
                    Hủy bỏ
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default TechnicianProfile;
