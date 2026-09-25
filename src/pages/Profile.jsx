import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { AuthContext } from '../context/AuthContext';
import { Plus, Trash2, X, BookOpen, GraduationCap, Mail, Edit3, Camera } from 'lucide-react';

export default function Profile() {
  const navigate = useNavigate();
  const { currentUser, updateUser } = useContext(AuthContext);

  const [newSkill, setNewSkill] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Tahrirlash uchun state'lar (Faqat Ism va Rasm)
  const [editUsername, setEditUsername] = useState('');
  const [editAvatar, setEditAvatar] = useState('');

  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonTime, setLessonTime] = useState('');
  const [isNegotiable, setIsNegotiable] = useState(false);
  const [priceType, setPriceType] = useState('free');
  const [priceAmount, setPriceAmount] = useState('');

  if (!currentUser) {
    return (
      <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
        <Sidebar />
        <main className="flex-1 p-4 md:p-8 pb-24 md:pb-8 flex flex-col justify-center items-center">
          <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 text-center shadow-xl max-w-md w-full">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Kirish talab qilinadi</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">Profilingizni boshqarish uchun avval tizimga kiring.</p>
            <button onClick={() => navigate('/login')} className="w-full py-3 bg-blue-600 text-white rounded-2xl font-semibold shadow-lg shadow-blue-600/20">Kirish sahifasi</button>
          </div>
        </main>
      </div>
    );
  }

  // Kompyuterdan fayl tanlab rasm yuklash
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditAvatar(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Profilni saqlash (Sahifa yangilanib ketishining oldini olish uchun e.preventDefault() qo'shildi)
  const handleSaveProfile = (e) => {
    e.preventDefault();
    if (!editUsername.trim()) return;

    const updated = {
      ...currentUser,
      username: editUsername,
      avatar: editAvatar || currentUser.avatar || ''
    };
    
    updateUser(updated);
    setIsEditModalOpen(false);
  };

  const handleAddLearningSkill = (e) => {
    e.preventDefault();
    if (!newSkill.trim()) return;
    const updated = {
      ...currentUser,
      learningSkills: [...(currentUser.learningSkills || []), newSkill]
    };
    updateUser(updated);
    setNewSkill('');
  };

  const handleRemoveLearningSkill = (index) => {
    const updated = {
      ...currentUser,
      learningSkills: currentUser.learningSkills.filter((_, i) => i !== index)
    };
    updateUser(updated);
  };

  const handleRemoveLesson = (index) => {
    const updated = {
      ...currentUser,
      teachingSkills: currentUser.teachingSkills.filter((_, i) => i !== index)
    };
    updateUser(updated);
  };

  const handleSaveLesson = (e) => {
    e.preventDefault();
    if (!lessonTitle) return;

    const newLesson = {
      title: lessonTitle,
      time: isNegotiable ? 'Kelishaman' : (lessonTime || 'Kelishaman'),
      type: priceType,
      price: priceType === 'paid' ? priceAmount : ''
    };

    const updated = {
      ...currentUser,
      teachingSkills: [...(currentUser.teachingSkills || []), newLesson]
    };
    updateUser(updated);
    setIsModalOpen(false);
    setLessonTitle('');
    setLessonTime('');
    setIsNegotiable(false);
    setPriceType('free');
    setPriceAmount('');
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <Sidebar />
      <main className="min-w-0 flex-1 p-4 sm:p-6 md:p-10 pb-28 md:pb-10 relative overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 md:p-10 border border-slate-200 dark:border-slate-800 shadow-xl max-w-4xl mx-auto">
          
          {/* User Header Profile */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between text-center sm:text-left space-y-4 sm:space-y-0 mb-8 pb-8 border-b border-slate-100 dark:border-slate-800">
            <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
              
              {/* Avatar yoki Yuklangan Rasm */}
              <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-3xl overflow-hidden flex items-center text-white text-3xl font-extrabold justify-center shadow-xl shadow-blue-600/30 shrink-0">
                {currentUser.avatar ? (
                  <img src={currentUser.avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  currentUser.username[0].toUpperCase()
                )}
              </div>

              <div className="overflow-hidden">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
                  <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white truncate">{currentUser.username}</h1>
                  {currentUser.role === 'learner' && (
                    <span className="px-2.5 py-0.5 bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 text-[11px] font-bold rounded-full border border-purple-100 dark:border-purple-900">O'rganuvchi</span>
                  )}
                  {currentUser.role === 'teacher' && (
                    <span className="px-2.5 py-0.5 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold rounded-full border border-emerald-100 dark:border-emerald-900">O'rgatuvchi</span>
                  )}
                  {currentUser.role === 'both' && (
                    <span className="px-2.5 py-0.5 bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 text-[11px] font-bold rounded-full border border-blue-100 dark:border-blue-900">Ikkalasi</span>
                  )}
                </div>
                <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 flex items-center justify-center sm:justify-start gap-1.5 mb-2">
                  <Mail size={14} className="shrink-0" /> <span className="truncate">{currentUser.email}</span>
                </p>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-xl inline-block font-medium">SkillSwap Pro</p>
              </div>
            </div>

            {/* Tahrirlash Tugmasi */}
            <button 
              onClick={() => {
                setEditUsername(currentUser.username || '');
                setEditAvatar(currentUser.avatar || '');
                setIsEditModalOpen(true);
              }}
              className="w-full sm:w-auto flex items-center justify-center space-x-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 text-slate-700 dark:text-slate-200 rounded-2xl text-xs font-semibold transition-all shadow-sm"
            >
              <Edit3 size={16} />
              <span>Profilni tahrirlash</span>
            </button>
          </div>

          {/* Skills Lists */}
          <div className="space-y-6 md:space-y-8">
            
            {/* Learning Skills */}
            {(currentUser.role === 'learner' || currentUser.role === 'both') && (
              <div className="bg-slate-50/50 dark:bg-slate-950/50 p-4 md:p-6 rounded-3xl border border-slate-200/60 dark:border-slate-800">
                <h3 className="font-extrabold text-slate-900 dark:text-white text-sm md:text-base mb-3 flex items-center gap-2">
                  <GraduationCap className="text-blue-600 dark:text-blue-400 shrink-0" size={20} /> Nimani o'rganaman?
                </h3>
                <div className="flex flex-wrap gap-2 mb-4">
                  {currentUser.learningSkills?.map((skill, index) => (
                    <div key={index} className="flex items-center space-x-2 px-3 py-1.5 bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-300 rounded-xl text-xs md:text-sm font-semibold border border-slate-200 dark:border-slate-800 shadow-sm">
                      <span className="truncate max-w-[120px] sm:max-w-xs">{skill}</span>
                      <button onClick={() => handleRemoveLearningSkill(index)} className="text-rose-400 hover:text-rose-600 transition-colors shrink-0">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                  {(!currentUser.learningSkills || currentUser.learningSkills.length === 0) && (
                    <p className="text-xs text-slate-400">Hozircha o'rganiladigan fanlar qo'shilmagan.</p>
                  )}
                </div>
                <form onSubmit={handleAddLearningSkill} className="flex flex-col sm:flex-row gap-2 max-w-md">
                  <input 
                    type="text" 
                    placeholder="Yangi o'rganiladigan fan..." 
                    value={newSkill} 
                    onChange={e => setNewSkill(e.target.value)} 
                    className="flex-1 px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-sm text-slate-900 dark:text-white" 
                  />
                  <button type="submit" className="px-5 py-2.5 bg-blue-600 text-white rounded-2xl text-sm font-semibold hover:bg-blue-700 shadow-md shadow-blue-600/20 transition-all shrink-0">Qo'shish</button>
                </form>
              </div>
            )}

            {/* Teaching Skills */}
            {(currentUser.role === 'teacher' || currentUser.role === 'both') && (
              <div className="bg-slate-50/50 dark:bg-slate-950/50 p-4 md:p-6 rounded-3xl border border-slate-200/60 dark:border-slate-800">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-sm md:text-base flex items-center gap-2">
                    <BookOpen className="text-emerald-600 dark:text-emerald-400 shrink-0" size={20} /> Nimani o'rgataman?
                  </h3>
                  <button 
                    onClick={() => setIsModalOpen(true)}
                    className="w-full sm:w-auto flex items-center justify-center space-x-1.5 px-4 py-2 bg-emerald-600 text-white rounded-2xl text-sm font-semibold hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition-all"
                  >
                    <Plus size={16} />
                    <span>Dars qo'shish</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentUser.teachingSkills?.map((lesson, idx) => (
                    <div key={idx} className="p-4 md:p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col justify-between relative group shadow-sm hover:border-emerald-300 transition-all">
                      <button 
                        onClick={() => handleRemoveLesson(idx)} 
                        title="Darsni o'chirish"
                        className="absolute top-3 right-3 text-slate-400 hover:text-rose-600 p-1.5 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all"
                      >
                        <Trash2 size={16} />
                      </button>

                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white pr-8 text-sm md:text-base">{lesson.title}</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">Vaqti: {lesson.time}</p>
                      </div>
                      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs font-semibold">
                        <span className={`px-3 py-1 rounded-full ${lesson.type === 'free' ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-900' : 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-100 dark:border-amber-900'}`}>
                          {lesson.type === 'free' ? 'Bepul dars' : `Narxi: ${lesson.price}`}
                        </span>
                      </div>
                    </div>
                  ))}
                  {(!currentUser.teachingSkills || currentUser.teachingSkills.length === 0) && (
                    <p className="text-xs text-slate-400 col-span-2">Hozircha o'rgatadigan darslaringiz kiritilmagan.</p>
                  )}
                </div>
              </div>
            )}

          </div>
        </div>

        {/* 1. PROFILNI TAHRIRLASH MODALI */}
        {isEditModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-50 p-4 overflow-y-auto">
            <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 md:p-8 shadow-2xl relative border border-slate-100 dark:border-slate-800 my-auto text-slate-900 dark:text-slate-100">
              <button onClick={() => setIsEditModalOpen(false)} className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 bg-slate-100 dark:bg-slate-800 p-2 rounded-xl transition-all">
                <X size={18} />
              </button>
              
              <h3 className="text-lg md:text-xl font-extrabold text-slate-900 dark:text-white mb-5">Profilni tahrirlash</h3>
              
              <form onSubmit={handleSaveProfile} className="space-y-4">
                
                {/* Rasm Yuklash qismi */}
                <div className="flex flex-col items-center justify-center mb-4">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center relative group mb-2 shadow-inner">
                    {editAvatar ? (
                      <img src={editAvatar} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <Camera size={24} className="text-slate-400" />
                    )}
                  </div>
                  <label className="cursor-pointer px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 text-xs font-semibold rounded-xl transition-all shadow-sm">
                    Kompyuterdan rasm tanlash
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">Ism / Foydalanuvchi nomi</label>
                  <input 
                    type="text" 
                    value={editUsername}
                    onChange={e => setEditUsername(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="flex space-x-3 pt-2">
                  <button type="button" onClick={() => setIsEditModalOpen(false)} className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-2xl font-semibold text-sm hover:bg-slate-200 transition-all">Bekor qilish</button>
                  <button type="submit" className="flex-1 py-3 bg-blue-600 text-white rounded-2xl font-semibold text-sm hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all">Saqlash</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 2. DARS QO'SHISH MODALI */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-50 p-4 overflow-y-auto">
            <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 md:p-8 shadow-2xl relative border border-slate-100 dark:border-slate-800 my-auto text-slate-900 dark:text-slate-100">
              <button onClick={() => setIsModalOpen(false)} className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 bg-slate-100 dark:bg-slate-800 p-2 rounded-xl transition-all">
                <X size={18} />
              </button>
              
              <h3 className="text-lg md:text-xl font-extrabold text-slate-900 dark:text-white mb-5">Yangi dars qo'shish</h3>
              
              <form onSubmit={handleSaveLesson} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">Dars nomi / Fan</label>
                  <input 
                    type="text" 
                    placeholder="Masalan: Python yoki Ingliz tili" 
                    value={lessonTitle}
                    onChange={e => setLessonTitle(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">O'qitish vaqti</label>
                  <input 
                    type="text" 
                    placeholder="Masalan: Har kuni 18:00 da" 
                    value={lessonTime}
                    disabled={isNegotiable}
                    onChange={e => setLessonTime(e.target.value)}
                    className={`w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm text-slate-900 dark:text-white ${isNegotiable ? 'opacity-50' : ''}`}
                  />
                  <div className="mt-2.5 flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      id="neg" 
                      checked={isNegotiable}
                      onChange={e => {
                        setIsNegotiable(e.target.checked);
                        if (e.target.checked) setLessonTime('');
                      }}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="neg" className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer">Vaqti kelishiladi</label>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">Dars turi</label>
                  <select 
                    value={priceType} 
                    onChange={e => setPriceType(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm focus:outline-none text-slate-900 dark:text-white"
                  >
                    <option value="free">Tekinga (Almashinuv)</option>
                    <option value="paid">Pullik dars</option>
                  </select>
                </div>

                {priceType === 'paid' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">Narxi (miqdori)</label>
                    <input 
                      type="text" 
                      placeholder="Masalan: 50,000 so'm / soat" 
                      value={priceAmount}
                      onChange={e => setPriceAmount(e.target.value)}
                      required
                      className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm text-slate-900 dark:text-white"
                    />
                  </div>
                )}

                <div className="flex space-x-3 pt-2">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-2xl font-semibold text-sm hover:bg-slate-200 transition-all">Bekor qilish</button>
                  <button type="submit" className="flex-1 py-3 bg-blue-600 text-white rounded-2xl font-semibold text-sm hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all">Saqlash</button>
                </div>
              </form>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}