import React, { useState, useEffect } from "react";
import { UserGroupIcon } from "@heroicons/react/24/outline";

const UserCard = () => {
    const [userCount, setUserCount] = useState({
        total: 0,
        admin: 0,
        family: 0,
    });

    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchUserCount = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await fetch("http://localhost:3000/api/v1/users", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`, 
                    }
                });

                if (!res.ok) throw new Error("Không thể lấy danh sách người dùng");
                const data = await res.json();
                const userArray = Array.isArray(data) ? data : (data.data || []);
                
                const admins = userArray.filter(u => u.role === 'Admin');
                const families = userArray.filter(u => u.role === 'Gia dinh' || u.role === 'Gia đình');
                
                setUserCount({
                    total: userArray.length,
                    admin: admins.length,
                    family: families.length,
                });
            } catch (error) {
                console.log("Lỗi gọi API:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchUserCount();
    }, []);

    return (
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="flex justify-between items-start">
                <p className="text-[15px] font-bold text-gray-900 mt-2">Tổng số User</p>
                <div className="p-3 bg-blue-50 rounded-full text-blue-600">
                    <UserGroupIcon className="w-6 h-6" strokeWidth={2} />
                </div>
            </div>
            
            <div className="mt-2">
                <h3 className="text-5xl font-extrabold text-blue-600">
                    {isLoading ? "..." : userCount.total}
                </h3>
            </div>

            <div className="mt-4 flex items-center text-[15px] text-gray-500 font-medium">
                {isLoading ? (
                    <span>Đang tải...</span>
                ) : (
                    <span>{userCount.admin} Quản trị viên, {userCount.family} Thành viên</span>
                )}
            </div>
        </div>
    );
}

export default UserCard;