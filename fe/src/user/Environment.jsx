import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Dữ liệu mẫu cho biểu đồ
const chartData = [
  { time: '19:21', temp: 26, humidity: 66 },
  { time: '19:22', temp: 25.5, humidity: 68 },
  { time: '19:23', temp: 25.2, humidity: 65.9 },
  { time: '19:24', temp: 24.8, humidity: 69 },
  { time: '19:25', temp: 25.1, humidity: 65 },
  { time: '19:26', temp: 24.5, humidity: 70 },
  { time: '19:27', temp: 25.0, humidity: 72 },
];

const Environment = () => {
  return (
    <div className="p-8 w-full max-w-7xl mx-auto">
      {/* Tiêu đề */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">Môi trường</h1>
        <p className="text-gray-500">Theo dõi nhiệt độ và độ ẩm chi tiết</p>
      </div>

      {/* 2 Thẻ lớn: Hiện tại */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Nhiệt độ hiện tại */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center text-gray-800 font-semibold mb-4">
            <span className="text-orange-500 mr-2 text-xl">🌡️</span> Nhiệt độ hiện tại
          </div>
          <h2 className="text-6xl font-bold text-[#10b981] mb-8">18.2°C</h2>
          <div className="flex justify-between items-center text-sm border-t border-gray-100 pt-4">
            <div className="text-gray-500">
              <p>Thời gian:</p>
              <p className="mt-1">Trạng thái:</p>
            </div>
            <div className="text-right font-medium">
              <p className="text-gray-900">19:26:50 22/3/2026</p>
              <p className="text-[#10b981] mt-1">Bình thường</p>
            </div>
          </div>
        </div>

        {/* Độ ẩm hiện tại */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center text-gray-800 font-semibold mb-4">
            <span className="text-blue-500 mr-2 text-xl">💧</span> Độ ẩm hiện tại
          </div>
          <h2 className="text-6xl font-bold text-[#3b82f6] mb-8">70.4%</h2>
          <div className="flex justify-between items-center text-sm border-t border-gray-100 pt-4">
            <div className="text-gray-500">
              <p>Thời gian:</p>
              <p className="mt-1">Trạng thái:</p>
            </div>
            <div className="text-right font-medium">
              <p className="text-gray-900">19:26:50 22/3/2026</p>
              <p className="text-[#3b82f6] mt-1">Bình thường</p>
            </div>
          </div>
        </div>
      </div>

      {/* Thống kê chi tiết */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Thống kê chi tiết</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Hàng 1: Nhiệt độ */}
          <div className="bg-[#fff7ed] p-4 rounded-lg">
            <p className="text-gray-500 text-sm mb-1 flex items-center">📈 Nhiệt độ TB</p>
            <p className="text-2xl font-bold text-orange-600">21.7°C</p>
          </div>
          <div className="bg-[#fef2f2] p-4 rounded-lg">
            <p className="text-gray-500 text-sm mb-1">Nhiệt độ cao nhất</p>
            <p className="text-2xl font-bold text-red-600">26.5°C</p>
          </div>
          <div className="bg-[#eff6ff] p-4 rounded-lg">
            <p className="text-gray-500 text-sm mb-1">Nhiệt độ thấp nhất</p>
            <p className="text-2xl font-bold text-blue-600">17.4°C</p>
          </div>
          {/* Hàng 2: Độ ẩm */}
          <div className="bg-[#eff6ff] p-4 rounded-lg">
            <p className="text-gray-500 text-sm mb-1 flex items-center">📉 Độ ẩm TB</p>
            <p className="text-2xl font-bold text-blue-600">67.4%</p>
          </div>
          <div className="bg-[#eef2ff] p-4 rounded-lg">
            <p className="text-gray-500 text-sm mb-1">Độ ẩm cao nhất</p>
            <p className="text-2xl font-bold text-indigo-600">71.2%</p>
          </div>
          <div className="bg-[#ecfeff] p-4 rounded-lg">
            <p className="text-gray-500 text-sm mb-1">Độ ẩm thấp nhất</p>
            <p className="text-2xl font-bold text-cyan-600">63.9%</p>
          </div>
        </div>
      </div>

      {/* Biểu đồ Nhiệt độ */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-6">
        <h3 className="text-lg font-bold text-gray-900 mb-6">Biểu đồ nhiệt độ</h3>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={true} horizontal={true} stroke="#e5e7eb" />
              <XAxis dataKey="time" tick={{fontSize: 12, fill: '#6b7280'}} tickMargin={10} axisLine={false} tickLine={false} />
              <YAxis tick={{fontSize: 12, fill: '#6b7280'}} axisLine={false} tickLine={false} domain={[0, 28]} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              <Area type="monotone" dataKey="temp" stroke="#f97316" strokeWidth={2} fillOpacity={1} fill="url(#colorTemp)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-center mt-2">
          <span className="text-sm text-orange-500 font-medium">⚬ Nhiệt độ (°C)</span>
        </div>
      </div>

      {/* Biểu đồ Độ ẩm */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-6">Biểu đồ độ ẩm</h3>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorHum" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={true} horizontal={true} stroke="#e5e7eb" />
              <XAxis dataKey="time" tick={{fontSize: 12, fill: '#6b7280'}} tickMargin={10} axisLine={false} tickLine={false} />
              <YAxis tick={{fontSize: 12, fill: '#6b7280'}} axisLine={false} tickLine={false} domain={[0, 80]} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              <Area type="monotone" dataKey="humidity" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorHum)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Environment;