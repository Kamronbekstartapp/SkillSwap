import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { AuthContext } from '../context/AuthContext';
import { Search, Sparkles, ArrowRight, ShieldCheck, Users } from 'lucide-react';

// Qurilma turini aniqlash uchun maxsus hook (to'g'ridan-to'g'ri shu yerga joylandi)
function useDeviceType() {
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

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return deviceType;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { currentUser, users } = useContext(AuthContext);
  const [searchTerm, setSearchTerm] = useState('');

  // Qurilma turini aniqlash hooki ishlatildi ('mobile', 'tablet' yoki 'desktop' qaytaradi)
  const device = useDeviceType();

  // O'zini o'zi qidiruv natijasida ko'rsatib qolmasligi uchun
  const realUsers = users.filter(u => currentUser ? u.email !== currentUser.email : true);

  // Qidiruv logikasi
  const filteredUsers = realUsers.filter(u => {
    const query = searchTerm.toLowerCase().trim();
    if (!query) return true;
    const nameMatch = u.username?.toLowerCase().includes(query);
    const emailMatch = u.email?.toLowerCase().includes(query);
    return nameMatch || emailMatch;
  });

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <Sidebar />
      <main className="min-w-0 flex-1 p-4 sm:p-6 md:p-10 pb-28 md:pb-10 overflow-y-auto">
        
        {/* Header section */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3.5 top-3 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Foydalanuvchi ismi bo'yicha qidiring..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent shadow-sm transition-all text-slate-900 dark:text-white" 
            />
          </div>
          
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
            {currentUser ? (
              <div 
                onClick={() => navigate('/profile')}
                className="max-w-full flex items-center space-x-3 bg-white dark:bg-slate-900 px-3 sm:px-4 py-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm cursor-pointer hover:border-blue-300 transition-all"
              >
                <div className="w-9 h-9 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl overflow-hidden flex items-center text-white justify-center font-bold text-sm shadow-md shadow-blue-600/20">
                  {currentUser.avatar ? (
                    <img src={currentUser.avatar} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    currentUser.username[0].toUpperCase()
                  )}
                </div>
                <div>
                  <span className="block font-bold text-slate-800 dark:text-white text-sm leading-tight">{currentUser.username}</span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Faol ({device})
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400 hidden sm:inline">Mehmon sifatida kuzatyapsiz</span>
                <button 
                  onClick={() => navigate('/login')} 
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-blue-600/20"
                >
                  Kirish
                </button>
                <button 
                  onClick={() => navigate('/signup')} 
                  className="px-5 py-2.5 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold transition-all shadow-sm"
                >
                  Ro'yxatdan o'tish
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Hero banner */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 md:p-10 text-white mb-10 shadow-2xl relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-1/4 -translate-y-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="relative z-10 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold mb-4 border border-blue-400/20">
              <Sparkles size={14} /> Haqiqiy Foydalanuvchilar Paneli
            </span>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3">Bilimingizni ulashing, yangisini o'rganing</h1>
            <p className="text-slate-300 text-sm md:text-base leading-relaxed mb-6">
              Platformada ro'yxatdan o'tgan real foydalanuvchilar bilan bog'laning va ko'nikmalar almashing.
            </p>
          </div>
        </div>

        {/* Real Users Section */}
        <section>
          <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <Users size={20} className="text-blue-600" />Barcha foydalanuvchilar
            </h2>
            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-3 py-1 rounded-lg border border-blue-100 dark:border-blue-900">
              Jami: {filteredUsers.length} ta
            </span>
          </div>

          {filteredUsers.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 p-12 rounded-3xl border border-slate-200 dark:border-slate-800 text-center shadow-sm">
              <Users size={48} className="mx-auto text-slate-300 dark:text-slate-700 mb-3" />
              <h3 className="text-base font-bold text-slate-800 dark:text-white mb-1">Hozircha boshqa foydalanuvchilar yo'q</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm">Boshqa brauzer yoki inkognito oynada yangi akkaunt ochib sinab ko'ring.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {filteredUsers.map((u, i) => (
                <div key={i} className="min-w-0 bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-blue-200 dark:hover:border-blue-800 transition-all duration-300 flex flex-col justify-between group">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl overflow-hidden flex items-center justify-center font-bold text-white shadow-md">
                          {u.avatar ? (
                            <img src={u.avatar} alt="Avatar" className="w-full h-full object-cover" />
                          ) : (
                            u.username?.[0]?.toUpperCase() || 'U'
                          )}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
  {u.username || u.name || u.displayName || 'Nomaʼlum'} <ShieldCheck size={14} className="text-blue-600 dark:text-blue-400" />
</h4>
                          <span className="text-xs text-blue-600 dark:text-blue-400 font-semibold capitalize">
                            {u.role === 'learner' ? "O'rganuvchi" : u.role === 'teacher' ? "O'rgatuvchi" : "Ikkalasi"}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-1 mb-6 text-xs text-slate-500 dark:text-slate-400">
                      <p>Email: <span className="text-slate-700 dark:text-slate-300 font-medium">{u.email}</span></p>
                    </div>
                  </div>
                  
                  <div>
                    <button 
                      onClick={() => {
                        if (!currentUser) navigate('/login');
                        else navigate('/chat');
                      }} 
                      className="w-full py-3 bg-slate-900 dark:bg-slate-800 hover:bg-blue-600 dark:hover:bg-blue-600 text-white rounded-2xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-md group-hover:shadow-blue-600/20"
                    >
                      <span>Bog'lanish</span>
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

      </main>
    </div>
  );
}
