import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';

const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const scrollPositionRef = useRef(0);
  const menuRef = useRef(null);
  const menuItemsRef = useRef([]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Simple mobile menu body scroll lock - no position preservation
  useEffect(() => {
    if (isMobileMenuOpen) {
      // Simple overflow hidden for body scroll lock
      document.body.style.overflow = 'hidden';
    } else {
      // Restore body scroll
      document.body.style.overflow = '';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      // Close mobile menu immediately if open
      if (isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
      
      // Smooth scroll to section without any delay
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Simple and fast mobile menu toggle animations
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    
    if (!isMobileMenuOpen) {
      // Opening animation - smooth and simple
      gsap.set(menuRef.current, { display: 'flex' });
      gsap.fromTo(menuRef.current, 
        { opacity: 0 },
        { opacity: 1, duration: 0.2, ease: "power2.out" }
      );
      
      // Simple menu items animation
      gsap.fromTo(menuItemsRef.current,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.3, stagger: 0.05, ease: "power2.out" }
      );
    } else {
      // Closing animation - clean and simple
      gsap.to(menuItemsRef.current, {
        y: -20,
        opacity: 0,
        duration: 0.2,
        stagger: 0.02,
        ease: "power2.in"
      });
      
      gsap.to(menuRef.current, {
        opacity: 0,
        duration: 0.2,
        ease: "power2.in",
        onComplete: () => {
          gsap.set(menuRef.current, { display: 'none' });
        }
      });
    }
  };

  const navItems = [
    { name: 'About', id: 'about' },
    { name: 'Blog', id: 'blog' },
    { name: 'Contact', id: 'contact' }
  ];

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled 
          ? 'bg-black/95 backdrop-blur-2xl border-b border-white/10 shadow-2xl shadow-purple-500/5' 
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Enhanced Logo */}
          <button
            onClick={() => scrollToSection('hero')}
            className="flex items-center space-x-3 group touch-interactive relative z-50"
          >
            <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-purple-400 via-purple-300 to-blue-400 bg-clip-text text-transparent group-hover:from-purple-300 group-hover:to-blue-300 transition-all duration-300"
            style={{ fontFamily: 'Encode Sans Semi Expanded, sans-serif' }}>
              Julian D'Rozario
            </span>
          </button>

          {/* Desktop Navigation - Hidden on mobile/tablet */}
          <div className="hidden lg:flex items-center space-x-6 xl:space-x-8">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className="relative px-3 py-2 text-gray-300 hover:text-white transition-all duration-300 group font-medium text-sm xl:text-base"
              >
                {item.name}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-500 to-blue-500 group-hover:w-full transition-all duration-500 rounded-full"></span>
                <div className="absolute inset-0 bg-white/5 rounded-lg scale-0 group-hover:scale-100 transition-all duration-300 -z-10"></div>
              </button>
            ))}
            
            <button
              onClick={() => scrollToSection('contact')}
              className="relative px-6 py-2.5 xl:px-8 xl:py-3 bg-gradient-to-r from-purple-600 via-purple-500 to-blue-600 rounded-xl text-white font-medium text-sm xl:text-base hover:scale-105 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/25 overflow-hidden group"
            >
              <span className="relative z-10">Let's Talk</span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-500 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
          </div>

          {/* Modern Mobile Menu Button - Shown on mobile/tablet */}
          <button
            onClick={toggleMobileMenu}
            className="lg:hidden relative w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300 group z-50"
            aria-label="Toggle mobile menu"
          >
            <div className="relative w-5 h-5 sm:w-6 sm:h-6 flex flex-col justify-center items-center">
              <span className={`absolute w-5 sm:w-6 h-0.5 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full transition-all duration-300 transform ${
                isMobileMenuOpen ? 'rotate-45 translate-y-0' : '-translate-y-1.5'
              }`}></span>
              <span className={`absolute w-5 sm:w-6 h-0.5 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full transition-all duration-300 ${
                isMobileMenuOpen ? 'opacity-0 scale-0' : 'opacity-100 scale-100'
              }`}></span>
              <span className={`absolute w-5 sm:w-6 h-0.5 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full transition-all duration-300 transform ${
                isMobileMenuOpen ? '-rotate-45 translate-y-0' : 'translate-y-1.5'
              }`}></span>
            </div>
          </button>
        </div>
      </div>

      {/* Modern Mobile Menu Overlay - Improved */}
      <div
        ref={menuRef}
        className={`fixed inset-0 z-40 lg:hidden ${isMobileMenuOpen ? 'flex' : 'hidden'} flex-col`}
        style={{ display: 'none' }}
      >
        {/* Backdrop with improved blur */}
        <div 
          className="absolute inset-0 bg-black/98 backdrop-blur-3xl"
          onClick={toggleMobileMenu}
        ></div>
        
        {/* Menu Content - Improved spacing and layout */}
        <div className="relative h-full flex flex-col justify-center items-center px-6 sm:px-8">
          {/* Navigation Items - Better mobile sizing */}
          <div className="flex flex-col items-center space-y-6 sm:space-y-8 text-center">
            {navItems.map((item, index) => (
              <button
                key={item.id}
                ref={el => menuItemsRef.current[index] = el}
                onClick={() => scrollToSection(item.id)}
                className="group relative text-3xl sm:text-4xl font-light text-white hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-purple-400 hover:to-blue-400 transition-all duration-300 py-2 px-4 rounded-lg hover:bg-white/5"
                style={{ fontFamily: 'Encode Sans Semi Expanded, sans-serif' }}
              >
                {item.name}
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-purple-500 to-blue-500 group-hover:w-full transition-all duration-500"></div>
              </button>
            ))}
            
            {/* CTA Button - Better mobile sizing */}
            <button
              ref={el => menuItemsRef.current[navItems.length] = el}
              onClick={() => scrollToSection('contact')}
              className="mt-6 sm:mt-8 px-10 py-3 sm:px-12 sm:py-4 bg-gradient-to-r from-purple-600 via-purple-500 to-blue-600 rounded-2xl text-white font-medium text-lg sm:text-xl hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/30 transition-all duration-300 relative overflow-hidden group"
              style={{ fontFamily: 'Encode Sans Semi Expanded, sans-serif' }}
            >
              <span className="relative z-10">Let's Talk</span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-500 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
          </div>

          {/* Decorative Elements - Responsive positioning */}
          <div className="absolute top-1/4 left-4 sm:left-8 w-2 h-2 bg-purple-500 rounded-full opacity-60 animate-pulse"></div>
          <div className="absolute top-1/3 right-6 sm:right-12 w-1 h-1 bg-blue-400 rounded-full opacity-40 animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-1/4 left-6 sm:left-12 w-1.5 h-1.5 bg-purple-400 rounded-full opacity-50 animate-pulse" style={{ animationDelay: '2s' }}></div>
          <div className="absolute bottom-1/3 right-4 sm:right-8 w-2 h-2 bg-blue-500 rounded-full opacity-30 animate-pulse" style={{ animationDelay: '3s' }}></div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;