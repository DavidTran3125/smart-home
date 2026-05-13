import React from "react";
import {
  Squares2X2Icon, 
  SunIcon, 
  LightBulbIcon, 
  ExclamationTriangleIcon, 
  HomeIcon,
  UsersIcon,
  Cog6ToothIcon,
  ClipboardDocumentListIcon,
} from "@heroicons/react/24/outline";

const Sidebar = ({ activePage, setActivePage, handleLogout, isHomeAdmin = false }) => {
  const baseMenuItems = [
    {
      id: "tong-quan",
      label: "Tổng quan",
      icon: Squares2X2Icon,
      color: "text-green-500",
    },
    {
      id: "nha-cua-toi", // Đã thêm menu Nhà của tôi
      label: "Nhà của tôi",
      icon: HomeIcon,
      color: "text-indigo-500",
    },
    {
      id: "moi-truong",
      label: "Môi trường",
      icon: SunIcon,
      color: "text-blue-500",
    },
    {
      id: "thiet-bi",
      label: "Thiết bị",
      icon: LightBulbIcon,
      color: "text-purple-500",
    },
    {
      id: "canh-bao",
      label: "Cảnh báo",
      icon: ExclamationTriangleIcon,
      color: "text-orange-500",
    },
  ];

  const adminMenuItems = [
    {
      id: "quan-ly-thanh-vien",
      label: "Thành viên",
      icon: UsersIcon,
      color: "text-indigo-500",
    },
    {
      id: "cau-hinh-thiet-bi",
      label: "Cấu hình cảm biến",
      icon: Cog6ToothIcon,
      color: "text-slate-500",
    },
    {
      id: "nhat-ky-nha",
      label: "Nhật ký nhà",
      icon: ClipboardDocumentListIcon,
      color: "text-gray-500",
    },
  ];

  const menuItems = isHomeAdmin
    ? [...baseMenuItems, ...adminMenuItems]
    : baseMenuItems;

  return (
    <div className="w-64 h-screen bg-white border-r border-gray-200 flex flex-col">
      
      <div className="p-6 border-b">
        <h1 className="text-xl font-bold text-gray-900">🏠 Smart Home</h1>
      </div>

      <div className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActivePage(item.id)}
            className={`group w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition
              ${
                activePage === item.id
                  ? "bg-green-100 text-black"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
          >
            <item.icon
              className={`h-6 w-6 transition ${
                activePage === item.id
                  ? "text-green-500" 
                  : item.color      
              }`}
            />
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </div>

      <div className="p-4 border-t">
        <button
          onClick={handleLogout}
          className="w-full bg-red-500 text-white py-2 rounded-xl hover:bg-red-600 transition"
        >
          Đăng xuất
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
