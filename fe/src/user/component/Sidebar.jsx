import React from "react";

const Sidebar = ({ activePage, setActivePage, handleLogout }) => {
  const menuItems = [
    { id: "tong-quan", label: "Tổng quan", icon: "📊" },
    { id: "moi-truong", label: "Môi trường", icon: "🌡️" },
    { id: "thiet-bi", label: "Thiết bị", icon: "💡" },
    { id: "canh-bao", label: "Cảnh báo", icon: "🚨" },
    { id: "lich-su", label: "Lịch sử", icon: "📜" },
  ];

  return (
    <div className="w-64 h-full bg-white border-r border-gray-200 flex flex-col">
      
      {/* Logo */}
      <div className="p-6 border-b">
        <h1 className="text-xl font-bold text-gray-900">🏠 Smart Home</h1>
      </div>

      {/* Menu */}
      <div className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActivePage(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition
              ${
                activePage === item.id
                  ? "bg-green-100 text-black"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
          >
            <span className="text-lg">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </div>

      {/* Logout */}
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


