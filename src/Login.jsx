import { useState } from "react";

// 1. Thêm prop onLoginSuccess vào đây
export default function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();

    const users = [
      { email: "admin@smarthome.com", password: "admin123", role: "Admin" },
      { email: "family@smarthome.com", password: "family123", role: "Gia đình" },
    ];

    const found = users.find(
      (u) => u.email === email && u.password === password
    );

    if (found) {
      alert("Đăng nhập thành công 🎉 " + found.role);
      
      // 2. Gọi hàm này để báo cho App.jsx biết là đã đăng nhập xong và chuyển trang
      if (onLoginSuccess) {
        onLoginSuccess();
      }
      
    } else {
      alert("Sai email hoặc mật khẩu ❌");
    }
  };

  return (
    <div className="min-h-screen bg-slate-300 flex items-center justify-center">
      <div className="bg-white w-[440px] rounded-2xl shadow-md p-8">
        
        {/* Icon */}
        <div className="flex justify-center mb-5">
          <div className="w-16 h-16 bg-indigo-500 rounded-full flex items-center justify-center">
            <span className="text-white text-2xl">🏠</span>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-semibold text-center mb-1">
          Smart Home
        </h1>
        <p className="text-gray-500 text-center mb-6">
          Đăng nhập để quản lý ngôi nhà thông minh của bạn
        </p>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="font-medium">Email</label>
            <input
              type="email"
              placeholder="admin@smarthome.com"
              className="w-full mt-1 bg-gray-100 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="font-medium">Mật khẩu</label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full mt-1 bg-gray-100 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button className="w-full bg-black text-white py-3 rounded-xl font-semibold hover:bg-gray-800 transition">
            Đăng nhập
          </button>
        </form>

        {/* Demo account */}
        <div className="bg-gray-100 mt-6 p-4 rounded-lg text-sm">
          <p className="font-semibold mb-1">Tài khoản demo:</p>
          <p>
            <b>Admin:</b> admin@smarthome.com / admin123
          </p>
          <p>
            <b>Gia đình:</b> family@smarthome.com / family123
          </p>
        </div>

      </div>
    </div>
  );
}