import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, googleProvider } from '../firebase/config';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
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
          
          // Send to backend for JWT token - using relative path for PHP API
          const response = await fetch('/api/auth/firebase-login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              firebase_token: idToken
            }),
          });

          if (response.ok) {
            const data = await response.json();
            setBackendToken(data.access_token);
            localStorage.setItem('backend_token', data.access_token);
          } else {
            console.error('Failed to get backend token:', await response.text());
            // Fallback: set a simple token for admin users
            if (isUserAdmin) {
              const fallbackToken = 'admin-token-' + Date.now();
              setBackendToken(fallbackToken);
              localStorage.setItem('backend_token', fallbackToken);
            }
          }
        } catch (error) {
          console.error('Error getting backend token:', error);
          // Fallback: set a simple token for admin users
          if (isUserAdmin) {
            const fallbackToken = 'admin-token-' + Date.now();
            setBackendToken(fallbackToken);
            localStorage.setItem('backend_token', fallbackToken);
          }
        }
      } else {
        setUser(null);
        setIsAdmin(false);
        setBackendToken(null);
        localStorage.removeItem('backend_token');
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const loginWithGoogle = async () => {
    try {
      setLoading(true);
      const result = await signInWithPopup(auth, googleProvider);
      return result.user;
    } catch (error) {
      console.error('Google login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem('backend_token');
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const value = {
    user,
    isAdmin,
    backendToken,
    loading,
    loginWithGoogle,
    logout,
    ADMIN_EMAILS
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};