import React from 'react';
import MagicBento from './MagicBento';
import { servicesData } from '../data/mockData';

const ServicesSection = () => {
  return (
    <section id="services" className="relative py-24 px-4 bg-gradient-to-br from-slate-900 via-purple-900/10 to-slate-900 overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-gradient-to-r from-purple-500/3 to-blue-500/3 rounded-full filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/3 w-72 h-72 bg-gradient-to-r from-blue-500/3 to-purple-500/3 rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
            Services
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
            Comprehensive business consulting solutions tailored to drive growth and maximize your success
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-purple-500 to-blue-500 mx-auto rounded-full"></div>
        </div>

        {/* Magic Bento Grid */}
        <div className="flex justify-center">
          <MagicBento
            textAutoHide={true}
            enableStars={true}
            enableSpotlight={true}
            enableBorderGlow={true}
            enableTilt={true}
            enableMagnetism={true}
            clickEffect={true}
            spotlightRadius={250}
            particleCount={8}
            glowColor="139, 92, 246"
            cardData={servicesData}
          />
        </div>

        {/* Call to action */}
        <div className="text-center mt-16">
          <p className="text-lg text-gray-300 mb-8">
            Ready to transform your business? Let's discuss your specific needs.
          </p>
          <button 
            onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl text-white font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/25 backdrop-blur-sm border border-white/10"
          >
            Get Started Today
          </button>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;