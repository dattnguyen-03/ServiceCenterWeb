import React, { useState } from "react";
import { Car, Zap, Settings, Users } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { useAuth } from "../../contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { getNetworkErrorMessage } from "../../utils/errorUtils";

const LoginForm: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState(""); 
  const [error, setError] = useState("");
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!username || !password) {
      setError("Vui lòng điền đầy đủ thông tin");
      return;
    }

    try {
      await login({ 
        email: username.trim(), // truyền username vào trường email để backend nhận đúng
        password: password.trim()
      });
      navigate("/", { replace: true });
    } catch (err: any) {
      setError(getNetworkErrorMessage(err));
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
              <Zap className="w-6 h-6 text-white/60" />
              <Settings className="w-6 h-6 text-white/60" />
              <Users className="w-6 h-6 text-white/60" />
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
              <label
                htmlFor="username"
                className="block text-sm font-semibold text-gray-700 mb-1"
              >
                Tên đăng nhập
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
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
              disabled={isLoading || !username || !password}
              className="w-full bg-gradient-to-r from-indigo-500 via-blue-500 to-pink-400 text-white py-2 px-4 rounded-xl font-bold shadow-lg hover:from-indigo-600 hover:to-pink-500 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-base flex items-center justify-center gap-2"
            >
              {isLoading && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              )}
              {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>
          </form>

          <div className="mt-6 text-center">
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
