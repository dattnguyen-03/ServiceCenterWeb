import React, { useState } from "react";
import { Form, Input, Button, Card, Typography } from "antd";
import { MailOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";

const { Title } = Typography;

const ForgotPasswordPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onFinish = async (values: any) => {
    setLoading(true);
    setError(null);
    try {
      // Gọi API gửi mail reset password ở đây (demo chỉ giả lập)
      // await fetch("/api/forgot-password", { ... });
      setTimeout(() => {
        setSent(true);
        setLoading(false);
      }, 1000);
    } catch (err: any) {
      setError("Không thể gửi email. Vui lòng thử lại sau.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Card className="w-full max-w-md shadow-lg">
        <div className="text-center mb-8">
          <Title level={3}>Quên mật khẩu</Title>
          <Typography.Text type="secondary">
            Nhập email để nhận hướng dẫn đặt lại mật khẩu
          </Typography.Text>
        </div>
        {sent ? (
          <div className="text-center text-green-600 font-semibold">
            Đã gửi email hướng dẫn đặt lại mật khẩu (nếu email tồn tại)!
            <br />
            <Link to="/login" className="text-indigo-600 hover:underline">
              Quay lại đăng nhập
            </Link>
          </div>
        ) : (
          <Form onFinish={onFinish}>
            <Form.Item
              name="email"
              rules={[
                { required: true, message: "Vui lòng nhập email!" },
                { type: "email", message: "Email không hợp lệ!" },
              ]}
            >
              <Input
                prefix={<MailOutlined />}
                placeholder="Email"
                size="large"
              />
            </Form.Item>
            {error && (
              <div className="text-red-600 text-center mb-2">{error}</div>
            )}
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                className="w-full"
                size="large"
                loading={loading}
              >
                Gửi email
              </Button>
            </Form.Item>
          </Form>
        )}
        <div className="text-center mt-4">
          <Link to="/login" className="text-indigo-600 hover:underline">
            Quay lại đăng nhập
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default ForgotPasswordPage;
