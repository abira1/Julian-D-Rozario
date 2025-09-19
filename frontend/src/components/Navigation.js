import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';

const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const menuItemsRef = useRef([]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Body scroll lock for mobile menu
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMobileMenuOpen(false);
    }
  };

  // Enhanced mobile menu toggle with GSAP animations
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    
    if (!isMobileMenuOpen) {
      // Opening animation
      gsap.set(menuRef.current, { display: 'block' });
      gsap.fromTo(menuRef.current, 
        { opacity: 0, scale: 0.95 },
        { opacity: 1, scale: 1, duration: 0.3, ease: "power2.out" }
      );
      
      // Stagger animation for menu items
      gsap.fromTo(menuItemsRef.current,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, stagger: 0.1, ease: "power2.out", delay: 0.1 }
      );
    } else {
      // Closing animation
      gsap.to(menuRef.current, {
        opacity: 0,
        scale: 0.95,
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
    { name: 'Services', id: 'services' },
    { name: 'Blog', id: 'blog' },
    { name: 'Contact', id: 'contact' }
  ];

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled 
          ? 'bg-slate-900/80 backdrop-blur-2xl border-b border-white/5 shadow-2xl shadow-purple-500/5' 
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          {/* Enhanced Logo */}
          <button
            onClick={() => scrollToSection('hero')}
            className="flex items-center space-x-3 group cursor-pointer relative"
          >
            <div className="relative">
              <img 
                src="/jdr-logo.png" 
                alt="Julian D Rozario Logo" 
                className="w-12 h-12 group-hover:scale-110 transition-all duration-300 relative z-10"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-full scale-0 group-hover:scale-125 transition-all duration-300"></div>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-400 via-purple-300 to-blue-400 bg-clip-text text-transparent group-hover:from-purple-300 group-hover:to-blue-300 transition-all duration-300">
              Julian Rozario
            </span>
          </button>

          {/* Enhanced Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className="relative px-4 py-2 text-gray-300 hover:text-white transition-all duration-300 group font-medium"
              >
                {item.name}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-500 to-blue-500 group-hover:w-full transition-all duration-500 rounded-full"></span>
                <div className="absolute inset-0 bg-white/5 rounded-lg scale-0 group-hover:scale-100 transition-all duration-300 -z-10"></div>
              </button>
            ))}
            
            <button
              onClick={() => scrollToSection('contact')}
              className="relative px-8 py-3 bg-gradient-to-r from-purple-600 via-purple-500 to-blue-600 rounded-xl text-white font-medium hover:scale-105 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/25 overflow-hidden group"
            >
              <span className="relative z-10">Let's Talk</span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-500 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
          </div>

          {/* Modern Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden relative w-12 h-12 flex items-center justify-center rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300 group"
            aria-label="Toggle mobile menu"
          >
            <div className="relative w-6 h-6 flex flex-col justify-center items-center">
              <span className={`absolute w-6 h-0.5 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full transition-all duration-300 transform ${
                isMobileMenuOpen ? 'rotate-45 translate-y-0' : '-translate-y-1.5'
              }`}></span>
              <span className={`absolute w-6 h-0.5 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full transition-all duration-300 ${
                isMobileMenuOpen ? 'opacity-0 scale-0' : 'opacity-100 scale-100'
              }`}></span>
              <span className={`absolute w-6 h-0.5 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full transition-all duration-300 transform ${
                isMobileMenuOpen ? '-rotate-45 translate-y-0' : 'translate-y-1.5'
              }`}></span>
            </div>
          </button>
        </div>
      </div>

      {/* Modern Mobile Menu Overlay */}
      <div
        ref={menuRef}
        className={`fixed inset-0 z-40 md:hidden ${isMobileMenuOpen ? 'block' : 'hidden'}`}
      >
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-slate-900/95 backdrop-blur-2xl"
          onClick={toggleMobileMenu}
        ></div>
        
        {/* Menu Content */}
        <div className="relative h-full flex flex-col justify-center items-center px-8">
          {/* Close Button */}
          <button
            onClick={toggleMobileMenu}
            className="absolute top-8 right-8 w-12 h-12 flex items-center justify-center rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300"
            aria-label="Close menu"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Navigation Items */}
          <div className="flex flex-col items-center space-y-8 text-center">
            {navItems.map((item, index) => (
              <button
                key={item.id}
                ref={el => menuItemsRef.current[index] = el}
                onClick={() => scrollToSection(item.id)}
                className="group relative text-4xl font-light text-white hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-purple-400 hover:to-blue-400 transition-all duration-300 py-2"
              >
                {item.name}
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-purple-500 to-blue-500 group-hover:w-full transition-all duration-500"></div>
              </button>
            ))}
            
            {/* CTA Button */}
            <button
              ref={el => menuItemsRef.current[navItems.length] = el}
              onClick={() => scrollToSection('contact')}
              className="mt-8 px-12 py-4 bg-gradient-to-r from-purple-600 via-purple-500 to-blue-600 rounded-2xl text-white font-medium text-xl hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/30 transition-all duration-300 relative overflow-hidden group"
            >
              <span className="relative z-10">Let's Talk</span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-500 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
          </div>

          {/* Decorative Elements */}
          <div className="absolute top-1/4 left-8 w-2 h-2 bg-purple-500 rounded-full opacity-60 animate-pulse"></div>
          <div className="absolute top-1/3 right-12 w-1 h-1 bg-blue-400 rounded-full opacity-40 animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-1/4 left-12 w-1.5 h-1.5 bg-purple-400 rounded-full opacity-50 animate-pulse" style={{ animationDelay: '2s' }}></div>
          <div className="absolute bottom-1/3 right-8 w-2 h-2 bg-blue-500 rounded-full opacity-30 animate-pulse" style={{ animationDelay: '3s' }}></div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;