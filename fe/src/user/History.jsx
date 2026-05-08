import React, { useState, useEffect } from 'react';

const History = () => {
  // --- STATES ---
  const [alertLogs, setAlertLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- API CALLS ---
  const fetchAlertLogs = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      
      const res = await fetch("http://localhost:3000/api/v1/alerts?limit=50", {
        headers: { Authorization: `Bearer ${token}` }
      });

      const alertsData = await res.json();

      // Bóc tách mảng dữ liệu cảnh báo
      setAlertLogs(Array.isArray(alertsData) ? alertsData : (alertsData.data || []));

    } catch (error) {
      console.error("Lỗi fetch dữ liệu cảnh báo:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAlertLogs();
  }, []);

  // --- HELPER FUNCTIONS ---
  const formatTime = (isoString) => {
    if (!isoString) return { date: "--", time: "--" };
    const d = new Date(isoString);
    return {
      date: d.toLocaleDateString('vi-VN'),
      time: d.toLocaleTimeString('vi-VN')
    };
  };

  return (
    <div className="p-8 w-full max-w-7xl mx-auto font-sans">
      {/* Header */}
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Lịch sử cảnh báo</h1>
          <p className="text-gray-500">Theo dõi các sự cố và cảnh báo an toàn từ hệ thống</p>
        </div>
        <button 
          onClick={fetchAlertLogs} 
          className="text-sm bg-white border border-gray-200 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-50 font-medium flex items-center shadow-sm"
        >
          <span className="mr-2">↻</span> Làm mới
        </button>
      </div>

      {/* Thanh tìm kiếm (UI) */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          <input 
            type="text" 
            placeholder="Tìm kiếm thông báo cảnh báo..." 
            className="w-full bg-white border border-gray-200 rounded-lg pl-11 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-red-400"
          />
        </div>
        <button className="bg-white border border-gray-200 rounded-lg px-4 py-2.5 flex items-center text-gray-700 font-medium hover:bg-gray-50">
          <span className="mr-2">▽</span> Tất cả mức độ
        </button>
      </div>

      {/* Content Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center">
          <span className="text-red-500 mr-2 text-lg">🔥</span>
          <h3 className="font-bold text-gray-900">Danh sách cảnh báo hệ thống ({alertLogs.length})</h3>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-12 text-center text-gray-500 font-medium">
              Đang tải dữ liệu từ server...
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 flex items-center"><span className="mr-2">🕒</span> Thời gian</th>
                  <th className="px-6 py-4">Mức độ</th>
                  <th className="px-6 py-4">Thông báo</th>
                  <th className="px-6 py-4">Chỉ số lúc báo</th>
                  <th className="px-6 py-4 text-right">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="text-gray-600 text-base">
                {alertLogs.length === 0 ? (
                  <tr><td colSpan="5" className="px-6 py-8 text-center text-gray-400">Tuyệt vời! Không có cảnh báo nào.</td></tr>
                ) : (
                  alertLogs.map((alert, index) => {
                    const { date, time } = formatTime(alert.detected_at || alert.timestamp);
                    
                    // Format màu cho Mức độ nghiêm trọng
                    let severityColor = "text-yellow-600 bg-yellow-50"; // Mặc định Trung bình
                    if (alert.severity === "Cao") severityColor = "text-red-600 bg-red-50";
                    if (alert.severity === "Thap") severityColor = "text-blue-600 bg-blue-50";

                    return (
                      <tr key={alert._id || index} className="border-b border-gray-50 hover:bg-red-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="text-gray-900 font-medium">{date}</div>
                          <div className="text-gray-500 text-xs mt-0.5">{time}</div>
                        </td>
                        <td className="px-6 py-4 font-medium">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${severityColor}`}>
                            {alert.severity ? alert.severity.toUpperCase() : "TRUNG BÌNH"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-red-600 font-medium">
                          {alert.message || "Cảnh báo hệ thống"}
                        </td>
                        <td className="px-6 py-4 font-bold text-gray-900">
                          {alert.value_at_alert !== undefined ? alert.value_at_alert : "--"}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-md ${
                            alert.status === "Da xu ly" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                          }`}>
                            {alert.status || "Chưa xử lý"}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default History;