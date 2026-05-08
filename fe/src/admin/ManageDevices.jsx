import {React, useState, useEffect} from 'react'
import { CpuChipIcon, PowerIcon } from '@heroicons/react/24/outline';
const ManageDevices = () => {
    const [devices, setDevices] = useState([]);

    const [isLoading, setIsLoading] = useState(true);

    const fetchDevices = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch("http://localhost:3000/api/v1/devices", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                }
            });

            if(!res.ok) {
                throw new Error("Lỗi khi tải danh sách thiết bị");
            }
            
            const data = await res.json();

            // Mang cac thiet bi
            const deviceList = Array.isArray(data) ? data : (data.data || []);

            setDevices(deviceList);
        }
        catch (error) {
            console.log("Chi tiết lỗi", error);
        }
        finally {
            setIsLoading(false);
        }
        useEffect(() => {
        fetchDevices();
    }, []);
    }

    const OnDevices = devices.filter(d => d.status === "Bat").length;
    const OffDevices = devices.filter(d => d.status === "Tat").length;
    return(
        <div className='p-9'>
            <div>
                <h1 className="font-bold text-3xl mb-2 text-gray-900">Quản lý thiết bị</h1>
                <p className="text-gray-500">Quản lý thiết bị của người dùng trong hệ thống</p>
            </div>

            <div className='grid grid-cols-3 gap-5 mt-5'>
                <div className='border border-gray-200 shadow-sm rounded-lg p-3 hover:shadow-md'>
                    <div className='flex justify-between items-center '>
                        <h1 className='font-medium text-[15px]'>Tổng thiết bị</h1>
                        <CpuChipIcon className='w-6 h-6 text-gray-500'/>
                    </div>
                    <div className='mt-6 font-medium text-3xl text-gray-500'>{isLoading ? "..." : devices.length}</div>
                </div>

                <div className='border border-gray-200 shadow-sm rounded-lg p-3 hover:shadow-md'>
                    <div className='flex justify-between items-center '>
                        <h1 className='font-medium text-[15px]'>Đang bật</h1>
                        <PowerIcon className='w-6 h-6 text-green-500'/>
                    </div>
                    <div className='mt-6 font-medium text-3xl text-green-500'>{isLoading ? "..." : OnDevices}</div>
                </div>

                <div className='border border-gray-200 shadow-sm rounded-lg p-3 hover:shadow-md'>
                    <div className='flex justify-between items-center '>
                        <h1 className='font-medium text-[15px]'>Đang tắt</h1>
                        <PowerIcon className='w-6 h-6 text-red-500'/>
                    </div>
                    <div className='mt-6 font-medium text-3xl text-red-500'>{isLoading ? "..." : OffDevices}</div>
                </div>
            </div>
        </div>
    );
}

export default ManageDevices;