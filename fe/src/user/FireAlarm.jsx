import React, { useState, useEffect } from 'react';

const FireAlarm = () => {
  
  const [isSafe, setIsSafe] = useState(true);
  const [currentTemp, setCurrentTemp] = useState("--");
  const [riskLevel, setRiskLevel] = useState("Thấp");
  const [rateOfRise, setRateOfRise] = useState("--"); 

  
  const [prevTemp, setPrevTemp] = useState(null);
  const [prevTimestamp, setPrevTimestamp] = useState(null);

  
  const INTERNVAL_SCAN = 5000; 
  const DANGER_RATE_MIN = 12;   
  const FIXED_TEMP_LIMIT = 65; 

  const fetchFireData = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:3000/api/v1/sensors/latest", {
        headers: { Authorization: `Bearer ${token}` },
      });

      let latestData = await res.json();
      let sensorArray = Array.isArray(latestData) ? latestData : (latestData.data || []);

      const tempSensor = sensorArray.find(s => s.type === "temperature" || s.type === "nhietdo");
      
      if (tempSensor) {
        const t = tempSensor.value;
        const currentTimestamp = new Date(tempSensor.timestamp);
        
        setCurrentTemp(t);

        let currentSafeStatus = true;
        let currentRisk = "Thấp";
        let r_text = "0.0";

        if (prevTemp !== null && prevTimestamp !== null) {
          const dT = t - prevTemp; 
          const dtSeconds = (currentTimestamp - prevTimestamp) / 1000; 
          const dtMinutes = dtSeconds / 60; 

          if (dtMinutes > 0) {
            const R = dT / dtMinutes; 
            setRateOfRise(R.toFixed(1));

            if (R > DANGER_RATE_MIN) {
              currentSafeStatus = false;
              currentRisk = `CỰC CAO - NHIỆT TĂNG ĐỘT NGỘT (+${R.toFixed(1)}°C/phút)`;
            } else if (t > FIXED_TEMP_LIMIT) {
              currentSafeStatus = false;
              currentRisk = `CỰC CAO - NHIỆT ĐỘ VƯỢT NGƯỠNG (${t}°C)`;
            } else if (R > DANGER_RATE_MIN / 2) {
              currentRisk = "Trung bình (Theo dõi)";
            }
          }
        }

        setIsSafe(currentSafeStatus);
        setRiskLevel(currentRisk);
        setPrevTemp(t);
        setPrevTimestamp(currentTimestamp);
      }
    } catch (error) {
      console.error("Lỗi fetch dữ liệu:", error);
    }
  };

  useEffect(() => {
    fetchFireData(); 
    const interval = setInterval(fetchFireData, INTERNVAL_SCAN);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-8 w-full max-w-7xl mx-auto font-sans relative">
      
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">Cảnh báo cháy</h1>
        <p className="text-gray-500text-sm">Hệ thống phát hiện tăng nhiệt đột ngột (Rate-of-Rise)</p>
      </div>

      <div className={`relative w-full rounded-2xl border-2 p-12 flex flex-col items-center justify-center transition-all duration-500 mb-6 
        ${isSafe ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.3)] animate-pulse'}`}
      >
        <div className={`px-4 py-1 rounded-full text-xs font-bold mb-4 ${isSafe ? 'bg-green-500' : 'bg-red-600'} text-white`}>
          {isSafe ? 'AN TOÀN' : 'NGUY HIỂM'}
        </div>

        <div className="text-center">
          <h2 className={`text-6xl font-black mb-3 ${isSafe ? 'text-green-600' : 'text-red-600'}`}>
            {isSafe ? 'BÌNH THƯỜNG' : 'BÁO ĐỘNG CHÁY!'}
          </h2>
          <p className={`${isSafe ? 'text-gray-600' : 'text-red-700'} font-medium`}>Tình trạng: {riskLevel}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className={`bg-white p-6 rounded-2xl border transition-colors ${!isSafe && rateOfRise > DANGER_RATE_MIN ? 'border-red-300' : 'border-gray-200'}`}>
          <div className="text-gray-500 text-sm font-bold uppercase mb-4 flex items-center">
            📈 Tốc độ tăng nhiệt (5s gần nhất)
          </div>
          <div className={`text-6xl font-black ${rateOfRise > DANGER_RATE_MIN ? 'text-red-600' : 'text-gray-900'}`}>
            {rateOfRise}°C<span className="text-2xl text-gray-400">/min</span>
          </div>
          <p className="mt-2 text-xs text-gray-400">Ngưỡng báo động: Tăng &gt; {DANGER_RATE_MIN}°C/phút</p>
        </div>

        <div className={`bg-white p-6 rounded-2xl border transition-colors ${!isSafe && currentTemp > FIXED_TEMP_LIMIT ? 'border-red-300' : 'border-gray-200'}`}>
          <div className="text-gray-500 text-sm font-bold uppercase mb-4 flex items-center">
            🌡️ Nhiệt độ phòng thực tế
          </div>
          <div className={`text-6xl font-black ${currentTemp > FIXED_TEMP_LIMIT ? 'text-red-600' : 'text-gray-900'}`}>
            {currentTemp}°C
          </div>
          <p className="mt-2 text-xs text-gray-400">Ngưỡng báo động cố định: {FIXED_TEMP_LIMIT}°C</p>
        </div>

      </div>
    </div>
  );
};

export default FireAlarm;