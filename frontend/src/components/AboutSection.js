import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { aboutData } from '../data/mockData';
import { SectionTransition } from './LoadingSystem';

gsap.registerPlugin(ScrollTrigger);

const AboutSection = () => {
  const sectionRef = useRef(null);
  const profileCardRef = useRef(null);
  const statsRef = useRef([]);
  const [countersStarted, setCountersStarted] = useState(false);
  // WorkedWith functionality removed as requested

  useEffect(() => {
    const section = sectionRef.current;
    const profileCard = profileCardRef.current;

    // WorkedWith fetch removed

    // Profile card 3D animation
    gsap.fromTo(profileCard, 
      { 
        opacity: 0, 
        rotateX: 30, 
        rotateY: -15, 
        z: -100 
      },
      {
        opacity: 1,
        rotateX: 0,
        rotateY: 0,
        z: 0,
        duration: 1.5,
        ease: "power3.out",
        scrollTrigger: {
          trigger: section,
          start: "top 60%",
          end: "bottom 40%",
          toggleActions: "play none none reverse"
        }
      }
    );

    // Stats animation trigger
    ScrollTrigger.create({
      trigger: section,
      start: "top 50%",
      onEnter: () => {
        if (!countersStarted) {
          setCountersStarted(true);
          animateCounters();
        }
      }
    });

    return () => {
      ScrollTrigger.getAll().forEach(st => st.kill());
    };
  }, [countersStarted]);

  const animateCounters = () => {
    aboutData.stats.forEach((stat, index) => {
      const element = statsRef.current[index];
      if (element) {
        // Skip animation for text-only stats
        if (stat.isText) {
          element.innerText = stat.number;
          return;
        }
        
        const finalNumber = parseInt(stat.number.replace(/\D/g, ''));
        const suffix = stat.number.replace(/\d/g, '');
        
        gsap.fromTo(element, 
          { innerText: 0 },
          {
            innerText: finalNumber,
            duration: 2,
            ease: "power2.out",
            snap: { innerText: 1 },
            onUpdate: function() {
              element.innerText = Math.ceil(this.targets()[0].innerText) + suffix;
            },
            delay: index * 0.2
          }
        );
      }
    });
  };

  return (
    <SectionTransition>
      <section 
        ref={sectionRef}
        id="about" 
        className="relative py-24 px-4 bg-gradient-to-br from-black via-slate-950/50 to-black overflow-hidden"
      >
      {/* Background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-purple-500/5 to-blue-500/5 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-1/4 left-1/4 w-72 h-72 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-full filter blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
            About Me
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-purple-500 to-blue-500 mx-auto rounded-full"></div>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Profile Card */}
          <div 
            ref={profileCardRef}
            className="relative"
            style={{ transformStyle: 'preserve-3d' }}
          >
            <div 
              className="relative p-8 rounded-3xl backdrop-blur-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] shadow-2xl"
              style={{
                background: `
                  linear-gradient(135deg, 
                    rgba(139, 92, 246, 0.1) 0%, 
                    rgba(59, 130, 246, 0.05) 50%, 
                    rgba(30, 58, 138, 0.1) 100%
                  )
                `,
                boxShadow: `
                  0 25px 50px rgba(0, 0, 0, 0.3),
                  0 0 0 1px rgba(255, 255, 255, 0.1),
                  inset 0 1px 0 rgba(255, 255, 255, 0.2)
                `
              }}
            >
              <h3 className="text-2xl font-semibold text-white mb-4 text-center" style={{ fontFamily: 'Encode Sans Semi Expanded, sans-serif' }}>Julian D'Rozario</h3>
              
              <p className="text-gray-300 leading-relaxed mb-6">
                {aboutData.description}
              </p>

              {/* Skills */}
              <div className="space-y-3">
                <h4 className="text-lg font-semibold text-purple-300 mb-4">Core Expertise</h4>
                <div className="grid grid-cols-2 gap-3">
                  {aboutData.skills.map((skill, index) => (
                    <div 
                      key={index}
                      className="flex items-center gap-2 text-sm text-gray-300 bg-white/5 rounded-lg px-3 py-2 backdrop-blur-sm border border-white/10"
                    >
                      <div className="w-2 h-2 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full"></div>
                      {skill}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Floating elements around the card */}
            <div className="absolute -top-4 -right-4 w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
            <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-bounce" style={{ animationDelay: '1s' }}></div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-6">
            {aboutData.stats.map((stat, index) => (
              <div 
                key={index}
                className="relative group text-center p-8 rounded-2xl backdrop-blur-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] hover:border-purple-500/30 transition-all duration-300"
                style={{
                  background: `
                    linear-gradient(135deg, 
                      rgba(139, 92, 246, 0.05) 0%, 
                      rgba(59, 130, 246, 0.02) 100%
                    )
                  `,
                  boxShadow: `
                    0 10px 30px rgba(0, 0, 0, 0.2),
                    inset 0 1px 0 rgba(255, 255, 255, 0.1)
                  `
                }}
              >
                {/* Glow effect on hover */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-600/10 to-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <div className="relative z-10">
                  <div 
                    ref={el => statsRef.current[index] = el}
                    className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent"
                  >
                    {stat.number}
                  </div>
                  <div className="text-gray-300 font-medium">{stat.label}</div>
                </div>

                {/* Animated border */}
                <div className="absolute inset-0 rounded-2xl border-2 border-transparent bg-gradient-to-r from-purple-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)', maskComposite: 'subtract' }}></div>
              </div>
            ))}
          </div>
        </div>

        {/* Worked With Partners Section removed as requested */}
      </div>
    </section>
    </SectionTransition>
  );
};

export default AboutSection;