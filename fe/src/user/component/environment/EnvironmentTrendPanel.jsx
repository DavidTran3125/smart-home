import { useEffect, useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const API_URL = "http://localhost:3000/api/v1";

const chartModes = [
  { id: "both", label: "Cả hai" },
  { id: "temperature", label: "Nhiệt độ" },
  { id: "humidity", label: "Độ ẩm" },
];

const parseResponseArray = (payload) => {
  return Array.isArray(payload) ? payload : payload.data || [];
};

const isTemperatureDevice = (device) => {
  const text = `${device.type || ""} ${device.feed_name || ""} ${device.name || ""}`.toLowerCase();
  return text.includes("temperature") || text.includes("temp") || text.includes("nhiet");
};

const isHumidityDevice = (device) => {
  const text = `${device.type || ""} ${device.feed_name || ""} ${device.name || ""}`.toLowerCase();
  return text.includes("humidity") || text.includes("humid") || text.includes("doam") || text.includes("độ ẩm");
};

const pickThreshold = (thresholds, matcher) => {
  const active = thresholds.find((device) => matcher(device) && device.threshold_is_active);
  return active || thresholds.find(matcher) || null;
};

const formatTimeLabel = (timestamp, compact) => {
  const date = new Date(timestamp);
  return compact
    ? date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
    : `${date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })} ${date.toLocaleDateString("vi-VN")}`;
};

const buildChartData = (temperatureRows, humidityRows, compact) => {
  const pointsByTimestamp = new Map();

  temperatureRows.forEach((row) => {
    if (!row.timestamp) return;
    const key = new Date(row.timestamp).toISOString();
    pointsByTimestamp.set(key, {
      ...(pointsByTimestamp.get(key) || {}),
      timestamp: key,
      label: formatTimeLabel(key, compact),
      temperature: Number(row.value),
    });
  });

  humidityRows.forEach((row) => {
    if (!row.timestamp) return;
    const key = new Date(row.timestamp).toISOString();
    pointsByTimestamp.set(key, {
      ...(pointsByTimestamp.get(key) || {}),
      timestamp: key,
      label: formatTimeLabel(key, compact),
      humidity: Number(row.value),
    });
  });

  return [...pointsByTimestamp.values()].sort(
    (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
  );
};

const metricFormatter = (value, name) => {
  if (name.includes("Nhiệt")) return [`${Number(value).toFixed(1)}°C`, name];
  return [`${Number(value).toFixed(1)}%`, name];
};

const EnvironmentTrendPanel = ({ compact = false, showThresholds = false }) => {
  const [mode, setMode] = useState("both");
  const [chartData, setChartData] = useState([]);
  const [thresholds, setThresholds] = useState({ temperature: null, humidity: null });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isCancelled = false;

    const loadEnvironmentData = async () => {
      try {
        setIsLoading(true);
        setError("");
        const token = localStorage.getItem("token");
        const limit = compact ? 60 : 200;

        const requests = [
          fetch(`${API_URL}/sensors/history?type=temperature&limit=${limit}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_URL}/sensors/history?type=humidity&limit=${limit}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ];

        if (showThresholds) {
          requests.push(fetch(`${API_URL}/thresholds`, {
            headers: { Authorization: `Bearer ${token}` },
          }));
        }

        const responses = await Promise.all(requests);
        const [tempRes, humRes, thresholdRes] = responses;

        if (!tempRes.ok || !humRes.ok) throw new Error("Không thể tải dữ liệu môi trường");

        const [tempPayload, humPayload] = await Promise.all([tempRes.json(), humRes.json()]);
        const temperatureRows = parseResponseArray(tempPayload);
        const humidityRows = parseResponseArray(humPayload);
        const nextChartData = buildChartData(temperatureRows, humidityRows, compact);

        let nextThresholds = { temperature: null, humidity: null };
        if (thresholdRes) {
          if (!thresholdRes.ok) throw new Error("Không thể tải ngưỡng cảnh báo");
          const thresholdPayload = await thresholdRes.json();
          const thresholdRows = parseResponseArray(thresholdPayload);
          nextThresholds = {
            temperature: pickThreshold(thresholdRows, isTemperatureDevice),
            humidity: pickThreshold(thresholdRows, isHumidityDevice),
          };
        }

        if (!isCancelled) {
          setChartData(nextChartData);
          setThresholds(nextThresholds);
        }
      } catch (err) {
        if (!isCancelled) setError(err.message || "Không thể tải dữ liệu môi trường");
      } finally {
        if (!isCancelled) setIsLoading(false);
      }
    };

    loadEnvironmentData();

    return () => {
      isCancelled = true;
    };
  }, [compact, showThresholds]);

  const showTemperature = mode === "both" || mode === "temperature";
  const showHumidity = mode === "both" || mode === "humidity";
  const tempThreshold = thresholds.temperature;
  const humidityThreshold = thresholds.humidity;
  const height = compact ? 220 : 360;

  return (
    <div className={`bg-white border border-gray-200 shadow-sm rounded-2xl ${compact ? "p-5 mb-8" : "p-6 mb-6"}`}>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">
        <div>
          <h3 className={`${compact ? "text-lg" : "text-xl"} font-bold text-gray-900`}>Xu hướng nhiệt độ và độ ẩm</h3>
          <p className="text-sm text-gray-500 mt-1">
            {compact ? "Tóm tắt dữ liệu gần đây trong nhà." : "Biểu đồ lịch sử gần đây của cảm biến môi trường."}
          </p>
        </div>
        <div className="flex bg-gray-100 p-1 rounded-xl w-fit">
          {chartModes.map((item) => (
            <button
              key={item.id}
              onClick={() => setMode(item.id)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                mode === item.id ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {showThresholds && (tempThreshold || humidityThreshold) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5">
          {tempThreshold && (
            <div className="rounded-xl bg-green-50 border border-green-100 px-4 py-3 text-sm text-green-700">
              Ngưỡng nhiệt độ: {tempThreshold.threshold_min_value ?? "-"}°C - {tempThreshold.threshold_max_value ?? "-"}°C
            </div>
          )}
          {humidityThreshold && (
            <div className="rounded-xl bg-blue-50 border border-blue-100 px-4 py-3 text-sm text-blue-700">
              Ngưỡng độ ẩm: {humidityThreshold.threshold_min_value ?? "-"}% - {humidityThreshold.threshold_max_value ?? "-"}%
            </div>
          )}
        </div>
      )}

      {isLoading ? (
        <div className="h-56 flex items-center justify-center text-gray-500">Đang tải biểu đồ...</div>
      ) : error ? (
        <div className="h-56 flex items-center justify-center text-red-600 bg-red-50 rounded-xl border border-red-100">{error}</div>
      ) : chartData.length === 0 ? (
        <div className="h-56 flex items-center justify-center text-gray-500 bg-gray-50 rounded-xl border border-gray-100">
          Chưa có dữ liệu nhiệt độ hoặc độ ẩm.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={height}>
          <LineChart data={chartData} margin={{ top: 10, right: 18, left: -10, bottom: compact ? 0 : 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="label" tick={{ fontSize: 11 }} minTickGap={compact ? 28 : 40} stroke="#9ca3af" />
            <YAxis yAxisId="temperature" tick={{ fontSize: 11 }} stroke="#10b981" unit="°C" />
            <YAxis yAxisId="humidity" orientation="right" tick={{ fontSize: 11 }} stroke="#3b82f6" unit="%" domain={[0, 100]} />
            <Tooltip formatter={metricFormatter} labelStyle={{ color: "#111827", fontWeight: 600 }} />
            {!compact && <Legend />}

            {showThresholds && showTemperature && tempThreshold?.threshold_is_active && tempThreshold.threshold_min_value != null && (
              <ReferenceLine yAxisId="temperature" y={tempThreshold.threshold_min_value} stroke="#22c55e" strokeDasharray="4 4" label="Temp min" />
            )}
            {showThresholds && showTemperature && tempThreshold?.threshold_is_active && tempThreshold.threshold_max_value != null && (
              <ReferenceLine yAxisId="temperature" y={tempThreshold.threshold_max_value} stroke="#ef4444" strokeDasharray="4 4" label="Temp max" />
            )}
            {showThresholds && showHumidity && humidityThreshold?.threshold_is_active && humidityThreshold.threshold_min_value != null && (
              <ReferenceLine yAxisId="humidity" y={humidityThreshold.threshold_min_value} stroke="#60a5fa" strokeDasharray="4 4" label="Hum min" />
            )}
            {showThresholds && showHumidity && humidityThreshold?.threshold_is_active && humidityThreshold.threshold_max_value != null && (
              <ReferenceLine yAxisId="humidity" y={humidityThreshold.threshold_max_value} stroke="#f97316" strokeDasharray="4 4" label="Hum max" />
            )}

            {showTemperature && (
              <Line
                yAxisId="temperature"
                type="monotone"
                dataKey="temperature"
                name="Nhiệt độ"
                stroke="#10b981"
                strokeWidth={compact ? 2 : 3}
                dot={false}
                connectNulls
              />
            )}
            {showHumidity && (
              <Line
                yAxisId="humidity"
                type="monotone"
                dataKey="humidity"
                name="Độ ẩm"
                stroke="#3b82f6"
                strokeWidth={compact ? 2 : 3}
                dot={false}
                connectNulls
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default EnvironmentTrendPanel;
