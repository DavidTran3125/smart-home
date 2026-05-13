import React, { useState, useEffect, useRef } from 'react';

const FireAlarm = () => {
  
  const [isSafe, setIsSafe] = useState(true);
  const [currentTemp, setCurrentTemp] = useState("--");
  const [currentHumidity, setCurrentHumidity] = useState("--");
  const [riskLevel, setRiskLevel] = useState("Thấp");
  const [rateOfRise, setRateOfRise] = useState("--"); 
  const [alertLogs, setAlertLogs] = useState([]);
  const [isLoadingAlerts, setIsLoadingAlerts] = useState(true);
  const [resolvingIds, setResolvingIds] = useState(new Set());
  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  })();
  const isHomeAdmin = user?.role === "Admin";

  
  const tempSnapshotRef = useRef({ value: null, timestamp: null });

  
  const INTERNVAL_SCAN = 5000; 
  const DANGER_RATE_MIN = 12;   
  const FIXED_TEMP_LIMIT = 65; 
  const HUMIDITY_MIN_LIMIT = 30;
  const HUMIDITY_MAX_LIMIT = 80;

  const fetchFireData = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:3000/api/v1/sensors/latest", {
        headers: { Authorization: `Bearer ${token}` },
      });

      let latestData = await res.json();
      let sensorArray = Array.isArray(latestData) ? latestData : (latestData.data || []);

      const tempSensor = sensorArray.find(s => s.type === "temperature" || s.type === "nhietdo");
      const humiditySensor = sensorArray.find(s => s.type === "humidity" || s.type === "doam");
      const riskMessages = [];
      
      if (tempSensor) {
        const t = tempSensor.value;
        const currentTimestamp = new Date(tempSensor.timestamp);
        const previousSnapshot = tempSnapshotRef.current;
        
        setCurrentTemp(t);

        if (previousSnapshot.value !== null && previousSnapshot.timestamp !== null) {
          const dT = t - previousSnapshot.value; 
          const dtSeconds = (currentTimestamp - previousSnapshot.timestamp) / 1000; 
          const dtMinutes = dtSeconds / 60; 

          if (dtMinutes > 0) {
            const R = dT / dtMinutes; 
            setRateOfRise(R.toFixed(1));

            if (R > DANGER_RATE_MIN) {
              riskMessages.push(`Nhiệt tăng đột ngột (+${R.toFixed(1)}°C/phút)`);
            }
          }
        }

        if (t > FIXED_TEMP_LIMIT) {
          riskMessages.push(`Nhiệt độ quá cao (${t}°C)`);
        }

        tempSnapshotRef.current = { value: t, timestamp: currentTimestamp };
      }

      if (humiditySensor) {
        const h = humiditySensor.value;
        setCurrentHumidity(h);

        if (h < HUMIDITY_MIN_LIMIT) {
          riskMessages.push(`Độ ẩm quá thấp (${h}%)`);
        } else if (h > HUMIDITY_MAX_LIMIT) {
          riskMessages.push(`Độ ẩm quá cao (${h}%)`);
        }
      }

      setIsSafe(riskMessages.length === 0);
      setRiskLevel(riskMessages.length > 0 ? riskMessages.join(" · ") : "Các chỉ số trong ngưỡng an toàn");
    } catch (error) {
      console.error("Lỗi fetch dữ liệu:", error);
    }
  };

  const fetchAlertLogs = async () => {
    setIsLoadingAlerts(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:3000/api/v1/alerts?limit=50", {
        headers: { Authorization: `Bearer ${token}` }
      });

      const alertsData = await res.json();
      setAlertLogs(Array.isArray(alertsData) ? alertsData : (alertsData.data || []));
    } catch (error) {
      console.error("Lỗi fetch dữ liệu cảnh báo:", error);
    } finally {
      setIsLoadingAlerts(false);
    }
  };

  const handleResolve = async (alertId) => {
    if (!window.confirm("Đánh dấu cảnh báo này là đã xử lý?")) return;

    try {
      setResolvingIds(prev => new Set(prev).add(alertId));
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:3000/api/v1/alerts/${alertId}/resolve`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Không thể xử lý cảnh báo");

      fetchAlertLogs();
    } catch (error) {
      alert(error.message);
    } finally {
      setResolvingIds(prev => {
        const next = new Set(prev);
        next.delete(alertId);
        return next;
      });
    }
  };

  const formatTime = (isoString) => {
    if (!isoString) return { date: "--", time: "--" };
    const d = new Date(isoString);
    return {
      date: d.toLocaleDateString('vi-VN'),
      time: d.toLocaleTimeString('vi-VN')
    };
  };

  useEffect(() => {
    fetchFireData(); 
    fetchAlertLogs();
    const interval = setInterval(fetchFireData, INTERNVAL_SCAN);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-8 w-full max-w-7xl mx-auto font-sans relative">
      
      <div className="mb-6 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Cảnh báo</h1>
          <p className="text-gray-500 text-sm">Theo dõi cảnh báo nhiệt độ, độ ẩm và lịch sử cảnh báo an toàn</p>
        </div>
        <button 
          onClick={fetchAlertLogs} 
          className="text-sm bg-white border border-gray-200 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-50 font-medium flex items-center shadow-sm self-start md:self-auto"
        >
          <span className="mr-2">↻</span> Làm mới lịch sử
        </button>
      </div>

      <div className={`relative w-full rounded-2xl border-2 p-12 flex flex-col items-center justify-center transition-all duration-500 mb-6 
        ${isSafe ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.3)] animate-pulse'}`}
      >
        <div className={`px-4 py-1 rounded-full text-xs font-bold mb-4 ${isSafe ? 'bg-green-500' : 'bg-red-600'} text-white`}>
          {isSafe ? 'AN TOÀN' : 'NGUY HIỂM'}
        </div>

        <div className="text-center">
          <h2 className={`text-6xl font-black mb-3 ${isSafe ? 'text-green-600' : 'text-red-600'}`}>
            {isSafe ? 'BÌNH THƯỜNG' : 'CÓ CẢNH BÁO!'}
          </h2>
          <p className={`${isSafe ? 'text-gray-600' : 'text-red-700'} font-medium`}>Tình trạng: {riskLevel}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

        <div className={`bg-white p-6 rounded-2xl border transition-colors ${(currentHumidity < HUMIDITY_MIN_LIMIT || currentHumidity > HUMIDITY_MAX_LIMIT) ? 'border-red-300' : 'border-gray-200'}`}>
          <div className="text-gray-500 text-sm font-bold uppercase mb-4 flex items-center">
            💧 Độ ẩm phòng thực tế
          </div>
          <div className={`text-6xl font-black ${(currentHumidity < HUMIDITY_MIN_LIMIT || currentHumidity > HUMIDITY_MAX_LIMIT) ? 'text-red-600' : 'text-gray-900'}`}>
            {currentHumidity}%
          </div>
          <p className="mt-2 text-xs text-gray-400">Ngưỡng báo động cố định: dưới {HUMIDITY_MIN_LIMIT}% hoặc trên {HUMIDITY_MAX_LIMIT}%</p>
        </div>

      </div>

      <div className="mt-8 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between gap-4">
          <div className="flex items-center">
            <span className="text-red-500 mr-2 text-lg">🔥</span>
            <h3 className="font-bold text-gray-900">Lịch sử cảnh báo ({alertLogs.length})</h3>
          </div>
          <span className="text-xs text-gray-400">50 cảnh báo gần nhất</span>
        </div>

        <div className="overflow-x-auto">
          {isLoadingAlerts ? (
            <div className="p-12 text-center text-gray-500 font-medium">
              Đang tải dữ liệu từ server...
            </div>
          ) : (
            <table className="w-full text-left text-sm min-w-[900px]">
              <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4">Thời gian</th>
                  <th className="px-6 py-4">Loại</th>
                  <th className="px-6 py-4">Mức độ</th>
                  <th className="px-6 py-4">Thông báo</th>
                  <th className="px-6 py-4">Chỉ số lúc báo</th>
                  <th className="px-6 py-4 text-right">Trạng thái</th>
                  {isHomeAdmin && <th className="px-6 py-4 text-right">Thao tác</th>}
                </tr>
              </thead>
              <tbody className="text-gray-600 text-base">
                {alertLogs.length === 0 ? (
                  <tr><td colSpan={isHomeAdmin ? "7" : "6"} className="px-6 py-8 text-center text-gray-400">Tuyệt vời! Không có cảnh báo nào.</td></tr>
                ) : (
                  alertLogs.map((alert, index) => {
                    const { date, time } = formatTime(alert.detected_at || alert.timestamp);
                    const alertType = alert.type || alert.device_id?.type;
                    const typeLabel = alertType === "humidity" ? "Độ ẩm" : alertType === "temperature" ? "Nhiệt độ" : "Khác";
                    const unit = alert.unit || (alertType === "humidity" ? "%" : alertType === "temperature" ? "°C" : "");
                    let severityColor = "text-yellow-600 bg-yellow-50";
                    if (alert.severity === "Cao") severityColor = "text-red-600 bg-red-50";
                    if (alert.severity === "Thấp") severityColor = "text-blue-600 bg-blue-50";
                    const isResolved = alert.status === "Đã xử lý";
                    const isResolving = resolvingIds.has(alert._id);

                    return (
                      <tr key={alert._id || index} className="border-b border-gray-50 hover:bg-red-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="text-gray-900 font-medium">{date}</div>
                          <div className="text-gray-500 text-xs mt-0.5">{time}</div>
                        </td>
                        <td className="px-6 py-4 font-medium">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${alertType === "humidity" ? "bg-blue-50 text-blue-700" : "bg-orange-50 text-orange-700"}`}>
                            {typeLabel}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-medium">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${severityColor}`}>
                            {alert.severity ? alert.severity.toUpperCase() : "TRUNG BÌNH"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-red-600 font-medium">
                          {alert.message || "Cảnh báo hệ thống"}
                        </td>
                        <td className="px-6 py-4 font-bold text-gray-900">
                          {alert.value_at_alert !== undefined ? `${alert.value_at_alert}${unit}` : "--"}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-md ${
                            isResolved ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                          }`}>
                            {alert.status || "Chưa xử lý"}
                          </span>
                        </td>
                        {isHomeAdmin && (
                          <td className="px-6 py-4 text-right">
                            {!isResolved ? (
                              <button
                                onClick={() => handleResolve(alert._id)}
                                disabled={isResolving}
                                className="px-3 py-1.5 rounded-lg bg-green-50 text-green-700 text-xs font-bold hover:bg-green-100 disabled:opacity-50"
                              >
                                {isResolving ? "Đang xử lý..." : "Đánh dấu xử lý"}
                              </button>
                            ) : (
                              <span className="text-xs text-gray-400">Hoàn tất</span>
                            )}
                          </td>
                        )}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default FireAlarm;
