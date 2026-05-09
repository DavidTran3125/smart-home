import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const API_URL = "http://localhost:3000";

      const res = await fetch(`${API_URL}/api/v1/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          full_name: fullName,
          username: username,
          email: email,
          password: password,
          role: "Gia đình",
        }),
      });

      if (res.ok) {
        alert("Đăng ký thành công 🎉 Hãy đăng nhập ngay!");
        navigate("/login"); 
      } else {
        const data = await res.json();
        alert(data.error || "Đăng ký thất bại, vui lòng kiểm tra lại ❌");
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
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
            <span className="text-white text-2xl">✨</span>
          </div>
        </div>

        <h1 className="text-3xl font-semibold text-center mb-1">
          Tạo tài khoản
        </h1>
        <p className="text-gray-500 text-center mb-6">
          Tham gia hệ thống Smart Home của bạn
        </p>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="font-medium">Họ và tên</label>
            <input
              type="text"
              required
              placeholder="Nguyễn Văn A"
              className="w-full mt-1 bg-gray-100 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>

          <div>
            <label className="font-medium">Tên đăng nhập (Username)</label>
            <input
              type="text"
              required
              placeholder="nguyenvana"
              className="w-full mt-1 bg-gray-100 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div>
            <label className="font-medium">Email</label>
            <input
              type="email"
              required
              placeholder="email@smarthome.com"
              className="w-full mt-1 bg-gray-100 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
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
              className="w-full mt-1 bg-gray-100 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button 
            type="submit"
            disabled={isLoading}
            className={`w-full text-white py-3 mt-2 rounded-xl font-semibold transition ${
              isLoading ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {isLoading ? "Đang xử lý..." : "Đăng ký ngay"}
          </button>
        </form>

        <div className="mt-6 text-center text-gray-600">
          Đã có tài khoản?{" "}
          <button 
            type="button"
            onClick={() => navigate("/login")}
            className="text-green-600 font-semibold hover:underline"
          >
            Đăng nhập
          </button>
        </div>

      </div>
    </div>
  );
}