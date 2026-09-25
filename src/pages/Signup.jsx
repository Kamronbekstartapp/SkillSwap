import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { AlertCircle } from 'lucide-react';

export default function Signup() {
  const navigate = useNavigate();
  const { signup, registerWithGoogle } = useContext(AuthContext);

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  // Google'dan kelgan unikal ID ni saqlab turish uchun (agar bo'lsa)
  const [googleUid, setGoogleUid] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const newUser = {
      uid: googleUid || undefined, // Agar Google'dan kelgan bo'lsa o'sha uid'ni ishlatamiz
      username,
      email,
      password,
      role: 'learner',
      avatar: ''
    };

    const result = await signup(newUser);

    if (result.success) {
      navigate('/');
    } else {
      setError(result.message);
    }
  };

  // Google orqali ro'yxatdan o'tish funksiyasi
  const handleGoogleRegister = async () => {
    setError('');
    const result = await registerWithGoogle();
    
    if (!result.success && result.exists) {
      // Agar akkaunt allaqachon mavjud bo'lsa
      setError(result.message);
      setTimeout(() => {
        navigate('/login'); // 2 soniyadan so'ng login sahifasiga o'tkazadi
      }, 1500);
    } else if (result.success) {
      // Agar akkaunt yangi bo'lsa, Google'dan olingan ma'lumotlarni inputlarga to'ldiramiz
      setUsername(result.user.username);
      setEmail(result.user.email);
      setGoogleUid(result.user.uid);
      // Foydalanuvchiga parolni kiritish qolganini bildiramiz
    } else {
      setError(result.message || 'Google orqali ro\'yxatdan o\'tishda xatolik yuz berdi!');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
      <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl max-w-md w-full">
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-2">Ro'yxatdan o'tish</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Yangi hisob yaratish</p>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 text-xs font-semibold rounded-2xl flex items-center gap-2">
            <AlertCircle size={16} className="flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Google orqali ro'yxatdan o'tish tugmasi */}
        <button 
          type="button"
          onClick={handleGoogleRegister}
          className="w-full py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-900 dark:text-white rounded-2xl font-semibold text-sm shadow-sm transition-all flex items-center justify-center gap-3 mb-4"
        >
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
          Google bilan ro'yxatdan o'tish
        </button>

        <div className="flex items-center my-4">
          <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
          <span className="px-3 text-xs text-slate-400 uppercase">yoki</span>
          <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">Ism (Username)</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="Ismingiz"
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="example@mail.com"
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">Parol</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="********"
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900 dark:text-white"
            />
          </div>

          <button 
            type="submit" 
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-semibold text-sm shadow-lg shadow-blue-600/20 transition-all mt-2"
          >
            Ro'yxatdan o'tishni yakunlash
          </button>
        </form>

        <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-6">
          Profilingiz bormi?{' '}
          <span onClick={() => navigate('/login')} className="text-blue-600 font-bold cursor-pointer hover:underline">
            Kirish
          </span>
        </p>
      </div>
    </div>
  );
}