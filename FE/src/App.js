import './App.css';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { useState } from 'react';
import Dashboard from './Dashboard';
import Profile from './Profile';
import DHT11Data from './DHT11Data';
import Max30100Data from './Max30100Data';
import LoginPage from './LoginPage'; // Import LoginPage

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = () => {
    setIsLoggedIn(true); // Đặt trạng thái đã đăng nhập
  };

  const handleLogout = () => {
    setIsLoggedIn(false); // Đặt trạng thái chưa đăng nhập
    localStorage.removeItem('authToken'); // Xóa token nếu có
  };

  return (
    <Router>
      <div className="container">
        {isLoggedIn && ( // Sidebar chỉ hiển thị khi người dùng đã đăng nhập
          <div className="sidebar">
            
            <ul>
              <li>
                <Link to="/dashboard">Dashboard</Link>
              </li>
              
              <li>
                <Link to="/dht11-data">DHT11 Data</Link>
              </li>
              <li>
                <Link to="/max30100-data">Max30100 Data</Link>
              </li>
            </ul>
            <div className="sidebar-bottom">
              <button onClick={handleLogout} className="logout-button">Logout</button>
            </div>
          </div>
        )}
        <div className="content">
          <Routes>
            {!isLoggedIn ? ( // Nếu chưa đăng nhập, điều hướng tới LoginPage
              <Route path="*" element={<LoginPage onLogin={handleLogin} />} />
            ) : (
              <>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/dht11-data" element={<DHT11Data />} />
                <Route path="/max30100-data" element={<Max30100Data />} />
              </>
            )}
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;
