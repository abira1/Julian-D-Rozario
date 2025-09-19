import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import GradualBlur from './GradualBlur';
import { heroData } from '../data/mockData';

const HeroSection = () => {
  const heroRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const ctaRef = useRef(null);
  const particlesRef = useRef([]);

  useEffect(() => {
    // Create floating particles
    const createParticles = () => {
      const particleCount = 20;
      const hero = heroRef.current;
      
      for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'floating-particle';
        particle.style.cssText = `
          position: absolute;
          width: ${Math.random() * 6 + 2}px;
          height: ${Math.random() * 6 + 2}px;
          background: radial-gradient(circle, rgba(139, 92, 246, 0.8), rgba(59, 130, 246, 0.4));
          border-radius: 50%;
          left: ${Math.random() * 100}%;
          top: ${Math.random() * 100}%;
          pointer-events: none;
          z-index: 1;
        `;
        hero.appendChild(particle);
        particlesRef.current.push(particle);

        // Animate particles
        gsap.to(particle, {
          y: Math.random() * 100 - 50,
          x: Math.random() * 100 - 50,
          rotation: Math.random() * 360,
          duration: 3 + Math.random() * 4,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: Math.random() * 2
        });

        gsap.to(particle, {
          opacity: Math.random() * 0.5 + 0.3,
          duration: 2 + Math.random() * 2,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut"
        });
      }
    };

    // Entrance animations
    const tl = gsap.timeline();
    
    tl.set([titleRef.current, subtitleRef.current, ctaRef.current], { opacity: 0, y: 50 })
      .to(titleRef.current, { 
        opacity: 1, 
        y: 0, 
        duration: 1.2, 
        ease: "power3.out" 
      })
      .to(subtitleRef.current, { 
        opacity: 1, 
        y: 0, 
        duration: 1, 
        ease: "power3.out" 
      }, "-=0.8")
      .to(ctaRef.current, { 
        opacity: 1, 
        y: 0, 
        duration: 0.8, 
        ease: "power3.out" 
      }, "-=0.6");

    createParticles();

    return () => {
      particlesRef.current.forEach(particle => {
        if (particle.parentNode) {
          particle.parentNode.removeChild(particle);
        }
      });
      particlesRef.current = [];
    };
  }, []);

  const handleCTAClick = () => {
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section 
      ref={heroRef}
      className="hero-section relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900"
      style={{
        background: `
          radial-gradient(circle at 20% 80%, rgba(94, 43, 151, 0.3) 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, rgba(59, 130, 246, 0.3) 0%, transparent 50%),
          radial-gradient(circle at 40% 40%, rgba(139, 92, 246, 0.2) 0%, transparent 50%),
          linear-gradient(135deg, rgba(30, 58, 138, 0.8), rgba(15, 23, 42, 0.9))
        `
      }}
    >
      {/* Glassmorphism overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-black/20 backdrop-blur-sm"></div>
      
      {/* Animated geometric shapes */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full mix-blend-multiply filter blur-xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Main content */}
      <div className="relative z-10 text-center px-4 max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 
            ref={titleRef}
            className="text-4xl sm:text-5xl md:text-8xl lg:text-9xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent leading-tight"
            style={{
              fontFamily: 'Poppins, sans-serif',
              textShadow: '0 0 50px rgba(139, 92, 246, 0.3)',
              transform: 'perspective(1000px) rotateX(5deg)'
            }}
          >
            Hi, I'm<br />
            <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-purple-300 bg-clip-text text-transparent">
              {heroData.name}
            </span>
          </h1>
          
          <div className="relative">
            <h2 
              ref={subtitleRef}
              className="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-semibold mb-6 sm:mb-8 text-gray-200 opacity-90"
              style={{
                textShadow: '0 0 30px rgba(59, 130, 246, 0.5)'
              }}
            >
              {heroData.title}
            </h2>
            
            <p className="text-base sm:text-lg md:text-xl text-gray-300 mb-8 sm:mb-10 max-w-3xl mx-auto leading-relaxed px-4">
              {heroData.subtitle}
            </p>
          </div>
        </div>

        {/* Enhanced Mobile-Friendly CTA Button */}
        <div ref={ctaRef} className="flex justify-center">
          <button
            onClick={handleCTAClick}
            className="group relative px-8 sm:px-12 py-3 sm:py-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl text-white font-semibold text-base sm:text-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/25"
            style={{
              background: `
                linear-gradient(135deg, rgba(139, 92, 246, 0.9), rgba(59, 130, 246, 0.9)),
                rgba(255, 255, 255, 0.1)
              `,
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: `
                0 8px 32px rgba(139, 92, 246, 0.3),
                inset 0 1px 0 rgba(255, 255, 255, 0.2)
              `,
              transform: 'perspective(1000px) rotateX(5deg) rotateY(-2deg)'
            }}
          >
            <span className="relative z-10 flex items-center gap-2 sm:gap-3">
              {heroData.cta}
              <svg 
                width="18" 
                height="18" 
                viewBox="0 0 24 24" 
                fill="none" 
                className="transform group-hover:translate-x-1 transition-transform duration-300 sm:w-5 sm:h-5"
              >
                <path 
                  d="M5 12H19M19 12L12 5M19 12L12 19" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            
            {/* Button glow effect */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-xl"></div>
          </button>
        </div>
      </div>

      {/* Gradual blur at bottom */}
      <GradualBlur
        position="bottom"
        height="8rem"
        strength={3}
        divCount={8}
        curve="bezier"
        opacity={0.8}
      />

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white/60 animate-bounce">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M12 5V19M12 19L19 12M12 19L5 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </section>
  );
};

export default HeroSection;