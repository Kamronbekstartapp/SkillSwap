import React, { createContext, useState, useEffect } from 'react';
import { auth, googleProvider, db } from '../firebase';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc, getDoc, collection, getDocs } from 'firebase/firestore';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Firebase orqali foydalanuvchilar va joriy foydalanuvchini kuzatib borish
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          setCurrentUser(userSnap.data());
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    const fetchAllUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "users"));
        const usersList = querySnapshot.docs.map(doc => doc.data());
        setUsers(usersList);
      } catch (error) {
        console.error("Foydalanuvchilarni olishda xatolik:", error);
      }
    };

    fetchAllUsers();
    return () => unsubscribe();
  }, []);

  // 1. Google orqali RO'YXATDAN O'TISH (Popup orqali barcha qurilmalarda barqaror ishlaydi)
  const registerWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        await signOut(auth);
        return { 
          success: false, 
          exists: true, 
          message: "Bu akkaunt allaqachon mavjud! Iltimos, tizimga kiring." 
        };
      }

      return { 
        success: true, 
        user: {
          uid: user.uid,
          username: user.displayName || "Foydalanuvchi",
          email: user.email,
          avatar: user.photoURL || "",
          role: "learner"
        }
      };
    } catch (error) {
      console.error("Google orqali ro'yxatdan o'tishda xatolik:", error);
      return { success: false, message: "Google orqali ro'yxatdan o'tishda xatolik yuz berdi: " + error.message };
    }
  };

  // 2. Google orqali TIZIMGA KIRISH
  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        await signOut(auth);
        return { 
          success: false, 
          exists: false, 
          message: "Bu akkaunt saytda mavjud emas, avval ro'yxatdan o'ting!" 
        };
      }

      setCurrentUser(userSnap.data());
      return { success: true };
    } catch (error) {
      console.error("Google orqali kirish xatoligi:", error);
      return { success: false, message: "Google orqali kirishda xatolik yuz berdi: " + error.message };
    }
  };

  const signup = async (userData) => {
    const trimmedEmail = userData.email.trim().toLowerCase();
    const trimmedUsername = userData.username.trim().toLowerCase();

    const usernameExists = users.some(u => u.username && u.username.trim().toLowerCase() === trimmedUsername);
    if (usernameExists) {
      return { success: false, message: "Bu username allaqachon saytda band qilingan!" };
    }

    const emailExists = users.some(u => u.email && u.email.trim().toLowerCase() === trimmedEmail);
    if (emailExists) {
      return { success: false, message: "Bu email bilan ro'yxatdan o'tilgan account mavjud!" };
    }

    try {
      const userId = userData.uid || ('user_' + Date.now());
      const newUser = { ...userData, uid: userId };

      const userRef = doc(db, "users", userId);
      await setDoc(userRef, newUser);

      const updatedUsers = [...users, newUser];
      setUsers(updatedUsers);
      setCurrentUser(newUser);
      return { success: true };
    } catch (error) {
      return { success: false, message: "Serverda xatolik yuz berdi." };
    }
  };

  const login = (email, password) => {
    const foundUser = users.find(u => 
      u.email && u.email.trim().toLowerCase() === email.trim().toLowerCase() && u.password === password
    );

    if (foundUser) {
      setCurrentUser(foundUser);
      return true;
    }
    return false;
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (e) {}
    setCurrentUser(null);
  };

  const updateUser = async (updatedData) => {
    setCurrentUser(updatedData);
    if (updatedData.uid) {
      try {
        const userRef = doc(db, "users", updatedData.uid);
        await setDoc(userRef, updatedData, { merge: true });
      } catch (error) {}
    }
    const updatedUsers = users.map(u => u.email === updatedData.email ? updatedData : u);
    setUsers(updatedUsers);
  };

  return (
    <AuthContext.Provider value={{ currentUser, users, signup, login, logout, updateUser, loginWithGoogle, registerWithGoogle, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}