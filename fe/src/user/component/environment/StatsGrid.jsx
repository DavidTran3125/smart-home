import React from 'react';

export default function StatsGrid({ stats }) {
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Thống kê chi tiết</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        <div className="bg-[#fff7ed] p-4 rounded-lg">
          <p className="text-gray-500 text-sm mb-1 flex items-center">📈 Nhiệt độ TB</p>
          <p className="text-2xl font-bold text-orange-600">{stats.tempAvg !== "--" ? `${stats.tempAvg}°C` : "--"}</p>
        </div>
        <div className="bg-[#fef2f2] p-4 rounded-lg">
          <p className="text-gray-500 text-sm mb-1">Nhiệt độ cao nhất</p>
          <p className="text-2xl font-bold text-red-600">{stats.tempMax !== "--" ? `${stats.tempMax}°C` : "--"}</p>
        </div>
        <div className="bg-[#eff6ff] p-4 rounded-lg">
          <p className="text-gray-500 text-sm mb-1">Nhiệt độ thấp nhất</p>
          <p className="text-2xl font-bold text-blue-600">{stats.tempMin !== "--" ? `${stats.tempMin}°C` : "--"}</p>
        </div>
        
        <div className="bg-[#eff6ff] p-4 rounded-lg">
          <p className="text-gray-500 text-sm mb-1 flex items-center">📉 Độ ẩm TB</p>
          <p className="text-2xl font-bold text-blue-600">{stats.humAvg !== "--" ? `${stats.humAvg}%` : "--"}</p>
        </div>
        <div className="bg-[#eef2ff] p-4 rounded-lg">
          <p className="text-gray-500 text-sm mb-1">Độ ẩm cao nhất</p>
          <p className="text-2xl font-bold text-indigo-600">{stats.humMax !== "--" ? `${stats.humMax}%` : "--"}</p>
        </div>
        <div className="bg-[#ecfeff] p-4 rounded-lg">
          <p className="text-gray-500 text-sm mb-1">Độ ẩm thấp nhất</p>
          <p className="text-2xl font-bold text-cyan-600">{stats.humMin !== "--" ? `${stats.humMin}%` : "--"}</p>
        </div>
      </div>
    </div>
  );
}