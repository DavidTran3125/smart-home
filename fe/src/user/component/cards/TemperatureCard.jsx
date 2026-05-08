import React, { useState, useEffect } from 'react';
import { ChartBarIcon } from '@heroicons/react/24/outline';

export default function TemperatureCard() {
  const [currentTemp, setCurrentTemp] = useState("--");
  const [avgTemp, setAvgTemp] = useState("--");

  useEffect(() => {
    const fetchTemperature = async () => {
      try {
        const token = localStorage.getItem("token");
        const API_URL = "http://localhost:3000";

        
        const resLatest = await fetch(`${API_URL}/api/v1/sensors/latest`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        let latestData = await resLatest.json();
        
        let sensorArray = Array.isArray(latestData) ? latestData : (latestData.data || []);

        const tempSensor = sensorArray.find(s => s.type === "temperature" || s.type === "nhietdo");
        if (tempSensor) {
          setCurrentTemp(tempSensor.value);
        }

        const resHistory = await fetch(`${API_URL}/api/v1/sensors/history?type=temperature&limit=50`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const historyData = await resHistory.json();
        
        if (historyData.length > 0) {
          const sum = historyData.reduce((acc, curr) => acc + curr.value, 0);
          const avg = (sum / historyData.length).toFixed(1);
          setAvgTemp(avg);
        }

      } catch (error) {
        console.error("Lỗi fetch nhiệt độ:", error);
      }
    };

    fetchTemperature();
  }, []);

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-start hover:shadow-md transition-shadow">
      <div>
        <p className="text-gray-500 text-sm font-medium mb-4">Nhiệt độ trung bình</p>
        <h2 className="text-3xl font-bold mb-2 text-[#1e8e3e]">{avgTemp}°C</h2>
        <p className="text-xs text-gray-400 font-medium">↗ Hiện tại: {currentTemp}°C</p>
      </div>
      <div className="p-2 rounded-full bg-green-50 text-green-500">
        <ChartBarIcon className="h-6 w-6" />
      </div>
    </div>
  );
}