import React, { useState, useEffect } from "react";

const OffDeviceCard = () => {
    const [stats, setStats] = useState({ inactive: 0, percentage: 0 });
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
                const inactiveCount = total - activeCount;
                
                // Tính phần trăm (Tránh lỗi chia cho 0)
                const percent = total > 0 ? Math.round((inactiveCount / total) * 100) : 0;

                setStats({ inactive: inactiveCount, percentage: percent });
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
            {/* Header */}
            <div className="flex justify-between items-start">
                <p className="text-[15px] font-bold text-gray-900 mt-2">Thiết bị đã tắt</p>
                <div className="p-3 bg-slate-50 rounded-full text-slate-500">
                    {/* Icon Power Slash tự vẽ bằng SVG */}
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.163v-5" />
                    </svg>
                </div>
            </div>

            {/* Số lượng */}
            <div className="mt-2">
                {/* Dùng màu slate-600 cho ra cái màu xám xanh đậm tuyệt đẹp */}
                <h3 className="text-5xl font-extrabold text-slate-600">
                    {isLoading ? "..." : stats.inactive}
                </h3>
            </div>

            {/* Phần trăm */}
            <div className="mt-4 flex items-center text-[15px] text-gray-500 font-medium">
                {isLoading ? (
                    <span>Đang tính...</span>
                ) : (
                    <span>{stats.percentage}% tổng số</span>
                )}
            </div>
        </div>
    );
};

export default OffDeviceCard;