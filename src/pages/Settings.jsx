import React, { useContext, useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { ThemeContext } from '../context/ThemeContext';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Sun, Moon, Bell, Shield, Monitor, UserCheck, CheckCircle2, ShieldCheck, LogOut } from 'lucide-react';

export default function Settings() {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { currentUser, updateUser, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [role, setRole] = useState('learner');
  const [successMessage, setSuccessMessage] = useState('');

  // Joriy foydalanuvchining rolini formaga yuklash
  useEffect(() => {
    if (currentUser && currentUser.role) {
      setRole(currentUser.role);
    }
  }, [currentUser]);

  // Rolni saqlash va butun sayt bo'ylab yangilash
  const handleSaveRole = (e) => {
    e.preventDefault();
    if (!currentUser) return;

    const updatedData = {
      ...currentUser,
      role: role
    };
    
    // AuthContext orqali yangilash
    updateUser(updatedData);

    setSuccessMessage('Rol muvaffaqiyatli o\'zgartirildi!');
    setTimeout(() => {
      setSuccessMessage('');
    }, 3500);
  };

  // Hisobdan chiqish funksiyasi
  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <Sidebar />
      <main className="min-w-0 flex-1 p-4 sm:p-6 md:p-10 pb-28 md:pb-10 overflow-y-auto">
        <div className="max-w-3xl mx-auto space-y-6">
          
          <div className="mb-6">
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Sozlamalar</h1>
            <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400">Platforma ko'rinishi va hisobingizni boshqaring</p>
          </div>

          {/* Muvaffaqiyatli xabar */}
          {successMessage && (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 text-sm font-semibold rounded-2xl flex items-center gap-2">
              <CheckCircle2 size={18} /> {successMessage}
            </div>
          )}

          {/* Rolni o'zgartirish Card */}
          <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center space-x-3 pb-4 border-b border-slate-100 dark:border-slate-800">
              <UserCheck className="text-blue-600 dark:text-blue-400" size={22} />
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm md:text-base">Foydalanuvchi roli</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">O'rganuvchi, o'rgatuvchi yoki ikkalasi maqomini tanlang</p>
              </div>
            </div>

            <form onSubmit={handleSaveRole} className="space-y-4 pt-2">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Hozirgi rolingiz: <strong className="text-blue-600 dark:text-blue-400 capitalize">
                    {role === 'learner' ? "O'rganuvchi" : role === 'teacher' ? "O'rgatuvchi" : "Ikkalasi"}
                  </strong>
                </span>

                <select 
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs md:text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer transition-all w-full sm:w-auto"
                >
                  <option value="learner">O'rganuvchi</option>
                  <option value="teacher">O'rgatuvchi</option>
                  <option value="both">Ikkalasi</option>
                </select>
              </div>

              <button 
                type="submit" 
                className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-xs transition-all shadow-md shadow-blue-600/20 flex items-center justify-center gap-2"
              >
                <ShieldCheck size={16} /> Rolni saqlash va yangilash
              </button>
            </form>
          </div>

          {/* Theme Settings Card */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center space-x-3 pb-4 border-b border-slate-100 dark:border-slate-800">
              <Monitor className="text-blue-600 dark:text-blue-400" size={22} />
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm md:text-base">Interfeys rejimi</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Tungi yoki kunduzgi mavzuni tanlang</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                {theme === 'dark' ? <Moon size={18} className="text-blue-400" /> : <Sun size={18} className="text-amber-500" />}
                <span>Hozirgi rejim: <strong>{theme === 'dark' ? 'Tungi rejim' : 'Kunduzgi rejim'}</strong></span>
              </span>
              <button 
                onClick={toggleTheme}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-md shadow-blue-600/20 transition-all"
              >
                Rejimni o'zgartirish
              </button>
            </div>
          </div>

          {/* Notifications Setting */}
          <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center space-x-3 pb-4 border-b border-slate-100 dark:border-slate-800">
              <Bell className="text-blue-600 dark:text-blue-400" size={22} />
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm md:text-base">Bildirishnomalar</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Xabarlar va dars eslatmalari</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Push bildirishnomalarni yoqish</span>
              <input type="checkbox" defaultChecked className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer" />
            </div>
          </div>

          {/* Privacy Setting */}
          <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center space-x-3 pb-4 border-b border-slate-100 dark:border-slate-800">
              <Shield className="text-blue-600 dark:text-blue-400" size={22} />
              <div>
                <h3 className="text-sm md:text-base font-bold text-slate-900 dark:text-white">Maxfiylik</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Profil xavfsizligi va ko'rinish darajasi</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Profilni qidiruv natijalarida ko'rsatish</span>
              <input type="checkbox" defaultChecked className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer" />
            </div>
          </div>

          {/* Hisobdan chiqish Card (Asosan telefon uchun Settings sahifasida ko'rinadi) */}
          {currentUser && (
            <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-3xl border border-rose-100 dark:border-rose-950/50 shadow-sm">
              <button
                onClick={handleLogout}
                className="w-full py-3 bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/50 rounded-2xl font-semibold text-sm transition-all flex items-center justify-center gap-2 border border-rose-200 dark:border-rose-900"
              >
                <LogOut size={18} />
                Hisobdan chiqish
              </button>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}