import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { login, loginWithGoogle } = useContext(AuthContext);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault(); // <-- Sahifa yangilanishining oldini oladi
    setError('');

    const success = login(email, password);
    if (success) {
      navigate('/');
    } else {
      setError('Email yoki parol noto\'g\'ri!');
    }
  };

  // Google orqali kirish funksiyasi (Tekshiruvi bilan)
  const handleGoogleLogin = async () => {
    setError('');
    const result = await loginWithGoogle();
    
    if (result.success) {
      navigate('/');
    } else {
      // Agar akkaunt bazada mavjud bo'lmasa, kontekstdan kelgan xabarni chiqaramiz
      setError(result.message || 'Google orqali kirishda xatolik yuz berdi!');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
      <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl max-w-md w-full">
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-2">Tizimga kirish</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Ma'lumotlaringizni kiriting</p>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold rounded-xl">
            {error}
          </div>
        )}

        {/* Google orqali kirish tugmasi */}
        <button 
          type="button"
          onClick={handleGoogleLogin}
          className="w-full py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-900 dark:text-white rounded-2xl font-semibold text-sm shadow-sm transition-all flex items-center justify-center gap-3 mb-4"
        >
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
          Google bilan kirish
        </button>

        <div className="flex items-center my-4">
          <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
          <span className="px-3 text-xs text-slate-400 uppercase">yoki</span>
          <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="example@mail.com"
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Parol</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="********"
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 dark:text-white"
            />
          </div>

          <button 
            type="submit" 
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-semibold text-sm shadow-lg shadow-blue-600/20 transition-all mt-2"
          >
            Kirish
          </button>
        </form>

        <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-6">
          Profilingiz yo'qmi?{' '}
          <span onClick={() => navigate('/signup')} className="text-blue-600 font-bold cursor-pointer hover:underline">
            Ro'yxatdan o'tish
          </span>
        </p>
      </div>
    </div>
  );
}