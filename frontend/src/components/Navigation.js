import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useFirebaseAuth } from '../contexts/FirebaseAuthContext';
import FirebaseUserProfileMenu from './FirebaseUserProfileMenu';
import FirebaseLoginButton from './FirebaseLoginButton';

const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useFirebaseAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Simple body scroll lock without position jumping
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  // Handle navigation - smart routing and scrolling
  const handleNavigation = (itemId) => {
    // Close mobile menu first
    setIsMobileMenuOpen(false);
    
    if (itemId === 'blog') {
      // Navigate to blog page
      navigate('/blog');
    } else if (itemId === 'hero') {
      // Navigate to home page
      navigate('/');
    } else {
      // For other sections (about, contact), check if we're on home page
      if (location.pathname === '/') {
        // We're on home page, just scroll to section
        setTimeout(() => {
          const element = document.getElementById(itemId);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 100);
      } else {
        // We're on a different page, navigate to home first then scroll
        navigate('/');
        setTimeout(() => {
          const element = document.getElementById(itemId);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 300);
      }
    }
  };

  // Simple menu toggle
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const navItems = [
    { name: 'About', id: 'about' },
    { name: 'Blog', id: 'blog' },
    { name: 'Contact', id: 'contact' }
  ];

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-black/95 backdrop-blur-xl border-b border-white/10 shadow-lg' 
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
        <div className="flex items-center justify-between h-14 sm:h-16 lg:h-18">
          {/* Responsive Logo */}
          <button
            onClick={() => handleNavigation('hero')}
            className="text-base sm:text-lg lg:text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent hover:from-purple-300 hover:to-blue-300 transition-all duration-300 flex-shrink-0"
            style={{ fontFamily: 'Encode Sans Semi Expanded, sans-serif' }}
          >
            <span className="block sm:hidden">Julian D.</span>
            <span className="hidden sm:block lg:hidden">Julian D'Rozario</span>
            <span className="hidden lg:block">Julian D'Rozario</span>
          </button>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-6 xl:space-x-8">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.id)}
                className="text-gray-300 hover:text-white transition-colors duration-200 font-medium text-sm xl:text-base px-2 py-1 rounded hover:bg-white/5"
              >
                {item.name}
              </button>
            ))}
            <button
              onClick={() => handleNavigation('contact')}
              className="px-4 py-2 xl:px-6 xl:py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg text-white font-medium text-sm xl:text-base hover:scale-105 transition-transform duration-200"
            >
              Let's Talk
            </button>
            
            {/* User Authentication */}
            <div className="flex items-center ml-4">
              {user ? (
                <FirebaseUserProfileMenu />
              ) : (
                <FirebaseLoginButton 
                  text="Sign In"
                  size="small"
                  theme="dark"
                />
              )}
            </div>
          </div>

          {/* Simple Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className="lg:hidden p-2 text-white hover:bg-white/10 rounded-lg transition-colors duration-200"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Simple Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 right-0 bg-black/95 backdrop-blur-xl border-t border-white/10 shadow-xl">
            <div className="py-4">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item.id)}
                  className="block w-full text-left px-6 py-3 text-white text-lg font-medium hover:bg-white/10 transition-colors duration-200"
                  style={{ fontFamily: 'Encode Sans Semi Expanded, sans-serif' }}
                >
                  {item.name}
                </button>
              ))}
              
              <div className="px-6 pt-4 space-y-3">
                <button
                  onClick={() => handleNavigation('contact')}
                  className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg text-white font-semibold text-lg hover:from-purple-700 hover:to-blue-700 transition-colors duration-200"
                  style={{ fontFamily: 'Encode Sans Semi Expanded, sans-serif' }}
                >
                  Let's Talk
                </button>
                
                {/* Mobile Authentication */}
                {user ? (
                  <div className="flex items-center justify-between py-3 px-4 bg-white/5 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <img 
                        src={user.photoURL || '/default-avatar.png'} 
                        alt={user.displayName || user.email}
                        className="w-8 h-8 rounded-full"
                      />
                      <div>
                        <p className="text-white font-medium text-sm">{user.displayName || 'User'}</p>
                        <p className="text-gray-400 text-xs">{user.email}</p>
                      </div>
                    </div>
                    <FirebaseUserProfileMenu />
                  </div>
                ) : (
                  <div className="pt-2">
                    <FirebaseLoginButton 
                      text="Sign In with Google"
                      size="medium"
                      theme="dark"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;