import React, { useState } from "react";
import { Car, Shield, User, Wrench } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { useAuth } from "../../contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("customer");
  const [password, setPassword] = useState(""); // Thêm state cho mật khẩu
  const [error, setError] = useState("");
  const { login, isLoading, setUser } = useAuth();
  const navigate = useNavigate();

  const roles = [
    {
      id: "customer",
      label: "Khách hàng",
      icon: User,
      color: "from-blue-500 to-blue-600",
    },
    {
      id: "staff",
      label: "Nhân viên",
      icon: Shield,
      color: "from-green-500 to-green-600",
    },
    {
      id: "technician",
      label: "Kỹ thuật viên",
      icon: Wrench,
      color: "from-orange-500 to-orange-600",
    },
    {
      id: "admin",
      label: "Quản trị viên",
      icon: Car,
      color: "from-purple-500 to-purple-600",
    },
  ];

  const demoAccounts = {
    customer: { email: "nam@email.com", password: "123456", role: "customer", name: "Demo Customer" },
    staff: { email: "staff@center.com", password: "123456", role: "staff", name: "Demo Staff" },
    technician: { email: "tech@center.com", password: "123456", role: "technician", name: "Demo Technician" },
    admin: { email: "admin@system.com", password: "123456", role: "admin", name: "Demo Admin" },
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      // Sau này chỉ cần thay fakeLogin bằng gọi API thực
      const user = fakeLogin(email, password, selectedRole);
      setUser(user);
      navigate("/", { replace: true });
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDemoLogin = (role: string) => {
    setEmail(demoAccounts[role as keyof typeof demoAccounts].email);
    setPassword(demoAccounts[role as keyof typeof demoAccounts].password); // Tự động điền mật khẩu demo
    setSelectedRole(role);
  };

  // Hàm xác thực giả lập, sau này thay bằng gọi API
  const fakeLogin = (email: string, password: string, role: string) => {
    const user = Object.values(demoAccounts).find(
      (u) => u.email === email && u.role === role && u.password === password
    );
    if (!user) {
      throw new Error("Thông tin đăng nhập không hợp lệ");
    }
    return user;
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
      <div className="w-full max-w-3xl flex flex-col md:flex-row rounded-2xl shadow-2xl overflow-hidden border border-blue-100 bg-white/80 backdrop-blur-lg">
        <div className="md:w-1/2 flex flex-col items-center justify-center bg-gradient-to-br from-indigo-700 via-blue-500 to-pink-400 p-6 relative">
          <div className="absolute top-4 left-4 opacity-30 blur-2xl w-20 h-20 rounded-full bg-pink-300"></div>
          <div className="absolute bottom-4 right-4 opacity-20 blur-2xl w-24 h-24 rounded-full bg-blue-400"></div>
          <div className="flex flex-col items-center z-10">
            <Car className="w-12 h-12 mb-4 text-white drop-shadow-2xl" />
            <h1 className="text-3xl font-extrabold mb-2 text-white drop-shadow-xl tracking-tight" style={{ fontFamily: "Montserrat, sans-serif" }}>
              <Link to="/">
              EV Service Manager
              </Link>
            </h1>
            <p className="text-base font-medium mb-2 text-white/90 text-center drop-shadow">
              Hệ thống quản lý dịch vụ xe điện<br />Chào mừng bạn quay lại!
            </p>
            <div className="flex gap-2 mt-2">
              <Shield className="w-6 h-6 text-white/60" />
              <Wrench className="w-6 h-6 text-white/60" />
              <User className="w-6 h-6 text-white/60" />
            </div>
          </div>
        </div>
        <div className="md:w-1/2 w-full flex flex-col justify-center p-6 md:p-8 bg-white/95">
          <button
            type="button"
            className="flex items-center justify-center w-full py-2 mb-5 rounded-xl border border-gray-200 bg-white hover:bg-blue-50 shadow transition-all duration-200 hover:shadow-lg group"
          >
            <FcGoogle className="w-6 h-6 mr-2" />
            <span className="font-semibold text-gray-700 group-hover:text-indigo-600 transition">Đăng nhập với Google</span>
          </button>

          <div className="flex items-center my-3">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-indigo-300 to-transparent" />
            <span className="mx-2 text-indigo-400 font-bold text-xs uppercase tracking-widest">hoặc</span>
            <div className="flex-1 h-px bg-gradient-to-l from-transparent via-indigo-300 to-transparent" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Chọn vai trò đăng nhập
              </label>
              <div className="grid grid-cols-2 gap-2">
                {roles.map((role) => {
                  const Icon = role.icon;
                  return (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => handleDemoLogin(role.id)}
                      className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all duration-200 shadow-sm font-semibold text-sm ${
                        selectedRole === role.id
                          ? "border-indigo-500 bg-indigo-50 scale-105 shadow-lg"
                          : "border-gray-200 hover:border-indigo-300 hover:bg-indigo-50"
                      }`}
                    >
                      <div
                        className={`flex items-center justify-center w-9 h-9 bg-gradient-to-br ${role.color} rounded-lg mb-1 shadow`}
                      >
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-gray-900">{role.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-gray-700 mb-1"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 bg-white text-sm"
                required
                autoComplete="username"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-gray-700 mb-1"
              >
                Mật khẩu
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 bg-white text-sm"
                required
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm text-center font-semibold">{error}</div>
            )}

            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-xs text-indigo-500 hover:underline font-semibold">
                Quên mật khẩu?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-indigo-500 via-blue-500 to-pink-400 text-white py-2 px-4 rounded-xl font-bold shadow-lg hover:from-indigo-600 hover:to-pink-500 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-base"
            >
              {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>
          </form>

          <div className="mt-5 pt-5 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              Nhấp vào vai trò để tự động điền thông tin demo
              <br />
              customer:nam@email.com / 123456
              <br />
              staff:staff@center.com / 123456
              <br />
              technician:tech@center.com / 123456
              <br />
              admin:admin@system.com / 123456
            </p>
          </div>
          <div className="mt-4 text-center">
            <span className="text-gray-600 text-sm">
              Chưa có tài khoản?{" "}
              <Link to="/register" className="text-indigo-600 font-semibold hover:underline">
                Đăng ký ngay
              </Link>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
