import React from 'react';

const History = ({ logs = [] }) => {
  return (
    <div className="p-8 w-full max-w-7xl mx-auto font-sans">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">Lịch sử</h1>
        <p className="text-gray-500">Theo dõi lịch sử hoạt động và cảnh báo</p>
      </div>

      {/* Thanh tìm kiếm và Lọc */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          <input 
            type="text" 
            placeholder="Tìm kiếm theo thiết bị, hành động..." 
            className="w-full bg-white border border-gray-200 rounded-lg pl-11 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#10b981]"
          />
        </div>
        <button className="bg-white border border-gray-200 rounded-lg px-4 py-2.5 flex items-center text-gray-700 font-medium hover:bg-gray-50">
          <span className="mr-2">▽</span> Tất cả
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg font-medium text-sm flex items-center">
          <span className="mr-2">⏻</span> Hoạt động thiết bị ({logs.length})
        </button>
        <button className="bg-white text-gray-500 px-4 py-2 rounded-lg font-medium text-sm flex items-center hover:bg-gray-50 border border-transparent">
          <span className="mr-2">🔥</span> Cảnh báo (1)
        </button>
      </div>

      {/* Bảng Lịch sử */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <h3 className="font-bold text-gray-900">Lịch sử hoạt động thiết bị</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-gray-900 font-semibold border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 flex items-center"><span className="mr-2">🕒</span> Thời gian</th>
                <th className="px-6 py-4">Thiết bị</th>
                <th className="px-6 py-4">Hành động</th>
                <th className="px-6 py-4">Trạng thái trước</th>
                <th className="px-6 py-4">Trạng thái mới</th>
              </tr>
            </thead>
            <tbody className="text-gray-600">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-400">Chưa có hoạt động nào được ghi nhận.</td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-gray-900">{log.date}</div>
                      <div className="text-gray-500 text-xs">{log.time}</div>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">{log.device}</td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-gray-50 border border-gray-200 rounded-md text-xs font-medium">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4">{log.oldState}</td>
                    <td className="px-6 py-4 font-medium text-blue-600">{log.newState}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default History;