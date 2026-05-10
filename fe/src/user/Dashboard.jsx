import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from "react-router-dom";

import Sidebar from './component/Sidebar';

import Environment from './Environment';
import Devices from './Devices';
import FireAlarm from './FireAlarm';
import History from './History';
import Home from './Home'; // Import file Home bạn vừa làm

import TemperatureCard from './component/cards/TemperatureCard';
import HumidityCard from './component/cards/HumidityCard';
import ActiveDevicesCard from './component/cards/ActiveDevicesCard';
import EnvironmentStatus from './component/cards/EnvironmentStatus';

// ======================================================
// HELPERS
// ======================================================

const isDeviceOn = (status) => {
  return (
    status === 'Bat' ||
    status === 'Bật' || // Thêm check "Bật" có dấu nếu cần
    status === 'ON' ||
    status === 'on' ||
    status === 1 ||
    status === true
  );
};

// ======================================================
// OVERVIEW PAGE
// ======================================================

const OverviewPage = ({
  devices = [],
  isLoading = true,
}) => {

  const activeDevices = devices.filter(d =>
    isDeviceOn(d.status)
  );

  return (
    <div className="p-8 w-full max-w-6xl mx-auto">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">
          Tổng quan
        </h1>

        <p className="text-gray-500">
          Thông tin chung về ngôi nhà của bạn
        </p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

        <TemperatureCard />

        <HumidityCard />

        <ActiveDevicesCard
          count={activeDevices.length}
          total={devices.length}
        />
      </div>

      {/* Device status */}
      <div className="mb-8">

        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Trạng thái thiết bị
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

          {isLoading ? (
            <div className="col-span-4 text-center py-4 text-gray-500">
              Đang tải dữ liệu thiết bị...
            </div>

          ) : devices.length === 0 ? (
            <div className="col-span-4 text-center py-4 text-gray-500 bg-white rounded-xl border border-gray-200">
              Chưa có thiết bị nào trong hệ thống.
            </div>

          ) : (
            devices.slice(0, 4).map((device) => {

              const isOn = isDeviceOn(device.status);

              return (
                <div
                  key={device._id}
                  className={`p-4 rounded-xl border flex justify-between items-center transition-all ${
                    isOn
                      ? 'bg-green-50 border-green-200 shadow-sm'
                      : 'bg-white border-gray-200'
                  }`}
                >
                  <div className="pr-2 truncate">

                    <p
                      className="font-semibold text-gray-900 truncate"
                      title={device.name}
                    >
                      {device.name}
                    </p>

                    <p className="text-sm text-gray-400">
                      {isOn ? 'Đang hoạt động' : 'Đang tắt'}
                    </p>
                  </div>

                  <span
                    className={`text-xs px-3 py-1 rounded-full font-medium flex-shrink-0 ${
                      isOn
                        ? 'bg-green-100 text-green-600'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {isOn ? 'ON' : 'OFF'}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>

      <EnvironmentStatus />
    </div>
  );
};

// ======================================================
// DASHBOARD LAYOUT
// ======================================================

const DashboardLayout = () => {

  const navigate = useNavigate();

  const [activePage, setActivePage] = useState('tong-quan');

  const [devices, setDevices] = useState([]);

  const [isLoadingDevices, setIsLoadingDevices] = useState(true);

  const isControlling = useRef(false);

  const fetchDevices = async () => {

    if (isControlling.current) return;

    try {

      const token = localStorage.getItem("token");

      const res = await fetch(
        "http://localhost:3000/api/v1/devices",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await res.json();

      const devicesArray = Array.isArray(data)
        ? data
        : (data.data || []);

      setDevices(devicesArray);

    } catch (error) {

      console.error("Lỗi fetch thiết bị:", error);

    } finally {

      setIsLoadingDevices(false);
    }
  };


  useEffect(() => {

    fetchDevices();

    const timer = setInterval(() => {
      fetchDevices();
    }, 5000);

    return () => clearInterval(timer);

  }, []);


  const handleLogout = () => {

    if (window.confirm("Bạn có chắc muốn đăng xuất? 👋")) {

      localStorage.removeItem("token");

      localStorage.removeItem("user");

      navigate("/login");
    }
  };

  const renderContent = () => {

    switch (activePage) {

      case 'tong-quan':
        return (
          <OverviewPage
            devices={devices}
            isLoading={isLoadingDevices}
          />
        );

      case 'nha-cua-toi': // Xử lý render trang Nhà của tôi
        return <Home />;

      case 'moi-truong':
        return <Environment />;

      case 'thiet-bi':
        return (
          <Devices
            devices={devices}
            setDevices={setDevices}
            fetchDevices={fetchDevices}
            isLoading={isLoadingDevices}
            isControlling={isControlling}
          />
        );

      case 'canh-bao':
        return <FireAlarm />;

      case 'lich-su':
        return <History />;

      default:
        return (
          <OverviewPage
            devices={devices}
            isLoading={isLoadingDevices}
          />
        );
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