import React, { useState, useEffect } from 'react';

export default function EnvironmentStatus() {
  const [temperature, setTemperature] = useState("--");
  const [humidity, setHumidity] = useState("--");
  const [tempStatus, setTempStatus] = useState("Đang tải...");
  const [humStatus, setHumStatus] = useState("Đang tải...");

  

  useEffect(() => {
    const fetchEnvironmentData = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:3000/api/v1/sensors/latest", {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        let latestData = await res.json();
        let sensorArray = Array.isArray(latestData) ? latestData : (latestData.data || []);

        
        const tempSensor = sensorArray.find(s => s.type === "temperature" || s.type === "nhietdo");
        if (tempSensor) {
          setTemperature(tempSensor.value);
          if (tempSensor.value > 35) setTempStatus("Cảnh báo: Quá nóng 🔥");
          else if (tempSensor.value > 30) setTempStatus("Hơi nóng");
          else if (tempSensor.value < 20) setTempStatus("Lạnh ❄️");
          else setTempStatus("Bình thường");
        } else {
          setTempStatus("Không có dữ liệu");
        }

        const humSensor = sensorArray.find(s => s.type === "humidity" || s.type === "doam");
        if (humSensor) {
          setHumidity(humSensor.value);
          if (humSensor.value > 80) setHumStatus("Độ ẩm cao 💧");
          else if (humSensor.value < 40) setHumStatus("Độ ẩm thấp (Khô)");
          else setHumStatus("Bình thường");
        } else {
          setHumStatus("Không có dữ liệu");
        }

      } catch (error) {
        console.error("Lỗi fetch môi trường:", error);
        setTempStatus("Lỗi kết nối");
        setHumStatus("Lỗi kết nối");
      }
    };
    fetchEnvironmentData();
  }, []);




  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Tình trạng môi trường</h3>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-50">
        
        {/* Nhiet do */}
        <div className="flex justify-between items-center p-5">
          <div>
            <p className="font-semibold text-gray-900">Nhiệt độ</p>
            <p className={`text-sm ${tempStatus === 'Bình thường' ? 'text-gray-500' : 'text-red-500 font-medium'}`}>
              {tempStatus}
            </p>
          </div>
          <p className="text-xl font-bold text-[#1e8e3e]">
            {temperature !== "--" ? `${temperature}°C` : "--"}
          </p>
        </div>

        {/* Do am */}
        <div className="flex justify-between items-center p-5">
          <div>
            <p className="font-semibold text-gray-900">Độ ẩm</p>
            <p className={`text-sm ${humStatus === 'Bình thường' ? 'text-gray-500' : 'text-orange-500 font-medium'}`}>
              {humStatus}
            </p>
          </div>
          <p className="text-xl font-bold text-blue-600">
            {humidity !== "--" ? `${humidity}%` : "--"}
          </p>
        </div>

      </div>
    </div>
  );
}