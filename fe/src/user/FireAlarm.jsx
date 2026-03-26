import React, { useState } from 'react';

const FireAlarm = () => {
  // State quản lý trạng thái an toàn (true: bình thường, false: có cháy)
  const [isSafe, setIsSafe] = useState(true);

  // Dữ liệu mô phỏng lịch sử khi có sự cố
  const mockAlertHistory = [
    { id: 1, time: '20:04:15 - 22/03/2026', location: 'Phòng khách', type: 'Phát hiện khói', status: 'Chưa xử lý' },
    { id: 2, time: '20:04:10 - 22/03/2026', location: 'Phòng khách', type: 'Nhiệt độ tăng cao đột ngột (65.5°C)', status: 'Chưa xử lý' },
  ];

  return (
    <div className="p-8 w-full max-w-7xl mx-auto font-sans relative">
      
      {/* NÚT MÔ PHỎNG (Dành cho Developer để test UI) */}
      <button 
        onClick={() => setIsSafe(!isSafe)}
        className={`absolute top-8 right-8 px-4 py-2 rounded-lg font-bold shadow-md transition-all ${isSafe ? 'bg-red-100 text-red-600 hover:bg-red-200' : 'bg-green-100 text-green-600 hover:bg-green-200'}`}
      >
        {isSafe ? '🔥 Mô phỏng Cháy' : '✅ Khôi phục An toàn'}
      </button>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">Cảnh báo cháy</h1>
        <p className="text-gray-500">Theo dõi và cảnh báo nguy cơ cháy nổ</p>
      </div>

      {/* Thẻ Trạng thái Hệ thống (Lớn) */}
      <div className={`relative w-full rounded-xl border-2 p-12 flex flex-col items-center justify-center transition-all duration-500 mb-6 
        ${isSafe ? 'bg-[#f0fdf4] border-[#86efac]' : 'bg-[#fef2f2] border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]'}`}
      >
        {/* Label góc trái trên */}
        <div className="absolute top-5 left-5 flex items-center">
          <svg className={`w-5 h-5 mr-2 ${isSafe ? 'text-green-600' : 'text-red-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className={`font-semibold ${isSafe ? 'text-gray-800' : 'text-red-700'}`}>Trạng thái hệ thống</span>
        </div>

        {/* Badge góc phải trên */}
        <div className={`absolute top-5 right-5 px-3 py-1 rounded text-xs font-bold tracking-wider text-white 
          ${isSafe ? 'bg-[#10b981]' : 'bg-red-600 animate-pulse'}`}
        >
          {isSafe ? 'AN TOÀN' : 'NGUY HIỂM'}
        </div>

        {/* Center Content */}
        <div className="flex flex-col items-center text-center mt-4">
          {/* Icon */}
          <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-4 
            ${isSafe ? 'bg-green-100' : 'bg-red-100 animate-bounce'}`}
          >
            {isSafe ? (
              <svg className="w-12 h-12 text-[#10b981]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            ) : (
              <svg className="w-14 h-14 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            )}
          </div>
          
          <h2 className={`text-3xl font-bold mb-2 ${isSafe ? 'text-[#10b981]' : 'text-red-600 uppercase tracking-wide'}`}>
            {isSafe ? '✓ Hệ thống an toàn' : 'Phát hiện nguy cơ cháy!'}
          </h2>
          <p className={`${isSafe ? 'text-gray-500' : 'text-red-500 font-medium'}`}>
            {isSafe ? 'Không phát hiện nguy cơ cháy nổ' : 'Yêu cầu kiểm tra khu vực ngay lập tức! Hệ thống báo động đã kích hoạt.'}
          </p>
        </div>
      </div>

      {/* Grid 2 Thẻ Cảm Biến */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        
        {/* Cảm biến khói */}
        <div className={`bg-white p-6 rounded-xl border transition-colors ${isSafe ? 'border-gray-200' : 'border-red-300'}`}>
          <div className="flex items-center mb-6 text-gray-600 font-medium">
            <span className="mr-2">☁️</span> Cảm biến khói
          </div>
          <h3 className={`text-4xl font-bold mb-6 ${isSafe ? 'text-[#10b981]' : 'text-red-600'}`}>
            {isSafe ? 'Bình thường' : 'Phát hiện khói!'}
          </h3>
          <span className={`px-3 py-1.5 rounded-lg text-sm font-medium ${isSafe ? 'bg-gray-100 text-gray-700' : 'bg-red-100 text-red-700'}`}>
            {isSafe ? 'An toàn' : 'Nguy hiểm'}
          </span>
        </div>

        {/* Cảm biến Nhiệt độ */}
        <div className={`bg-white p-6 rounded-xl border transition-colors ${isSafe ? 'border-gray-200' : 'border-red-300'}`}>
          <div className="flex items-center mb-6 text-gray-600 font-medium">
            <span className="mr-2">🌡️</span> Nhiệt độ bất thường
          </div>
          <h3 className={`text-4xl font-bold mb-6 ${isSafe ? 'text-[#10b981]' : 'text-red-600'}`}>
            {isSafe ? '29.7°C' : '65.5°C'}
          </h3>
          <span className={`px-3 py-1.5 rounded-lg text-sm font-medium ${isSafe ? 'bg-gray-100 text-gray-700' : 'bg-red-100 text-red-700'}`}>
            {isSafe ? 'Bình thường' : 'Mức nhiệt nguy hiểm'}
          </span>
        </div>

      </div>

      {/* Lịch sử cảnh báo */}
      <div className="bg-white p-6 rounded-xl border border-gray-200">
        <h3 className="font-bold text-gray-900 mb-6">Lịch sử cảnh báo</h3>
        
        {isSafe ? (
          // Trạng thái trống (Không có lỗi)
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <svg className="w-16 h-16 mb-4 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <p>Không có cảnh báo cháy nào</p>
          </div>
        ) : (
          // Bảng chi tiết khi có lỗi
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-600 uppercase">
                <tr>
                  <th className="px-4 py-3 rounded-tl-lg">Thời gian</th>
                  <th className="px-4 py-3">Khu vực</th>
                  <th className="px-4 py-3">Loại cảnh báo</th>
                  <th className="px-4 py-3 rounded-tr-lg text-right">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {mockAlertHistory.map((alert) => (
                  <tr key={alert.id} className="border-b border-gray-100 hover:bg-red-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900">{alert.time}</td>
                    <td className="px-4 py-3">{alert.location}</td>
                    <td className="px-4 py-3 text-red-600 font-medium">{alert.type}</td>
                    <td className="px-4 py-3 text-right">
                      <span className="px-2 py-1 text-xs font-semibold bg-red-100 text-red-700 rounded-md">
                        {alert.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};

export default FireAlarm;