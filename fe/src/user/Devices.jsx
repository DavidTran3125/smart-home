import React, { useState } from 'react';

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

const Devices = ({
  devices = [],
  setDevices,
  fetchDevices,
  isLoading,
  isControlling,
}) => {
  const [togglingIds, setTogglingIds] = useState(new Set());
  const [error, setError] = useState(null);

  const handleToggle = async (device) => {
    if (togglingIds.has(device._id)) return;

    const currentIsOn = isDeviceOn(device.status);
    const newStatusString = currentIsOn ? 'Tat' : 'Bat';
    const newValue = currentIsOn ? 0 : 1;

    if (isControlling) {
      isControlling.current = true;
    }

    setTogglingIds(prev => new Set(prev).add(device._id));
    setError(null);

    setDevices(prev =>
      prev.map(d =>
        d._id === device._id
          ? { ...d, status: newStatusString }
          : d
      )
    );

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:3000/api/v1/devices/${device._id}/control`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ value: newValue }),
      });

      if (!res.ok) {
        throw new Error("Control thất bại");
      }

      const data = await res.json();
      
      setDevices(prev =>
        prev.map(d =>
          d._id === device._id
            ? (data.data || data)
            : d
        )
      );

    } catch (err) {
      console.error(err);
      setError("Không thể điều khiển thiết bị lúc này!");

      setDevices(prev =>
        prev.map(d =>
          d._id === device._id
            ? device
            : d
        )
      );
    } finally {
      setTogglingIds(prev => {
        const next = new Set(prev);
        next.delete(device._id);
        return next;
      });

      setTimeout(() => {
        if (isControlling) {
          isControlling.current = false;
        }
        fetchDevices();
      }, 1500);
    }
  };

  const activeCount = devices.filter(d => isDeviceOn(d.status)).length;

  return (
    <div className="p-8 w-full max-w-7xl mx-auto font-sans">
      

      <div className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Thiết bị</h1>
          <p className="text-gray-500">Quản lý và điều khiển các thiết bị trong nhà</p>
        </div>
        <button 
          onClick={fetchDevices} 
          className="text-sm bg-white border border-gray-200 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-50 font-medium flex items-center shadow-sm"
        >
          <span className="mr-2">↻</span> Làm mới
        </button>
      </div>


      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-8">
        <div className="flex items-center text-gray-800 font-semibold mb-6">
          <span className="mr-2">⏻</span> Trạng thái tổng quan
        </div>
        <div className="bg-[#f0fdf4] rounded-xl p-6 flex justify-between items-center border border-green-100">
          <div>
            <p className="text-gray-500 text-sm font-medium mb-1">Thiết bị đang hoạt động</p>
            <h2 className="text-4xl font-bold text-[#10b981]">{activeCount}/{devices.length}</h2>
          </div>
          <div className="w-16 h-16 rounded-full border-4 border-[#10b981] flex items-center justify-center text-[#10b981]">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
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
      ) : devices.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200 text-gray-500">
          Hệ thống chưa có thiết bị nào.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {devices.map((device) => {
            const isOn = isDeviceOn(device.status);
            const isProcessing = togglingIds.has(device._id);

            return (
              <div key={device._id} className={`bg-white rounded-xl shadow-sm border-2 transition-colors ${isOn ? 'border-blue-400' : 'border-gray-200'}`}>
                <div className="p-6">
                  <div className="flex justify-between items-center">
                    
                    <div className="flex flex-col justify-center">
                      <h3 className="font-bold text-gray-900 text-lg mb-1 leading-tight">{device.name}</h3>
                      <div>
                        <span className={`text-[10px] px-2 py-0.5 rounded text-white font-semibold uppercase tracking-wide ${isOn ? 'bg-[#10b981]' : 'bg-gray-400'}`}>
                          {isOn ? 'Đang bật' : 'Đang tắt'}
                        </span>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => handleToggle(device)}
                      disabled={isProcessing}
                      className={`w-14 h-7 rounded-full relative transition-colors duration-300 focus:outline-none flex-shrink-0 ${
                        isOn ? 'bg-blue-500' : 'bg-gray-300'
                      } ${isProcessing ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                      <span className={`absolute top-1 left-1 bg-white w-5 h-5 rounded-full shadow-sm transition-transform duration-300 flex items-center justify-center ${
                        isOn ? 'translate-x-7' : 'translate-x-0'
                      }`}>
                        {isProcessing && (
                          <svg className="animate-spin h-3 w-3 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        )}
                      </span>
                    </button>
                    
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Devices;