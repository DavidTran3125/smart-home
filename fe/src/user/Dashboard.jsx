import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import Sidebar from './component/Sidebar'; 
import Environment from './Environment';
import Devices from './Devices';
import FireAlarm from './FireAlarm';
import History from './History';
import { ChartBarIcon, CloudIcon, CpuChipIcon } from '@heroicons/react/24/outline';

const ICON_MAP = {
  temperature: ChartBarIcon,
  humidity: CloudIcon,
  device: CpuChipIcon,
};


const STATS_DATA = [
  { id: 1, label: 'Nhiệt độ trung bình', value: '26.4°C', info: '↗ Hiện tại: 25.3°C', color: 'text-[#1e8e3e]', bg: 'bg-green-50', iconColor: 'text-green-500', icon: 'temperature' },
  { id: 2, label: 'Độ ẩm hiện tại', value: '67.2%', info: 'Cập nhật: 19:14:39', color: 'text-blue-600', bg: 'bg-blue-50', iconColor: 'text-blue-500', icon: 'humidity' },
  { id: 3, label: 'Thiết bị hoạt động', value: '1/4', info: '1 thiết bị đang bật', color: 'text-[#f97316]', bg: 'bg-orange-50', iconColor: 'text-orange-500', icon: 'device' },
];

const DEVICES_LIST = [
  { id: 1, name: 'Đèn phòng khách', icon: '💡', status: 'on', statusText: 
    'Đang bật' },
  { id: 2, name: 'Quạt phòng ngủ', icon: '🌀', status: 'off', statusText: 'Đang tắt' },
  { id: 3, name: 'Máy lạnh', icon: '❄️', status: 'on', statusText: 'Đang bật' },
  { id: 4, name: 'Máy hút ẩm', icon: '💨', status: 'off', statusText: 'Đang tắt' },
  { id: 5, name: 'Máy lọc nước', status: 'on', statusText: 'Đang bật' },

];

const OverviewPage = () => {
  return (
    <div className="p-8 w-full max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">Tổng quan</h1>
        <p className="text-gray-500">Thông tin chung về ngôi nhà của bạn</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {STATS_DATA.map((stat) => {
          const Icon = ICON_MAP[stat.icon]
          return(
            <div key={stat.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-start hover:shadow-md transition-shadow">
            <div>
              <p className="text-gray-500 text-sm font-medium mb-4">{stat.label}</p>
              <h2 className={`text-3xl font-bold mb-2 ${stat.color}`}>{stat.value}</h2>
              <p className="text-xs text-gray-400 font-medium">{stat.info}</p>
            </div>
            <div className={`p-2 rounded-full ${stat.bg} ${stat.iconColor}`}>
              <Icon className='h-6 w-6'/>
            </div>
          </div>
          )
        })}
      </div>

      
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Trạng thái thiết bị</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {DEVICES_LIST.map((device) => {
            const isOn = device.status === 'on';
            return (
              <div
                key={device.id}
                className={`p-4 rounded-xl border flex justify-between items-center transition-all ${
                  isOn
                    ? 'bg-green-50 border-green-200 shadow-sm'
                    : 'bg-white border-gray-200'
                }`}
              >
                <div>
                  <p className="font-semibold text-gray-900">{device.name}</p>
                  <p className="text-sm text-gray-400">{device.statusText}</p>
                </div>
                <span
                  className={`text-xs px-3 py-1 rounded-full font-medium ${
                    isOn
                      ? 'bg-green-100 text-green-600'
                      : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {isOn ? 'ON' : 'OFF'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Tình trạng môi trường</h3>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-50">
          <div className="flex justify-between items-center p-5">
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
  const navigate = useNavigate();
  const [activePage, setActivePage] = useState('tong-quan');

  const handleLogout = () => {
    if(window.confirm("Bạn có chắc muốn đăng xuất? 👋")) {
        navigate("/");
    }
  };

  const renderContent = () => {
    switch (activePage) {
      case 'tong-quan': return <OverviewPage />;
      case 'moi-truong': return <Environment />;
      case 'thiet-bi': return <Devices />;
      case 'canh-bao': return <FireAlarm />;
      case 'lich-su': return <History />;
      default: return <OverviewPage />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      <Sidebar 
        activePage={activePage} 
        setActivePage={setActivePage} 
        handleLogout={handleLogout} 
      />

      
      <div className="flex-1 overflow-y-auto">
        {renderContent()}
      </div>
    </div>
  );
};

export default DashboardLayout;