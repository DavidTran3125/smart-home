import { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './auth/Login';
import Register from './auth/Register';
import UserDashboard from './user/Dashboard';
import AdminDashboard from './admin/Dashboard';
import AddUser from './admin/AddUser';

const API_URL = "http://localhost:3000";
const ADMIN_ROLES = ['SystemAdmin'];
const USER_ROLES = ['Gia đình', 'Gia dinh', 'Admin'];

const clearSession = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

const getUser = () => {
  try {
    const userStr = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (!userStr || !token) return null;

    // Kiểm tra token hết hạn chưa
    const payload = JSON.parse(atob(token.split(".")[1]));
    if (payload.exp * 1000 < Date.now()) {
      clearSession();
      return null;
    }

    const user = JSON.parse(userStr);
    if (user.status === 'invalid') {
      clearSession();
      return null;
    }

    return user;
  } catch {
    clearSession();
    return null;
  }
};

const hasAllowedRole = (user, allowedRoles) => {
  return user && allowedRoles.includes(user.role) && user.status !== 'invalid';
};

const ProtectedRoute = ({ children, allowedRoles }) => {
  const [authState, setAuthState] = useState(() => {
    const user = getUser();
    const token = localStorage.getItem("token");

    if (!user || !token || !hasAllowedRole(user, allowedRoles)) {
      clearSession();
      return { isChecking: false, isAllowed: false };
    }

    return { isChecking: true, isAllowed: false };
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setAuthState({ isChecking: false, isAllowed: false });
      return;
    }

    let isCancelled = false;

    const verifyCurrentUser = async () => {
      try {
        const res = await fetch(`${API_URL}/api/v1/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Unauthorized");

        const result = await res.json();
        const currentUser = result.data;

        if (!hasAllowedRole(currentUser, allowedRoles)) {
          clearSession();
          if (!isCancelled) setAuthState({ isChecking: false, isAllowed: false });
          return;
        }

        localStorage.setItem("user", JSON.stringify(currentUser));
        if (!isCancelled) setAuthState({ isChecking: false, isAllowed: true });
      } catch {
        clearSession();
        if (!isCancelled) setAuthState({ isChecking: false, isAllowed: false });
      }
    };

    verifyCurrentUser();

    return () => {
      isCancelled = true;
    };
  }, [allowedRoles]);

  if (authState.isChecking) return null;
  if (!authState.isAllowed) return <Navigate to="/login" replace />;
  return children;
};

const AdminRoute = ({ children }) => {
  return <ProtectedRoute allowedRoles={ADMIN_ROLES}>{children}</ProtectedRoute>;
};

const UserRoute = ({ children }) => {
  return <ProtectedRoute allowedRoles={USER_ROLES}>{children}</ProtectedRoute>;
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
