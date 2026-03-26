import React, { useState } from 'react';
import Environment from './Environment';
import Devices from './Devices';
import FireAlarm from './FireAlarm';
import History from './History';

const OverviewPage = () => {
  return (
    <div className="p-8 w-full max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">Tổng quan</h1>
        <p className="text-gray-500">Thông tin chung về ngôi nhà của bạn</p>
      </div>

      {/* 3 Thẻ thống kê */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-start">
          <div>
            <p className="text-gray-500 text-sm font-medium mb-4">Nhiệt độ trung bình</p>
            <h2 className="text-3xl font-bold text-[#1e8e3e] mb-2">26.4°C</h2>
            <p className="text-xs text-gray-500 flex items-center">
              <span className="mr-1">↗</span> Hiện tại: 25.3°C
            </p>
          </div>
          <div className="p-2 bg-orange-50 rounded-full text-orange-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-start">
          <div>
            <p className="text-gray-500 text-sm font-medium mb-4">Độ ẩm hiện tại</p>
            <h2 className="text-3xl font-bold text-blue-600 mb-2">67.2%</h2>
            <p className="text-xs text-gray-500">Cập nhật: 19:14:39</p>
          </div>
          <div className="p-2 bg-blue-50 rounded-full text-blue-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" /></svg>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-start">
          <div>
            <p className="text-gray-500 text-sm font-medium mb-4">Thiết bị đang hoạt động</p>
            <h2 className="text-3xl font-bold text-[#1e8e3e] mb-2">1/4</h2>
            <p className="text-xs text-gray-500">1 thiết bị đang bật</p>
          </div>
          <div className="p-2 bg-green-50 rounded-full text-green-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" /></svg>
          </div>
        </div>
      </div>

      {/* Trạng thái thiết bị */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Trạng thái thiết bị</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-[#e6f4ea] p-4 rounded-xl border border-green-200">
            <div className="text-yellow-500 mb-2">💡</div>
            <p className="font-semibold text-gray-900">Đèn phòng khách</p>
            <p className="text-xs text-[#1e8e3e] mt-1">Đang bật</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <div className="text-blue-500 mb-2">🌀</div>
            <p className="font-semibold text-gray-900">Quạt phòng ngủ</p>
            <p className="text-xs text-gray-400 mt-1">Đang tắt</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <div className="text-cyan-500 mb-2">❄️</div>
            <p className="font-semibold text-gray-900">Máy lạnh</p>
            <p className="text-xs text-gray-400 mt-1">Đang tắt</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <div className="text-purple-400 mb-2">💨</div>
            <p className="font-semibold text-gray-900">Máy hút ẩm</p>
            <p className="text-xs text-gray-400 mt-1">Đang tắt</p>
          </div>
        </div>
      </div>

      {/* Tình trạng môi trường */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Tình trạng môi trường</h3>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex justify-between items-center p-5 border-b border-gray-50">
            <div>
              <p className="font-semibold text-gray-900">Nhiệt độ</p>
              <p className="text-sm text-gray-500">Bình thường</p>
            </div>
            <p className="text-xl font-bold text-[#1e8e3e]">25.3°C</p>
          </div>
          <div className="flex justify-between items-center p-5">
            <div>
              <p className="font-semibold text-gray-900">Độ ẩm</p>
              <p className="text-sm text-gray-500">Bình thường</p>
            </div>
            <p className="text-xl font-bold text-blue-600">67.2%</p>
          </div>
        </div>
      </div>
    </div>
  );
};


const DashboardLayout = () => {
  // State quản lý xem trang nào đang được chọn
  const [activePage, setActivePage] = useState('tong-quan');

  // 1. TẠO CUỐN SỔ NHẬT KÝ
  const [historyLogs, setHistoryLogs] = useState([]);

  // 2. HÀM GHI NHẬN LỊCH SỬ MỚI
  const addHistoryLog = (deviceName, action, oldState, newState) => {
    const now = new Date();
    // Tạo chuỗi ngày tháng: "22/3/2026"
    const dateStr = `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`;
    // Tạo chuỗi giờ phút giây: "20:08:10"
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

    const newLog = {
      id: Date.now(),
      date: dateStr,
      time: timeStr,
      device: deviceName,
      action: action,
      oldState: oldState,
      newState: newState
    };

    // Thêm dòng lịch sử mới lên đầu mảng
    setHistoryLogs((prevLogs) => [newLog, ...prevLogs]);
  };
  // Hàm render nội dung dựa trên trang đang chọn
  const renderContent = () => {
    switch (activePage) {
      case 'tong-quan':
        return <OverviewPage />;
      case 'moi-truong':
        return <Environment/>
      case 'thiet-bi':
        return <Devices/>
      case 'canh-bao':
        return <FireAlarm/>
      case 'lich-su':
        return <History/>;
      default:
        return <OverviewPage />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      
      {/* SIDEBAR (BÊN TRÁI) */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col justify-between">
        
        {/* Phần trên: Logo & Menu */}
        <div>
          {/* Logo */}
          <div className="flex items-center px-6 py-8">
            <div className="w-10 h-10 bg-[#1e8e3e] rounded-lg flex items-center justify-center mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 leading-tight">Smart Home</h1>
              <p className="text-sm text-gray-500">Gia đình</p>
            </div>
          </div>

          {/* Menu Navigation */}
          <nav className="px-4 space-y-2">
            <button 
              onClick={() => setActivePage('tong-quan')}
              className={`w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activePage === 'tong-quan' ? 'bg-[#e6f4ea] text-[#1e8e3e]' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <span className="mr-3 text-lg">⊞</span> Tổng quan
            </button>
            <button 
              onClick={() => setActivePage('moi-truong')}
              className={`w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activePage === 'moi-truong' ? 'bg-[#e6f4ea] text-[#1e8e3e]' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <span className="mr-3 text-lg">🌡️</span> Môi trường
            </button>
            <button 
              onClick={() => setActivePage('thiet-bi')}
              className={`w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activePage === 'thiet-bi' ? 'bg-[#e6f4ea] text-[#1e8e3e]' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <span className="mr-3 text-lg">⚙️</span> Thiết bị
            </button>
            <button 
              onClick={() => setActivePage('canh-bao')}
              className={`w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activePage === 'canh-bao' ? 'bg-[#e6f4ea] text-[#1e8e3e]' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <span className="mr-3 text-lg">🔥</span> Cảnh báo cháy
            </button>
            <button 
              onClick={() => setActivePage('lich-su')}
              className={`w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activePage === 'lich-su' ? 'bg-[#e6f4ea] text-[#1e8e3e]' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <span className="mr-3 text-lg">🕒</span> Lịch sử
            </button>
          </nav>
        </div>

        {/* Phần dưới: User Profile & Đăng xuất */}
        <div className="p-4 border-t border-gray-200">
          <div className="mb-4 px-2">
            <p className="text-sm font-bold text-gray-900">Thành viên gia đình</p>
            <div className="flex items-center mt-1">
              <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-md flex items-center">
                <span className="mr-1">👤</span> Thành viên
              </span>
            </div>
          </div>
          <button className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            <span className="mr-2">↪️</span> Đăng xuất
          </button>
        </div>
      </div>

      {/* VÙNG NỘI DUNG CHÍNH (BÊN PHẢI) */}
      <div className="flex-1 overflow-y-auto">
        {renderContent()}
      </div>

    </div>
  );
};

export default DashboardLayout;