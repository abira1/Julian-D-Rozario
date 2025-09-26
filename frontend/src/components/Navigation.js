import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';

const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef(null);
  const mobileItemsRef = useRef([]);
  const scrollPositionRef = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Enhanced body scroll lock with position preservation
  useEffect(() => {
    if (isMobileMenuOpen) {
      // Capture current scroll position
      scrollPositionRef.current = window.scrollY;
      
      // Apply body lock with position preservation
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollPositionRef.current}px`;
      document.body.style.width = '100%';
      document.body.style.right = '0';
    } else {
      // Restore scroll position
      const savedScrollY = scrollPositionRef.current;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.right = '';
      
      // Restore scroll position with smooth restoration
      if (savedScrollY > 0) {
        requestAnimationFrame(() => {
          window.scrollTo(0, savedScrollY);
        });
      }
    }

    // Cleanup function
    return () => {
      if (document.body.style.position === 'fixed') {
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.right = '';
      }
    };
  }, [isMobileMenuOpen]);

  // Enhanced smooth scroll with mobile optimization
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      // Close mobile menu with animation
      setIsMobileMenuOpen(false);
      
      // Optimized scroll timing for mobile
      setTimeout(() => {
        element.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start',
          inline: 'nearest'
        });
      }, 200);
    }
  };

  // Enhanced mobile menu toggle with GSAP animations
  const toggleMobileMenu = () => {
    if (!isMobileMenuOpen) {
      setIsMobileMenuOpen(true);
      // Animate menu opening
      setTimeout(() => {
        if (mobileMenuRef.current) {
          gsap.fromTo(mobileMenuRef.current, 
            { opacity: 0, y: -20, scale: 0.98 },
            { opacity: 1, y: 0, scale: 1, duration: 0.25, ease: "power2.out" }
          );
          
          // Stagger animate menu items
          gsap.fromTo(mobileItemsRef.current,
            { opacity: 0, y: -15, x: -10 },
            { opacity: 1, y: 0, x: 0, duration: 0.2, stagger: 0.08, ease: "power2.out", delay: 0.1 }
          );
        }
      }, 50);
    } else {
      // Animate menu closing
      if (mobileMenuRef.current) {
        gsap.to(mobileMenuRef.current, {
          opacity: 0,
          y: -15,
          scale: 0.98,
          duration: 0.2,
          ease: "power2.in",
          onComplete: () => setIsMobileMenuOpen(false)
        });
      } else {
        setIsMobileMenuOpen(false);
      }
    }
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
            onClick={() => scrollToSection('hero')}
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
                onClick={() => scrollToSection(item.id)}
                className="text-gray-300 hover:text-white transition-colors duration-200 font-medium text-sm xl:text-base px-2 py-1 rounded hover:bg-white/5"
              >
                {item.name}
              </button>
            ))}
            <button
              onClick={() => scrollToSection('contact')}
              className="px-4 py-2 xl:px-6 xl:py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg text-white font-medium text-sm xl:text-base hover:scale-105 transition-transform duration-200"
            >
              Let's Talk
            </button>
          </div>

          {/* Modern Animated Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className="lg:hidden relative p-3 text-white hover:bg-white/15 rounded-xl transition-all duration-300 touch-manipulation group active:scale-95"
            aria-label="Toggle menu"
          >
            <div className="relative w-6 h-6 flex flex-col justify-center items-center">
              {/* Top line */}
              <span className={`block absolute h-0.5 w-6 bg-white rounded-full transform transition-all duration-300 ease-out ${
                isMobileMenuOpen ? 'rotate-45 translate-y-0' : '-translate-y-2'
              }`}></span>
              
              {/* Middle line */}
              <span className={`block absolute h-0.5 w-6 bg-white rounded-full transition-all duration-300 ease-out ${
                isMobileMenuOpen ? 'opacity-0 scale-0' : 'opacity-100 scale-100'
              }`}></span>
              
              {/* Bottom line */}
              <span className={`block absolute h-0.5 w-6 bg-white rounded-full transform transition-all duration-300 ease-out ${
                isMobileMenuOpen ? '-rotate-45 translate-y-0' : 'translate-y-2'
              }`}></span>
            </div>
            
            {/* Subtle glow effect on hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>
        </div>

        {/* Modern Full-Height Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div 
            ref={mobileMenuRef}
            className="lg:hidden fixed inset-0 top-14 sm:top-16 z-40 bg-gradient-to-br from-black/98 via-slate-950/98 to-black/98 backdrop-blur-2xl"
            style={{
              background: `
                radial-gradient(circle at 30% 40%, rgba(139, 92, 246, 0.15) 0%, transparent 50%),
                radial-gradient(circle at 70% 80%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
                linear-gradient(135deg, rgba(0, 0, 0, 0.98) 0%, rgba(15, 23, 42, 0.98) 100%)
              `
            }}
          >
            {/* Modern Menu Content */}
            <div className="flex flex-col justify-center items-center h-full px-8 py-12">
              
              {/* Navigation Items with Modern Styling */}
              <div className="space-y-2 w-full max-w-sm">
                {navItems.map((item, index) => (
                  <button
                    key={item.id}
                    ref={el => mobileItemsRef.current[index] = el}
                    onClick={() => scrollToSection(item.id)}
                    className="group relative w-full text-center py-4 px-6 text-white text-xl font-semibold bg-white/[0.03] backdrop-blur-sm rounded-2xl border border-white/10 hover:border-purple-400/40 hover:bg-gradient-to-r hover:from-purple-500/20 hover:to-blue-500/20 active:scale-[0.98] transition-all duration-300 touch-manipulation shadow-lg"
                    style={{ fontFamily: 'Encode Sans Semi Expanded, sans-serif' }}
                  >
                    {/* Subtle gradient background on hover */}
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    {/* Text content */}
                    <span className="relative z-10 group-hover:text-purple-200 transition-colors duration-300">
                      {item.name}
                    </span>
                    
                    {/* Modern underline effect */}
                    <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-0 group-hover:w-12 h-0.5 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full transition-all duration-300"></div>
                  </button>
                ))}
              </div>
              
              {/* Enhanced CTA Button */}
              <div className="mt-8 w-full max-w-sm">
                <button
                  ref={el => mobileItemsRef.current[navItems.length] = el}
                  onClick={() => scrollToSection('contact')}
                  className="group relative w-full py-5 px-8 bg-gradient-to-r from-purple-600 via-purple-700 to-blue-600 rounded-2xl text-white font-bold text-xl hover:from-purple-500 hover:via-purple-600 hover:to-blue-500 active:scale-[0.98] transition-all duration-300 shadow-2xl shadow-purple-500/30 touch-manipulation overflow-hidden"
                  style={{ fontFamily: 'Encode Sans Semi Expanded, sans-serif' }}
                >
                  {/* Animated gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-white/10 to-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  {/* Button content */}
                  <span className="relative z-10 flex items-center justify-center space-x-3">
                    <svg className="w-6 h-6 group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
                    </svg>
                    <span>Let's Work Together</span>
                    <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </span>
                  
                  {/* Subtle pulse effect */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-400/30 to-blue-400/30 blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-300"></div>
                </button>
              </div>
              
              {/* Modern Footer Text */}
              <div className="mt-12 text-center">
                <p className="text-gray-400 text-sm font-light">
                  Empowering Business Excellence
                </p>
                <div className="mt-2 w-16 h-0.5 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full mx-auto"></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;