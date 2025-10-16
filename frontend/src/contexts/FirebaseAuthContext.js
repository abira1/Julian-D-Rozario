import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, googleProvider } from '../firebase/config';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { API_CONFIG } from '../config/api';

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
  const [backendToken, setBackendToken] = useState(null);

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
        
        try {
          // Get Firebase ID token
          const idToken = await firebaseUser.getIdToken();
          
          // Send to backend for JWT token (both admin and regular users)
          const endpointPath = isUserAdmin ? '/auth/firebase-admin-login' : '/auth/firebase-user-login';
          const endpoint = API_CONFIG.getApiPath(endpointPath);
          
          const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              firebase_token: idToken,
              user_data: {
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                name: firebaseUser.displayName,
                picture: firebaseUser.photoURL
              }
            }),
          });

          if (response.ok) {
            const data = await response.json();
            setBackendToken(data.access_token);
            localStorage.setItem('firebase_backend_token', data.access_token);
          } else {
            console.error('Failed to get backend token:', await response.text());
            // Fallback: set a simple token
            const fallbackToken = (isUserAdmin ? 'admin-token-' : 'user-token-') + Date.now();
            setBackendToken(fallbackToken);
            localStorage.setItem('firebase_backend_token', fallbackToken);
          }
        } catch (error) {
          console.error('Error getting backend token:', error);
          // Fallback: set a simple token
          const fallbackToken = (isUserAdmin ? 'admin-token-' : 'user-token-') + Date.now();
          setBackendToken(fallbackToken);
          localStorage.setItem('firebase_backend_token', fallbackToken);
        }
      } else {
        setUser(null);
        setIsAdmin(false);
        setBackendToken(null);
        localStorage.removeItem('firebase_backend_token');
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
      setBackendToken(null);
      localStorage.removeItem('firebase_backend_token');
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const getAuthHeaders = () => {
    const token = backendToken || localStorage.getItem('firebase_backend_token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  };

  const requireAuth = (callback) => {
    if (user) {
      callback();
    } else {
      login();
    }
  };

  // Check if user has liked a specific blog
  const checkUserLike = async (blogId) => {
    if (!user) return false;
    
    try {
      const response = await fetch(API_CONFIG.getApiPath(`/blogs/${blogId}/user-like-status`), {
        headers: getAuthHeaders()
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.liked;
      }
    } catch (error) {
      console.error('Error checking like status:', error);
    }
    return false;
  };

  // Check if user has saved a specific blog
  const checkUserSaved = async (blogId) => {
    if (!user) return false;
    
    try {
      const response = await fetch(API_CONFIG.getApiPath(`/blogs/${blogId}/user-save-status`), {
        headers: getAuthHeaders()
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.saved;
      }
    } catch (error) {
      console.error('Error checking save status:', error);
    }
    return false;
  };

  const value = {
    // User state
    user,
    loading,
    isAdmin,
    backendToken,
    
    // Authentication methods
    login,
    logout,
    getAuthHeaders,
    requireAuth,
    
    // Blog interaction helpers
    checkUserLike,
    checkUserSaved,
    
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