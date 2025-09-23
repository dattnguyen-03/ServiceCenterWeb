import React, { useState } from "react";
import { Form, Input, Button, Typography } from "antd";
import { UserOutlined, MailOutlined, LockOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";

const { Title, Text } = Typography;

const RegisterPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const onFinish = async (values: any) => {
    setLoading(true);
    setApiError(null);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: values.fullName,
          email: values.email,
          password: values.password,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Đăng ký thất bại");
      }
      alert("Đăng ký thành công!");
    } catch (err: any) {
      setApiError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-blue-300 to-pink-200 animate-gradient-x pt-16 pb-16">
      <style>
        {`
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 8s ease-in-out infinite;
        }
        `}
      </style>
      <div className="w-full max-w-2xl flex flex-col md:flex-row rounded-2xl shadow-2xl overflow-hidden border border-blue-100 bg-white/80 backdrop-blur-lg">
        {/* Bên trái trang trí */}
        <div className="md:w-1/2 flex flex-col items-center justify-center bg-gradient-to-br from-indigo-700 via-blue-500 to-pink-400 p-6 relative">
          <div className="absolute top-4 left-4 opacity-30 blur-2xl w-20 h-20 rounded-full bg-pink-300"></div>
          <div className="absolute bottom-4 right-4 opacity-20 blur-2xl w-24 h-24 rounded-full bg-blue-400"></div>
          <div className="flex flex-col items-center z-10 text-white text-center">
            <h1
              className="text-3xl font-extrabold mb-2 drop-shadow-xl tracking-tight"
              style={{ fontFamily: "Montserrat, sans-serif" }}
            >
              EV Service Manager
            </h1>
            <p className="text-base font-medium mb-2 text-white/90 drop-shadow">
              Đăng ký để bắt đầu quản lý dịch vụ xe điện<br />Nhanh chóng & tiện lợi
            </p>
          </div>
        </div>

        {/* Bên phải form đăng ký */}
        <div className="md:w-1/2 w-full flex flex-col justify-center p-6 md:p-8 bg-white/95">
          <div className="text-center mb-6">
            <Title level={3}>Tạo tài khoản</Title>
            <Text type="secondary">
              Bắt đầu quản lý garage của bạn một cách hiệu quả
            </Text>
          </div>

          <Form name="register" onFinish={onFinish} scrollToFirstError layout="vertical">
            <Form.Item
              name="fullName"
              label="Họ và tên"
              rules={[{ required: true, message: "Vui lòng nhập họ và tên!", whitespace: true }]}
            >
              <Input prefix={<UserOutlined />} placeholder="Nhập họ và tên" size="large" />
            </Form.Item>

            <Form.Item
              name="email"
              label="Email"
              rules={[
                { type: "email", message: "Email không hợp lệ!" },
                { required: true, message: "Vui lòng nhập email!" },
              ]}
            >
              <Input prefix={<MailOutlined />} placeholder="Nhập email" size="large" />
            </Form.Item>

            <Form.Item
              name="password"
              label="Mật khẩu"
              rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
              hasFeedback
            >
              <Input.Password prefix={<LockOutlined />} placeholder="Nhập mật khẩu" size="large" />
            </Form.Item>

            <Form.Item
              name="confirm"
              label="Xác nhận mật khẩu"
              dependencies={["password"]}
              hasFeedback
              rules={[
                { required: true, message: "Vui lòng xác nhận mật khẩu!" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("password") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error("Hai mật khẩu không khớp!"));
                  },
                }),
              ]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder="Nhập lại mật khẩu" size="large" />
            </Form.Item>

            {apiError && (
              <div className="text-red-600 text-center mb-2 font-semibold">{apiError}</div>
            )}

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                className="w-full bg-gradient-to-r from-indigo-500 via-blue-500 to-pink-400 hover:from-indigo-600 hover:to-pink-500 text-white rounded-xl font-bold shadow-lg transition-all duration-200"
                size="large"
                loading={loading}
              >
                Đăng ký
              </Button>
            </Form.Item>
          </Form>

          <div className="text-center mt-4">
            <Text type="secondary">
              Đã có tài khoản?{" "}
              <Link to="/login" className="text-indigo-600 font-semibold hover:underline">
                Đăng nhập ngay
              </Link>
            </Text>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
