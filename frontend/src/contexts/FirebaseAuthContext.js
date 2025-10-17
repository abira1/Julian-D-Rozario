import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, googleProvider, database } from '../firebase/config';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { ref, get, set, serverTimestamp } from 'firebase/database';

const FirebaseAuthContext = createContext();

export const useFirebaseAuth = () => {
  const context = useContext(FirebaseAuthContext);
  if (!context) {
    throw new Error('useFirebaseAuth must be used within a FirebaseAuthProvider');
  }
  return context;
};

export const FirebaseAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Authorized admin emails
  const ADMIN_EMAILS = [
    'abirsabirhossain@gmail.com',
    'juliandrozario@gmail.com'
  ];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      
      if (firebaseUser) {
        setUser(firebaseUser);
        
        // Check if user is admin
        const isUserAdmin = ADMIN_EMAILS.includes(firebaseUser.email);
        setIsAdmin(isUserAdmin);
        
        // Store/update user profile in Firebase Realtime Database
        try {
          const userRef = ref(database, `users/${firebaseUser.uid}`);
          await set(userRef, {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
            isAdmin: isUserAdmin,
            lastLogin: serverTimestamp()
          });
        } catch (error) {
          console.error('Error saving user profile:', error);
        }
      } else {
        setUser(null);
        setIsAdmin(false);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      return result.user;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  // Alias for backward compatibility
  const login = loginWithGoogle;

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const requireAuth = (callback) => {
    if (user) {
      callback();
    } else {
      login();
    }
  };

  // Check if user has liked a specific blog (Firebase version)
  const checkUserLike = async (blogId) => {
    if (!user) return false;
    
    try {
      const likeRef = ref(database, `likes/${blogId}/${user.uid}`);
      const snapshot = await get(likeRef);
      return snapshot.exists();
    } catch (error) {
      console.error('Error checking like status:', error);
      return false;
    }
  };

  const value = {
    // User state
    user,
    loading,
    isAdmin,
    
    // Authentication methods
    login,
    loginWithGoogle, // Primary method
    logout,
    requireAuth,
    
    // Blog interaction helpers
    checkUserLike,
    
    // Firebase user properties for easy access
    userId: user?.uid,
    userEmail: user?.email,
    userName: user?.displayName,
    userPhoto: user?.photoURL
  };

  return (
    <FirebaseAuthContext.Provider value={value}>
      {children}
    </FirebaseAuthContext.Provider>
  );
};

export default FirebaseAuthProvider;