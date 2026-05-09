import React from 'react';
import { CpuChipIcon } from '@heroicons/react/24/outline';

export default function ActiveDevicesCard({
  count = 0,
  total = 0,
}) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-start hover:shadow-md transition-shadow">
      
      <div>
        <p className="text-gray-500 text-sm font-medium mb-4">
          Thiết bị hoạt động
        </p>

        <h2 className="text-3xl font-bold mb-2 text-[#f97316]">
          {count}/{total}
        </h2>

        <p className="text-xs text-gray-400 font-medium">
          {count} thiết bị đang bật
        </p>
      </div>

      <div className="p-2 rounded-full bg-orange-50 text-orange-500">
        <CpuChipIcon className="h-6 w-6" />
      </div>
    </div>
  );
}