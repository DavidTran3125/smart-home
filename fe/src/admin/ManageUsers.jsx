// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { 
//     UserPlusIcon, UserGroupIcon, UserIcon, 
//     PencilSquareIcon, TrashIcon, ShieldCheckIcon,
//     XMarkIcon 
// } from "@heroicons/react/24/outline";

// const ManageUsers = () => {
//     const navigate = useNavigate();
    
//     const [users, setUsers] = useState([]);
//     const [userCount, setUserCount] = useState({
//         total: 0,
//         admin: 0,
//         member: 0,
//     });
//     const [isLoading, setIsLoading] = useState(true);
//     const [editingUser, setEditingUser] = useState(null);

    
//     const updateUserCount = (userArray, totalFromApi) => {
//         const admins = userArray.filter(u => u.role === 'SystemAdmin');
//         const members = userArray.filter(u => u.role === 'Member' || u.role === 'HomeAdmin');
        
//         setUserCount({
//             total: totalFromApi || userArray.length,
//             admin: admins.length,
//             member: members.length,
//         });
//     };

//     const fetchUsersData = async () => {
//         try {
//             setIsLoading(true);
//             const token = localStorage.getItem("token");
//             const res = await fetch("http://localhost:3000/api/v1/system/users", {
//                 method: "GET",
//                 headers: {
//                     "Content-Type": "application/json",
//                     "Authorization": `Bearer ${token}`, 
//                 }
//             });

//             if (!res.ok) throw new Error("Không thể lấy danh sách người dùng");
            
//             const result = await res.json();
//             const userArray = result.data || [];
//             const activeUsers = userArray.filter(user => user.status === "active");
            
//             setUsers(activeUsers);
//             updateUserCount(activeUsers, activeUsers.length);
//         } catch (error) {
//             console.error("Lỗi gọi API:", error);
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     useEffect(() => {
//         fetchUsersData();
//     }, []);

//     const handleDelete = async (userId) => {
//         if (!window.confirm("Bạn có chắc chắn muốn vô hiệu hóa người dùng này? (Soft-delete)")) return;

//         try {
//             const token = localStorage.getItem("token");
//             const res = await fetch(`http://localhost:3000/api/v1/system/users/${userId}/invalidate`, {
//                 method: "PATCH",
//                 headers: {
//                     "Content-Type": "application/json",
//                     "Authorization": `Bearer ${token}`, 
//                 },
//                 body: JSON.stringify({ reason: "Admin xóa từ giao diện quản lý" })
//             });

//             if (res.ok) {
//                 alert("Đã vô hiệu hóa tài khoản thành công!");
//                 fetchUsersData(); // Reload lại danh sách
//             } else {
//                 const errData = await res.json();
//                 alert(errData.error || "Thao tác thất bại.");
//             }
//         } catch (error) {
//             alert("Lỗi kết nối đến server.");
//         }
//     };

//     const handleEditChange = (e) => {
//         setEditingUser({
//             ...editingUser,
//             [e.target.name]: e.target.value
//         });
//     };

//     const handleEditSubmit = async (e) => {
//         e.preventDefault();
//         try {
//             const token = localStorage.getItem("token");
//             const res = await fetch(`http://localhost:3000/api/v1/system/users/${editingUser._id}`, {
//                 method: "PUT", 
//                 headers: {
//                     "Content-Type": "application/json",
//                     "Authorization": `Bearer ${token}`, 
//                 },
//                 body: JSON.stringify({
//                     full_name: editingUser.full_name,
//                     email: editingUser.email,
//                     phone: editingUser.phone,
//                     // Lưu ý: Backend chỉ cho update 1 số field profile
//                 })
//             });

//             if (res.ok) {
//                 setEditingUser(null);
//                 fetchUsersData();
//                 alert("Cập nhật thông tin thành công!");
//             } else {
//                 alert("Cập nhật thất bại.");
//             }
//         } catch (error) {
//             alert("Lỗi kết nối đến server.");
//         }
//     };

//     const formatDate = (dateString) => {
//         if (!dateString) return "—";
//         return new Date(dateString).toLocaleDateString('vi-VN');
//     };

//     return (
//         <div className="p-7 font-sans relative">
//             <div className="flex justify-between items-center">
//                 <div className="p-2" >
//                     <h1 className="font-bold text-3xl mb-2 text-gray-900">Quản lý User</h1>
//                     <p className="text-gray-500">Quản trị viên hệ thống - Toàn quyền quản lý tài khoản</p>
//                 </div>
//                 <button 
//                     onClick={() => navigate('/admin/add-user')} 
//                     className="bg-gray-900 text-white px-4 py-2 hover:bg-gray-800 transition cursor-pointer rounded-xl flex items-center font-medium shadow-sm"
//                 >
//                     <UserPlusIcon className="w-5 h-5 mr-2"/> Thêm User
//                 </button>
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-6">
//                 <div className="border border-gray-200 bg-white rounded-2xl shadow-sm p-6">
//                     <div className="flex justify-between items-start">
//                         <div className="font-medium text-gray-500">Tổng số User</div>
//                         <UserGroupIcon className="w-6 h-6 text-gray-400"/>
//                     </div>
//                     <h2 className="font-extrabold text-4xl mt-4 text-gray-900">{isLoading ? "..." : userCount.total}</h2>
//                 </div>

//                 <div className="border border-gray-200 bg-white rounded-2xl shadow-sm p-6">
//                     <div className="flex justify-between items-start">
//                         <div className="font-medium text-gray-500">Thành viên / Member</div>
//                         <UserIcon className="w-6 h-6 text-green-500"/>
//                     </div>
//                     <h2 className="font-extrabold text-4xl mt-4 text-green-600">{isLoading ? "..." : userCount.member}</h2>
//                 </div>

//                 <div className="border border-gray-200 bg-white rounded-2xl shadow-sm p-6">
//                     <div className="flex justify-between items-start">
//                         <div className="font-medium text-gray-500">Hệ thống Admin</div>
//                         <ShieldCheckIcon className="w-6 h-6 text-blue-500"/>
//                     </div>
//                     <h2 className="font-extrabold text-4xl mt-4 text-blue-600">{isLoading ? "..." : userCount.admin}</h2>
//                 </div>
//             </div>

//             <div className="mt-10 bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
//                 <div className="p-5 border-b border-gray-100 flex justify-between items-center">
//                     <h3 className="text-lg font-bold text-gray-900">Danh sách người dùng hệ thống</h3>
//                 </div>
                
//                 <div className="overflow-x-auto">
//                     <table className="w-full text-left border-collapse">
//                         <thead>
//                             <tr className="bg-gray-50 text-gray-600 text-sm border-b border-gray-100">
//                                 <th className="p-4 font-semibold">Tên người dùng</th>
//                                 <th className="p-4 font-semibold">Email</th>
//                                 <th className="p-4 font-semibold">Vai trò</th>
//                                 <th className="p-4 font-semibold">Trạng thái</th>
//                                 <th className="p-4 font-semibold">Ngày tạo</th>
//                                 <th className="p-4 font-semibold text-center">Thao tác</th>
//                             </tr>
//                         </thead>
                        
//                         <tbody className="divide-y divide-gray-100 text-sm">
//                             {isLoading ? (
//                                 <tr>
//                                     <td colSpan="6" className="p-8 text-center text-gray-500">Đang truy vấn dữ liệu Admin...</td>
//                                 </tr>
//                             ) : users.length === 0 ? (
//                                 <tr>
//                                     <td colSpan="6" className="p-8 text-center text-gray-500">Không tìm thấy dữ liệu. Hãy chạy lệnh Seed.</td>
//                                 </tr>
//                             ) : (
//                                 users.map((user) => (
//                                     <tr key={user._id} className="hover:bg-gray-50 transition-colors">                                     
//                                         <td className="p-4 font-bold text-gray-900">
//                                             <div>{user.full_name || "—"}</div>
//                                             <div className="text-xs text-gray-400 font-normal">@{user.username}</div>
//                                         </td>
//                                         <td className="p-4 text-gray-600">{user.email || "—"}</td>
//                                         <td className="p-4">
//                                             {user.role === 'SystemAdmin' ? (
//                                                 <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 px-2.5 py-1 rounded-md text-xs font-bold">
//                                                     <ShieldCheckIcon className="w-3.5 h-3.5" /> SystemAdmin
//                                                 </span>
//                                             ) : (
//                                                 <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 px-2.5 py-1 rounded-md text-xs font-bold">
//                                                     <UserIcon className="w-3.5 h-3.5" /> {user.role}
//                                                 </span>
//                                             )}
//                                         </td>
//                                         <td className="p-4">
//                                             <span className={`px-2 py-1 rounded-full text-[11px] font-bold uppercase ${user.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
//                                                 {user.status === 'active' ? 'Hoạt động' : 'Vô hiệu'}
//                                             </span>
//                                         </td>
//                                         <td className="p-4 text-gray-600">{formatDate(user.created_at)}</td>
//                                         <td className="p-4 flex justify-center items-center gap-3">
//                                             <button 
//                                                 onClick={() => setEditingUser(user)}
//                                                 className="text-gray-400 hover:text-blue-600 transition p-1"
//                                                 title="Sửa profile"
//                                             >
//                                                 <PencilSquareIcon className="w-5 h-5" />
//                                             </button>
//                                             {user.status === 'active' && user.role !== 'SystemAdmin' && (
//                                                 <button 
//                                                     onClick={() => handleDelete(user._id)}
//                                                     className="text-red-300 hover:text-red-600 transition p-1"
//                                                     title="Vô hiệu hóa"
//                                                 >
//                                                     <TrashIcon className="w-5 h-5" />
//                                                 </button>
//                                             )}
//                                         </td>
//                                     </tr>
//                                 ))
//                             )}
//                         </tbody>
//                     </table>
//                 </div>
//             </div>

//             {/* Modal chỉnh sửa Profile */}
//             {editingUser && (
//                 <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
//                     <div className="bg-white p-6 rounded-2xl shadow-xl w-96 relative border border-gray-100">
//                         <button 
//                             onClick={() => setEditingUser(null)}
//                             className="absolute top-4 right-4 text-gray-400 hover:text-gray-900"
//                         >
//                             <XMarkIcon className="w-6 h-6" />
//                         </button>
//                         <h2 className="text-xl font-bold mb-4 text-gray-900">Chỉnh sửa Profile</h2>
//                         <form onSubmit={handleEditSubmit} className="space-y-4">
//                             <div>
//                                 <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
//                                 <input 
//                                     type="text" name="full_name" required
//                                     value={editingUser.full_name || ""} 
//                                     onChange={handleEditChange} 
//                                     className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-black"
//                                 />
//                             </div>
//                             <div>
//                                 <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
//                                 <input 
//                                     type="email" name="email" required
//                                     value={editingUser.email || ""} 
//                                     onChange={handleEditChange} 
//                                     className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-black"
//                                 />
//                             </div>
//                             <div className="bg-blue-50 p-3 rounded-lg text-xs text-blue-700">
//                                 * Theo quy định mới, vai trò SystemAdmin chỉ có thể được gán qua hệ thống Seed hoặc Database trực tiếp để đảm bảo bảo mật.
//                             </div>
//                             <button 
//                                 type="submit" 
//                                 className="w-full bg-gray-900 text-white py-2 rounded-xl hover:bg-gray-800 transition font-medium mt-4"
//                             >
//                                 Lưu thay đổi
//                             </button>
//                         </form>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// }

// export default ManageUsers;






import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
    UserPlusIcon, UserGroupIcon, UserIcon, 
    PencilSquareIcon, TrashIcon, ShieldCheckIcon,
    XMarkIcon, PowerIcon
} from "@heroicons/react/24/outline";

const ManageUsers = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [userCount, setUserCount] = useState({ total: 0, admin: 0, member: 0 });
    const [isLoading, setIsLoading] = useState(true);
    const [editingUser, setEditingUser] = useState(null);

    const API_BASE = "http://localhost:3000/api/v1/system/users";

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
            
            // Lọc dữ liệu: Nếu ông muốn xóa là biến mất, hãy dùng filter này
            // Nhưng vì mình đã có nút Toggle Bật/Tắt, nên mình cứ hiện hết ra để quản lý nhé
            setUsers(userArray);

            const admins = userArray.filter(u => u.role === 'SystemAdmin');
            const members = userArray.filter(u => u.role !== 'SystemAdmin');
            setUserCount({
                total: userArray.length,
                admin: admins.length,
                member: members.length,
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

    // 1. XỬ LÝ XÓA VĨNH VIỄN (Hard Delete)
    const handleDelete = async (userId) => {
        if (!window.confirm("CẢNH BÁO: User này sẽ bị xóa VĨNH VIỄN khỏi Database. Tiếp tục?")) return;

        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_BASE}/${userId}/hard-delete`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (res.ok) {
                alert("Đã xóa vĩnh viễn!");
                fetchUsersData();
            } else {
                alert("Xóa thất bại.");
            }
        } catch (error) {
            alert("Lỗi kết nối server.");
        }
    };

    // 2. XỬ LÝ BẬT/TẮT TRẠNG THÁI (Toggle)
    const handleToggleStatus = async (userId) => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_BASE}/${userId}/toggle`, {
                method: "PATCH",
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (res.ok) {
                fetchUsersData(); // Cập nhật lại màu sắc nút
            }
        } catch (error) {
            console.error("Lỗi toggle");
        }
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_BASE}/${editingUser._id}`, {
                method: "PUT", 
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`, 
                },
                body: JSON.stringify(editingUser)
            });

            if (res.ok) {
                setEditingUser(null);
                fetchUsersData();
                alert("Cập nhật thành công!");
            }
        } catch (error) {
            alert("Lỗi kết nối.");
        }
    };

    return (
        <div className="p-7 font-sans">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="font-bold text-3xl text-gray-900">Quản lý Hệ thống</h1>
                    <p className="text-gray-500">Quản lý User & Trạng thái hoạt động</p>
                </div>
                <button 
                    onClick={() => navigate('/admin/add-user')} 
                    className="bg-black text-white px-5 py-2.5 rounded-xl flex items-center font-medium shadow-lg hover:bg-gray-800 transition"
                >
                    <UserPlusIcon className="w-5 h-5 mr-2"/> Thêm User Mới
                </button>
            </div>

            {/* Thống kê nhanh */}
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
                    <p className="text-gray-500 text-sm">Quản trị hệ thống</p>
                    <h3 className="text-3xl font-bold text-blue-600">{userCount.admin}</h3>
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
                        {users.map((user) => (
                            <tr key={user._id} className="hover:bg-gray-50 transition">
                                <td className="p-4 font-semibold text-gray-900">{user.full_name || user.username}</td>
                                <td className="p-4 text-gray-600">{user.email}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${user.role === 'SystemAdmin' ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-600'}`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="p-4 text-center">
                                    <button 
                                        onClick={() => handleToggleStatus(user._id)}
                                        className={`px-3 py-1 rounded-full text-xs font-bold transition ${
                                            user.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                        }`}
                                    >
                                        {user.status === 'active' ? '● ĐANG HOẠT ĐỘNG' : '○ ĐÃ VÔ HIỆU'}
                                    </button>
                                </td>
                                <td className="p-4 flex justify-center gap-3">
                                    <button onClick={() => setEditingUser(user)} className="p-2 text-gray-400 hover:text-blue-600">
                                        <PencilSquareIcon className="w-5 h-5" />
                                    </button>
                                    {user.role !== 'SystemAdmin' && (
                                        <button onClick={() => handleDelete(user._id)} className="p-2 text-gray-400 hover:text-red-600">
                                            <TrashIcon className="w-5 h-5" />
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal Edit */}
            {editingUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="bg-white p-6 rounded-2xl w-96 shadow-2xl">
                        <h2 className="text-xl font-bold mb-4">Sửa thông tin</h2>
                        <div className="space-y-4">
                            <input 
                                className="w-full p-2 border rounded-lg"
                                value={editingUser.full_name}
                                onChange={(e) => setEditingUser({...editingUser, full_name: e.target.value})}
                                placeholder="Họ tên"
                            />
                            <input 
                                className="w-full p-2 border rounded-lg"
                                value={editingUser.email}
                                onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                                placeholder="Email"
                            />
                            <div className="flex gap-2 mt-4">
                                <button onClick={handleEditSubmit} className="flex-1 bg-black text-white py-2 rounded-lg">Lưu</button>
                                <button onClick={() => setEditingUser(null)} className="flex-1 bg-gray-200 py-2 rounded-lg">Hủy</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageUsers;