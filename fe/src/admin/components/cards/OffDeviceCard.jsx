import React from "react";

const OffDeviceCard = ({ stats, isLoading }) => {
    
    const inactiveCount = stats?.offDevices || 0;
    const total = stats?.totalDevices || 0;

    const percent = total > 0 ? Math.round((inactiveCount / total) * 100) : 0;

    return (
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex justify-between items-start">
                <p className="text-[15px] font-bold text-gray-900 mt-2">Thiết bị đã tắt</p>
                <div className="p-3 bg-slate-50 rounded-full text-slate-500">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.163v-5" />
                    </svg>
                </div>
            </div>

            <div className="mt-2">
                <h3 className="text-5xl font-extrabold text-slate-600">
                    {isLoading ? (
                        <span className="animate-pulse">...</span>
                    ) : (
                        inactiveCount
                    )}
                </h3>
            </div>

            <div className="mt-4 flex items-center text-[13px] text-gray-500 font-medium">
                {isLoading ? (
                    <span>Đang tính...</span>
                ) : (
                    <div className="flex items-center gap-1.5">
                        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                        <span>Chiếm {percent}% tổng số thiết bị</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OffDeviceCard;