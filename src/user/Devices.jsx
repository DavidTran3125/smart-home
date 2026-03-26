import React, { useState } from 'react';

const Devices = () => {
  // Quản lý trạng thái các thiết bị
  const [light, setLight] = useState({ isOn: true, brightness: 80 });
  const [fan, setFan] = useState({ isOn: false, speed: 0 }); // 0: Tắt, 1: Yếu, 2: Vừa, 3: Mạnh
  const [ac, setAc] = useState({ isOn: false });
  const [dehumidifier, setDehumidifier] = useState({ isOn: false });

  // Đếm số thiết bị đang bật
  const activeCount = [light.isOn, fan.isOn, ac.isOn, dehumidifier.isOn].filter(Boolean).length;

  // Xử lý khi bật/tắt Đèn
  const toggleLight = () => {
    setLight(prev => ({
      isOn: !prev.isOn,
      brightness: !prev.isOn ? (prev.brightness === 0 ? 50 : prev.brightness) : prev.brightness
    }));
  };

  // Xử lý khi kéo thanh độ sáng Đèn
  const handleLightSlider = (e) => {
    const val = parseInt(e.target.value);
    setLight({ isOn: val > 0, brightness: val });
  };

  // Xử lý khi bật/tắt Quạt
  const toggleFan = () => {
    setFan(prev => ({
      isOn: !prev.isOn,
      speed: !prev.isOn ? (prev.speed === 0 ? 2 : prev.speed) : 0
    }));
  };

  // Xử lý khi kéo thanh tốc độ Quạt
  const handleFanSlider = (e) => {
    const val = parseInt(e.target.value);
    setFan({ isOn: val > 0, speed: val });
  };

  return (
    <div className="p-8 w-full max-w-7xl mx-auto font-sans">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">Thiết bị</h1>
        <p className="text-gray-500">Quản lý và điều khiển các thiết bị trong nhà</p>
      </div>

      {/* Thẻ Trạng thái tổng quan */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-8">
        <div className="flex items-center text-gray-800 font-semibold mb-6">
          <span className="mr-2">⏻</span> Trạng thái tổng quan
        </div>
        <div className="bg-[#f0fdf4] rounded-xl p-6 flex justify-between items-center border border-green-100">
          <div>
            <p className="text-gray-500 text-sm font-medium mb-1">Thiết bị đang hoạt động</p>
            <h2 className="text-4xl font-bold text-[#10b981]">{activeCount}/4</h2>
          </div>
          <div className="w-16 h-16 rounded-full border-4 border-[#10b981] flex items-center justify-center text-[#10b981]">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Grid Thiết bị */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Card 1: Đèn phòng khách */}
        <div className={`bg-white rounded-xl shadow-sm border-2 transition-colors ${light.isOn ? 'border-blue-400' : 'border-gray-200'}`}>
          <div className="p-6">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center">
                <div className={`text-2xl mr-3 ${light.isOn ? 'text-blue-500' : 'text-gray-400'}`}>💡</div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">Đèn phòng khách</h3>
                  <span className={`text-xs px-2 py-1 rounded-md text-white font-medium ${light.isOn ? 'bg-black' : 'bg-gray-400'}`}>
                    {light.isOn ? 'Đang hoạt động' : 'Đã tắt'}
                  </span>
                </div>
              </div>
              {/* Nút Toggle */}
              <button 
                onClick={toggleLight}
                className={`w-12 h-6 rounded-full relative transition-colors duration-300 focus:outline-none ${light.isOn ? 'bg-black' : 'bg-gray-300'}`}
              >
                <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform duration-300 ${light.isOn ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <p className="text-xs text-gray-500 mb-1">Loại thiết bị</p>
              <p className="font-medium text-gray-900">Đèn chiếu sáng</p>
            </div>

            {/* Thanh trượt độ sáng */}
            <div className="mb-4">
              <div className="flex justify-between text-sm font-medium mb-2">
                <span className="text-gray-900">Độ sáng</span>
                <span className="text-gray-500">{light.brightness}%</span>
              </div>
              <input 
                type="range" 
                min="0" max="100" 
                value={light.brightness} 
                onChange={handleLightSlider}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black"
              />
            </div>
          </div>
          <div className="border-t border-gray-100 p-4 bg-gray-50 rounded-b-xl flex justify-between items-center text-sm">
            <span className="text-gray-500">Trạng thái:</span>
            <span className={`font-semibold ${light.isOn ? 'text-[#10b981]' : 'text-gray-500'}`}>
              {light.isOn ? '● Đang hoạt động' : '○ Đã tắt'}
            </span>
          </div>
        </div>

        {/* Card 2: Quạt phòng ngủ */}
        <div className={`bg-white rounded-xl shadow-sm border-2 transition-colors ${fan.isOn ? 'border-blue-400' : 'border-gray-200'}`}>
          <div className="p-6">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center">
                <div className={`text-2xl mr-3 ${fan.isOn ? 'text-blue-500 animate-spin-slow' : 'text-gray-400'}`}>🌀</div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">Quạt phòng ngủ</h3>
                  <span className={`text-xs px-2 py-1 rounded-md text-white font-medium ${fan.isOn ? 'bg-black' : 'bg-gray-400'}`}>
                    {fan.isOn ? 'Đang hoạt động' : 'Đã tắt'}
                  </span>
                </div>
              </div>
              <button 
                onClick={toggleFan}
                className={`w-12 h-6 rounded-full relative transition-colors duration-300 focus:outline-none ${fan.isOn ? 'bg-black' : 'bg-gray-300'}`}
              >
                <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform duration-300 ${fan.isOn ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <p className="text-xs text-gray-500 mb-1">Loại thiết bị</p>
              <p className="font-medium text-gray-900">Quạt</p>
            </div>

            {/* Thanh trượt tốc độ gió */}
            <div className="mb-4">
              <div className="flex justify-between text-sm font-medium mb-2">
                <span className="text-gray-900">Tốc độ gió</span>
                <span className="text-gray-500">
                  {fan.speed === 0 ? 'Tắt' : fan.speed === 1 ? 'Yếu' : fan.speed === 2 ? 'Vừa' : 'Mạnh'}
                </span>
              </div>
              <input 
                type="range" 
                min="0" max="3" step="1"
                value={fan.speed} 
                onChange={handleFanSlider}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-2 px-1">
                <span>Tắt</span>
                <span>Yếu</span>
                <span>Vừa</span>
                <span>Mạnh</span>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-100 p-4 bg-gray-50 rounded-b-xl flex justify-between items-center text-sm">
            <span className="text-gray-500">Trạng thái:</span>
            <span className={`font-semibold ${fan.isOn ? 'text-[#10b981]' : 'text-gray-500'}`}>
              {fan.isOn ? '● Đang hoạt động' : '○ Đã tắt'}
            </span>
          </div>
        </div>

        {/* Card 3: Máy lạnh */}
        <div className={`bg-white rounded-xl shadow-sm border-2 transition-colors ${ac.isOn ? 'border-blue-400' : 'border-gray-200'}`}>
          <div className="p-6">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center">
                <div className={`text-2xl mr-3 ${ac.isOn ? 'text-cyan-500' : 'text-gray-400'}`}>❄️</div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">Máy lạnh</h3>
                  <span className={`text-xs px-2 py-1 rounded-md text-white font-medium ${ac.isOn ? 'bg-black' : 'bg-gray-400'}`}>
                    {ac.isOn ? 'Đang hoạt động' : 'Đã tắt'}
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setAc({isOn: !ac.isOn})}
                className={`w-12 h-6 rounded-full relative transition-colors duration-300 focus:outline-none ${ac.isOn ? 'bg-black' : 'bg-gray-300'}`}
              >
                <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform duration-300 ${ac.isOn ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Loại thiết bị</p>
              <p className="font-medium text-gray-900">Điều hòa</p>
            </div>
          </div>
          <div className="border-t border-gray-100 p-4 bg-gray-50 rounded-b-xl flex justify-between items-center text-sm">
            <span className="text-gray-500">Trạng thái:</span>
            <span className={`font-semibold ${ac.isOn ? 'text-[#10b981]' : 'text-gray-500'}`}>
              {ac.isOn ? '● Đang hoạt động' : '○ Đã tắt'}
            </span>
          </div>
        </div>

        {/* Card 4: Máy hút ẩm */}
        <div className={`bg-white rounded-xl shadow-sm border-2 transition-colors ${dehumidifier.isOn ? 'border-blue-400' : 'border-gray-200'}`}>
          <div className="p-6">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center">
                <div className={`text-2xl mr-3 ${dehumidifier.isOn ? 'text-purple-500' : 'text-gray-400'}`}>💨</div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">Máy hút ẩm</h3>
                  <span className={`text-xs px-2 py-1 rounded-md text-white font-medium ${dehumidifier.isOn ? 'bg-black' : 'bg-gray-400'}`}>
                    {dehumidifier.isOn ? 'Đang hoạt động' : 'Đã tắt'}
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setDehumidifier({isOn: !dehumidifier.isOn})}
                className={`w-12 h-6 rounded-full relative transition-colors duration-300 focus:outline-none ${dehumidifier.isOn ? 'bg-black' : 'bg-gray-300'}`}
              >
                <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform duration-300 ${dehumidifier.isOn ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Loại thiết bị</p>
              <p className="font-medium text-gray-900">Máy hút ẩm</p>
            </div>
          </div>
          <div className="border-t border-gray-100 p-4 bg-gray-50 rounded-b-xl flex justify-between items-center text-sm">
            <span className="text-gray-500">Trạng thái:</span>
            <span className={`font-semibold ${dehumidifier.isOn ? 'text-[#10b981]' : 'text-gray-500'}`}>
              {dehumidifier.isOn ? '● Đang hoạt động' : '○ Đã tắt'}
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Devices;