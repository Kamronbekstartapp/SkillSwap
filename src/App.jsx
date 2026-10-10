import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Chat from './pages/Chat';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Requests from './pages/Requests';

function App() {
  // Kompyuterda zoom qilishni bloklash
  useEffect(() => {
    // 1. Ctrl + Sichqoncha g'ildiragi orqali zoom qilishni bloklash
    const handleWheel = (e) => {
      if (e.ctrlKey) {
        e.preventDefault();
      }
    };

    // 2. Ctrl + (+), Ctrl + (-), Ctrl + (0) klaviatura qisqartmalarini bloklash
    const handleKeyDown = (e) => {
      if (
        e.key === 'F12' ||
        e.keyCode === 123 || // F12 ning eski kodi
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j' || e.key === 'C' || e.key === 'c')) ||
        (e.ctrlKey && (e.key === 'U' || e.key === 'u'))
      ) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div
      onContextMenu={(e) => e.preventDefault()}
      className="w-full min-w-0 min-h-screen select-none"
    >
      <AuthProvider>
        <Router>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/requests" element={<Requests />} />
            </Routes>
        </Router>
      </AuthProvider>
    </div>
  );
}

export default App;



// Qurilma turini aniqlash funksiyasi
export function useDeviceType() {
  const [deviceType, setDeviceType] = useState('desktop');

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width <= 768) {
        setDeviceType('mobile');
      } else if (width <= 1024) {
        setDeviceType('tablet');
      } else {
        setDeviceType('desktop');
      }
    };

    handleResize(); // Dastlabki yuklanganda tekshirish
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return deviceType;
}
