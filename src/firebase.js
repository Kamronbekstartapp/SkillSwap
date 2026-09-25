import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";


const firebaseConfig = {
  apiKey: "AIzaSyBpVXgKOUOptR7kW_zFOgUey9hEDsZpzF4",
  authDomain: "skillswap-8efd4.firebaseapp.com",
  projectId: "skillswap-8efd4",
  storageBucket: "skillswap-8efd4.firebasestorage.app",
  messagingSenderId: "183827840904",
  appId: "1:183827840904:web:330fb233ecd3112245c43d",
  measurementId: "G-HKN6P9RR9E"
};

const app = initializeApp(firebaseConfig);
getAnalytics(app);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});
export const db = getFirestore(app);