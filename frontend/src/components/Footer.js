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
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.447 20.452H16.893V14.883C16.893 13.555 16.866 11.846 15.041 11.846C13.188 11.846 12.905 13.291 12.905 14.785V20.452H9.351V9H12.765V10.561H12.811C13.288 9.661 14.448 8.711 16.181 8.711C19.782 8.711 20.448 11.081 20.448 14.166V20.452H20.447ZM5.337 7.433C4.193 7.433 3.274 6.507 3.274 5.368C3.274 4.23 4.194 3.305 5.337 3.305C6.477 3.305 7.401 4.23 7.401 5.368C7.401 6.507 6.476 7.433 5.337 7.433ZM7.119 20.452H3.555V9H7.119V20.452ZM22.225 0H1.771C0.792 0 0 0.774 0 1.729V22.271C0 23.227 0.792 24 1.771 24H22.222C23.2 24 24 23.227 24 22.271V1.729C24 0.774 23.2 0 22.222 0H22.225Z"/>
        </svg>
      )
    },
    {
      name: 'Email',
      href: `mailto:${contactData.email}`,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z"/>
          <polyline points="22,6 12,13 2,6"/>
        </svg>
      )
    },
    {
      name: 'Phone',
      href: `tel:${contactData.phone}`,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 16.92V19.92C22 20.52 21.52 21 20.92 21C10.93 21 3 13.07 3 3.08C3 2.48 3.48 2 4.08 2H7.09C7.69 2 8.17 2.48 8.17 3.08C8.17 4.07 8.35 5.02 8.68 5.92C8.82 6.24 8.73 6.61 8.47 6.87L6.9 8.44C8.07 10.68 9.32 11.93 11.56 13.1L13.13 11.53C13.39 11.27 13.76 11.18 14.08 11.32C14.98 11.65 15.93 11.83 16.92 11.83C17.52 11.83 18 12.31 18 12.91V15.92C18 16.52 17.52 17 16.92 17C16.92 17 16.92 16.92 22 16.92Z"/>
        </svg>
      )
    }
  ];

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative bg-gradient-to-br from-slate-900 via-purple-900/30 to-slate-900 border-t border-white/10">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/4 w-80 h-80 bg-gradient-to-r from-purple-500/5 to-blue-500/5 rounded-full filter blur-3xl"></div>
        <div className="absolute -top-40 right-1/4 w-60 h-60 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-full filter blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-12 mb-12">
          {/* Brand Section */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <img 
                src="/jdr-logo.png" 
                alt="Julian D Rozario Logo" 
                className="w-12 h-12"
              />
              <div>
                <h3 className="text-xl font-bold text-white">Julian D Rozario</h3>
                <p className="text-gray-400 text-sm">Business Consultant & Licensing Advisor</p>
              </div>
            </div>
            <p className="text-gray-300 leading-relaxed">
              Transforming businesses through strategic consulting and innovative licensing solutions. 
              Let's work together to unlock your business potential.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h4 className="text-lg font-semibold text-white">Quick Links</h4>
            <div className="space-y-3">
              {['About', 'Services', 'Blog', 'Contact'].map((item) => (
                <button
                  key={item}
                  onClick={() => document.getElementById(item.toLowerCase())?.scrollIntoView({ behavior: 'smooth' })}
                  className="block text-gray-300 hover:text-purple-400 transition-colors duration-300"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            <h4 className="text-lg font-semibold text-white">Contact Info</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-gray-300">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10C21 17 12 23 12 23S3 17 3 10C3 5.03 7.03 1 12 1S21 5.03 21 10Z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                <span>{contactData.location}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
                <span>{contactData.email}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12,6 12,12 16,14"/>
                </svg>
                <span className="text-green-400">{contactData.availability}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-gray-400 text-sm">
            © {currentYear} Julian D Rozario. All rights reserved.
          </p>

          {/* Social Links */}
          <div className="flex items-center gap-4">
            {socialLinks.map((social) => (
              <a
                key={social.name}
                href={social.href}
                target={social.name === 'LinkedIn' ? '_blank' : undefined}
                rel={social.name === 'LinkedIn' ? 'noopener noreferrer' : undefined}
                className="w-10 h-10 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-purple-600/20 hover:border-purple-500/30 transition-all duration-300 group"
                title={social.name}
              >
                {social.icon}
              </a>
            ))}
          </div>

          {/* Back to Top */}
          <button
            onClick={scrollToTop}
            className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center text-white hover:scale-110 transition-all duration-300 group"
            title="Back to Top"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-y-0.5 transition-transform duration-300">
              <path d="M18 15L12 9L6 15"/>
            </svg>
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;