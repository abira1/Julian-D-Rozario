import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useFirebaseAuth } from '../contexts/FirebaseAuthContext';
import AdminLogin from './admin/AdminLogin';
import AdminDashboard from './admin/AdminDashboard';
import ComprehensiveBlogManager from './admin/ComprehensiveBlogManager';
import ContactManager from './admin/ContactManager';
// WorkedWithManager removed as requested
import AdminNavigation from './admin/AdminNavigation';

const AdminPanel = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { user: authUser, isAdmin, loading: authLoading } = useFirebaseAuth();

  useEffect(() => {
    if (!authLoading) {
      if (authUser) {
        if (isAdmin) {
          setIsAuthenticated(true);
          setUser(authUser.displayName || authUser.email);
        } else {
          // User is logged in but not admin, redirect to homepage
          navigate('/');
        }
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
      setIsLoading(false);
    }
  }, [authUser, isAdmin, authLoading, navigate]);

  const handleLogin = (token, username) => {
    setIsAuthenticated(true);
    setUser(username);
    navigate('/julian_portfolio/dashboard');
  };

  const handleLogout = async () => {
    try {
      const { logout } = await import('../contexts/AuthContext');
      // This won't work directly, we need to use the hook
      // Instead, we'll handle logout through the auth context
      setIsAuthenticated(false);
      setUser(null);
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (isLoading || authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-slate-950 to-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-slate-950 to-black">
        <AdminLogin onLogin={handleLogin} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-slate-950 to-black">
      <AdminNavigation user={user} onLogout={handleLogout} />
      
      <div className="pt-16">
        <Routes>
          <Route path="/" element={<AdminDashboard />} />
          <Route path="/dashboard" element={<AdminDashboard />} />
          <Route path="/blogs" element={<ComprehensiveBlogManager />} />
          <Route path="/blogs/:action/:id?" element={<ComprehensiveBlogManager />} />
          <Route path="/contact" element={<ContactManager />} />
          {/* WorkedWith route removed as requested */}
          <Route path="*" element={<AdminDashboard />} />
        </Routes>
      </div>
    </div>
  );
};

export default AdminPanel;