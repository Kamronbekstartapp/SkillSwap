import React, { useContext, useState, useEffect, useRef } from 'react';
import Sidebar from '../components/Sidebar';
import { AuthContext } from '../context/AuthContext';
import { Search, Send, ArrowLeft, MessageSquare, CheckCheck, User, Image as ImageIcon, Mic, Square, Phone, Video, PhoneOff, Camera, CameraOff, Edit2, Trash2 } from 'lucide-react';
import { db } from '../firebase';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, doc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';

export default function Chat() {
  const { currentUser, users } = useContext(AuthContext);
  
  const [selectedUser, setSelectedUser] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [messages, setMessages] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Xabarni tahrirlash uchun state'lar
  const [editingMessageId, setEditingMessageId] = useState(null);

  // Context Menu uchun state'lar
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, message: null });
  const pressTimerRef = useRef(null);

  // Ovozli xabar uchun
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState('');
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // Qo'ng'iroq uchun state'lar
  const [callActive, setCallActive] = useState(false);
  const [callType, setCallType] = useState(null);
  const [incomingCall, setIncomingCall] = useState(null);
  const [isCamOff, setIsCamOff] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);

  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  const currentChatId = selectedUser && currentUser 
    ? [currentUser.email, selectedUser.email].sort().join('_') 
    : null;

  useEffect(() => {
    if (!currentChatId) {
      setMessages([]);
      return;
    }

    const q = query(
      collection(db, "chats", currentChatId, "messages"),
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [currentChatId]);

  // Qo'ng'iroqlarni tinglash va ICE candidate'larni ulash
  useEffect(() => {
    if (!currentUser?.email) return;

    const callDocRef = doc(db, "calls", currentUser.email);
    const unsubscribe = onSnapshot(callDocRef, async (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        
        if (data.status === 'calling' && !callActive && data.offer && !incomingCall) {
          setIncomingCall(data);
        } else if (data.status === 'connected' && peerConnectionRef.current && data.answer && !peerConnectionRef.current.remoteDescription) {
          const remoteDesc = new RTCSessionDescription(data.answer);
          await peerConnectionRef.current.setRemoteDescription(remoteDesc);
        } else if (data.candidate && peerConnectionRef.current) {
          try {
            await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(data.candidate));
          } catch (e) {}
        } else if (data.status === 'ended') {
          hangUpCall(false);
        }
      }
    });

    return () => unsubscribe();
  }, [currentUser, callActive, incomingCall]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const handleClickOutside = () => {
      if (contextMenu.visible) {
        setContextMenu({ visible: false, x: 0, y: 0, message: null });
      }
    };
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, [contextMenu.visible]);

  const servers = {
    iceServers: [
      { urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'] }
    ]
  };

  const createPeerConnection = (targetEmail) => {
    const pc = new RTCPeerConnection(servers);
    peerConnectionRef.current = pc;

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        updateDoc(doc(db, "calls", targetEmail), {
          candidate: event.candidate.toJSON()
        }).catch(() => {
          setDoc(doc(db, "calls", targetEmail), { candidate: event.candidate.toJSON() }, { merge: true });
        });
      }
    };

    pc.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    return pc;
  };

  const startCall = async (type) => {
    if (!selectedUser) return;
    setCallType(type);
    setCallActive(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: type === 'video',
        audio: true
      });
      localStreamRef.current = stream;
      if (localVideoRef.current && type === 'video') {
        localVideoRef.current.srcObject = stream;
      }

      const pc = createPeerConnection(selectedUser.email);
      stream.getTracks().forEach(track => pc.addTrack(track, stream));

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      await setDoc(doc(db, "calls", selectedUser.email), {
        caller: currentUser.email,
        callerName: currentUser.username || currentUser.email,
        type: type,
        offer: { type: offer.type, sdp: offer.sdp },
        status: 'calling'
      });
    } catch (error) {
      alert("Kamera yoki mikrofon ruxsati berilmadi!");
      hangUpCall();
    }
  };

  const answerCall = async () => {
    if (!incomingCall) return;
    setCallType(incomingCall.type);
    setCallActive(true);
    const callerEmail = incomingCall.caller;
    setIncomingCall(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: incomingCall.type === 'video',
        audio: true
      });
      localStreamRef.current = stream;
      if (localVideoRef.current && incomingCall.type === 'video') {
        localVideoRef.current.srcObject = stream;
      }

      const pc = createPeerConnection(callerEmail);
      stream.getTracks().forEach(track => pc.addTrack(track, stream));

      const remoteDesc = new RTCSessionDescription(incomingCall.offer);
      await pc.setRemoteDescription(remoteDesc);

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      await updateDoc(doc(db, "calls", callerEmail), {
        answer: { type: answer.type, sdp: answer.sdp },
        status: 'connected'
      });
    } catch (error) {
      hangUpCall();
    }
  };

  const hangUpCall = async (updateDb = true) => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }
    setCallActive(false);
    setCallType(null);
    setIncomingCall(null);

    if (updateDb && currentUser?.email && selectedUser?.email) {
      try {
        await setDoc(doc(db, "calls", selectedUser.email), { status: 'ended' });
        await deleteDoc(doc(db, "calls", currentUser.email));
      } catch (e) {}
    }
  };

  const toggleCamera = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsCamOff(!videoTrack.enabled);
      }
    }
  };

  const toggleMic = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedUser || !currentUser) return;

    if (editingMessageId) {
      try {
        const msgRef = doc(db, "chats", currentChatId, "messages", editingMessageId);
        await updateDoc(msgRef, { text: messageText, edited: true });
        setEditingMessageId(null);
        setMessageText('');
      } catch (error) {}
      return;
    }

    try {
      await addDoc(collection(db, "chats", currentChatId, "messages"), {
        sender: currentUser.email,
        text: messageText,
        type: 'text',
        createdAt: serverTimestamp(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
      setMessageText('');
    } catch (error) {}
  };

  const handleDeleteMessage = async (msgId) => {
    try {
      await deleteDoc(doc(db, "chats", currentChatId, "messages", msgId));
      setContextMenu({ visible: false, x: 0, y: 0, message: null });
    } catch (error) {}
  };

  const handleStartEdit = (msg) => {
    setEditingMessageId(msg.id);
    setMessageText(msg.text);
    setContextMenu({ visible: false, x: 0, y: 0, message: null });
  };

  const handleMessageContextMenu = (e, msg) => {
    e.preventDefault(); 
    e.stopPropagation(); 
    if (msg.sender !== currentUser?.email) return;
    
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      message: msg
    });
  };

  const handleTouchStart = (e, msg) => {
    if (msg.sender !== currentUser?.email) return;
    const touch = e.touches[0];
    
    pressTimerRef.current = setTimeout(() => {
      setContextMenu({
        visible: true,
        x: touch.clientX,
        y: touch.clientY,
        message: msg
      });
    }, 600);
  };

  const handleTouchEnd = () => {
    if (pressTimerRef.current) {
      clearTimeout(pressTimerRef.current);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const fileDataUrl = reader.result;
      const isVideo = file.type.startsWith('video');

      try {
        await addDoc(collection(db, "chats", currentChatId, "messages"), {
          sender: currentUser.email,
          text: isVideo ? "📹 Video xabar" : "📷 Rasm",
          mediaUrl: fileDataUrl,
          type: isVideo ? 'video' : 'image',
          createdAt: serverTimestamp(),
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
      } catch (error) {}
    };
    reader.readAsDataURL(file);
  };

  const startRecording = async () => {
    audioChunksRef.current = [];
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(audioBlob);
        setAudioUrl(URL.createObjectURL(audioBlob));
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      alert("Mikrofonga ruxsat berilmadi!");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const sendAudioMessage = async () => {
    if (!audioBlob) return;
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        await addDoc(collection(db, "chats", currentChatId, "messages"), {
          sender: currentUser.email,
          text: "🎤 Ovozli xabar",
          mediaUrl: reader.result,
          type: 'audio',
          createdAt: serverTimestamp(),
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
        setAudioBlob(null);
        setAudioUrl('');
      } catch (error) {}
    };
    reader.readAsDataURL(audioBlob);
  };

  const otherUsers = users.filter(u => u.email !== currentUser?.email && 
    (u.username?.toLowerCase().includes(searchQuery.toLowerCase()) || u.email?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div 
      onContextMenu={(e) => e.preventDefault()}
      className="fixed inset-0 w-full min-w-0 h-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex overflow-hidden select-none"
    >
      <Sidebar />
      
      {contextMenu.visible && (
        <div 
          style={{ top: `${Math.min(contextMenu.y, window.innerHeight - 120)}px`, left: `${Math.min(contextMenu.x, window.innerWidth - 160)}px` }}
          className="fixed z-50 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl py-2 w-36 overflow-hidden animate-in fade-in zoom-in duration-150"
        >
          <button 
            onClick={() => handleStartEdit(contextMenu.message)}
            className="w-full px-4 py-2.5 text-left text-xs font-medium flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
          >
            <Edit2 size={14} className="text-blue-500" /> Tahrirlash
          </button>
          <button 
            onClick={() => handleDeleteMessage(contextMenu.message.id)}
            className="w-full px-4 py-2.5 text-left text-xs font-medium flex items-center gap-2 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-600"
          >
            <Trash2 size={14} /> O'chirish
          </button>
        </div>
      )}

      {incomingCall && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-sm w-full text-center">
            <div className="w-16 h-16 bg-blue-600/10 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
              {incomingCall.type === 'video' ? <Video size={32} /> : <Phone size={32} />}
            </div>
            <h3 className="font-bold text-lg mb-1">{incomingCall.callerName}</h3>
            <p className="text-xs text-slate-400 mb-6">Sizga {incomingCall.type === 'video' ? 'video' : 'ovozli'} qo'ng'iroq qilmoqda...</p>
            <div className="flex items-center gap-3">
              <button onClick={() => hangUpCall()} className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-semibold text-xs">Rad etish</button>
              <button onClick={answerCall} className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-semibold text-xs">Javob berish</button>
            </div>
          </div>
        </div>
      )}

      {callActive && (
        <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col items-center justify-between p-4 md:p-8">
          <div className="text-white text-center">
            <h3 className="font-bold text-lg">{selectedUser?.username || selectedUser?.email}</h3>
            <span className="text-xs text-emerald-400 font-medium">Qo'ng'iroq davom etmoqda...</span>
          </div>

          <div className="w-full min-w-0 max-w-4xl flex-1 flex items-center justify-center relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 my-4">
            {callType === 'video' ? (
              <>
                <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
                <div className="absolute bottom-4 right-4 w-32 md:w-48 h-24 md:h-36 bg-slate-950 rounded-2xl overflow-hidden border-2 border-slate-700 shadow-lg">
                  <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center text-slate-400">
                <div className="w-24 h-24 bg-blue-600/20 text-blue-500 rounded-full flex items-center justify-center mb-3 animate-pulse">
                  <Mic size={40} />
                </div>
                <p className="text-sm font-medium text-white">Ovozli qo'ng'iroq...</p>
                <audio ref={remoteVideoRef} autoPlay />
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            {callType === 'video' && (
              <button onClick={toggleCamera} className={`p-4 rounded-2xl text-white ${isCamOff ? 'bg-rose-600' : 'bg-slate-800'}`}>
                {isCamOff ? <CameraOff size={22} /> : <Camera size={22} />}
              </button>
            )}
            <button onClick={toggleMic} className={`p-4 rounded-2xl text-white ${isMuted ? 'bg-rose-600' : 'bg-slate-800'}`}>
              <Mic size={22} />
            </button>
            <button onClick={() => hangUpCall()} className="p-4 bg-rose-600 text-white rounded-2xl shadow-lg shadow-rose-600/30">
              <PhoneOff size={22} />
            </button>
          </div>
        </div>
      )}

      <main className="min-w-0 flex-1 flex w-full h-full relative overflow-hidden">
        {/* CHATLAR RO'YXATI */}
        <div className={`w-full md:w-80 lg:w-96 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col h-full absolute md:relative z-20 ${selectedUser ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex-shrink-0">
            <h2 className="text-xl font-extrabold mb-3">Chatlar</h2>
            <div className="relative">
              <Search className="absolute left-3.5 top-3 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Qidirish..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/50">
            {otherUsers.map((user, index) => (
              <div key={index} onClick={() => setSelectedUser(user)} className="flex items-center gap-3 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer">
                <div className="w-12 h-12 rounded-2xl bg-blue-600/10 text-blue-600 flex items-center justify-center font-bold text-base flex-shrink-0">
                  {user.avatar ? <img src={user.avatar} alt="" className="w-full h-full rounded-2xl object-cover" /> : <User size={22} />}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-sm truncate">{user.username || user.email}</h4>
                  <p className="text-xs text-slate-400 truncate">Suhbatni boshlash...</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CHAT OYNASI */}
        <div className={`min-w-0 flex-1 flex flex-col h-full bg-slate-50 dark:bg-slate-950 absolute md:relative z-30 inset-0 ${!selectedUser ? 'hidden md:flex' : 'flex'}`}>
          {selectedUser ? (
            <div className="flex flex-col h-full w-full overflow-hidden">
              {/* Chat Header */}
              <div className="px-3 sm:px-4 py-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 shadow-sm flex-shrink-0 z-10">
                <div className="min-w-0 flex items-center gap-2 sm:gap-3">
                  <button onClick={() => setSelectedUser(null)} className="md:hidden p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300">
                    <ArrowLeft size={22} />
                  </button>
                  <div className="w-10 h-10 rounded-xl bg-blue-600/10 text-blue-600 flex items-center justify-center font-bold text-sm">
                    {selectedUser.avatar ? <img src={selectedUser.avatar} alt="" className="w-full h-full rounded-xl object-cover" /> : <User size={18} />}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-sm">{selectedUser.username || selectedUser.email}</h3>
                    <span className="text-[10px] text-emerald-500 font-medium">online</span>
                  </div>
                </div>

                <div className="flex flex-shrink-0 items-center gap-1 sm:gap-2">
                  <button onClick={() => startCall('audio')} className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-blue-600"><Phone size={18} /></button>
                  <button onClick={() => startCall('video')} className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-blue-600"><Video size={18} /></button>
                </div>
              </div>

              {/* Messages Container */}
              <div className="min-h-0 flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 space-y-3 flex flex-col">
                {messages.map((msg) => {
                  const isMe = msg.sender === currentUser?.email;
                  return (
                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div 
                        onContextMenu={(e) => handleMessageContextMenu(e, msg)}
                        onTouchStart={(e) => handleTouchStart(e, msg)}
                        onTouchEnd={handleTouchEnd}
                        className={`max-w-[75%] md:max-w-md px-4 py-3 rounded-2xl text-xs md:text-sm shadow-sm select-none cursor-pointer ${
                          isMe ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-bl-none'
                        }`}
                      >
                        {msg.type === 'image' && <img src={msg.mediaUrl} alt="" className="rounded-xl max-h-60 object-cover mb-2 w-full" />}
                        {msg.type === 'video' && <video src={msg.mediaUrl} controls className="rounded-xl max-h-60 object-cover mb-2 w-full" />}
                        {msg.type === 'audio' && <audio src={msg.mediaUrl} controls className="mb-2 max-w-full h-10" />}
                        {msg.type === 'text' && <p className="break-words leading-relaxed">{msg.text}</p>}
                        
                        <div className={`flex items-center justify-end gap-1.5 mt-1 text-[10px] ${isMe ? 'text-blue-100' : 'text-slate-400'}`}>
                          {msg.edited && <span className="italic opacity-80">(tahrirlangan)</span>}
                          <span>{msg.time}</span>
                          {isMe && <CheckCheck size={12} />}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {editingMessageId && (
                <div className="bg-blue-50 dark:bg-slate-900 px-4 py-2 border-t border-blue-200 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-blue-600 dark:text-blue-400 font-medium">Xabarni tahrirlash rejimi</span>
                  <button onClick={() => { setEditingMessageId(null); setMessageText(''); }} className="text-slate-500 hover:text-slate-700 underline">Bekor qilish</button>
                </div>
              )}

              {/* Input qismi */}
              <div className="flex-shrink-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 w-full z-10 pb-16 md:pb-0">
                {audioBlob ? (
                  <div className="p-3 flex flex-wrap items-center justify-between gap-2">
                    <div className="min-w-0 flex flex-wrap items-center gap-3">
                      <span className="text-xs text-rose-500 font-semibold">Ovozli xabar tayyor!</span>
                      <audio src={audioUrl} controls className="h-9" />
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setAudioBlob(null)} className="px-3 py-2 text-xs text-slate-500">Bekor qilish</button>
                      <button onClick={sendAudioMessage} className="px-4 py-2 bg-blue-600 text-white text-xs rounded-xl flex items-center gap-1">
                        <Send size={14} /> Yuborish
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSendMessage} className="p-3 md:p-4 flex items-center gap-2">
                    <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*,video/*" className="hidden" />
                    <button type="button" onClick={() => fileInputRef.current.click()} className="p-3 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl flex-shrink-0">
                      <ImageIcon size={20} />
                    </button>
                    <input 
                      type="text" 
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      placeholder={editingMessageId ? "Xabarni tahrirlash..." : "Xabar yozing..."}
                      className="flex-1 px-4 py-3 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                    {isRecording ? (
                      <button type="button" onClick={stopRecording} className="w-11 h-11 bg-rose-600 text-white rounded-2xl flex items-center justify-center animate-bounce flex-shrink-0">
                        <Square size={18} />
                      </button>
                    ) : (
                      <button type="button" onClick={startRecording} className="w-11 h-11 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl flex-shrink-0 flex items-center justify-center">
                        <Mic size={18} />
                      </button>
                    )}
                    <button type="submit" className="w-11 h-11 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/20 flex-shrink-0">
                      <Send size={18} />
                    </button>
                  </form>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 hidden md:flex flex-col items-center justify-center text-center p-8">
              <div className="w-16 h-16 bg-blue-600/10 text-blue-600 rounded-3xl flex items-center justify-center mb-4">
                <MessageSquare size={32} />
              </div>
              <h3 className="font-bold text-base mb-1">Suhbat tanlanmagan</h3>
              <p className="text-xs text-slate-400">Qo'ng'iroq qilish yoki yozish uchun foydalanuvchini tanlang.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}