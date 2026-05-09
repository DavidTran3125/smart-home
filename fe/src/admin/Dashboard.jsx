import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './components/Sidebar'; 
import ManageDevices from './ManageDevices';
import ManageUsers from './ManageUsers';
import Logs from './Logs';
import UserCard from './components/cards/UserCard';
import DeviceCard from './components/cards/DeviceCard';
import OnDeviceCard from './components/cards/OnDeviceCard';
import OffDeviceCard from './components/cards/OffDeviceCard';
import AddUser from './AddUser';

const AdminOverview = () => {
  return (
    <div className="p-8 w-full max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">Tổng quan hệ thống</h1>
        <p className="text-gray-500">Chào mừng Admin, đây là báo cáo nhanh về toàn bộ ngôi nhà thông minh.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <UserCard/>
        <DeviceCard/>
        <OnDeviceCard/>
        <OffDeviceCard/>
      </div>
    </div>
  );
};


export default function AdminDashboard() {
  const navigate = useNavigate();
  

  const [activePage, setActivePage] = useState('tong-quan');

  const handleLogout = () => {
    if (window.confirm("Bạn có chắc muốn đăng xuất khỏi tài khoản Admin? 👋")) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/login");
    }
  };

  const renderContent = () => {
    switch (activePage) {
      case 'tong-quan': 
        return <AdminOverview />;
      case 'quan-ly-nguoi-dung': 
        return <ManageUsers />;
      case 'quan-ly-thiet-bi': 
        return <ManageDevices />;
      case 'lich-su-he-thong': 
        return <Logs />;
      case 'them-user':
        return <AddUser/>;
      default: 
        return <AdminOverview />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans">

      <Sidebar 
        activePage={activePage} 
        setActivePage={setActivePage} 
        handleLogout={handleLogout} 
        isAdmin={true} 
      />
      

      <div className="flex-1 overflow-y-auto">
        {renderContent()}
      </div>
    </div>
  );
}