import { useCallback, useEffect, useState } from "react";

const API_URL = "http://localhost:3000/api/v1/system/logs";

const formatDateTime = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleString("vi-VN");
};

const getUserName = (user) => {
    if (!user) return "System";
    return user.full_name || user.username || user.email || "Unknown user";
};

const Logs = () => {
    const [logs, setLogs] = useState([]);
    const [sort, setSort] = useState("latest");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchLogs = useCallback(async () => {
        try {
            setIsLoading(true);
            setError("");

            const token = localStorage.getItem("token");
            const params = new URLSearchParams({
                page: String(page),
                limit: "20",
                sort,
            });

            const res = await fetch(`${API_URL}?${params.toString()}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const result = await res.json();
            if (!res.ok) throw new Error(result.error || "Không thể tải logs");

            setLogs(result.data || []);
            setTotal(result.total || 0);
            setTotalPages(result.totalPages || 1);
        } catch (err) {
            setError(err.message || "Không thể tải logs");
        } finally {
            setIsLoading(false);
        }
    }, [page, sort]);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    const handleSortChange = (nextSort) => {
        setSort(nextSort);
        setPage(1);
    };

    return (
        <div className="p-8 w-full max-w-7xl mx-auto font-sans">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-1">Lịch sử hệ thống</h1>
                    <p className="text-gray-500">Theo dõi toàn bộ hoạt động đã ghi nhận trong hệ thống.</p>
                </div>

                <div className="flex items-center gap-3">
                    <select
                        value={sort}
                        onChange={(event) => handleSortChange(event.target.value)}
                        className="bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-black/10"
                    >
                        <option value="latest">Mới nhất trước</option>
                        <option value="oldest">Cũ nhất trước</option>
                    </select>
                    <button
                        onClick={fetchLogs}
                        className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition"
                    >
                        Làm mới
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-sm text-gray-500">Tổng logs</p>
                    <h2 className="text-3xl font-bold text-gray-900 mt-1">{total}</h2>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-sm text-gray-500">Trang hiện tại</p>
                    <h2 className="text-3xl font-bold text-blue-600 mt-1">{page}/{totalPages}</h2>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-sm text-gray-500">Thứ tự hiển thị</p>
                    <h2 className="text-xl font-bold text-gray-900 mt-2">{sort === "latest" ? "Mới nhất" : "Cũ nhất"}</h2>
                </div>
            </div>

            {error && (
                <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium">
                    {error}
                </div>
            )}

            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[980px]">
                        <thead className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wide">
                            <tr>
                                <th className="p-4">Thời gian</th>
                                <th className="p-4">Hành động</th>
                                <th className="p-4">Người dùng</th>
                                <th className="p-4">Thiết bị</th>
                                <th className="p-4">Nhà</th>
                                <th className="p-4">Mô tả</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm">
                            {isLoading ? (
                                <tr>
                                    <td colSpan="6" className="p-8 text-center text-gray-500">Đang tải logs...</td>
                                </tr>
                            ) : logs.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="p-8 text-center text-gray-500">Chưa có log nào.</td>
                                </tr>
                            ) : logs.map((log) => (
                                <tr key={log._id} className="hover:bg-gray-50 transition">
                                    <td className="p-4 text-gray-600 whitespace-nowrap">
                                        {formatDateTime(log.timestamp)}
                                    </td>
                                    <td className="p-4">
                                        <span className="inline-flex px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 font-semibold text-xs">
                                            {log.action || "-"}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="font-semibold text-gray-900">{getUserName(log.user_id)}</div>
                                        {log.user_id && (
                                            <div className="text-xs text-gray-400">{log.user_id.role} · {log.user_id.status}</div>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        <div className="font-medium text-gray-900">{log.device_id?.name || "-"}</div>
                                        {log.device_id?.feed_name && (
                                            <div className="text-xs text-gray-400">{log.device_id.feed_name}</div>
                                        )}
                                    </td>
                                    <td className="p-4 text-gray-600">{log.home?.name || "-"}</td>
                                    <td className="p-4 text-gray-600 max-w-md">
                                        <div className="line-clamp-2" title={log.description || ""}>
                                            {log.description || "-"}
                                        </div>
                                    </td>
                                </tr>
                            ))}
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

export default Logs;
