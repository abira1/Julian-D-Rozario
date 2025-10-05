import React, { createContext, useContext, useState, useEffect } from 'react';

const GoogleAuthContext = createContext();

export const useGoogleAuth = () => {
  const context = useContext(GoogleAuthContext);
  if (!context) {
    throw new Error('useGoogleAuth must be used within a GoogleAuthProvider');
  }
  return context;
};

export const GoogleAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize Google Auth
  useEffect(() => {
    const initializeGoogleAuth = async () => {
      try {
        // Load Google API script
        if (!window.google) {
          const script = document.createElement('script');
          script.src = 'https://accounts.google.com/gsi/client';
          script.async = true;
          script.defer = true;
          document.head.appendChild(script);
          
          await new Promise((resolve) => {
            script.onload = resolve;
          });
        }

        // Initialize Google Identity Services
        window.google.accounts.id.initialize({
          client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
          callback: handleGoogleResponse,
          auto_select: false,
          cancel_on_tap_outside: false,
        });

        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize Google Auth:', error);
      } finally {
        setLoading(false);
      }
    };

    // Check if user is already logged in
    const token = localStorage.getItem('auth_token');
    if (token) {
      verifyToken(token);
    } else {
      setLoading(false);
    }

    initializeGoogleAuth();
  }, []);

  const handleGoogleResponse = async (response) => {
    try {
      const result = await fetch('/api/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id_token: response.credential
        })
      });

      if (result.ok) {
        const data = await result.json();
        setUser(data.user);
        localStorage.setItem('auth_token', data.token);
      } else {
        console.error('Authentication failed');
      }
    } catch (error) {
      console.error('Authentication error:', error);
    }
  };

  const verifyToken = async (token) => {
    try {
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData.user);
      } else {
        localStorage.removeItem('auth_token');
      }
    } catch (error) {
      console.error('Token verification failed:', error);
      localStorage.removeItem('auth_token');
    } finally {
      setLoading(false);
    }
  };

  const login = () => {
    if (isInitialized && window.google) {
      window.google.accounts.id.prompt();
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('auth_token');
    if (window.google) {
      window.google.accounts.id.disableAutoSelect();
    }
  };

  const getAuthHeaders = () => {
    const token = localStorage.getItem('auth_token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  };

  const requireAuth = (callback) => {
    if (user) {
      callback();
    } else {
      login();
    }
  };

  const value = {
    user,
    loading,
    isInitialized,
    login,
    logout,
    getAuthHeaders,
    requireAuth
  };

  return (
    <GoogleAuthContext.Provider value={value}>
      {children}
    </GoogleAuthContext.Provider>
  );
};

export default GoogleAuthProvider;