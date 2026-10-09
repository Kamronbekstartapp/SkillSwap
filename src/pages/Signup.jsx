import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { AlertCircle, Eye, EyeOff, ShieldCheck, Mail, Lock, User } from 'lucide-react';
import emailjs from '@emailjs/browser';

export default function Signup() {
  const navigate = useNavigate();
  const { signup, registerWithGoogle } = useContext(AuthContext);

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [googleUid, setGoogleUid] = useState('');

  // Email tasdiqlash va yuklanish holatlari
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');
  const [enteredCode, setEnteredCode] = useState('');
  const [verificationError, setVerificationError] = useState('');
  const [pendingUserData, setPendingUserData] = useState(null);
  const [loading, setLoading] = useState(false);

  // 1-bosqich: Forma to'ldirilganda 6 xonali kodni yaratish va emailga yuborish
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username || !email || !password) {
      setError("Barcha maydonlarni to'ldiring!");
      return;
    }

    setLoading(true);

    // 6 xonali random kod generatsiya qilish
    const randomCode = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(randomCode);

    const newUser = {
      uid: googleUid || undefined,
      username,
      email,
      password,
      role: 'learner',
      avatar: ''
    };

    setPendingUserData(newUser);

    // EmailJS ma'lumotlari (O'zingizning Service ID, Template ID va Public Key'ingizni shu yerga yozing)
     const serviceID = 'service_b6fcxok';     // EmailJS'dan olgan Service ID'ni yozing
    const templateID = 'template_07m0mzs';   // EmailJS'dan olgan Template ID'ни yozинг
    const publicKey = 'n4AiAryqnIlcT1hRk';     

    const templateParams = {
      to_email: email,       
      to_name: username,     
      pass_code: randomCode, 
    };

    try {
      await emailjs.send(serviceID, templateID, templateParams, publicKey);
      setLoading(false);
      setShowVerificationModal(true); // Kod muvaffaqiyatli ketgach modalni ochamiz
    } catch (err) {
      console.error('Email yuborishda xatolik:', err);
      setLoading(false);
      setError("Emailga xat yuborib bo'lmadi. Email manzilini tekshiring.");
    }
  };

  // 2-bosqich: Kiritilgan kodni tekshirish va ro'yxatdan o'tishni yakunlash
  const handleVerifyCode = async () => {
    setVerificationError('');

    if (enteredCode.trim() !== generatedCode) {
      setVerificationError("Noto'g'ri kod! Iltimos, emailga kelgan kodni qaytadan tekshirib kiriting.");
      return;
    }

    // Kod to'g'ri bo'lsa, Firebase'ga ma'lumotni yozish
    const result = await signup(pendingUserData);

    if (result.success) {
      setShowVerificationModal(false);
      navigate('/');
    } else {
      setVerificationError(result.message || "Ro'yxatdan o'tishda xatolik yuz berdi.");
    }
  };

  const handleGoogleRegister = async () => {
    setError('');
    const result = await registerWithGoogle();

    if (!result.success && result.exists) {
      setError(result.message);
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } else if (result.success) {
      setUsername(result.user.username);
      setEmail(result.user.email);
      setGoogleUid(result.user.uid);
    } else {
      setError(result.message || 'Google orqali ro\'yxatdan o\'tishda xatolik yuz berdi!');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 relative">
      <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl max-w-md w-full">
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-2">Ro'yxatdan o'tish</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Yangi hisob yaratish</p>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 text-xs font-semibold rounded-2xl flex items-center gap-2">
            <AlertCircle size={16} className="flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button 
          type="button"
          onClick={handleGoogleRegister}
          className="w-full py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-900 dark:text-white rounded-2xl font-semibold text-sm shadow-sm transition-all flex items-center justify-center gap-3 mb-4 cursor-pointer"
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
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><User size={16} /></span>
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="Ismingiz"
                className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">Email</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><Mail size={16} /></span>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="example@mail.com"
                className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">Parol</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><Lock size={16} /></span>
              <input 
                type={showPassword ? "text" : "password"} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="********"
                className="w-full pl-11 pr-12 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900 dark:text-white"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-semibold text-sm shadow-lg shadow-blue-600/20 transition-all mt-2 cursor-pointer flex items-center justify-center gap-2"
          >
            {loading ? "Kod yuborilmoqda..." : "Ro'yxatdan o'tishni tasdiqlash"}
          </button>
        </form>

        <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-6">
          Profilingiz bormi?{' '}
          <span onClick={() => navigate('/login')} className="text-blue-600 font-bold cursor-pointer hover:underline">
            Kirish
          </span>
        </p>
      </div>

      {/* EMAIL TASDIQLASH MODAL OYNASI */}
      {showVerificationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6 animate-in fade-in zoom-in duration-200 text-center">
            
            <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 mx-auto shadow-inner">
              <ShieldCheck size={30} />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">Emailni Tasdiqlash</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                <span className="font-semibold text-slate-800 dark:text-slate-200">{email}</span> manziliga 6 xonali tasdiqlash kodi yuborildi. Iltimos, pochtangizni tekshiring va kodni kiriting.
              </p>
            </div>

            {verificationError && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 text-xs font-semibold rounded-xl flex items-center justify-center gap-2">
                <AlertCircle size={16} className="flex-shrink-0" />
                <span>{verificationError}</span>
              </div>
            )}

            <div>
              <input 
                type="text" 
                maxLength={6}
                value={enteredCode}
                onChange={(e) => setEnteredCode(e.target.value)}
                placeholder="000000"
                className="w-full px-4 py-3 text-center tracking-widest text-xl font-bold rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowVerificationModal(false)}
                className="flex-1 py-3 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-2xl transition-all cursor-pointer"
              >
                Bekor qilish
              </button>
              <button
                onClick={handleVerifyCode}
                className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-2xl shadow-lg shadow-blue-600/25 transition-all cursor-pointer"
              >
                Tasdiqlash
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}