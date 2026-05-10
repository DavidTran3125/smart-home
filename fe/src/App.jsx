import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './auth/Login';
import Register from './auth/Register';
import UserDashboard from './user/Dashboard';
import AdminDashboard from './admin/Dashboard';
import AddUser from './admin/AddUser';

const getUser = () => {
  try {
    const userStr = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (!userStr || !token) return null;

    // Kiểm tra token hết hạn chưa
    const payload = JSON.parse(atob(token.split(".")[1]));
    if (payload.exp * 1000 < Date.now()) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      return null;
    }

    return JSON.parse(userStr);
  } catch {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return null;
  }
};

const AdminRoute = ({ children }) => {
  const user = getUser();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'SystemAdmin') return <Navigate to="/login" replace />;
  return children;
};

const UserRoute = ({ children }) => {
  const user = getUser();
  if (!user) return <Navigate to="/login" replace />;
  const isFamily = user.role === 'Gia đình' || user.role === 'Gia dinh';
  if (!isFamily && user.role !== 'SystemAdmin') return <Navigate to="/login" replace />;
  return children;
};

export default function App() {
  return (
    <Routes>
      {/* Mặc định luôn về login */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Login không check token — luôn hiển thị */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="/user/*" element={
        <UserRoute>
          <UserDashboard />
        </UserRoute>
      } />

      <Route path="/admin/*" element={
        <AdminRoute>
          <AdminDashboard />
        </AdminRoute>
      } />

      <Route path="/admin/add-user" element={
        <AdminRoute>
          <AddUser />
        </AdminRoute>
      } />

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}