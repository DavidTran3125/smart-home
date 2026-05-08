import React, { useState, useEffect } from "react";
import { CpuChipIcon } from "@heroicons/react/24/outline";

const DeviceCard = () => {
    const [stats, setStats] = useState({
        totalDevices: 0,
        totalUsers: 0,
    });

    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchAllStats = async () => {
            try {
                const token = localStorage.getItem("token");
                const headers = {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`, 
                };

                const [devRes, userRes] = await Promise.all([
                    fetch("http://localhost:3000/api/v1/devices", { headers }),
                    fetch("http://localhost:3000/api/v1/users", { headers })
                ]);

                const devData = await devRes.json();
                const userData = await userRes.json();

                const deviceArray = Array.isArray(devData) ? devData : (devData.data || []);
                const userArray = Array.isArray(userData) ? userData : (userData.data || []);

                setStats({
                    totalDevices: deviceArray.length,
                    totalUsers: userArray.length,
                });
            } catch (error) {
                console.log("Lỗi gọi API:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAllStats();
    }, []);

    return (
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300">

            <div className="flex justify-between items-start">
                <p className="text-[15px] font-bold text-gray-900 mt-2">Tổng số Thiết bị</p>
                <div className="p-3 bg-purple-50 rounded-full text-purple-600">
                    <CpuChipIcon className="w-6 h-6" strokeWidth={2} />
                </div>
            </div>

            <div className="mt-2">
                <h3 className="text-5xl font-extrabold text-purple-600">
                    {isLoading ? "..." : stats.totalDevices}
                </h3>
            </div>

            <div className="mt-4 flex items-center text-[15px] text-gray-500 font-medium">
                {isLoading ? (
                    <span>Đang cập nhật...</span>
                ) : (
                    <span>Trên {stats.totalUsers} người dùng</span>
                )}
            </div>
        </div>
    );
}

export default DeviceCard;