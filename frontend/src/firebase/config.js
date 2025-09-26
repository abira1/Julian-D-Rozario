// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCfY6LTtYomc_mTs8yu25g7dryXFsPpaAE",
  authDomain: "julian-d-rozario.firebaseapp.com",
  databaseURL: "https://julian-d-rozario-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "julian-d-rozario",
  storageBucket: "julian-d-rozario.firebasestorage.app",
  messagingSenderId: "4955843425",
  appId: "1:4955843425:web:631729598c7c77f85c3320",
  measurementId: "G-TZSRNMS9VL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Initialize Realtime Database
export const database = getDatabase(app);

// Initialize Analytics
export const analytics = getAnalytics(app);

export default app;