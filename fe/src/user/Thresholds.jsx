import { useCallback, useEffect, useState } from "react";

const API_URL = "http://localhost:3000/api/v1/thresholds";

const toInputValue = (value) => {
  return value === null || value === undefined ? "" : String(value);
};

const parseNumberOrNull = (value) => {
  if (value === "") return null;
  return Number(value);
};

const SENSOR_META = {
  temp: { label: "Cảm biến nhiệt độ", unit: "°C" },
  humid: { label: "Cảm biến độ ẩm", unit: "%" },
  light: { label: "Cảm biến ánh sáng", unit: "lux" },
};

const getSensorMeta = (device) => {
  return SENSOR_META[device.feed_name] || { label: device.type || "Cảm biến", unit: "" };
};

const Thresholds = () => {
  const [devices, setDevices] = useState([]);
  const [edits, setEdits] = useState({});
  const [savingIds, setSavingIds] = useState(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState({ type: "", text: "" });

  const fetchThresholds = useCallback(async () => {
    try {
      setIsLoading(true);
      setMessage({ type: "", text: "" });
      const token = localStorage.getItem("token");
      const res = await fetch(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Không thể tải ngưỡng cảnh báo");

      const thresholdDevices = result.data || [];
      const nextEdits = thresholdDevices.reduce((acc, device) => {
        acc[device._id] = {
          min: toInputValue(device.threshold_min_value),
          max: toInputValue(device.threshold_max_value),
          active: Boolean(device.threshold_is_active),
        };
        return acc;
      }, {});

      setDevices(thresholdDevices);
      setEdits(nextEdits);
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchThresholds();
  }, [fetchThresholds]);

  const updateEdit = (deviceId, field, value) => {
    setEdits(prev => ({
      ...prev,
      [deviceId]: {
        ...prev[deviceId],
        [field]: value,
      },
    }));
  };

  const handleSave = async (device) => {
    const edit = edits[device._id];
    const min = parseNumberOrNull(edit.min);
    const max = parseNumberOrNull(edit.max);

    if (Number.isNaN(min) || Number.isNaN(max)) {
      setMessage({ type: "error", text: "Ngưỡng phải là số hợp lệ" });
      return;
    }

    if (min !== null && max !== null && min >= max) {
      setMessage({ type: "error", text: "Ngưỡng thấp phải nhỏ hơn ngưỡng cao" });
      return;
    }

    try {
      setSavingIds(prev => new Set(prev).add(device._id));
      setMessage({ type: "", text: "" });
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/${device._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          threshold_min_value: min,
          threshold_max_value: max,
          threshold_is_active: edit.active,
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Không thể cập nhật ngưỡng");

      setMessage({ type: "success", text: `Đã cập nhật ngưỡng cho ${device.name}` });
      fetchThresholds();
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setSavingIds(prev => {
        const next = new Set(prev);
        next.delete(device._id);
        return next;
      });
    }
  };

  return (
    <div className="p-8 w-full max-w-7xl mx-auto font-sans">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Cấu hình cảm biến</h1>
          <p className="text-gray-500">Cấu hình ngưỡng cảnh báo trên/dưới cho các cảm biến trong nhà.</p>
        </div>
        <button onClick={fetchThresholds} className="bg-white border border-gray-200 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
          Làm mới
        </button>
      </div>

      {message.text && (
        <div className={`mb-6 px-4 py-3 rounded-xl border text-sm font-medium ${message.type === "error" ? "bg-red-50 border-red-200 text-red-700" : "bg-green-50 border-green-200 text-green-700"}`}>
          {message.text}
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[900px]">
            <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
              <tr>
                <th className="p-4">Cảm biến</th>
                <th className="p-4">Feed</th>
                <th className="p-4">Loại</th>
                <th className="p-4">Đơn vị</th>
                <th className="p-4">Ngưỡng thấp</th>
                <th className="p-4">Ngưỡng cao</th>
                <th className="p-4">Kích hoạt</th>
                <th className="p-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {isLoading ? (
                <tr><td colSpan="8" className="p-8 text-center text-gray-500">Đang tải cấu hình cảm biến...</td></tr>
              ) : devices.length === 0 ? (
                <tr><td colSpan="8" className="p-8 text-center text-gray-500">Chưa có cảm biến nào.</td></tr>
              ) : devices.map((device) => {
                const edit = edits[device._id] || { min: "", max: "", active: false };
                const isSaving = savingIds.has(device._id);
                const meta = getSensorMeta(device);

                return (
                  <tr key={device._id} className="hover:bg-gray-50">
                    <td className="p-4">
                      <div className="font-semibold text-gray-900">{device.name}</div>
                      <div className="text-xs text-gray-400">{meta.label}</div>
                    </td>
                    <td className="p-4 text-gray-600">{device.feed_name || "-"}</td>
                    <td className="p-4 text-gray-600">{device.type || "-"}</td>
                    <td className="p-4 text-gray-600">{meta.unit || "-"}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={edit.min}
                          onChange={(event) => updateEdit(device._id, "min", event.target.value)}
                          className="w-28 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black/10"
                        />
                        <span className="text-xs text-gray-400">{meta.unit}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={edit.max}
                          onChange={(event) => updateEdit(device._id, "max", event.target.value)}
                          className="w-28 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black/10"
                        />
                        <span className="text-xs text-gray-400">{meta.unit}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <label className="inline-flex items-center gap-2 text-sm font-medium text-gray-700">
                        <input
                          type="checkbox"
                          checked={edit.active}
                          onChange={(event) => updateEdit(device._id, "active", event.target.checked)}
                          className="h-4 w-4"
                        />
                        Bật
                      </label>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleSave(device)}
                        disabled={isSaving}
                        className="px-4 py-2 rounded-lg bg-black text-white text-xs font-bold hover:bg-gray-800 disabled:opacity-50"
                      >
                        {isSaving ? "Đang lưu..." : "Lưu"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Thresholds;
