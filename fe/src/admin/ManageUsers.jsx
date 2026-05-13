import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserPlusIcon, PowerIcon } from "@heroicons/react/24/outline";

const API_BASE = "http://localhost:3000/api/v1/system/users";

const formatDateTime = (dateString) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleString("vi-VN");
};

const ManageUsers = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [userCount, setUserCount] = useState({ total: 0, member: 0, revoked: 0 });
    const [isLoading, setIsLoading] = useState(true);

    const fetchUsersData = async () => {
        try {
            setIsLoading(true);
            const token = localStorage.getItem("token");
            const res = await fetch(API_BASE, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                }
            });

            if (!res.ok) throw new Error("Không thể lấy dữ liệu");

            const result = await res.json();
            const userArray = result.data || [];
            const members = userArray.filter(user => user.role !== "SystemAdmin");
            const revoked = userArray.filter(user => user.status === "invalid");

            setUsers(userArray);
            setUserCount({
                total: userArray.length,
                member: members.length,
                revoked: revoked.length,
            });
        } catch (error) {
            console.error("Lỗi:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUsersData();
    }, []);

    const handleRevokeUser = async (userId) => {
        if (!window.confirm("Bạn có chắc muốn vô hiệu hóa tài khoản này? Người dùng có thể được khôi phục sau.")) return;

        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_BASE}/${userId}/invalidate`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({ reason: "SystemAdmin revoked access from user management UI" })
            });

            if (res.ok) {
                alert("Đã vô hiệu hóa tài khoản.");
                fetchUsersData();
            } else {
                const data = await res.json();
                alert(data.error || "Vô hiệu hóa thất bại.");
            }
        } catch {
            alert("Lỗi kết nối server.");
        }
    };

    const handleReactivateUser = async (userId) => {
        if (!window.confirm("Khôi phục quyền truy cập cho tài khoản này?")) return;

        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_BASE}/${userId}/reactivate`, {
                method: "PATCH",
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (res.ok) {
                alert("Đã khôi phục tài khoản.");
                fetchUsersData();
            } else {
                const data = await res.json();
                alert(data.error || "Khôi phục thất bại.");
            }
        } catch {
            alert("Lỗi kết nối server.");
        }
    };

    return (
        <div className="p-7 font-sans">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="font-bold text-3xl text-gray-900">Quản lý Hệ thống</h1>
                    <p className="text-gray-500">Quản lý vòng đời tài khoản người dùng</p>
                </div>
                <button
                    onClick={() => navigate("/admin/add-user")}
                    className="bg-black text-white px-5 py-2.5 rounded-xl flex items-center font-medium shadow-lg hover:bg-gray-800 transition"
                >
                    <UserPlusIcon className="w-5 h-5 mr-2"/> Thêm User Mới
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <p className="text-gray-500 text-sm">Tổng số tài khoản</p>
                    <h3 className="text-3xl font-bold">{userCount.total}</h3>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <p className="text-gray-500 text-sm">Thành viên Gia đình</p>
                    <h3 className="text-3xl font-bold text-green-600">{userCount.member}</h3>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <p className="text-gray-500 text-sm">Đã vô hiệu hóa</p>
                    <h3 className="text-3xl font-bold text-red-600">{userCount.revoked}</h3>
                </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-600 text-sm uppercase">
                        <tr>
                            <th className="p-4">Người dùng</th>
                            <th className="p-4">Email</th>
                            <th className="p-4">Vai trò</th>
                            <th className="p-4 text-center">Trạng thái</th>
                            <th className="p-4 text-center">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {isLoading ? (
                            <tr>
                                <td colSpan="5" className="p-8 text-center text-gray-500">Đang tải danh sách người dùng...</td>
                            </tr>
                        ) : users.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="p-8 text-center text-gray-500">Không có người dùng nào.</td>
                            </tr>
                        ) : users.map((user) => {
                            const isActive = user.status === "active";
                            const statusTime = isActive ? user.reactivated_at : user.invalidated_at;

                            return (
                                <tr key={user._id} className="hover:bg-gray-50 transition">
                                    <td className="p-4 font-semibold text-gray-900">
                                        <div>{user.full_name || user.username}</div>
                                        <div className="text-xs text-gray-400 font-normal">@{user.username}</div>
                                    </td>
                                    <td className="p-4 text-gray-600">{user.email}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${user.role === "SystemAdmin" ? "bg-red-50 text-red-600" : "bg-gray-100 text-gray-600"}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="p-4 text-center">
                                        <div className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${
                                            isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                                        }`}>
                                            {isActive ? "● ĐANG HOẠT ĐỘNG" : "○ ĐÃ VÔ HIỆU"}
                                        </div>
                                        {statusTime && (
                                            <div className="mt-1 text-[11px] text-gray-400">
                                                {isActive ? "Khôi phục" : "Vô hiệu"}: {formatDateTime(statusTime)}
                                            </div>
                                        )}
                                        {!isActive && user.invalid_reason && (
                                            <div className="mt-1 text-[11px] text-gray-500 max-w-48 mx-auto truncate" title={user.invalid_reason}>
                                                {user.invalid_reason}
                                            </div>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        <div className="flex justify-center">
                                            {user.role !== "SystemAdmin" ? (
                                                <button
                                                    onClick={() => isActive ? handleRevokeUser(user._id) : handleReactivateUser(user._id)}
                                                    className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition ${
                                                        isActive
                                                            ? "bg-red-50 text-red-700 hover:bg-red-100"
                                                            : "bg-green-50 text-green-700 hover:bg-green-100"
                                                    }`}
                                                >
                                                    <PowerIcon className="w-4 h-4" />
                                                    {isActive ? "Vô hiệu hóa" : "Khôi phục"}
                                                </button>
                                            ) : (
                                                <span className="text-xs text-gray-400">Không khả dụng</span>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ManageUsers;
