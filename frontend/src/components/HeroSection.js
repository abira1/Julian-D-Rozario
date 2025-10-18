import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

const HeroSection = () => {
  const heroRef = useRef(null);
  const greetingRef = useRef(null);
  const nameRef = useRef(null);
  const titleRef = useRef(null);
  const taglineRef = useRef(null);
  const ctaRef = useRef(null);
  const imageRef = useRef(null);
  const tagsRef = useRef([]);
  const servicesRef = useRef(null);

  // Final tag positions - User-finalized positioning
  const tagPositions = [
    { top: -174, left: -413, rotate: -12, name: 'Business Relations' },
    { top: -119, left: 143, rotate: 8, name: '10+ Years' },
    { top: -43, left: -482, rotate: -3, name: 'Company Formation' },
    { top: 110, left: -381, rotate: -6, name: 'Dubai Expert' },
    { top: 57, left: 103, rotate: 8, name: 'UAE Specialist' }
  ];

  useEffect(() => {
    // Entrance animations
    const tl = gsap.timeline();
    
    tl.set([greetingRef.current, nameRef.current, titleRef.current, taglineRef.current, ctaRef.current, imageRef.current, servicesRef.current], { opacity: 0, y: 30 })
      .to(greetingRef.current, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" })
      .to(nameRef.current, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }, "-=0.6")
      .to(titleRef.current, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }, "-=0.6")
      .to(taglineRef.current, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }, "-=0.6")
      .to(ctaRef.current, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }, "-=0.6")
      .to(imageRef.current, { opacity: 1, y: 0, duration: 1, ease: "power3.out" }, "-=0.8")
      .to(servicesRef.current, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }, "-=0.4");

    // Tags entrance animation only - NO floating animations (fixed positions)
    tagsRef.current.forEach((tag, index) => {
      if (tag) {
        gsap.fromTo(tag, 
          { opacity: 0, scale: 0.8 },
          { 
            opacity: 1, 
            scale: 1,
            duration: 0.6,
            ease: "back.out(1.7)",
            delay: 1 + index * 0.1
          }
        );
      }
    });
  }, []);

  // Function to get tag style based on final position - center-based positioning
  const getTagStyle = (position) => {
    return {
      transform: `translate(${position.left}px, ${position.top}px) rotate(${position.rotate}deg)`,
      left: '50%',
      top: '50%'
    };
  };

  const handleCTAClick = () => {
    const contactSection = document.getElementById('contact');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const services = [
    { name: 'Licenses', color: 'bg-purple-500' },
    { name: 'Company Setup', color: 'bg-blue-500' },
    { name: 'Business Development', color: 'bg-green-500' },
    { name: 'Corporate Advisory', color: 'bg-yellow-500' },
    { name: 'Immigration', color: 'bg-red-500' }
  ];

  return (
    <section 
      ref={heroRef}
      className="hero-section relative min-h-screen bg-gradient-to-br from-black via-slate-950 to-black overflow-hidden"
      style={{
        background: `
          radial-gradient(circle at 20% 80%, rgba(94, 43, 151, 0.2) 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, rgba(59, 130, 246, 0.2) 0%, transparent 50%),
          linear-gradient(135deg, #000000 0%, #0a0a0a 50%, #000000 100%)
        `
      }}
    >
      {/* Glassmorphism overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-black/30 backdrop-blur-sm"></div>
      
      {/* Main content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center min-h-[80vh]">
          
          {/* Left Column - Typography Layout */}
          <div className="space-y-8">
            {/* Hello There! Label */}
            <div ref={greetingRef} className="flex items-center justify-center lg:justify-start">
              <div className="flex items-center space-x-4">
                <div className="w-8 h-0.5 bg-gradient-to-r from-purple-500 to-blue-500"></div>
                <div className="px-4 py-2 border-2 border-white/20 rounded-lg bg-white/5 backdrop-blur-sm shadow-sm">
                  <span className="text-white font-medium" style={{ fontFamily: 'Encode Sans Semi Expanded, sans-serif' }}>
                    Hi there...
                  </span>
                </div>
                <div className="w-8 h-0.5 bg-gradient-to-r from-purple-500 to-blue-500"></div>
              </div>
            </div>

            {/* Name with styling */}
            <div ref={nameRef} className="text-center lg:text-left">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight" style={{ fontFamily: 'Encode Sans Semi Expanded, sans-serif' }}>
                <span className="text-white">Julian </span>
                <span className="text-purple-400 relative">
                  D'Rozario
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transform scale-x-100 animate-pulse"></div>
                </span>
              </h1>
            </div>

            {/* Professional Title */}
            <div ref={titleRef} className="text-center lg:text-left">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-200 leading-relaxed" style={{ fontFamily: 'Encode Sans Semi Expanded, sans-serif' }}>
                Business Relations Manager &<br />
                Company Formation Specialist
              </h2>
            </div>

            {/* Supporting Tagline */}
            <div ref={taglineRef} className="text-center lg:text-left">
              <p className="text-lg sm:text-xl text-gray-300 font-light leading-relaxed max-w-2xl">
                Empowering Corporate Service Providers with End-to-End Licensing Expertise.
              </p>
            </div>

            {/* CTA Button */}
            <div ref={ctaRef} className="flex justify-center lg:justify-start">
              <button
                onClick={handleCTAClick}
                className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl transition-all duration-300 hover:from-purple-700 hover:to-blue-700 hover:scale-[1.02] hover:shadow-xl hover:shadow-purple-500/25 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-black"
                style={{ 
                  fontFamily: 'Encode Sans Semi Expanded, sans-serif'
                }}
              >
                {/* Subtle inner glow */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-400/20 to-blue-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                {/* Button content */}
                <span className="relative flex items-center space-x-3">
                  <svg className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
                  </svg>
                  <span>Let's Work Together</span>
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </span>
              </button>
            </div>
          </div>

          {/* Right Column - Image with decorative elements */}
          <div className="flex justify-center lg:justify-end relative">
            <div className="relative">
              {/* Abstract background shape - blob */}
              <div className="absolute -inset-8 bg-gradient-to-br from-purple-500/20 to-blue-500/20 opacity-50 blur-3xl"
                style={{
                  borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%'
                }}
              ></div>
              
              {/* Main image container with blob shape - Responsive positioning */}
              <div 
                className="relative z-20 p-8 lg-image-position" 
                ref={imageRef}
              >
                <div className="relative w-80 h-80 lg:w-96 lg:h-96 overflow-hidden shadow-2xl border-4 border-white/20"
                  style={{
                    borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%'
                  }}
                >
                  <img 
                    src="https://customer-assets.emergentagent.com/job_cd459998-3640-40ec-a059-7a5253a00dd1/artifacts/nm7o42x4_IMG-20210906-WA0002.png"
                    alt="Julian D'Rozario"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Floating tags - surrounding the blob (Desktop only) */}
              {tagPositions.map((position, index) => {
                const colors = ['bg-purple-400', 'bg-red-400', 'bg-blue-400', 'bg-green-400', 'bg-yellow-400'];
                return (
                  <div 
                    key={index}
                    ref={el => tagsRef.current[index] = el}
                    className="hidden lg:block absolute bg-white/10 backdrop-blur-md px-4 py-2 rounded-full shadow-lg border border-white/20 z-30 whitespace-nowrap"
                    style={getTagStyle(position)}
                  >
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 ${colors[index]} rounded-full`}></div>
                      <span className="text-sm font-medium text-white">{position.name}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modern Flowing Services Strip */}
        <div ref={servicesRef} className="mt-16 pt-8 border-t border-white/5">
          <div className="relative overflow-hidden">
            {/* Background flowing gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-blue-500/5 to-purple-500/5 animate-pulse"></div>
            
            {/* Flowing animation container */}
            <div className="relative">
              <div className="flex animate-marquee space-x-12 py-6">
                {[...services, ...services].map((service, index) => (
                  <div 
                    key={`${service.name}-${index}`}
                    className="group flex-shrink-0 flex items-center space-x-4 px-6 py-3 bg-white/5 backdrop-blur-sm rounded-full border border-white/10 hover:border-purple-400/30 hover:bg-white/10 transition-all duration-300 touch-interactive transform hover:scale-105 hover:shadow-lg hover:shadow-purple-500/20"
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(59, 130, 246, 0.15))';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '';
                    }}
                  >
                    <div className={`w-3 h-3 rounded-full ${service.color} group-hover:scale-125 transition-transform duration-200 shadow-lg`}></div>
                    <div className="flex flex-col">
                      <span 
                        className="font-semibold text-white text-sm whitespace-nowrap group-hover:text-purple-200 transition-colors duration-200" 
                        style={{ fontFamily: 'Encode Sans Semi Expanded, sans-serif' }}
                      >
                        {service.name}
                      </span>
                      <div className="w-0 group-hover:w-full h-0.5 bg-gradient-to-r from-purple-400 to-blue-400 transition-all duration-300 rounded-full"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Gradient fade edges */}
            <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-black to-transparent pointer-events-none z-10"></div>
            <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-black to-transparent pointer-events-none z-10"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;