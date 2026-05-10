import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const API_URL = "http://localhost:3000"; 

      const res = await fetch(`${API_URL}/api/v1/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Đăng nhập thành công 🎉");
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        console.log(data.user);
        console.log(data.user.role);
        if (data.user.role === "SystemAdmin") {
          navigate("/admin");
        } else {
          navigate("/user");
        }
      } else {
        alert(data.error || "Sai email hoặc mật khẩu ❌"); 
      }
    } catch (err) {
      console.error(err);
      alert("Lỗi kết nối đến server ❌");
    } finally {
      setIsLoading(false); 
    }
  };

  return (
    <div className="min-h-screen bg-slate-300 flex items-center justify-center py-10">
      <div className="bg-white w-110 rounded-2xl shadow-md p-8">
        
        <div className="flex justify-center mb-5">
          <div className="w-16 h-16 bg-indigo-500 rounded-full flex items-center justify-center">
            <span className="text-white text-2xl">🏠</span>
          </div>
        </div>

        <h1 className="text-3xl font-semibold text-center mb-1">
          Smart Home
        </h1>
        <p className="text-gray-500 text-center mb-6">
          Đăng nhập để quản lý ngôi nhà của bạn
        </p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="font-medium">Email</label>
            <input
              type="email"
              required
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
              required
              placeholder="••••••••"
              className="w-full mt-1 bg-gray-100 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button 
            type="submit"
            disabled={isLoading}
            className={`w-full text-white py-3 rounded-xl font-semibold transition ${
              isLoading ? "bg-gray-400 cursor-not-allowed" : "bg-black hover:bg-gray-800"
            }`}
          >
            {isLoading ? "Đang xử lý..." : "Đăng nhập"}
          </button>
        </form>

        <div className="mt-6 text-center text-gray-600">
          Chưa có tài khoản?{" "}
          <button 
            type="button"
            onClick={() => navigate("/register")}
            className="text-indigo-600 font-semibold hover:underline"
          >
            Đăng ký ngay
          </button>
        </div>

      </div>
    </div>
  );
}