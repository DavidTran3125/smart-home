import { useState } from 'react';
import Login from './Login';
import Dashboard from './user/Dashboard'; // Import file dashboard.jsx của bạn

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <>
      {isLoggedIn ? (
        <Dashboard /> 
      ) : (
        // Hiển thị trang Login, nếu đăng nhập đúng thì đổi trạng thái isLoggedIn thành true
        <Login onLoginSuccess={() => setIsLoggedIn(true)} />
      )}
    </>
  )
}

export default App;