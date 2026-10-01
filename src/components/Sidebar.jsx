import React, { useContext, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, UserCircle, MessageSquareText, Settings as SettingsIcon, LogOut, Sun, Moon, Menu, ChevronLeft } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, currentUser } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);

  // Kompyuter uchun sidebar yig'ilib-ochilishi uchun state
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    { id: '/', label: 'Bosh sahifa', icon: LayoutDashboard },
    { id: '/profile', label: 'Profil', icon: UserCircle },
    { id: '/chat', label: 'Chat', icon: MessageSquareText },
    { id: '/settings', label: 'Sozlamalar', icon: SettingsIcon },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      {/* 1. KOMPYUTER UCHUN (Chap tomondagi Sidebar - Yig'ilib ochiladigan) */}
      <aside className={`bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hidden md:flex flex-shrink-0 flex-col justify-between h-screen sticky top-0 border-r border-slate-200 dark:border-slate-800 shadow-xl z-30 transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-72'}`}>
        <div>
          {/* Logo va Ochish/Yopish tugmasi */}
          <div className="p-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800/60">
            {!isCollapsed && (
              <div className="flex items-center space-x-3 cursor-pointer overflow-hidden" onClick={() => navigate('/')}>
                <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-xl flex items-center justify-center text-white font-extrabold text-lg shadow-lg shadow-blue-500/20 flex-shrink-0">
                  S
                </div>
                <div>
                  <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">SkillSwap</span>
                  <span className="block text-[10px] text-blue-500 dark:text-blue-400 font-semibold uppercase tracking-wider">Pro Platform</span>
                </div>
              </div>
            )}
            
            <button 
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all mr-[-10px]"
              title={isCollapsed ? "Menyuni ochish" : "Menyuni yopish"}
            >
              {isCollapsed ? <Menu size={20} /> : <Menu size={20} />}
            </button>
          </div>

          {/* Menu Items */}
          <nav className="px-3 py-3 space-y-1.5">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => navigate(item.id)}
                  title={isCollapsed ? item.label : ''}
                  className={`w-full flex items-center space-x-3 px-3.5 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                    isActive 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25 font-semibold' 
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Icon size={20} className={`flex-shrink-0 transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer / Theme Toggle & User & Logout */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-950/30 space-y-3">
          
          {/* Theme Toggle Button */}
          <button 
            onClick={toggleTheme}
            title="Rejimni o'zgartirish"
            className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} px-3 py-2.5 rounded-xl bg-slate-200/70 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all text-xs font-semibold`}
          >
            <span className="flex items-center space-x-2">
              {theme === 'dark' ? <Moon size={16} className="text-blue-400 flex-shrink-0" /> : <Sun size={16} className="text-amber-500 flex-shrink-0" />}
              {!isCollapsed && <span>{theme === 'dark' ? 'Tungi rejim' : 'Kunduzgi rejim'}</span>}
            </span>
            {!isCollapsed && (
              <div className={`w-8 h-4 flex items-center rounded-full p-1 transition-colors duration-300 ${theme === 'dark' ? 'bg-blue-600' : 'bg-slate-300'}`}>
                <div className={`bg-white w-3 h-3 rounded-full shadow-md transform transition-transform duration-300 ${theme === 'dark' ? 'translate-x-4' : 'translate-x-0'}`} />
              </div>
            )}
          </button>

          {/* Foydalanuvchi ma'lumotlari */}
          {currentUser && (
            <>
              {!isCollapsed ? (
                <div className="px-3 py-2 rounded-xl bg-slate-200/50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-600 dark:text-blue-400 font-bold flex items-center justify-center text-sm flex-shrink-0">
                    {currentUser.username ? currentUser.username[0].toUpperCase() : 'U'}
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{currentUser.username}</p>
                    <p className="text-[10px] text-slate-500 truncate">{currentUser.email}</p>
                  </div>
                </div>
              ) : (
                <div className="flex justify-center" title={currentUser.username}>
                  <div className="w-9 h-9 rounded-xl bg-blue-600/20 text-blue-600 dark:text-blue-400 font-bold flex items-center justify-center text-sm">
                    {currentUser.username ? currentUser.username[0].toUpperCase() : 'U'}
                  </div>
                </div>
              )}

              <button 
                onClick={handleLogout} 
                title="Chiqish"
                className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3 px-3'} py-2 text-rose-500 dark:text-rose-400 hover:bg-rose-500/10 rounded-xl text-sm font-medium transition-all duration-200`}
              >
                <LogOut size={18} className="flex-shrink-0" />
                {!isCollapsed && <span>Chiqish</span>}
              </button>
            </>
          )}
        </div>
      </aside>


      {/* 2. TELEFON UCHUN (O'zgarishsiz qoldirildi - Pastdagi Bottom Navigation Bar) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 px-1 py-2 flex items-center z-50 shadow-2xl transition-colors duration-300">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.id;
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.id)}
              className={`flex min-w-0 flex-1 flex-col items-center justify-center py-1 px-1 sm:px-3 rounded-2xl transition-all duration-200 ${
                isActive 
                  ? 'text-blue-600 dark:text-blue-400 scale-105 font-bold' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Icon size={18} className={isActive ? 'stroke-[2.5]' : 'stroke-[1.7]' } />
              <span className="text-[9px] sm:text-[10px] mt-0.5 tracking-tight truncate max-w-full">{item.label}</span>
            </button>
          );
        })}

        <button
          onClick={toggleTheme}
          className="flex min-w-0 flex-1 flex-col items-center justify-center py-1 px-1 sm:px-3 rounded-2xl text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-all"
        >
          {theme === 'dark' ? <Moon size={18} className="text-blue-400 stroke-[2]" /> : <Sun size={18} className="text-amber-500 stroke-[2]" />}
          <span className="text-[9px] sm:text-[10px] mt-0.5 tracking-tight">Rejim</span>
        </button>
      </div>
    </>
  );
}