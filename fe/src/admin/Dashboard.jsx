import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Sidebar from './components/Sidebar'; 
import ManageDevices from './ManageDevices';
import ManageUsers from './ManageUsers';
import Logs from './Logs';
import UserCard from './components/cards/UserCard';
import DeviceCard from './components/cards/DeviceCard';
import OnDeviceCard from './components/cards/OnDeviceCard';
import OffDeviceCard from './components/cards/OffDeviceCard';
import AddUser from './AddUser';

const AdminOverview = ({ stats, loading }) => {
    return (
        <div className="p-8 w-full max-w-6xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-1">Tổng quan hệ thống</h1>
                <p className="text-gray-500">Chào mừng Admin, đây là báo cáo nhanh về toàn bộ ngôi nhà thông minh.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* TRUYỀN stats VÀ loading XUỐNG CARD */}
                <UserCard stats={stats} isLoading={loading} />
                <DeviceCard stats={stats} isLoading={loading} />
                <OnDeviceCard stats={stats} isLoading={loading} />
                <OffDeviceCard stats={stats} isLoading={loading} />
            </div>
        </div>
    );
};

export default function AdminDashboard() {
    const navigate = useNavigate();
    const [activePage, setActivePage] = useState('tong-quan');
    const [stats, setStats] = useState({
        totalUsers: 0,
        admin: 0,
        family: 0,
        totalDevices: 0,
        onDevices: 0,
        offDevices: 0
    });
    const [loading, setLoading] = useState(true);

    const fetchSystemStats = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            const config = {
                headers: { Authorization: `Bearer ${token}` }
            };

            const [usersRes, devicesRes] = await Promise.all([
                axios.get('http://localhost:3000/api/v1/system/users', config),
                axios.get('http://localhost:3000/api/v1/system/devices', config)
            ]);

            const userList = usersRes.data.data || [];
            const deviceList = devicesRes.data.data || [];

            // TÍNH TOÁN CHI TIẾT
            const onCount = deviceList.filter(d => d.status === "Bật").length;

            setStats({
                totalUsers: usersRes.data.total || userList.length,
                admin: userList.filter(u => u.role === 'SystemAdmin' || u.role === 'Admin').length,
                family: userList.filter(u => u.role === 'Gia đình').length,
                totalDevices: devicesRes.data.total || deviceList.length,
                onDevices: onCount,
                offDevices: (devicesRes.data.total || deviceList.length) - onCount
            });
        } catch (error) {
            console.error("Lỗi lấy dữ liệu:", error);
            if (error.response?.status === 401) navigate("/login");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (activePage === 'tong-quan') fetchSystemStats();
    }, [activePage]);

    const handleLogout = () => {
        if (window.confirm("Đăng xuất? 👋")) {
            localStorage.clear();
            navigate("/login");
        }
    };

    const renderContent = () => {
        switch (activePage) {
            case 'tong-quan': return <AdminOverview stats={stats} loading={loading} />;
            case 'quan-ly-nguoi-dung': return <ManageUsers />;
            case 'quan-ly-thiet-bi': return <ManageDevices />;
            case 'lich-su-he-thong': return <Logs />;
            case 'them-user': return <AddUser />;
            default: return <AdminOverview stats={stats} loading={loading} />;
        }
    };

    return (
        <div className="flex h-screen bg-gray-50 font-sans">
            <Sidebar activePage={activePage} setActivePage={setActivePage} handleLogout={handleLogout} isAdmin={true} />
            <div className="flex-1 overflow-y-auto">{renderContent()}</div>
        </div>
    );
}