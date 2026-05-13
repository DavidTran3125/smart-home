import { useCallback, useEffect, useState } from "react";

const API_URL = "http://localhost:3000/api/v1/logs";

const formatDateTime = (dateString) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleString("vi-VN");
};

const getUserName = (user) => {
  if (!user) return "-";
  return user.full_name || user.username || user.email || "-";
};

const HomeLogs = () => {
  const [logs, setLogs] = useState([]);
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
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      const res = await fetch(`${API_URL}?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Không thể tải nhật ký nhà");

      setLogs(result.data || []);
      setTotal(result.total || 0);
      setTotalPages(result.totalPages || 1);
    } catch (err) {
      setError(err.message || "Không thể tải nhật ký nhà");
    } finally {
      setIsLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return (
    <div className="p-8 w-full max-w-7xl mx-auto font-sans">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Nhật ký nhà</h1>
          <p className="text-gray-500">Theo dõi các thao tác thiết bị, ngưỡng và cảnh báo trong nhà.</p>
        </div>
        <button onClick={fetchLogs} className="bg-white border border-gray-200 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
          Làm mới
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <p className="text-sm text-gray-500">Tổng nhật ký</p>
          <h2 className="text-3xl font-bold text-gray-900 mt-1">{total}</h2>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <p className="text-sm text-gray-500">Trang hiện tại</p>
          <h2 className="text-3xl font-bold text-blue-600 mt-1">{page}/{totalPages}</h2>
        </div>
      </div>

      {error && <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium">{error}</div>}

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[900px]">
            <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
              <tr>
                <th className="p-4">Thời gian</th>
                <th className="p-4">Hành động</th>
                <th className="p-4">Người dùng</th>
                <th className="p-4">Thiết bị</th>
                <th className="p-4">Mô tả</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {isLoading ? (
                <tr><td colSpan="5" className="p-8 text-center text-gray-500">Đang tải nhật ký...</td></tr>
              ) : logs.length === 0 ? (
                <tr><td colSpan="5" className="p-8 text-center text-gray-500">Chưa có nhật ký nào.</td></tr>
              ) : logs.map((log) => (
                <tr key={log._id} className="hover:bg-gray-50">
                  <td className="p-4 text-gray-600 whitespace-nowrap">{formatDateTime(log.timestamp)}</td>
                  <td className="p-4"><span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-bold">{log.action}</span></td>
                  <td className="p-4 text-gray-900 font-medium">{getUserName(log.user_id)}</td>
                  <td className="p-4 text-gray-600">{log.device_id?.name || "-"}</td>
                  <td className="p-4 text-gray-600">{log.description || "-"}</td>
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

export default HomeLogs;
