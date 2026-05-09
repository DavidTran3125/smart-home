import React from 'react';

export default function CurrentCards({ currentTemp, currentHum }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
        <div className="flex items-center text-gray-800 font-semibold mb-4">
          <span className="text-orange-500 mr-2 text-xl">🌡️</span> Nhiệt độ hiện tại
        </div>
        <h2 className="text-6xl font-bold text-[#10b981] mb-8">
          {currentTemp.value !== "--" ? `${currentTemp.value}°C` : "--"}
        </h2>
        <div className="flex justify-between items-center text-sm border-t border-gray-100 pt-4">
          <div className="text-gray-500">
            <p>Thời gian:</p>
            <p className="mt-1">Trạng thái:</p>
          </div>
          <div className="text-right font-medium">
            <p className="text-gray-900">{currentTemp.time}</p>
            <p className={`${currentTemp.color} mt-1`}>{currentTemp.status}</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
        <div className="flex items-center text-gray-800 font-semibold mb-4">
          <span className="text-blue-500 mr-2 text-xl">💧</span> Độ ẩm hiện tại
        </div>
        <h2 className="text-6xl font-bold text-[#3b82f6] mb-8">
          {currentHum.value !== "--" ? `${currentHum.value}%` : "--"}
        </h2>
        <div className="flex justify-between items-center text-sm border-t border-gray-100 pt-4">
          <div className="text-gray-500">
            <p>Thời gian:</p>
            <p className="mt-1">Trạng thái:</p>
          </div>
          <div className="text-right font-medium">
            <p className="text-gray-900">{currentHum.time}</p>
            <p className={`${currentHum.color} mt-1`}>{currentHum.status}</p>
          </div>
        </div>
      </div>
    </div>
  );
}