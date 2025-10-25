import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Button, notification, Spin, Tabs, Space, Modal } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { authService } from '../../services/authService';

interface CustomerProfileType {
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

const CustomerProfile: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<CustomerProfileType | null>(null);
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

  const handleUpdateProfile = async (values: CustomerProfileType) => {
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
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #f0f9ff 0%, #f9fafb 100%)' }}>
      {/* Gradient Header */}
      <div className="p-6 bg-gradient-to-r from-indigo-600 to-purple-500 text-white rounded-b-3xl shadow-lg mb-8">
        <div className="flex items-center mb-3">
          <UserOutlined style={{ fontSize: 32, marginRight: 12 }} />
          <h1 className="text-4xl font-bold">Hồ sơ cá nhân</h1>
        </div>
        <p className="text-indigo-100 text-lg">Quản lý thông tin tài khoản và bảo mật</p>
      </div>

      <div className="px-6 pb-6 max-w-4xl mx-auto">
        <Card 
          style={{
            borderRadius: 20,
            boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
            border: '1px solid #e5e7eb'
          }}
          bodyStyle={{ padding: 0 }}
        >
          <Tabs 
            defaultActiveKey="1"
            style={{ borderRadius: 20 }}
            tabBarStyle={{
              borderBottom: '2px solid #e5e7eb',
              paddingLeft: 24,
              paddingRight: 24
            }}
          >
            <Tabs.TabPane
              tab={
                <span style={{ fontSize: 14, fontWeight: 600 }}>
                  👤 Thông tin cá nhân
                </span>
              }
              key="1"
            >
              <div style={{ padding: 24 }}>
                <Form
                  form={profileForm}
                  layout="vertical"
                  onFinish={handleUpdateProfile}
                  initialValues={profile}
                >
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
                    <Form.Item
                      name="username"
                      label={<span style={{ fontWeight: 600, color: '#1f2937' }}>Tên đăng nhập</span>}
                    >
                      <Input 
                        prefix={<UserOutlined />} 
                        disabled 
                        style={{ borderRadius: 10, backgroundColor: '#f3f4f6', borderColor: '#e5e7eb' }}
                        size="large"
                      />
                    </Form.Item>
                    <Form.Item
                      name="name"
                      label={<span style={{ fontWeight: 600, color: '#1f2937' }}>Họ và tên</span>}
                      rules={[
                        { required: true, message: 'Vui lòng nhập họ và tên!' }
                      ]}
                    >
                      <Input 
                        prefix={<UserOutlined />}
                        style={{ borderRadius: 10, borderColor: '#e5e7eb' }}
                        size="large"
                        placeholder="Nhập họ và tên"
                      />
                    </Form.Item>
                    <Form.Item
                      name="email"
                      label={<span style={{ fontWeight: 600, color: '#1f2937' }}>Email</span>}
                      rules={[
                        { required: true, message: 'Vui lòng nhập email!' },
                        { type: 'email', message: 'Email không hợp lệ!' }
                      ]}
                    >
                      <Input 
                        prefix={<span>✉️</span>}
                        style={{ borderRadius: 10, borderColor: '#e5e7eb' }}
                        size="large"
                        placeholder="Nhập email"
                      />
                    </Form.Item>
                    <Form.Item
                      name="phone"
                      label={<span style={{ fontWeight: 600, color: '#1f2937' }}>Số điện thoại</span>}
                      rules={[
                        { required: true, message: 'Vui lòng nhập số điện thoại!' }
                      ]}
                    >
                      <Input 
                        prefix={<span>☎️</span>}
                        style={{ borderRadius: 10, borderColor: '#e5e7eb' }}
                        size="large"
                        placeholder="Nhập số điện thoại"
                      />
                    </Form.Item>
                    <Form.Item
                      name="address"
                      label={<span style={{ fontWeight: 600, color: '#1f2937' }}>Địa chỉ</span>}
                      style={{ gridColumn: '1 / -1' }}
                    >
                      <Input.TextArea 
                        rows={3}
                        style={{ borderRadius: 10, borderColor: '#e5e7eb' }}
                        placeholder="Nhập địa chỉ"
                      />
                    </Form.Item>
                  </div>
                  
                  <Form.Item>
                    <Space style={{ gap: 12 }}>
                      <Button
                        type="primary"
                        htmlType="submit"
                        loading={loading}
                        size="large"
                        style={{
                          borderRadius: 10,
                          background: 'linear-gradient(90deg, #4f46e5 0%, #7c3aed 100%)',
                          border: 'none',
                          fontWeight: 600,
                          paddingLeft: 32,
                          paddingRight: 32
                        }}
                      >
                        💾 Cập nhật thông tin
                      </Button>
                      <Button 
                        size="large"
                        onClick={() => profileForm.setFieldsValue(profile)}
                        style={{
                          borderRadius: 10,
                          fontWeight: 600
                        }}
                      >
                        Hủy bỏ
                      </Button>
                    </Space>
                  </Form.Item>
                </Form>
              </div>
            </Tabs.TabPane>

            <Tabs.TabPane
              tab={
                <span style={{ fontSize: 14, fontWeight: 600 }}>
                  🔒 Đổi mật khẩu
                </span>
              }
              key="2"
            >
              <div style={{ padding: 24 }}>
                <Form
                  form={passwordForm}
                  layout="vertical"
                  onFinish={handleChangePassword}
                  style={{ maxWidth: 400 }}
                >
                  <Form.Item
                    name="oldPassword"
                    label={<span style={{ fontWeight: 600, color: '#1f2937' }}>Mật khẩu hiện tại</span>}
                    rules={[
                      { required: true, message: 'Vui lòng nhập mật khẩu hiện tại!' }
                    ]}
                  >
                    <Input.Password 
                      prefix={<LockOutlined />}
                      style={{ borderRadius: 10, borderColor: '#e5e7eb' }}
                      size="large"
                      placeholder="Nhập mật khẩu hiện tại"
                    />
                  </Form.Item>
                  <Form.Item
                    name="newPassword"
                    label={<span style={{ fontWeight: 600, color: '#1f2937' }}>Mật khẩu mới</span>}
                    rules={[
                      { required: true, message: 'Vui lòng nhập mật khẩu mới!' },
                      { min: 8, message: 'Mật khẩu phải có ít nhất 8 ký tự!' },
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
                    <Input.Password 
                      prefix={<LockOutlined />}
                      style={{ borderRadius: 10, borderColor: '#e5e7eb' }}
                      size="large"
                      placeholder="Nhập mật khẩu mới"
                    />
                  </Form.Item>
                  <Form.Item
                    name="confirmPassword"
                    label={<span style={{ fontWeight: 600, color: '#1f2937' }}>Xác nhận mật khẩu mới</span>}
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
                    <Input.Password 
                      prefix={<LockOutlined />}
                      style={{ borderRadius: 10, borderColor: '#e5e7eb' }}
                      size="large"
                      placeholder="Xác nhận mật khẩu mới"
                    />
                  </Form.Item>
                  <Form.Item>
                    <Space style={{ gap: 12 }}>
                      <Button
                        type="primary"
                        htmlType="submit"
                        loading={loading}
                        size="large"
                        style={{
                          borderRadius: 10,
                          background: 'linear-gradient(90deg, #4f46e5 0%, #7c3aed 100%)',
                          border: 'none',
                          fontWeight: 600,
                          paddingLeft: 32,
                          paddingRight: 32
                        }}
                      >
                        🔐 Đổi mật khẩu
                      </Button>
                      <Button 
                        size="large"
                        onClick={() => passwordForm.resetFields()}
                        style={{
                          borderRadius: 10,
                          fontWeight: 600
                        }}
                      >
                        Hủy bỏ
                      </Button>
                    </Space>
                  </Form.Item>
                </Form>
              </div>
            </Tabs.TabPane>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default CustomerProfile;
