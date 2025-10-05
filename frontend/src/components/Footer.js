import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { contactData } from '../data/mockData';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const footerRef = useRef(null);
  const animationRef = useRef([]);

  const socialLinks = [
    {
      name: 'LinkedIn',
      href: contactData.linkedin,
      color: 'from-blue-600 to-blue-700',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.447 20.452H16.893V14.883C16.893 13.555 16.866 11.846 15.041 11.846C13.188 11.846 12.905 13.291 12.905 14.785V20.452H9.351V9H12.765V10.561H12.811C13.288 9.661 14.448 8.711 16.181 8.711C19.782 8.711 20.448 11.081 20.448 14.166V20.452H20.447ZM5.337 7.433C4.193 7.433 3.274 6.507 3.274 5.368C3.274 4.23 4.194 3.305 5.337 3.305C6.477 3.305 7.401 4.23 7.401 5.368C7.401 6.507 6.476 7.433 5.337 7.433ZM7.119 20.452H3.555V9H7.119V20.452ZM22.225 0H1.771C0.792 0 0 0.774 0 1.729V22.271C0 23.227 0.792 24 1.771 24H22.222C23.2 24 24 23.227 24 22.271V1.729C24 0.774 23.2 0 22.222 0H22.225Z"/>
        </svg>
      )
    }
    // Email and Phone contact removed per user request - only LinkedIn remains
  ];

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Enhanced animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Floating animation for decorative elements
      gsap.to(".floating-orb", {
        y: "random(-20, 20)",
        x: "random(-15, 15)",
        rotation: "random(-180, 180)",
        scale: "random(0.8, 1.2)",
        duration: "random(3, 5)",
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        stagger: {
          amount: 2,
          from: "random"
        }
      });

      // Glow effect animation
      gsap.to(".glow-pulse", {
        opacity: "random(0.3, 0.8)",
        scale: "random(1, 1.1)",
        duration: "random(2, 4)",
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });
    }, footerRef);

    return () => ctx.revert();
  }, []);

  return (
    <footer 
      ref={footerRef}
      className="relative bg-gradient-to-br from-black via-slate-950 to-black overflow-hidden"
    >
      {/* Modern Background with Mesh Gradient */}
      <div className="absolute inset-0">
        {/* Animated mesh background */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 via-blue-900/5 to-black/50"></div>
        
        {/* Floating orbs */}
        <div className="floating-orb absolute top-20 left-1/4 w-32 h-32 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-full filter blur-2xl glow-pulse"></div>
        <div className="floating-orb absolute top-32 right-1/3 w-24 h-24 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full filter blur-2xl glow-pulse"></div>
        <div className="floating-orb absolute bottom-20 left-1/3 w-20 h-20 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-full filter blur-2xl glow-pulse"></div>
        
        {/* Grid pattern overlay */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(139, 92, 246, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(139, 92, 246, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}
        ></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        
        {/* Top Section with Enhanced Design */}
        <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-12 mb-16">
          
          {/* Brand Section - Enhanced */}
          <div className="lg:col-span-2 space-y-8">
            <div className="group">
              <div className="mb-6">
                <h3 className="text-3xl font-bold bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent mb-2"
                style={{ fontFamily: 'Encode Sans Semi Expanded, sans-serif' }}>
                  Julian D'Rozario
                </h3>
                <p className="text-gray-400 text-sm font-medium">Business Consultant & Licensing Advisor</p>
              </div>
              
              <p className="text-gray-300 leading-relaxed text-lg max-w-md">
                Transforming businesses through strategic consulting and innovative licensing solutions. 
                <span className="block mt-2 text-purple-300 font-medium">Let's unlock your business potential together.</span>
              </p>
              
              {/* CTA Button */}
              <button
                onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                className="mt-6 group relative px-8 py-3 bg-gradient-to-r from-purple-600 via-purple-500 to-blue-600 rounded-xl text-white font-semibold transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-purple-500/25 overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Get Started Today
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-500 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            </div>
          </div>

          {/* Navigation Links - Modernized */}
          <div className="space-y-8">
            <h4 className="text-xl font-bold text-white relative">
              Quick Navigation
              <span className="absolute -bottom-2 left-0 w-12 h-0.5 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"></span>
            </h4>
            <div className="space-y-4">
              {['About', 'Blog', 'Contact'].map((item, index) => (
                <button
                  key={item}
                  onClick={() => document.getElementById(item.toLowerCase())?.scrollIntoView({ behavior: 'smooth' })}
                  className="group flex items-center gap-3 text-gray-300 hover:text-white transition-all duration-300 py-2"
                >
                  <div className="w-1.5 h-1.5 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full scale-0 group-hover:scale-100 transition-all duration-300"></div>
                  <span className="group-hover:translate-x-1 transition-transform duration-300">{item}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Connect Section - LinkedIn Only */}
          <div className="space-y-8">
            <h4 className="text-xl font-bold text-white relative">
              Connect & Follow
              <span className="absolute -bottom-2 left-0 w-12 h-0.5 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"></span>
            </h4>
            <div className="space-y-6">
              <p className="text-gray-300 leading-relaxed">
                Follow my professional journey and connect with me on LinkedIn for insights on Dubai business formation and corporate services.
              </p>
              
              {/* LinkedIn CTA Button */}
              <a
                href={contactData.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl text-white font-semibold text-sm hover:scale-105 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/25"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.447 20.452H16.893V14.883C16.893 13.555 16.866 11.846 15.041 11.846C13.188 11.846 12.905 13.291 12.905 14.785V20.452H9.351V9H12.765V10.561H12.811C13.288 9.661 14.448 8.711 16.181 8.711C19.782 8.711 20.448 11.081 20.448 14.166V20.452H20.447ZM5.337 7.433C4.193 7.433 3.274 6.507 3.274 5.368C3.274 4.23 4.194 3.305 5.337 3.305C6.477 3.305 7.401 4.23 7.401 5.368C7.401 6.507 6.476 7.433 5.337 7.433ZM7.119 20.452H3.555V9H7.119V20.452ZM22.225 0H1.771C0.792 0 0 0.774 0 1.729V22.271C0 23.227 0.792 24 1.771 24H22.222C23.2 24 24 23.227 24 22.271V1.729C24 0.774 23.2 0 22.222 0H22.225Z"/>
                </svg>
                Follow on LinkedIn
              </a>
            </div>
          </div>
        </div>

        {/* Separator Line with Gradient */}
        <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent mb-12"></div>

        {/* Bottom Section - Completely Redesigned */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
          
          {/* Copyright and Developer Credit */}
          <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
            <p className="text-gray-400 text-sm">
              © {currentYear} Julian D Rozario. All rights reserved.
            </p>
            <div className="hidden sm:block w-px h-4 bg-gray-600"></div>
            <div className="flex items-center gap-2">
              <span className="text-gray-400 text-sm">Designed & Developed by</span>
              <a
                href="https://toiral-development.web.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative text-sm font-semibold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent hover:from-purple-300 hover:to-blue-300 transition-all duration-300"
              >
                Toiral Web Development
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-500 to-blue-500 group-hover:w-full transition-all duration-300 rounded-full"></span>
              </a>
            </div>
          </div>

          {/* Social Links - Enhanced Design */}
          <div className="flex items-center gap-4">
            {socialLinks.map((social, index) => (
              <a
                key={social.name}
                href={social.href}
                target={social.name === 'LinkedIn' ? '_blank' : undefined}
                rel={social.name === 'LinkedIn' ? 'noopener noreferrer' : undefined}
                className={`group relative w-12 h-12 bg-gradient-to-r ${social.color} rounded-xl flex items-center justify-center text-white hover:scale-110 hover:rotate-3 transition-all duration-300 shadow-lg hover:shadow-xl overflow-hidden`}
                title={social.name}
              >
                <span className="relative z-10 group-hover:scale-110 transition-transform duration-300">
                  {social.icon}
                </span>
                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </a>
            ))}
          </div>

          {/* Enhanced Back to Top Button */}
          <button
            onClick={scrollToTop}
            className="group relative w-12 h-12 bg-gradient-to-r from-purple-600 via-purple-500 to-blue-600 rounded-xl flex items-center justify-center text-white hover:scale-110 hover:rotate-12 transition-all duration-300 shadow-lg hover:shadow-2xl hover:shadow-purple-500/30 overflow-hidden"
            title="Back to Top"
          >
            <span className="relative z-10 group-hover:scale-110 group-hover:-translate-y-1 transition-all duration-300">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 15L12 9L6 15"/>
              </svg>
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-500 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            {/* Ripple effect */}
            <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="absolute inset-0 rounded-xl bg-white/20 animate-ping"></div>
            </div>
          </button>
        </div>
      </div>

      {/* Bottom glow effect */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"></div>
    </footer>
  );
};

export default Footer;