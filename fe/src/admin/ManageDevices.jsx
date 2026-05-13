import { useCallback, useEffect, useState } from "react";
import {
    BellAlertIcon,
    CpuChipIcon,
    MagnifyingGlassIcon,
    PowerIcon,
    SignalIcon,
} from "@heroicons/react/24/outline";

const API_URL = "http://localhost:3000/api/v1/system/devices";

const formatDateTime = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleString("vi-VN");
};

const getOwnerName = (owner) => {
    if (!owner) return "-";
    return owner.full_name || owner.username || owner.email || "-";
};

const getConditionClass = (condition, activeClass, inactiveClass) => {
    return condition ? activeClass : inactiveClass;
};

const StatCard = ({ label, value, icon, className = "text-gray-700" }) => {
    const IconComponent = icon;

    return (
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500 font-medium">{label}</p>
                <IconComponent className={`w-6 h-6 ${className}`} />
            </div>
            <h2 className={`text-3xl font-bold mt-4 ${className}`}>{value}</h2>
        </div>
    );
};

const ManageDevices = () => {
    const [devices, setDevices] = useState([]);
    const [searchInput, setSearchInput] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [status, setStatus] = useState("");
    const [stats, setStats] = useState({ online: 0, offline: 0, on: 0, off: 0, alerting: 0 });
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchDevices = useCallback(async () => {
        try {
            setIsLoading(true);
            setError("");

            const token = localStorage.getItem("token");
            const params = new URLSearchParams({
                page: String(page),
                limit: "20",
            });

            if (searchQuery) params.set("search", searchQuery);
            if (status) params.set("status", status);

            const res = await fetch(`${API_URL}?${params.toString()}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const result = await res.json();
            if (!res.ok) throw new Error(result.error || "Không thể tải danh sách thiết bị");

            setDevices(result.data || []);
            setStats(result.stats || { online: 0, offline: 0, on: 0, off: 0, alerting: 0 });
            setTotal(result.total || 0);
            setTotalPages(result.totalPages || 1);
        } catch (err) {
            setError(err.message || "Không thể tải danh sách thiết bị");
        } finally {
            setIsLoading(false);
        }
    }, [page, searchQuery, status]);

    useEffect(() => {
        fetchDevices();
    }, [fetchDevices]);

    const handleSubmit = (event) => {
        event.preventDefault();
        setSearchQuery(searchInput.trim());
        setPage(1);
    };

    const handleStatusChange = (event) => {
        setStatus(event.target.value);
        setPage(1);
    };

    return (
        <div className="p-8 w-full max-w-7xl mx-auto font-sans">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
                <div>
                    <h1 className="font-bold text-3xl mb-2 text-gray-900">Giám sát thiết bị</h1>
                    <p className="text-gray-500">Theo dõi thiết bị, chủ sở hữu, trạng thái kết nối và cảnh báo trên toàn hệ thống.</p>
                </div>
                <button
                    onClick={fetchDevices}
                    className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition"
                >
                    Làm mới
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-5 mb-8">
                <StatCard label="Tổng thiết bị" value={total} icon={CpuChipIcon} />
                <StatCard label="Online" value={stats.online} icon={SignalIcon} className="text-green-600" />
                <StatCard label="Offline" value={stats.offline} icon={SignalIcon} className="text-gray-500" />
                <StatCard label="Đang bật" value={stats.on} icon={PowerIcon} className="text-blue-600" />
                <StatCard label="Đang tắt" value={stats.off} icon={PowerIcon} className="text-red-500" />
                <StatCard label="Cảnh báo" value={stats.alerting} icon={BellAlertIcon} className="text-orange-600" />
            </div>

            <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl p-4 mb-6 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-[1fr_180px_auto] gap-3">
                    <div className="relative">
                        <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            value={searchInput}
                            onChange={(event) => setSearchInput(event.target.value)}
                            placeholder="Tìm theo tên, feed hoặc loại thiết bị..."
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/10"
                        />
                    </div>
                    <select
                        value={status}
                        onChange={handleStatusChange}
                        className="px-4 py-2.5 border border-gray-200 rounded-xl bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-black/10"
                    >
                        <option value="">Tất cả trạng thái</option>
                        <option value="Bật">Đang bật</option>
                        <option value="Tắt">Đang tắt</option>
                    </select>
                    <button className="bg-gray-900 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-gray-800 transition">
                        Tìm kiếm
                    </button>
                </div>
            </form>

            {error && (
                <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium">
                    {error}
                </div>
            )}

            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[1100px]">
                        <thead className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wide">
                            <tr>
                                <th className="p-4">Thiết bị</th>
                                <th className="p-4">Feed</th>
                                <th className="p-4">Nhà</th>
                                <th className="p-4">Chủ sở hữu</th>
                                <th className="p-4">Nguồn</th>
                                <th className="p-4">Kết nối</th>
                                <th className="p-4">Cảnh báo</th>
                                <th className="p-4">Lần cuối</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm">
                            {isLoading ? (
                                <tr>
                                    <td colSpan="8" className="p-8 text-center text-gray-500">Đang tải danh sách thiết bị...</td>
                                </tr>
                            ) : devices.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="p-8 text-center text-gray-500">Không tìm thấy thiết bị nào.</td>
                                </tr>
                            ) : devices.map((device) => {
                                const isOn = device.condition?.power === "on";
                                const isOnline = device.condition?.connectivity === "online";
                                const hasAlert = device.condition?.alert === "alerting";

                                return (
                                    <tr key={device._id} className="hover:bg-gray-50 transition">
                                        <td className="p-4">
                                            <div className="font-semibold text-gray-900">{device.name}</div>
                                            <div className="text-xs text-gray-400">{device.type || "unknown"} {device.model ? `· ${device.model}` : ""}</div>
                                        </td>
                                        <td className="p-4 text-gray-600">{device.feed_name || "-"}</td>
                                        <td className="p-4 text-gray-600">{device.homeId?.name || "-"}</td>
                                        <td className="p-4">
                                            <div className="font-medium text-gray-900">{getOwnerName(device.owner_id)}</div>
                                            {device.owner_id?.email && <div className="text-xs text-gray-400">{device.owner_id.email}</div>}
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${getConditionClass(isOn, "bg-blue-50 text-blue-700", "bg-gray-100 text-gray-500")}`}>
                                                {isOn ? "Bật" : "Tắt"}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${getConditionClass(isOnline, "bg-green-50 text-green-700", "bg-gray-100 text-gray-500")}`}>
                                                {isOnline ? "Online" : "Offline"}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${getConditionClass(hasAlert, "bg-orange-50 text-orange-700", "bg-green-50 text-green-700")}`}>
                                                {hasAlert ? "Có cảnh báo" : "Bình thường"}
                                            </span>
                                        </td>
                                        <td className="p-4 text-gray-600 whitespace-nowrap">{formatDateTime(device.last_seen)}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="flex items-center justify-between mt-6">
                <button
                    onClick={() => setPage(prev => Math.max(1, prev - 1))}
                    disabled={page <= 1 || isLoading}
                    className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                    Trang trước
                </button>
                <span className="text-sm text-gray-500">Trang {page} / {totalPages}</span>
                <button
                    onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={page >= totalPages || isLoading}
                    className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                    Trang sau
                </button>
            </div>
        </div>
    );
};

export default ManageDevices;
