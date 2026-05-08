import React, { useState, useEffect } from "react";
import { PowerIcon, ArrowTrendingUpIcon } from "@heroicons/react/24/outline";

const OnDeviceCard = () => {
    const [stats, setStats] = useState({ active: 0, percentage: 0 });
    const [isLoading, setIsLoading] = useState(true);

    const isDeviceOn = (status) => {
        return status === 'Bat' || status === 'Bật' || status === 'ON' || status === 1;
    };

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await fetch("http://localhost:3000/api/v1/devices", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`, 
                    }
                });

                if (!res.ok) throw new Error("Lỗi API");
                const data = await res.json();
                const deviceArray = Array.isArray(data) ? data : (data.data || []);
                
                const activeCount = deviceArray.filter(d => isDeviceOn(d.status)).length;
                const total = deviceArray.length;
                
                const percent = total > 0 ? Math.round((activeCount / total) * 100) : 0;

                setStats({ active: activeCount, percentage: percent });
            } catch (error) {
                console.log("Lỗi:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchStats();
    }, []);

    return (
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
  
            <div className="flex justify-between items-start">
                <p className="text-[15px] font-bold text-gray-900 mt-2">Thiết bị đang bật</p>
                <div className="p-3 bg-green-50 rounded-full text-green-600">
                    <PowerIcon className="w-6 h-6" strokeWidth={2} />
                </div>
            </div>

 
            <div className="mt-2">
                <h3 className="text-5xl font-extrabold text-green-600">
                    {isLoading ? "..." : stats.active}
                </h3>
            </div>

 
            <div className="mt-4 flex items-center text-[15px] text-gray-500 font-medium">
                {isLoading ? (
                    <span>Đang tính...</span>
                ) : (
                    <>
                        <ArrowTrendingUpIcon className="w-5 h-5 mr-2 text-gray-600" strokeWidth={2} />
                        <span>{stats.percentage}% tổng số</span>
                    </>
                )}
            </div>
        </div>
    );
};

export default OnDeviceCard;