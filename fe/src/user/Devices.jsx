import React, { useEffect, useState } from 'react';

const SENSOR_FEEDS = new Set(['temp', 'humid', 'light']);
const SERVO_OPEN_VALUE = 1;

const CONTROL_CONFIG = {
  fan: {
    label: 'Quạt',
    description: 'Điều chỉnh tốc độ quạt từ 0-100%',
    min: 0,
    max: 100,
    unit: '%',
  },
  ledrgb: {
    label: 'Đèn RGB',
    description: 'Điều chỉnh độ sáng đèn từ 0-255',
    min: 0,
    max: 255,
    unit: '',
  },
  ledred: {
    label: 'Đèn',
    description: 'Bật hoặc tắt đèn',
    min: 0,
    max: 1,
    unit: '',
  },
};

const normalizeFeed = (device) => (device.feed_name || '').toLowerCase();

const isSensorDevice = (device) => SENSOR_FEEDS.has(normalizeFeed(device));

const isServoDevice = (device) => normalizeFeed(device) === 'servo';

const isControllableDevice = (device) => {
  const feed = normalizeFeed(device);
  return isServoDevice(device) || Boolean(CONTROL_CONFIG[feed]);
};

const isDeviceOn = (status) => {
  return (
    status === 'Bat' ||
    status === 'Bật' ||
    status === 'ON' ||
    status === 'on' ||
    status === 1 ||
    status === true
  );
};

const clampValue = (value, min, max) => {
  const numericValue = Number(value);
  if (Number.isNaN(numericValue)) return min;
  return Math.max(min, Math.min(max, Math.round(numericValue)));
};

const getInitialControlValue = (device) => {
  if (device.control_value !== undefined && device.control_value !== null) {
    return String(device.control_value);
  }

  const feed = normalizeFeed(device);
  const config = CONTROL_CONFIG[feed];
  if (!config) return '0';

  return isDeviceOn(device.status) ? String(config.max) : '0';
};

const Devices = ({
  devices = [],
  setDevices,
  fetchDevices,
  isLoading,
  isControlling,
}) => {
  const [controlValues, setControlValues] = useState({});
  const [processingIds, setProcessingIds] = useState(new Set());
  const [error, setError] = useState(null);

  const controllableDevices = devices.filter(isControllableDevice);
  const sensorDevices = devices.filter(isSensorDevice);
  const activeCount = controllableDevices.filter(d => isDeviceOn(d.status)).length;

  useEffect(() => {
    setControlValues(prev => {
      const next = { ...prev };
      devices.filter(isControllableDevice).forEach((device) => {
        if (next[device._id] === undefined) {
          next[device._id] = getInitialControlValue(device);
        }
      });
      return next;
    });
  }, [devices]);

  const updateControlValue = (deviceId, value) => {
    setControlValues(prev => ({ ...prev, [deviceId]: value }));
  };

  const updateDeviceOptimistically = (device, value) => {
    if (isServoDevice(device)) return;

    const nextStatus = Number(value) === 0 ? 'Tắt' : 'Bật';
    setDevices(prev =>
      prev.map(d =>
        d._id === device._id
          ? { ...d, status: nextStatus, control_value: Number(value) }
          : d
      )
    );
  };

  const finishControl = (deviceId, delay = 0) => {
    setTimeout(() => {
      setProcessingIds(prev => {
        const next = new Set(prev);
        next.delete(deviceId);
        return next;
      });

      if (isControlling) {
        isControlling.current = false;
      }

      fetchDevices();
    }, delay);
  };

  const handleControl = async (device, value, holdMs = 0) => {
    if (processingIds.has(device._id)) return;

    if (isControlling) {
      isControlling.current = true;
    }

    setProcessingIds(prev => new Set(prev).add(device._id));
    setError(null);
    updateDeviceOptimistically(device, value);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:3000/api/v1/devices/${device._id}/control`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ value }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Điều khiển thất bại');

      const updatedDevice = result.data;
      if (updatedDevice?._id) {
        setDevices(prev => prev.map(d => d._id === updatedDevice._id ? updatedDevice : d));
      }

      finishControl(device._id, holdMs);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Không thể điều khiển thiết bị lúc này!');
      fetchDevices();
      finishControl(device._id);
    }
  };

  const renderRangeControl = (device) => {
    const feed = normalizeFeed(device);
    const config = CONTROL_CONFIG[feed];
    const isProcessing = processingIds.has(device._id);
    const rawValue = controlValues[device._id] ?? getInitialControlValue(device);
    const value = clampValue(rawValue, config.min, config.max);

    return (
      <div className="mt-5 space-y-4">
        <div>
          <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
            <span>{config.description}</span>
            <span className="font-bold text-gray-900">{value}{config.unit}</span>
          </div>
          <input
            type="range"
            min={config.min}
            max={config.max}
            value={value}
            onChange={(event) => updateControlValue(device._id, event.target.value)}
            className="w-full"
          />
        </div>

        <div className="flex gap-3">
          <input
            type="number"
            min={config.min}
            max={config.max}
            value={value}
            onChange={(event) => updateControlValue(device._id, event.target.value)}
            className="w-24 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
          />
          <button
            onClick={() => handleControl(device, value)}
            disabled={isProcessing}
            className="flex-1 bg-gray-900 text-white rounded-lg px-4 py-2 text-sm font-bold hover:bg-gray-800 disabled:opacity-50"
          >
            {isProcessing ? 'Đang gửi...' : 'Áp dụng'}
          </button>
        </div>
      </div>
    );
  };

  const renderServoControl = (device) => {
    const isProcessing = processingIds.has(device._id);

    return (
      <div className="mt-5">
        <button
          onClick={() => handleControl(device, SERVO_OPEN_VALUE, 2000)}
          disabled={isProcessing}
          className="w-full bg-indigo-600 text-white rounded-xl px-4 py-3 text-sm font-bold hover:bg-indigo-700 disabled:opacity-50"
        >
          {isProcessing ? 'Đang mở cửa...' : 'Mở cửa'}
        </button>
        <p className="text-xs text-gray-400 mt-2 text-center">
        </p>
      </div>
    );
  };

  return (
    <div className="p-8 w-full max-w-7xl mx-auto font-sans">
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Thiết bị</h1>
          <p className="text-gray-500">Điều khiển các thiết bị trong nhà. Cảm biến chỉ hiển thị thông tin, không bật/tắt.</p>
        </div>
        <button
          onClick={fetchDevices}
          className="text-sm bg-white border border-gray-200 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-50 font-medium flex items-center shadow-sm"
        >
          <span className="mr-2">↻</span> Làm mới
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-gray-500 text-sm font-medium mb-1">Thiết bị điều khiển đang hoạt động</p>
          <h2 className="text-4xl font-bold text-[#10b981]">{activeCount}/{controllableDevices.length}</h2>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-gray-500 text-sm font-medium mb-1">Cảm biến trong nhà</p>
          <h2 className="text-4xl font-bold text-blue-600">{sensorDevices.length}</h2>
        </div>
      </div>

      {error && (
        <div className="mb-6 flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 font-medium">
          <span className="text-lg">⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-12 text-gray-500 font-medium">Đang tải danh sách thiết bị...</div>
      ) : (
        <div className="space-y-8">
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-4">Điều khiển thiết bị</h2>
            {controllableDevices.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200 text-gray-500">
                Chưa có thiết bị điều khiển nào.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {controllableDevices.map((device) => {
                  const feed = normalizeFeed(device);
                  const config = CONTROL_CONFIG[feed];
                  const isOn = isDeviceOn(device.status);

                  return (
                    <div key={device._id} className={`bg-white rounded-xl shadow-sm border-2 transition-colors ${isOn ? 'border-blue-400' : 'border-gray-200'}`}>
                      <div className="p-6">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="font-bold text-gray-900 text-lg mb-1 leading-tight">{device.name}</h3>
                            <p className="text-xs text-gray-400">{isServoDevice(device) ? 'Cửa servo' : config?.label || device.type || 'Thiết bị'}</p>
                          </div>
                          <span className={`text-[10px] px-2 py-0.5 rounded text-white font-semibold uppercase tracking-wide ${isOn ? 'bg-[#10b981]' : 'bg-gray-400'}`}>
                            {isOn ? 'Đang bật' : 'Đang tắt'}
                          </span>
                        </div>

                        {isServoDevice(device) ? renderServoControl(device) : renderRangeControl(device)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-4">Cảm biến chỉ đọc</h2>
            {sensorDevices.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-xl border border-gray-200 text-gray-500">
                Chưa có cảm biến nào.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {sensorDevices.map((device) => (
                  <div key={device._id} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                    <div className="font-bold text-gray-900">{device.name}</div>
                    <div className="text-sm text-gray-500 mt-1">Feed: {device.feed_name}</div>
                    <div className="mt-3 inline-flex px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700">
                      Cảm biến không điều khiển
                    </div>
                    <div className="text-xs text-gray-400 mt-3">
                      Lần cuối: {device.last_seen ? new Date(device.last_seen).toLocaleString('vi-VN') : '-'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
};

export default Devices;
