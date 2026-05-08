import React from "react";
import { HomeIcon, Squares2X2Icon, UserIcon, DeviceTabletIcon, PaperClipIcon} from "@heroicons/react/24/outline";

const Sidebar = ({ activePage, setActivePage, handleLogout }) => {
    const menuItem = [
        {
            id: "tong-quan",
            label: "Tổng quan",
            icon: Squares2X2Icon,
        },
        {
            id: "quan-ly-nguoi-dung", 
            label: "Quản lý User",
            icon: UserIcon,
        },
        {
            id: "quan-ly-thiet-bi",
            label: "Quản lý Thiết bị",
            icon: DeviceTabletIcon,
        },
        {
            id: "lich-su-he-thong",
            label: "Logs",
            icon: PaperClipIcon,
        },
    ];

    return(
        <div className="border border-gray-200 h-screen w-64 bg-white flex flex-col font-sans">
            <div className="flex border-b border-gray-200 p-4 justify-evenly items-center">
                <HomeIcon className="w-10 h-10 bg-red-600 text-white border rounded-lg p-1"/>
                <div>
                    <h2 className="font-bold text-xl">Smart Home</h2>
                    <p className="text-[14px] text-gray-500">Quản trị viên</p>
                </div>
            </div>

            <div className="flex-1 p-4 space-y-2">
                {
                    menuItem.map((item) => (
                        <button 
                            key={item.id}
                            onClick={() => setActivePage(item.id)} 
                            className={`group w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition
                                ${
                                    activePage === item.id
                                    ? "bg-red-50 text-red-600" 
                                    : "text-gray-700 hover:bg-gray-100"
                                }`}
                        >
                            <item.icon
                                className={`h-6 w-6 transition ${
                                    activePage === item.id
                                    ? "text-red-600" 
                                    : "text-gray-500"
                                }`}
                            />
                            
                            <span className="font-medium text-inherit">{item.label}</span>
                        </button>
                    ))
                }
            </div>

            <div className="p-4 border-t border-gray-200">
                <button 
                    onClick={handleLogout}
                    className="w-full py-3 bg-red-50 text-red-600 font-bold rounded-xl hover:bg-red-100 transition"
                >
                    Đăng xuất
                </button>
            </div>
        </div>
    );
}

export default Sidebar;