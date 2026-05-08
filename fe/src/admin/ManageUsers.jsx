import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
    UserPlusIcon, UserGroupIcon, UserIcon, 
    PencilSquareIcon, TrashIcon, ShieldCheckIcon,
    XMarkIcon 
} from "@heroicons/react/24/outline";

const ManageUsers = () => {
    const navigate = useNavigate();
    
    const [users, setUsers] = useState([]);
    const [userCount, setUserCount] = useState({
        total: 0,
        admin: 0,
        family: 0,
    });
    const [isLoading, setIsLoading] = useState(true);
 
    const [editingUser, setEditingUser] = useState(null);

 
    const updateUserCount = (userArray) => {
        const admins = userArray.filter(u => u.role === 'Admin');
        const families = userArray.filter(u => u.role === 'Gia dinh' || u.role === 'Gia đình');
        setUserCount({
            total: userArray.length,
            admin: admins.length,
            family: families.length,
        });
    };

    const fetchUsersData = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch("http://localhost:3000/api/v1/users", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`, 
                }
            });

            if (!res.ok) throw new Error("Không thể lấy danh sách người dùng");
            const data = await res.json();
            const userArray = Array.isArray(data) ? data : (data.data || []);
            
            setUsers(userArray);
            updateUserCount(userArray);
        } catch (error) {
            console.log("Lỗi gọi API:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUsersData();
    }, []);

    const handleDelete = async (userId) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa người dùng này khỏi hệ thống?")) return;

        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`http://localhost:3000/api/v1/users/${userId}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`, 
                }
            });

            if (res.ok) {
                
                const updatedUsers = users.filter(user => user._id !== userId);
                setUsers(updatedUsers);
                updateUserCount(updatedUsers); 
                alert("Đã xóa người dùng thành công!");
            } else {
                alert("Xóa thất bại. Vui lòng thử lại.");
            }
        } catch (error) {
            alert("Lỗi kết nối đến server.");
        }
    };


    const handleEditChange = (e) => {
        setEditingUser({
            ...editingUser,
            [e.target.name]: e.target.value
        });
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`http://localhost:3000/api/v1/users/${editingUser._id}`, {
                method: "PUT", 
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`, 
                },
                body: JSON.stringify(editingUser)
            });

            if (res.ok) {
                
                const updatedUsers = users.map(user => 
                    user._id === editingUser._id ? editingUser : user
                );
                setUsers(updatedUsers);
                updateUserCount(updatedUsers); 
                setEditingUser(null); 
                alert("Cập nhật thông tin thành công!");
            } else {
                alert("Cập nhật thất bại. Vui lòng thử lại.");
            }
        } catch (error) {
            alert("Lỗi kết nối đến server.");
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "—";
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN');
    };

    return (
        <div className="p-7 font-sans relative">
            <div className="flex justify-between items-center">
                <div className="p-2" >
                    <h1 className="font-bold text-3xl mb-2 text-gray-900">Quản lý User</h1>
                    <p className="text-gray-500">Quản lý danh sách người dùng trong hệ thống</p>
                </div>
                <button 
                    onClick={() => navigate('/admin/add-user')} 
                    className="bg-gray-900 text-white px-4 py-2 hover:bg-gray-800 transition cursor-pointer rounded-xl flex items-center font-medium shadow-sm"
                >
                    <UserPlusIcon className="w-5 h-5 mr-2"/> Thêm User
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-6">
                <div className="border border-gray-200 bg-white rounded-2xl shadow-sm p-6">
                    <div className="flex justify-between items-start">
                        <div className="font-medium text-gray-500">Tổng số User</div>
                        <UserGroupIcon className="w-6 h-6 text-gray-400"/>
                    </div>
                    <h2 className="font-extrabold text-4xl mt-4 text-gray-900">{isLoading ? "..." : userCount.total}</h2>
                </div>

                <div className="border border-gray-200 bg-white rounded-2xl shadow-sm p-6">
                    <div className="flex justify-between items-start">
                        <div className="font-medium text-gray-500">Người dùng</div>
                        <UserIcon className="w-6 h-6 text-green-500"/>
                    </div>
                    <h2 className="font-extrabold text-4xl mt-4 text-green-600">{isLoading ? "..." : userCount.family}</h2>
                </div>

                <div className="border border-gray-200 bg-white rounded-2xl shadow-sm p-6">
                    <div className="flex justify-between items-start">
                        <div className="font-medium text-gray-500">Admin</div>
                        <ShieldCheckIcon className="w-6 h-6 text-blue-500"/>
                    </div>
                    <h2 className="font-extrabold text-4xl mt-4 text-blue-600">{isLoading ? "..." : userCount.admin}</h2>
                </div>
            </div>

            <div className="mt-10 bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="p-5 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900">Danh sách người dùng</h3>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 text-gray-600 text-sm border-b border-gray-100">
                                <th className="p-4 font-semibold whitespace-nowrap">Họ tên</th>
                                <th className="p-4 font-semibold whitespace-nowrap">Email</th>
                                <th className="p-4 font-semibold whitespace-nowrap">Vai trò</th>
                                <th className="p-4 font-semibold whitespace-nowrap">Số thiết bị</th>
                                <th className="p-4 font-semibold whitespace-nowrap">Ngày tạo</th>
                                <th className="p-4 font-semibold text-center whitespace-nowrap">Thao tác</th>
                            </tr>
                        </thead>
                        
                        <tbody className="divide-y divide-gray-100 text-sm">
                            {isLoading ? (
                                <tr>
                                    <td colSpan="6" className="p-8 text-center text-gray-500">Đang tải dữ liệu...</td>
                                </tr>
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="p-8 text-center text-gray-500">Chưa có người dùng nào.</td>
                                </tr>
                            ) : (
                                users.map((user) => (
                                    <tr key={user._id} className="hover:bg-gray-50 transition-colors">                                      
                                        <td className="p-4 font-bold text-gray-900">{user.full_name || user.username || "—"}</td>
                                        <td className="p-4 text-gray-600">{user.email || "—"}</td>
                                        <td className="p-4">
                                            {user.role === 'Admin' ? (
                                                <span className="inline-flex items-center gap-1 bg-[#d94857] text-white px-2.5 py-1 rounded text-xs font-semibold tracking-wide">
                                                    <ShieldCheckIcon className="w-3.5 h-3.5" /> Admin
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 bg-[#101828] text-white px-2.5 py-1 rounded text-xs font-semibold tracking-wide">
                                                    <UserGroupIcon className="w-3.5 h-3.5" /> Gia đình
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4 text-gray-600">0 thiết bị</td>
                                        <td className="p-4 text-gray-600">{formatDate(user.created_at)}</td>
                                        <td className="p-4 flex justify-center items-center gap-3">
                                            <button 
                                                onClick={() => setEditingUser(user)}
                                                className="text-gray-400 hover:text-blue-600 transition"
                                            >
                                                <PencilSquareIcon className="w-5 h-5" />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(user._id)}
                                                className="text-red-300 hover:text-red-600 transition"
                                            >
                                                <TrashIcon className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {editingUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded-2xl shadow-xl w-96 relative">
                        <button 
                            onClick={() => setEditingUser(null)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-900"
                        >
                            <XMarkIcon className="w-6 h-6" />
                        </button>

                        <h2 className="text-xl font-bold mb-4 text-gray-900">Sửa thông tin</h2>
                        
                        <form onSubmit={handleEditSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
                                <input 
                                    type="text" name="full_name" required
                                    value={editingUser.full_name || ""} 
                                    onChange={handleEditChange} 
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md outline-none focus:ring-2 focus:ring-black"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input 
                                    type="email" name="email" required
                                    value={editingUser.email || ""} 
                                    onChange={handleEditChange} 
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md outline-none focus:ring-2 focus:ring-black"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Vai trò</label>
                                <select 
                                    name="role" 
                                    value={editingUser.role} 
                                    onChange={handleEditChange} 
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md outline-none focus:ring-2 focus:ring-black bg-white"
                                >
                                    <option value="Admin">Admin</option>
                                    <option value="Gia đình">Gia đình</option>
                                </select>
                            </div>

                            <button 
                                type="submit" 
                                className="w-full bg-gray-900 text-white py-2 rounded-md hover:bg-gray-800 transition font-medium mt-4"
                            >
                                Lưu thay đổi
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ManageUsers;