import React, { useState, useEffect } from 'react';
import CurrentCards from './component/environment/CurrentCards';
import StatsGrid from './component/environment/StatsGrid';



const Environment = () => {

  const [currentTemp, setCurrentTemp] = useState({ value: "--", time: "--", status: "Đang tải...", color: "text-gray-500" });
  const [currentHum, setCurrentHum] = useState({ value: "--", time: "--", status: "Đang tải...", color: "text-gray-500" });

  const [stats, setStats] = useState({
    tempAvg: "--", tempMax: "--", tempMin: "--",
    humAvg: "--", humMax: "--", humMin: "--"
  });

  const formatDateTime = (isoString) => {
    const d = new Date(isoString);
    return `${d.toLocaleTimeString('vi-VN')} ${d.toLocaleDateString('vi-VN')}`;
  };

  const fetchLatestSensors = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:3000/api/v1/sensors/latest", {
        headers: { Authorization: `Bearer ${token}` },
      });

      let latestData = await res.json();
      let sensorArray = Array.isArray(latestData) ? latestData : (latestData.data || []);

      
      const tempSensor = sensorArray.find(s => s.type === "temperature" || s.type === "nhietdo");
      if (tempSensor) {
        let status = "Bình thường";
        let color = "text-[#10b981]";
        if (tempSensor.value > 35) { status = "Quá nóng"; color = "text-red-500"; }
        else if (tempSensor.value < 15) { status = "Quá lạnh"; color = "text-blue-500"; }
        setCurrentTemp({ value: tempSensor.value, time: formatDateTime(tempSensor.timestamp), status, color });
      }


      const humSensor = sensorArray.find(s => s.type === "humidity" || s.type === "doam");
      if (humSensor) {
        let status = "Bình thường";
        let color = "text-[#10b981]";
        if (humSensor.value > 80) { status = "Độ ẩm cao"; color = "text-orange-500"; }
        else if (humSensor.value < 40) { status = "Độ ẩm thấp"; color = "text-yellow-600"; }
        setCurrentHum({ value: humSensor.value, time: formatDateTime(humSensor.timestamp), status, color });
      }
    } catch (error) {
      console.error("Lỗi fetch dữ liệu môi trường mới nhất:", error);
    }
  };

  const fetchSensorsStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:3000/api/v1/sensors/history?limit=100", {
        headers: { Authorization: `Bearer ${token}` },
      });

      let historyData = await res.json();
      let dataArray = Array.isArray(historyData) ? historyData : (historyData.data || []);

      if (dataArray.length === 0) return;

      const temps = dataArray.filter(s => s.type === "temperature" || s.type === "nhietdo").map(s => s.value);
      const hums = dataArray.filter(s => s.type === "humidity" || s.type === "doam").map(s => s.value);

      let tAvg = "--", tMax = "--", tMin = "--";
      if (temps.length > 0) {
        tMax = Math.max(...temps).toFixed(1);
        tMin = Math.min(...temps).toFixed(1);
        tAvg = (temps.reduce((a, b) => a + b, 0) / temps.length).toFixed(1);
      }

      let hAvg = "--", hMax = "--", hMin = "--";
      if (hums.length > 0) {
        hMax = Math.max(...hums).toFixed(1);
        hMin = Math.min(...hums).toFixed(1);
        hAvg = (hums.reduce((a, b) => a + b, 0) / hums.length).toFixed(1);
      }

      setStats({ tempAvg: tAvg, tempMax: tMax, tempMin: tMin, humAvg: hAvg, humMax: hMax, humMin: hMin });
    } catch (error) {
      console.error("Lỗi fetch thống kê:", error);
    }
  };

  useEffect(() => {
    fetchLatestSensors();
    fetchSensorsStats();
    
    const interval = setInterval(() => {
      fetchLatestSensors();
      fetchSensorsStats();
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-8 w-full max-w-7xl mx-auto">
      
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">Môi trường</h1>
        <p className="text-gray-500">Theo dõi nhiệt độ và độ ẩm chi tiết</p>
      </div>

      <CurrentCards currentTemp={currentTemp} currentHum={currentHum} />
      <StatsGrid stats={stats} />
      
    </div>
  );
};

export default Environment;