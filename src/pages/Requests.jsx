import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { AuthContext } from '../context/AuthContext';
import { PlusCircle, ArrowRightLeft, User, Sparkles, AlertCircle, X, Trash2, Edit3 } from 'lucide-react';

export default function Requests() {
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();

  // Dastlabki e'lonlar ro'yxati (namuna uchun)
  const [requests, setRequests] = useState([
    
  ]);

  // Modal oynalar uchun statelar
  const [showModal, setShowModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [deleteModalId, setDeleteModalId] = useState(null); // O'chirishni tasdiqlash uchun ID
  
  // Tahrirlash uchun statelar
  const [editingId, setEditingId] = useState(null);

  const [offer, setOffer] = useState('');
  const [want, setWant] = useState('');
  const [description, setDescription] = useState('');

  // E'lon qo'shish tugmasini bosganda tekshirish
  const handleOpenModal = () => {
    if (!currentUser) {
      setShowAuthModal(true);
      return;
    }
    setEditingId(null);
    setOffer('');
    setWant('');
    setDescription('');
    setShowModal(true);
  };

  // E'lon qo'shish yoki Tahrirlashni saqlash
  const handleSaveRequest = (e) => {
    e.preventDefault();
    if (!offer || !want) return;

    if (editingId) {
      setRequests(requests.map(req => 
        req.id === editingId 
          ? { ...req, offer, want, description } 
          : req
      ));
    } else {
      const newReq = {
        id: Date.now(),
        author: currentUser?.username || currentUser?.name || "Foydalanuvchi",
        offer,
        want,
        description
      };
      setRequests([newReq, ...requests]);
    }

    setOffer('');
    setWant('');
    setDescription('');
    setEditingId(null);
    setShowModal(false);
  };

  // Tahrirlash oynasini ochish
  const handleEditClick = (item) => {
    setEditingId(item.id);
    setOffer(item.offer);
    setWant(item.want);
    setDescription(item.description);
    setShowModal(true);
  };

  // O'chirish modalini ochish
  const handleDeleteClick = (id) => {
    setDeleteModalId(id);
  };

  // Haqiqatdan o'chirishni tasdiqlash
  const confirmDelete = () => {
    if (deleteModalId) {
      setRequests(requests.filter(req => req.id !== deleteModalId));
      setDeleteModalId(null);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <Sidebar />
      <main className="min-w-0 flex-1 p-4 sm:p-6 md:p-10 pb-28 md:pb-10 overflow-y-auto">
        <div className="max-w-4xl mx-auto space-y-6">
          
          {/* Sarlavha va e'lon qo'shish tugmasi */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="text-blue-600" size={24} /> E'lonlar doskasi (Skill Request)
              </h1>
              <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">
                O'zingiz o'rgatmoqchi bo'lgan va o'rganmoqchi bo'lgan ko'nikmangizni yozib qoldiring.
              </p>
            </div>
            <button
              onClick={handleOpenModal}
              className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-semibold text-xs transition-all shadow-md shadow-blue-600/20 flex items-center gap-2 cursor-pointer"
            >
              <PlusCircle size={18} /> E'lon qo'shish
            </button>
          </div>

          {/* E'lonlar ro'yxati */}
          <div className="grid grid-cols-1 gap-4">
            {requests.map((item) => {
              const isOwner = currentUser && (currentUser.username === item.author || currentUser.name === item.author);

              return (
                <div key={item.id} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 hover:border-blue-500/50 transition-all">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                    <span className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                      <User size={16} className="text-blue-600" /> {item.author}
                    </span>
                    
                    <div className="flex items-center gap-2">
                      {isOwner && (
                        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                          <button
                            onClick={() => handleEditClick(item)}
                            title="Tahrirlash"
                            className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all cursor-pointer"
                          >
                            <Edit3 size={15} />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(item.id)}
                            title="O'chirish"
                            className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-rose-500 transition-all cursor-pointer"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      )}

                      <span className="px-3 py-1 bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 text-xs font-semibold rounded-full border border-blue-200 dark:border-blue-900">
                        Barter so'rovi
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/80">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Men o'rgataman:</span>
                      <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{item.offer}</p>
                    </div>
                    <div className="hidden md:flex justify-center">
                      <ArrowRightLeft size={20} className="text-slate-400" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Men o'rganishni xohlayman:</span>
                      <p className="text-sm font-bold text-blue-600 dark:text-blue-400">{item.want}</p>
                    </div>
                  </div>

                  <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300">
                    {item.description}
                  </p>

                  <div className="flex justify-end pt-2">
                    <button 
                      onClick={() => {
                        if (!currentUser) {
                          setShowAuthModal(true);
                        } else {
                          navigate('/chat');
                        }
                      }}
                      className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 hover:text-white text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                    >
                      Bog'lanish / Chatga yozish
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 1. YANGI E'LON QO'SHISH / TAHRIRLASH MODALI */}
          {showModal && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl w-full max-w-lg border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {editingId ? "E'lonni tahrirlash" : "Yangi e'lon yaratish"}
                  </h3>
                  <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                    <X size={20} />
                  </button>
                </div>
                
                <form onSubmit={handleSaveRequest} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Nima o'rgata olasiz?</label>
                    <input 
                      type="text"
                      required
                      placeholder="Masalan: Ingliz tili / Python"
                      value={offer}
                      onChange={(e) => setOffer(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Nimani o'rganishni xohlaysiz?</label>
                    <input 
                      type="text"
                      required
                      placeholder="Masalan: UI/UX Dizayn / Grafik dizayn"
                      value={want}
                      onChange={(e) => setWant(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Qo'shimcha izoh</label>
                    <textarea 
                      rows="3"
                      placeholder="O'zingiz haqingizda qisqacha..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
                    >
                      Bekor qilish
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-600/20 cursor-pointer"
                    >
                      {editingId ? "Saqlash" : "E'lonni e'lon qilish"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* 2. RO'YXATDAN O'TMAGANLAR UCHUN O'RTADAGI DIV (MODAL) */}
          {showAuthModal && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl w-full max-w-sm border border-slate-200 dark:border-slate-800 shadow-2xl text-center space-y-4">
                <div className="w-12 h-12 bg-amber-500/10 text-amber-500 rounded-2xl flex items-center justify-center mx-auto">
                  <AlertCircle size={24} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Tizimga kirish talab etiladi</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    E'lon joylash yoki boshqalar bilan bog'lanish uchun avval ro'yxatdan o'ting yoki profilingizga kiring.
                  </p>
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => setShowAuthModal(false)}
                    className="flex-1 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold cursor-pointer hover:bg-slate-200 transition-all"
                  >
                    Yopish
                  </button>
                  <button
                    onClick={() => navigate('/login')}
                    className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-600/20 cursor-pointer transition-all"
                  >
                    Kirish
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 3. O'CHIRISHNI TASDIQLASH UCHUN O'RTADAGI DIV (MODAL) */}
          {deleteModalId && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl w-full max-w-sm border border-slate-200 dark:border-slate-800 shadow-2xl text-center space-y-4">
                <div className="w-12 h-12 bg-rose-500/10 text-rose-500 rounded-2xl flex items-center justify-center mx-auto">
                  <Trash2 size={24} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">E'lonni o'chirish</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Rostdan ham ushbu e'lonni o'chirib yubormoqchimisiz? Bu amalni ortga qaytarib bo'lmaydi.
                  </p>
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => setDeleteModalId(null)}
                    className="flex-1 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold cursor-pointer hover:bg-slate-200 transition-all"
                  >
                    Bekor qilish
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="flex-1 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-rose-600/20 cursor-pointer transition-all"
                  >
                    O'chirish
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}