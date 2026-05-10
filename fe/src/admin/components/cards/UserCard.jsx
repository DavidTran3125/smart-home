import React from "react";
import { UserGroupIcon } from "@heroicons/react/24/outline";

// Nhận stats và isLoading từ AdminDashboard
const UserCard = ({ stats, isLoading }) => {
    // Bóc tách dữ liệu từ object stats truyền vào
    // totalUsers, admin, family được tính toán từ Dashboard
    const { totalUsers = 0, admin = 0, family = 0 } = stats || {};

    return (
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex justify-between items-start">
                <p className="text-[15px] font-bold text-gray-900 mt-2">Tổng số User</p>
                <div className="p-3 bg-blue-50 rounded-full text-blue-600">
                    <UserGroupIcon className="w-6 h-6" strokeWidth={2} />
                </div>
            </div>
            
            <div className="mt-2">
                <h3 className="text-5xl font-extrabold text-blue-600">
                    {isLoading ? (
                        <span className="animate-pulse">...</span>
                    ) : (
                        totalUsers
                    )}
                </h3>
            </div>

            <div className="mt-4 flex items-center text-[13px] text-gray-500 font-medium">
                {isLoading ? (
                    <span>Đang cập nhật...</span>
                ) : (
                    <div className="flex gap-2">
                        <span className="bg-blue-50 px-2 py-0.5 rounded text-blue-700">
                            {admin} Admin
                        </span>
                        <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-700">
                            {family} Gia đình
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}

export default UserCard;