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
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-slate-900/90 backdrop-blur-xl border-b border-white/10' 
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <button
            onClick={() => scrollToSection('hero')}
            className="flex items-center space-x-3 group cursor-pointer"
          >
            <img 
              src="/jdr-logo.png" 
              alt="Julian D Rozario Logo" 
              className="w-12 h-12 group-hover:scale-110 transition-transform duration-300"
            />
            <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Julian Rozario
            </span>
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className="relative px-4 py-2 text-gray-300 hover:text-white transition-colors duration-300 group"
              >
                {item.name}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-500 to-blue-500 group-hover:w-full transition-all duration-300"></span>
              </button>
            ))}
            
            <button
              onClick={() => scrollToSection('contact')}
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg text-white font-medium hover:scale-105 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/25"
            >
              Let's Talk
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden w-10 h-10 flex flex-col items-center justify-center space-y-1.5 group"
          >
            <span className={`w-6 h-0.5 bg-white transition-all duration-300 ${isMobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
            <span className={`w-6 h-0.5 bg-white transition-all duration-300 ${isMobileMenuOpen ? 'opacity-0' : ''}`}></span>
            <span className={`w-6 h-0.5 bg-white transition-all duration-300 ${isMobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden transition-all duration-300 overflow-hidden ${
        isMobileMenuOpen ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0'
      }`}>
        <div className="bg-slate-900/95 backdrop-blur-xl border-t border-white/10 px-4 py-6">
          <div className="space-y-4">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className="block w-full text-left px-4 py-3 text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-300"
              >
                {item.name}
              </button>
            ))}
            <button
              onClick={() => scrollToSection('contact')}
              className="block w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg text-white font-medium text-center hover:scale-105 transition-all duration-300 mt-4"
            >
              Let's Talk
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;