import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography } from 'antd';
import { UserOutlined, MailOutlined, LockOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';

const { Title } = Typography;

const RegisterPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const onFinish = async (values: any) => {
    setLoading(true);
    setApiError(null);
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: values.fullName,
          email: values.email,
          password: values.password,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Đăng ký thất bại');
      }
      // Registration successful
      alert('Đăng ký thành công!');
      // Optionally redirect to login or home page
    } catch (err: any) {
      setApiError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <Card className="w-full max-w-md shadow-lg">
        <div className="text-center mb-8">
          <Title level={2}>Tạo tài khoản</Title>
          <Typography.Text type="secondary">Bắt đầu quản lý garage của bạn một cách hiệu quả</Typography.Text>
        </div>
        <Form
          name="register"
          onFinish={onFinish}
          scrollToFirstError
        >
          <Form.Item
            name="fullName"
            rules={[{ required: true, message: 'Vui lòng nhập họ và tên!', whitespace: true }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Họ và tên" size="large" />
          </Form.Item>

          <Form.Item
            name="email"
            rules={[
              {
                type: 'email',
                message: 'Email không hợp lệ!',
              },
              {
                required: true,
                message: 'Vui lòng nhập email!',
              },
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="Email" size="large" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              {
                required: true,
                message: 'Vui lòng nhập mật khẩu!',
              },
            ]}
            hasFeedback
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu" size="large" />
          </Form.Item>

          <Form.Item
            name="confirm"
            dependencies={['password']}
            hasFeedback
            rules={[
              {
                required: true,
                message: 'Vui lòng xác nhận mật khẩu!',
              },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Hai mật khẩu không khớp!'));
                },
              }),
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Xác nhận mật khẩu" size="large" />
          </Form.Item>
          {apiError && (
            <div className="text-red-600 text-center mb-2">{apiError}</div>
          )}
          <Form.Item>
            <Button type="primary" htmlType="submit" className="w-full" size="large" loading={loading}>
              Đăng ký
            </Button>
          </Form.Item>
        </Form>
        <div className="text-center">
          <Typography.Text type="secondary">
            Đã có tài khoản? <Link to="/login">Đăng nhập ngay</Link>
          </Typography.Text>
        </div>
      </Card>
    </div>
  );
};

export default RegisterPage;
