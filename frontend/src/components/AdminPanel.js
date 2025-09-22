import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import AdminLogin from './admin/AdminLogin';
import AdminDashboard from './admin/AdminDashboard';
import BlogManager from './admin/BlogManager';
import ContactManager from './admin/ContactManager';
import AdminNavigation from './admin/AdminNavigation';

const AdminPanel = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/admin/verify`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setIsAuthenticated(true);
        setUser(data.username);
      } else {
        localStorage.removeItem('admin_token');
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Auth verification failed:', error);
      localStorage.removeItem('admin_token');
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = (token, username) => {
    localStorage.setItem('admin_token', token);
    setIsAuthenticated(true);
    setUser(username);
    navigate('/julian_portfolio/dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    setIsAuthenticated(false);
    setUser(null);
    navigate('/julian_portfolio');
  };

  if (isLoading) {
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
          <Route path="*" element={<Navigate to="/julian_portfolio/dashboard" replace />} />
        </Routes>
      </div>
    </div>
  );
};

export default AdminPanel;