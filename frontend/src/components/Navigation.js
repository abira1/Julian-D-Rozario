import React, { useState, useEffect } from 'react';

const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
      // Close mobile menu first
      setIsMobileMenuOpen(false);
      // Simple smooth scroll
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

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

          {/* Enhanced Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className="lg:hidden p-2 sm:p-2.5 text-white hover:bg-white/10 rounded-lg transition-all duration-200 touch-manipulation"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              // Enhanced X icon
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              // Enhanced Hamburger icon  
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Enhanced Responsive Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-black/95 backdrop-blur-xl border-t border-white/10 shadow-2xl">
            {/* Mobile Menu Items */}
            <div className="py-2 sm:py-3">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className="block w-full text-left px-4 sm:px-6 py-3 sm:py-4 text-white text-base sm:text-lg font-medium hover:bg-white/10 active:bg-white/20 transition-all duration-200 touch-manipulation"
                  style={{ fontFamily: 'Encode Sans Semi Expanded, sans-serif' }}
                >
                  {item.name}
                </button>
              ))}
              
              {/* Mobile CTA Button */}
              <div className="px-4 sm:px-6 pt-2 sm:pt-3 pb-3 sm:pb-4">
                <button
                  onClick={() => scrollToSection('contact')}
                  className="w-full py-3 sm:py-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg sm:rounded-xl text-white font-semibold text-base sm:text-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-lg shadow-purple-500/25 touch-manipulation"
                  style={{ fontFamily: 'Encode Sans Semi Expanded, sans-serif' }}
                >
                  Let's Talk
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;