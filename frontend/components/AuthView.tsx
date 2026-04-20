import React, { useState } from "react";
import { api } from "../api";
import { User } from "../types";

interface AuthViewProps {
  onSuccess: (user: User, token: string) => void;
  onClose?: () => void;
}

const AuthView: React.FC<AuthViewProps> = ({ onSuccess, onClose }) => {

  const [isLogin, setIsLogin] = useState(true);

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    email: "",
  });

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {

    e.preventDefault();

    setError("");
    setIsLoading(true);

    const data = new FormData();

    data.append("username", formData.username);
    data.append("password", formData.password);

    if (!isLogin) data.append("email", formData.email);

    try {

      if (isLogin) {

        const res = await api.login(data);

        onSuccess(res.user, res.access_token);

      } else {

        await api.register(data);

        const loginRes = await api.login(data);

        onSuccess(loginRes.user, loginRes.access_token);

      }

    } catch (err: any) {

      setError(err.message || "Thao tác thất bại");

    } finally {

      setIsLoading(false);

    }

  };

  const handleGoogleLogin = async () => {

    try {

      const url = await api.getGoogleLoginUrl();

      window.location.href = url;

    } catch {

      setError("Không thể kết nối với Google");

    }

  };

  return (

    <div className="flex items-center justify-center min-h-screen w-full">

      {/* CARD */}
      <div className="relative w-full max-w-md mx-auto bg-[#151520]/90 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl p-8">

        {/* TITLE */}
        <div className="text-center mb-8">

          <h2 className="text-3xl font-black bg-gradient-to-r from-purple-400 via-pink-400 to-amber-400 bg-clip-text text-transparent mb-2">

            {isLogin ? "Chào mừng trở lại" : "Gia nhập Zodiac Whisper"}

          </h2>

          <p className="text-purple-200/50 text-sm">

            {isLogin
              ? "Đăng nhập để tiếp tục hành trình của bạn."
              : "Tạo tài khoản để khám phá vũ trụ."}

          </p>

        </div>

        {/* ERROR */}
        {error && (

          <div className="mb-5 p-3 bg-red-500/10 text-red-400 text-sm rounded-lg border border-red-500/20">

            {error}

          </div>

        )}

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-4">

          {!isLogin && (

            <div>

              <label className="text-xs text-purple-400 mb-1 block">

                Email

              </label>

              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="oracle@example.com"
                className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 outline-none"
              />

            </div>

          )}

          <div>

            <label className="text-xs text-purple-400 mb-1 block">

              Tên đăng nhập

            </label>

            <input
              type="text"
              required
              value={formData.username}
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
              placeholder="username"
              className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 outline-none"
            />

          </div>

          <div>

            <label className="text-xs text-purple-400 mb-1 block">

              Mật khẩu

            </label>

            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              placeholder="••••••••"
              className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 outline-none"
            />

          </div>

          {/* BUTTON */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-3 rounded-lg hover:scale-[1.02] transition disabled:opacity-50"
          >

            {isLoading
              ? "Đang xử lý..."
              : isLogin
              ? "Đăng nhập"
              : "Đăng ký"}

          </button>

        </form>

        {/* DIVIDER */}
        <div className="my-6 flex items-center gap-3 text-white/30 text-xs">

          <div className="flex-1 h-px bg-white/10"></div>

          Hoặc

          <div className="flex-1 h-px bg-white/10"></div>

        </div>

        {/* GOOGLE LOGIN */}
        <button
          onClick={handleGoogleLogin}
          className="w-full bg-white/5 border border-white/10 py-3 rounded-lg text-white hover:bg-white/10 transition flex items-center justify-center gap-2"
        >

          <svg className="w-5 h-5" viewBox="0 0 24 24">

            <path fill="#EA4335" d="M12 11.01V13h6.32a5.42 5.42 0 0 1-2.32 3.53l3.65 2.82A11.96 11.96 0 0 0 24 12c0-.68-.07-1.36-.2-2.01H12z"/>
            <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.97-2.91L16.32 18.27A7.14 7.14 0 0 1 12 19.5c-3.13 0-5.83-2.12-6.78-4.97L1.44 17.5A11.94 11.94 0 0 0 12 24z"/>
            <path fill="#4285F4" d="M5.22 14.53A7.14 7.14 0 0 1 4.5 12c0-.88.16-1.72.44-2.5l-3.71-2.88A11.93 11.93 0 0 0 0 12c0 2.45.74 4.73 2.01 6.63l3.21-2.1z"/>
            <path fill="#FBBC05" d="M12 4.5c1.76 0 3.34.6 4.58 1.78l3.43-3.43A11.95 11.95 0 0 0 12 0 11.94 11.94 0 0 0 1.44 6.62l3.78 2.91c.95-2.85 3.65-4.97 6.78-4.97z"/>

          </svg>

          Tiếp tục với Google

        </button>

        {/* SWITCH LOGIN */}
        <p className="text-center mt-6 text-sm text-gray-400">

          {isLogin ? "Chưa có tài khoản?" : "Đã có tài khoản?"}

          <button
            onClick={() => setIsLogin(!isLogin)}
            className="ml-2 text-purple-400 hover:text-purple-300"
          >
            {isLogin ? "Đăng ký ngay" : "Đăng nhập"}
          </button>

        </p>

      </div>

    </div>

  );

};

export default AuthView;