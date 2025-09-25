import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

const WorkedWithSection = () => {
  const sectionRef = useRef(null);
  const titleRef = useRef(null);
  const flowingRef = useRef(null);

  useEffect(() => {
    // Entrance animations
    const tl = gsap.timeline();
    
    tl.set([titleRef.current, flowingRef.current], { opacity: 0, y: 30 })
      .to(titleRef.current, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" })
      .to(flowingRef.current, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }, "-=0.4");
  }, []);

  // Company logos and names that Julian has worked with
  const companies = [
    { 
      name: 'Meydan Free Zone Authority', 
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Google_2015_logo.svg/368px-Google_2015_logo.svg.png', // Placeholder - will replace with actual logos
      category: 'Free Zone Authority'
    },
    { 
      name: 'Dubai South', 
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Apple_logo_black.svg/814px-Apple_logo_black.svg.png',
      category: 'Free Zone'
    },
    { 
      name: 'JAFZA', 
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Microsoft_logo_%282012%29.svg/512px-Microsoft_logo_%282012%29.svg.png',
      category: 'Free Zone Authority'
    },
    { 
      name: 'DMCC', 
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/IBM_logo.svg/512px-IBM_logo.svg.png',
      category: 'Commodities Centre'
    },
    { 
      name: 'Dubai Chamber', 
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Adobe_Systems_logo_and_wordmark.svg/512px-Adobe_Systems_logo_and_wordmark.svg.png',
      category: 'Business Chamber'
    },
    { 
      name: 'Emirates NBD', 
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Netflix_2015_logo.svg/512px-Netflix_2015_logo.svg.png',
      category: 'Banking Partner'
    },
    { 
      name: 'ADCB', 
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Amazon_logo.svg/512px-Amazon_logo.svg.png',
      category: 'Banking Partner'
    },
    { 
      name: 'Mashreq Bank', 
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Spotify_logo_RGB_Black.png/512px-Spotify_logo_RGB_Black.png',
      category: 'Banking Partner'
    }
  ];

  return (
    <section 
      ref={sectionRef}
      className="relative py-20 bg-gradient-to-b from-black via-slate-950/50 to-black overflow-hidden"
      style={{
        background: `
          radial-gradient(circle at 30% 70%, rgba(94, 43, 151, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 70% 30%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
          linear-gradient(135deg, #000000 0%, #0f0f0f 50%, #000000 100%)
        `
      }}
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/5 to-transparent"></div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Title */}
        <div ref={titleRef} className="text-center mb-16">
          <h2 
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4"
            style={{ fontFamily: 'Encode Sans Semi Expanded, sans-serif' }}
          >
            Worked With
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full mx-auto mb-6"></div>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Trusted by leading organizations across Dubai and UAE for business formation, 
            licensing, and corporate advisory services
          </p>
        </div>

        {/* Flowing Companies Strip */}
        <div ref={flowingRef} className="relative">
          <div className="relative overflow-hidden">
            {/* Background flowing gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-blue-500/5 to-purple-500/5 animate-pulse"></div>
            
            {/* Flowing animation container */}
            <div className="relative">
              <div className="flex animate-marquee space-x-16 py-8">
                {[...companies, ...companies].map((company, index) => (
                  <div 
                    key={`${company.name}-${index}`}
                    className="group flex-shrink-0 flex flex-col items-center space-y-4 px-8 py-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:border-purple-400/30 hover:bg-white/10 transition-all duration-300 cursor-pointer transform hover:scale-105 hover:shadow-xl hover:shadow-purple-500/20 min-w-[200px]"
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(59, 130, 246, 0.1))';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '';
                    }}
                  >
                    {/* Company Logo */}
                    <div className="w-16 h-16 bg-white rounded-xl p-3 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      <img 
                        src={company.logo} 
                        alt={`${company.name} logo`}
                        className="w-full h-full object-contain"
                        style={{ filter: 'grayscale(100%) brightness(0.2)' }}
                      />
                    </div>
                    
                    {/* Company Info */}
                    <div className="text-center">
                      <h3 
                        className="font-bold text-white text-sm whitespace-nowrap group-hover:text-purple-200 transition-colors duration-200 mb-1" 
                        style={{ fontFamily: 'Encode Sans Semi Expanded, sans-serif' }}
                      >
                        {company.name}
                      </h3>
                      <p className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors duration-200">
                        {company.category}
                      </p>
                      <div className="w-0 group-hover:w-full h-0.5 bg-gradient-to-r from-purple-400 to-blue-400 transition-all duration-300 rounded-full mt-2 mx-auto"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Gradient fade edges */}
            <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-black to-transparent pointer-events-none z-10"></div>
            <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-black to-transparent pointer-events-none z-10"></div>
          </div>
        </div>

        {/* Bottom decorative line */}
        <div className="mt-16 flex justify-center">
          <div className="w-64 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
        </div>
      </div>
    </section>
  );
};

export default WorkedWithSection;