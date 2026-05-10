import React from "react";
import { PowerIcon, ArrowTrendingUpIcon } from "@heroicons/react/24/outline";

const OnDeviceCard = ({ stats, isLoading }) => {
    
    const activeCount = stats?.onDevices || 0;
    const total = stats?.totalDevices || 0;
    
  
    const percent = total > 0 ? Math.round((activeCount / total) * 100) : 0;

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
                    {isLoading ? (
                        <span className="animate-pulse">...</span>
                    ) : (
                        activeCount
                    )}
                </h3>
            </div>

            <div className="mt-4 flex items-center text-[15px] text-gray-500 font-medium">
                {isLoading ? (
                    <span>Đang tính...</span>
                ) : (
                    <>
                        <ArrowTrendingUpIcon className="w-5 h-5 mr-2 text-green-500" strokeWidth={2} />
                        <span>Chiếm {percent}% tổng số thiết bị</span>
                    </>
                )}
            </div>
        </div>
    );
};

export default OnDeviceCard;