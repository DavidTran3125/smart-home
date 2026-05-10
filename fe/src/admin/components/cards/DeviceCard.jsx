import React from "react";
import { CpuChipIcon } from "@heroicons/react/24/outline";

// Nhận stats và isLoading từ Dashboard truyền xuống
const DeviceCard = ({ stats, isLoading }) => {
    // Bây giờ stats đã là nguyên cái Object chứa đầy đủ thông tin
    const totalDevices = stats?.totalDevices || 0;
    const totalUsers = stats?.totalUsers || 0;

    return (
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex justify-between items-start">
                <p className="text-[15px] font-bold text-gray-900 mt-2">Tổng số Thiết bị</p>
                <div className="p-3 bg-purple-50 rounded-full text-purple-600">
                    <CpuChipIcon className="w-6 h-6" strokeWidth={2} />
                </div>
            </div>

            <div className="mt-2">
                <h3 className="text-5xl font-extrabold text-purple-600">
                    {isLoading ? (
                        <span className="animate-pulse">...</span>
                    ) : (
                        totalDevices
                    )}
                </h3>
            </div>

            <div className="mt-4 flex items-center text-[13px] text-gray-500 font-medium">
                {isLoading ? (
                    <span>Đang cập nhật...</span>
                ) : (
                    <div className="flex items-center gap-1.5">
                        <span className="bg-purple-50 px-2 py-0.5 rounded text-purple-700">
                            Hệ thống có {totalUsers} người dùng
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}

export default DeviceCard;