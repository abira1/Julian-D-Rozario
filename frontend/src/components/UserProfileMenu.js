import React, { useState, useRef, useEffect } from 'react';
import { useGoogleAuth } from '../contexts/GoogleAuthContext';
import './UserProfileMenu.css';

const UserProfileMenu = () => {
  const { user, logout } = useGoogleAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  if (!user) return null;

  return (
    <div className="user-profile-menu" ref={menuRef}>
      <button 
        className="profile-trigger"
        onClick={toggleMenu}
        aria-label="Open user menu"
      >
        <img 
          src={user.picture || '/default-avatar.png'} 
          alt={user.name}
          className="profile-avatar"
        />
      </button>

      {isOpen && (
        <div className="profile-dropdown">
          <div className="profile-header">
            <img 
              src={user.picture || '/default-avatar.png'} 
              alt={user.name}
              className="profile-avatar-large"
            />
            <div className="profile-info">
              <h3 className="profile-name">{user.name}</h3>
              <p className="profile-email">{user.email}</p>
            </div>
          </div>

          <div className="profile-divider"></div>

          <div className="profile-menu-items">
            <button className="menu-item">
              <svg className="menu-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
              My Profile
            </button>

            <button className="menu-item">
              <svg className="menu-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
              Liked Blogs
            </button>

            <button className="menu-item">
              <svg className="menu-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2z"/>
              </svg>
              Saved Blogs
            </button>

            <button className="menu-item">
              <svg className="menu-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              My Comments
            </button>

            <div className="profile-divider"></div>

            <button className="menu-item">
              <svg className="menu-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
              </svg>
              Settings
            </button>

            <button className="menu-item logout" onClick={handleLogout}>
              <svg className="menu-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.59L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
              </svg>
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfileMenu;