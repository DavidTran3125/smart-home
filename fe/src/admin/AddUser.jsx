import React, { useState } from 'react';

const AddUser = () => {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        username: "",
        full_name: "",
        role: "Gia đình",
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
            setMessage({ type: "error", text: "Lỗi: Không tìm thấy Token xác thực. Vui lòng đăng nhập lại." });
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch("http://localhost:3000/api/v1/users", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${adminToken}`,
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();
            
            if (response.ok) {
                setMessage({ type: "success", text: "Tạo người dùng mới thành công!" });
                setFormData({ username: "", full_name: "", email: "", password: "", role: "Gia đình" });
                
                setTimeout(() => {
                    setMessage({ type: "", text: "" });
                }, 3000);
            } else {
                setMessage({ type: "error", text: data.message || "Tạo người dùng thất bại." });
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
                <p className="mt-2 text-gray-600">Nhập thông tin người dùng mới</p>
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
                                {message.type === "success" ? "✓ Thành công:" : "✕ Lỗi:"}
                            </span>
                            {message.text}
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="border border-black w-96 p-6 rounded-lg bg-white shadow-sm">
                    <div className="mb-4">
                        <label className="block mb-2 text-sm font-medium text-gray-700">
                            Tên đăng nhập
                        </label>
                        <input 
                            type="text"
                            name="username"
                            required
                            value={formData.username}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md outline-none focus:ring-2 focus:ring-black"
                            placeholder="nguyenvana" 
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block mb-2 text-sm font-medium text-gray-700">
                            Email
                        </label>
                        <input 
                            type="email"
                            name="email"
                            required
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md outline-none focus:ring-2 focus:ring-black"
                            placeholder="nva@smarthome.com" 
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block mb-2 text-sm font-medium text-gray-700">
                            Mật khẩu
                        </label>
                        <input 
                            type="password"
                            name="password"
                            required
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md outline-none focus:ring-2 focus:ring-black"
                            placeholder="nva123" 
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block mb-2 text-sm font-medium text-gray-700">
                            Họ và tên
                        </label>
                        <input 
                            type="text"
                            name="full_name"
                            required
                            value={formData.full_name}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md outline-none focus:ring-2 focus:ring-black"
                            placeholder="Nguyễn Văn A" 
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block mb-2 text-sm font-medium text-gray-700">
                            Vai trò
                        </label>
                        <select 
                            name="role" 
                            value={formData.role}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md outline-none focus:ring-2 focus:ring-black bg-white"
                        >
                            <option value="Admin">Admin</option>
                            <option value="Gia đình">Gia đình</option>
                        </select>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full py-2 px-4 rounded-md text-white font-medium transition-colors ${
                            isLoading ? "bg-green-300 cursor-not-allowed" : "bg-green-500 hover:bg-green-600"
                        }`}
                    >
                        {isLoading ? "Đang xử lý..." : "Thêm người dùng"}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default AddUser;