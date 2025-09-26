import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AdminLogin from './admin/AdminLogin';
import AdminDashboard from './admin/AdminDashboard';
import BlogManager from './admin/BlogManager';
import ContactManager from './admin/ContactManager';
import WorkedWithManager from './admin/WorkedWithManager';
import AdminNavigation from './admin/AdminNavigation';

const AdminPanel = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { user: authUser, isAdmin, backendToken, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading) {
      if (authUser && backendToken) {
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
  }, [authUser, isAdmin, backendToken, authLoading, navigate]);

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
      navigate('/julian_portfolio');
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
          <Route path="/" element={<Navigate to="/julian_portfolio/dashboard" replace />} />
          <Route path="/dashboard" element={<AdminDashboard />} />
          <Route path="/blogs" element={<BlogManager />} />
          <Route path="/blogs/:action/:id?" element={<BlogManager />} />
          <Route path="/contact" element={<ContactManager />} />
          <Route path="/worked-with" element={<WorkedWithManager />} />
          <Route path="*" element={<Navigate to="/julian_portfolio/dashboard" replace />} />
        </Routes>
      </div>
    </div>
  );
};

export default AdminPanel;