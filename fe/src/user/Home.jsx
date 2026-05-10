import React, { useState, useEffect } from 'react';
import { PowerIcon, UserPlusIcon, LightBulbIcon } from '@heroicons/react/24/outline';

const Home = () => {
    const [devices, setDevices] = useState([]);
    const [userHome, setUserHome] = useState(null); // { id, name } hoặc null

    // State cho Form mời thành viên
    const [inviteEmail, setInviteEmail] = useState("");
    const [inviteMessage, setInviteMessage] = useState({ type: '', text: '' });

    const [isLoading, setIsLoading] = useState(true);
    const token = localStorage.getItem("token");

    useEffect(() => {
        fetchUserHomeInfo();
        fetchDevices();
    }, []);

    // 1. Lấy thông tin Nhà của User hiện tại thông qua API Auth Me
    const fetchUserHomeInfo = async () => {
        try {
            const res = await fetch("http://localhost:3000/api/v1/auth/me", {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const result = await res.json();

            if (result.success && result.data?.homeId) {
                setUserHome({ id: result.data.homeId, name: "Nhà của tôi" });
            }
        } catch (error) {
            console.error("Lỗi tải thông tin user/nhà:", error);
        }
    };

    // 2. Lấy danh sách thiết bị
    const fetchDevices = async () => {
        try {
            const res = await fetch("http://localhost:3000/api/v1/devices", {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const result = await res.json();
            if (result.success) {
                setDevices(result.data);
            }
        } catch (error) {
            console.error("Lỗi tải thiết bị:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // 3. Mời thành viên mới vào nhà
    const handleInvite = async (e) => {
        e.preventDefault();

        if (!userHome?.id) {
            setInviteMessage({ type: 'error', text: 'Không tìm thấy thông tin nhà của bạn.' });
            return;
        }

        setInviteMessage({ type: 'info', text: 'Đang gửi lời mời...' });

        try {
            const res = await fetch(`http://localhost:3000/api/v1/homes/${userHome.id}/members/invite`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ email: inviteEmail })
            });
            const result = await res.json();

            if (res.ok && result.success) {
                setInviteMessage({ type: 'success', text: `Đã gửi lời mời tới ${inviteEmail} thành công!` });
                setInviteEmail("");
            } else {
                setInviteMessage({ type: 'error', text: result.error || "Không thể gửi lời mời." });
            }
        } catch (error) {
            setInviteMessage({ type: 'error', text: "Lỗi kết nối tới server." });
        }
    };

    // 4. Bật/Tắt thiết bị (Optimistic Update)
    const toggleDevice = async (deviceId, currentStatus) => {
        const newValue = currentStatus === "Bật" ? 0 : 1;

        setDevices(prev =>
            prev.map(d =>
                d._id === deviceId ? { ...d, status: newValue === 1 ? "Bật" : "Tắt" } : d
            )
        );

        try {
            const res = await fetch(`http://localhost:3000/api/v1/devices/${deviceId}/control`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ value: newValue })
            });

            if (!res.ok) {
                alert("Điều khiển thất bại! Đang khôi phục trạng thái...");
                fetchDevices();
            }
        } catch (error) {
            alert("Lỗi kết nối khi điều khiển thiết bị.");
            fetchDevices();
        }
    };

    if (isLoading) {
        return <div className="p-9 text-center text-gray-500">Đang tải dữ liệu...</div>;
    }

    return (
        <div className='p-9 max-w-6xl mx-auto'>
            <div className="mb-8 border-b pb-4">
                <h1 className="font-bold text-3xl text-gray-900">Nhà của tôi</h1>
                <p className="text-gray-500 mt-2">Quản lý không gian sống và các thiết bị thông minh của bạn.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* CỘT TRÁI: DANH SÁCH THIẾT BỊ */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-semibold text-gray-800">Thiết bị hiện có</h2>
                            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-1 rounded">
                                Tổng: {devices.length}
                            </span>
                        </div>

                        {devices.length === 0 ? (
                            <div className="text-center py-10 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                                <LightBulbIcon className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                                <p>Bạn chưa có thiết bị nào.</p>
                                <p className="text-sm">Vui lòng thêm thiết bị hoặc đợi quản trị viên cấp phát.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {devices.map((device) => (
                                    <div
                                        key={device._id}
                                        className="border border-gray-200 rounded-lg p-4 flex justify-between items-center bg-gray-50 hover:bg-white hover:shadow-md transition duration-200"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-full ${device.status === "Bật" ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-200 text-gray-500'}`}>
                                                <LightBulbIcon className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h3 className="font-medium text-gray-900">{device.name}</h3>
                                                <p className="text-xs text-gray-500 capitalize">{device.type}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => toggleDevice(device._id, device.status)}
                                            className={`p-2 rounded-full transition ${
                                                device.status === "Bật"
                                                    ? "bg-green-100 text-green-600 hover:bg-green-200"
                                                    : "bg-gray-200 text-gray-500 hover:bg-gray-300"
                                            }`}
                                        >
                                            <PowerIcon className="w-6 h-6" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* CỘT PHẢI: MỜI THÀNH VIÊN */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <div className="flex items-center gap-2 mb-1">
                            <UserPlusIcon className="w-6 h-6 text-blue-600" />
                            <h2 className="text-lg font-semibold text-gray-800">Chia sẻ quyền truy cập</h2>
                        </div>

                        {/* Hiển thị tên nhà đang mời vào */}
                        {userHome && (
                            <p className="text-xs text-gray-400 mb-4 ml-8">
                                Nhà: <span className="font-medium text-gray-600">{userHome.name}</span>
                            </p>
                        )}

                        {!userHome ? (
                            <p className="text-sm text-gray-500">
                                Không tìm thấy thông tin nhà của bạn. Vui lòng thử đăng nhập lại.
                            </p>
                        ) : (
                            <form onSubmit={handleInvite} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Email người thân
                                    </label>
                                    <input
                                        type="email"
                                        required
                                        value={inviteEmail}
                                        onChange={(e) => setInviteEmail(e.target.value)}
                                        placeholder="nguoinha@gmail.com"
                                        className="w-full border border-gray-300 rounded p-2 focus:ring-blue-500 text-sm"
                                    />
                                </div>

                                {inviteMessage.text && (
                                    <p className={`text-xs font-medium ${
                                        inviteMessage.type === 'error' ? 'text-red-600' : 'text-green-600'
                                    }`}>
                                        {inviteMessage.text}
                                    </p>
                                )}

                                <button
                                    type="submit"
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded transition text-sm"
                                >
                                    Gửi lời mời
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;