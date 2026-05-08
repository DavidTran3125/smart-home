import React, { useState, useEffect } from 'react';
import { CloudIcon } from '@heroicons/react/24/outline';

export default function HumidityCard() {
  const [humidity, setHumidity] = useState("--");
  const [lastUpdated, setLastUpdated] = useState("--:--:--");

  useEffect(() => {
    const fetchHumidity = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:3000/api/v1/sensors/latest", {
          headers: { Authorization: `Bearer ${token}` },
        });
        let latestData = await res.json();
        
        // 🌟 THÊM ĐOẠN NÀY:
        let sensorArray = Array.isArray(latestData) ? latestData : (latestData.data || []);
        
        // Cập nhật lại biến dùng hàm find:
        const humSensor = sensorArray.find(s => s.type === "humidity" || s.type === "doam");
        if (humSensor) {
          setHumidity(humSensor.value);
          
          const dateObj = new Date(humSensor.timestamp);
          setLastUpdated(dateObj.toLocaleTimeString('vi-VN')); 
        }
      } catch (error) {
        console.error("Lỗi fetch độ ẩm:", error);
      }
    };

    fetchHumidity();
  }, []);

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-start hover:shadow-md transition-shadow">
      <div>
        <p className="text-gray-500 text-sm font-medium mb-4">Độ ẩm hiện tại</p>
        <h2 className="text-3xl font-bold mb-2 text-blue-600">{humidity}%</h2>
        <p className="text-xs text-gray-400 font-medium">Cập nhật: {lastUpdated}</p>
      </div>
      <div className="p-2 rounded-full bg-blue-50 text-blue-500">
        <CloudIcon className="h-6 w-6" />
      </div>
    </div>
  );
}