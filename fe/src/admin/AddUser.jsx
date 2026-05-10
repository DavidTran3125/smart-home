import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AddUser = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        username: "",
        full_name: "",
        role: "Gia đình", // Đổi mặc định thành Member cho khớp Backend mới
    });

    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage({ type: "", text: "" });

        const adminToken = localStorage.getItem("token");

        if (!adminToken) {
            setMessage({ type: "error", text: "Lỗi: Phiên đăng nhập hết hạn." });
            setIsLoading(false);
            return;
        }

        try {
            // Đảm bảo URL chính xác: /api/v1/system/users/create
            const response = await fetch("http://localhost:3000/api/v1/system/users/create", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${adminToken}`,
                },
                body: JSON.stringify({
                    username: formData.username,
                    email: formData.email,
                    password: formData.password,
                    full_name: formData.full_name,
                    role: formData.role // Sẽ gửi "SystemAdmin" hoặc "Member"
                }),
            });

            const data = await response.json();
            
            if (response.ok) {
                setMessage({ type: "success", text: "Tạo người dùng mới thành công!" });
                // Reset form
                setFormData({ username: "", full_name: "", email: "", password: "", role: "Member" });
                
                // Chuyển hướng sau 2 giây
                setTimeout(() => {
                    navigate("/admin"); // Hoặc trang quản lý user của bạn
                }, 2000);
            } else {
                // Hiển thị lỗi chi tiết từ Backend (ví dụ: "Email đã tồn tại")
                setMessage({ type: "error", text: data.error || "Tạo người dùng thất bại." });
            }
        } catch (error) {
            setMessage({ type: "error", text: "Lỗi kết nối đến server." });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
            <div className="w-96 text-center mb-6">
                <h1 className="font-bold text-4xl text-black">Thêm người dùng</h1>
                <p className="mt-2 text-gray-600">Dành cho Quản trị viên hệ thống</p>
            </div>

            <div className="flex flex-col items-center justify-center w-full">
                {message.text && (
                    <div className={`w-96 p-4 mb-4 rounded-lg shadow-md border-l-4 ${
                        message.type === "success" 
                        ? "bg-green-50 border-green-500 text-green-800" 
                        : "bg-red-50 border-red-500 text-red-800"
                    }`}>
                        <div className="flex items-center">
                            <span className="font-bold mr-2">
                                {message.type === "success" ? "✓" : "✕"}
                            </span>
                            {message.text}
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="border border-black w-96 p-6 rounded-lg bg-white shadow-sm">
                    <div className="mb-4">
                        <label className="block mb-2 text-sm font-medium text-gray-700">Tên đăng nhập</label>
                        <input 
                            type="text" name="username" required
                            value={formData.username}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md outline-none focus:ring-2 focus:ring-black"
                            placeholder="user123" 
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block mb-2 text-sm font-medium text-gray-700">Email</label>
                        <input 
                            type="email" name="email" required
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md outline-none focus:ring-2 focus:ring-black"
                            placeholder="name@example.com" 
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block mb-2 text-sm font-medium text-gray-700">Mật khẩu</label>
                        <input 
                            type="password" name="password" required
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md outline-none focus:ring-2 focus:ring-black"
                            placeholder="••••••••" 
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block mb-2 text-sm font-medium text-gray-700">Họ và tên</label>
                        <input 
                            type="text" name="full_name" required
                            value={formData.full_name}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md outline-none focus:ring-2 focus:ring-black"
                            placeholder="Nguyễn Văn A" 
                        />
                    </div>

                    <div className="mb-6">
                        <label className="block mb-2 text-sm font-medium text-gray-700">Vai trò</label>
                        <select 
                            name="role" 
                            value={formData.role}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md outline-none focus:ring-2 focus:ring-black bg-white"
                        >
                            <option value="Gia đình">Gia đình</option>
                            <option value="Admin">Admin (Chủ nhà)</option>
                            <option value="SystemAdmin">SystemAdmin (Quản trị hệ thống)</option>
                        </select>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full py-2 px-4 rounded-md text-white font-medium transition-colors ${
                            isLoading ? "bg-gray-400 cursor-not-allowed" : "bg-black hover:bg-gray-800"
                        }`}
                    >
                        {isLoading ? "Đang xử lý..." : "Xác nhận thêm"}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default AddUser;