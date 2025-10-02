import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { contactData } from '../data/mockData';

gsap.registerPlugin(ScrollTrigger);

const ContactSection = () => {
  const sectionRef = useRef(null);

  // Simple fade-in animation for contact info - Mobile-friendly version
  useEffect(() => {
    const section = sectionRef.current;
    const contactCard = section.querySelector('.contact-card');
    
    if (contactCard) {
      // Ensure the card is visible immediately on mobile
      gsap.set(contactCard, { opacity: 1, y: 0 });
      
      // Apply subtle entrance animation that works on all devices
      gsap.fromTo(contactCard,
        {
          opacity: 0,
          y: 20
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: "power2.out",
          delay: 0.2
        }
      );
    }
  }, []);

  const handleLinkedInClick = () => {
    window.open(contactData.linkedin, '_blank');
  };

  return (
    <section 
      ref={sectionRef}
      id="contact" 
      className="relative py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-black via-slate-950/40 to-black overflow-hidden"
    >
      {/* Background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-full filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="text-center mb-12 lg:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 lg:mb-6 bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent" style={{ fontFamily: 'Encode Sans Semi Expanded, sans-serif' }}>
            Let's Work Together
          </h2>
          <p className="text-lg lg:text-xl text-gray-300 max-w-3xl mx-auto mb-6 lg:mb-8 px-4">
            Ready to transform your business? Get in touch and let's discuss how I can help you achieve your goals.
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-purple-500 to-blue-500 mx-auto rounded-full"></div>
        </div>

        {/* Centered Contact Info */}
        <div className="flex justify-center">
          <div className="w-full max-w-lg">
            <div className="contact-card bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl border border-white/10 rounded-2xl lg:rounded-3xl p-6 lg:p-8 mb-6 lg:mb-8">
              <h3 className="text-xl lg:text-2xl font-semibold text-white mb-4 lg:mb-6 text-center" style={{ fontFamily: 'Encode Sans Semi Expanded, sans-serif' }}>Get in Touch</h3>
              
              <div className="space-y-6">
                {/* Email and Phone sections removed per user request - only LinkedIn remains */}
                <div className="text-center py-4">
                  <p className="text-gray-300 text-base lg:text-lg mb-4">
                    Ready to connect and discuss business opportunities?
                  </p>
                  <p className="text-gray-400 text-sm">
                    Let's explore how I can help transform your business goals into reality.
                  </p>
                </div>
              </div>
            </div>

            {/* LinkedIn CTA */}
            <button
              onClick={handleLinkedInClick}
              className="w-full group relative px-6 lg:px-8 py-3 lg:py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl lg:rounded-2xl text-white font-semibold text-base lg:text-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/25"
              style={{
                background: `
                  linear-gradient(135deg, rgba(59, 130, 246, 0.9), rgba(139, 92, 246, 0.9)),
                  rgba(255, 255, 255, 0.1)
                `,
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: `
                  0 8px 32px rgba(59, 130, 246, 0.3),
                  inset 0 1px 0 rgba(255, 255, 255, 0.2)
                `,
                fontFamily: 'Encode Sans Semi Expanded, sans-serif'
              }}
            >
              <span className="relative z-10 flex items-center justify-center gap-3">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.447 20.452H16.893V14.883C16.893 13.555 16.866 11.846 15.041 11.846C13.188 11.846 12.905 13.291 12.905 14.785V20.452H9.351V9H12.765V10.561H12.811C13.288 9.661 14.448 8.711 16.181 8.711C19.782 8.711 20.448 11.081 20.448 14.166V20.452H20.447ZM5.337 7.433C4.193 7.433 3.274 6.507 3.274 5.368C3.274 4.23 4.194 3.305 5.337 3.305C6.477 3.305 7.401 4.23 7.401 5.368C7.401 6.507 6.476 7.433 5.337 7.433ZM7.119 20.452H3.555V9H7.119V20.452ZM22.225 0H1.771C0.792 0 0 0.774 0 1.729V22.271C0 23.227 0.792 24 1.771 24H22.222C23.2 24 24 23.227 24 22.271V1.729C24 0.774 23.2 0 22.222 0H22.225Z"/>
                </svg>
                Connect on LinkedIn
              </span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;