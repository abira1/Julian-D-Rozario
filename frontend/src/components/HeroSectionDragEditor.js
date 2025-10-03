import React, { useState, useRef, useEffect } from 'react';

const HeroSectionDragEditor = () => {
  const containerRef = useRef(null);
  const imageContainerRef = useRef(null);
  
  // Initial positions for image and tags
  const [imagePosition, setImagePosition] = useState({ top: 0, left: 0 });
  const [tagPositions, setTagPositions] = useState([
    { top: 9, left: -147, rotate: -12, name: 'Business Relations' },
    { top: 57, left: 340, rotate: 8, name: '10+ Years' },
    { top: 176, left: -260, rotate: -3, name: 'Company Formation' },
    { top: 307, left: -146, rotate: -6, name: 'Dubai Expert' },
    { top: 251, left: 310, rotate: 8, name: 'UAE Specialist' }
  ]);

  const [draggingItem, setDraggingItem] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Handle mouse down on draggable items
  const handleMouseDown = (e, type, index = null) => {
    e.preventDefault();
    e.stopPropagation();
    
    const rect = e.currentTarget.getBoundingClientRect();
    const containerRect = imageContainerRef.current.getBoundingClientRect();
    
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    
    setDraggingItem({ type, index });
  };

  // Handle mouse move
  const handleMouseMove = (e) => {
    if (!draggingItem || !imageContainerRef.current) return;
    
    const containerRect = imageContainerRef.current.getBoundingClientRect();
    
    // Calculate new position relative to the image container center
    const centerX = containerRect.left + containerRect.width / 2;
    const centerY = containerRect.top + containerRect.height / 2;
    
    const newLeft = Math.round(e.clientX - centerX - dragOffset.x);
    const newTop = Math.round(e.clientY - centerY - dragOffset.y);
    
    if (draggingItem.type === 'image') {
      setImagePosition({ top: newTop, left: newLeft });
    } else if (draggingItem.type === 'tag') {
      setTagPositions(prev => {
        const newPositions = [...prev];
        newPositions[draggingItem.index] = {
          ...newPositions[draggingItem.index],
          top: newTop,
          left: newLeft
        };
        return newPositions;
      });
    }
  };

  // Handle mouse up
  const handleMouseUp = () => {
    setDraggingItem(null);
  };

  // Add global mouse event listeners
  useEffect(() => {
    if (draggingItem) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [draggingItem, dragOffset]);

  const services = [
    { name: 'Licenses', color: 'bg-purple-500' },
    { name: 'Company Setup', color: 'bg-blue-500' },
    { name: 'Business Development', color: 'bg-green-500' },
    { name: 'Corporate Advisory', color: 'bg-yellow-500' },
    { name: 'Immigration', color: 'bg-red-500' }
  ];

  const handleCTAClick = () => {
    const contactSection = document.getElementById('contact');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="relative flex min-h-screen bg-black">
      {/* Live Preview Panel - Left Side */}
      <div className="fixed left-0 top-0 bottom-0 w-80 bg-slate-950/95 backdrop-blur-lg border-r border-purple-500/30 z-50 overflow-y-auto">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="border-b border-purple-500/30 pb-4">
            <h2 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: 'Encode Sans Semi Expanded, sans-serif' }}>
              Live Preview
            </h2>
            <p className="text-sm text-gray-400">
              Drag elements to adjust positions
            </p>
          </div>

          {/* Image Position */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-purple-400 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Profile Image
            </h3>
            <div className="bg-black/50 rounded-lg p-4 space-y-2 border border-white/10">
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">Top:</span>
                <span className="text-white font-mono text-sm bg-purple-500/20 px-2 py-1 rounded">{imagePosition.top}px</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">Left:</span>
                <span className="text-white font-mono text-sm bg-purple-500/20 px-2 py-1 rounded">{imagePosition.left}px</span>
              </div>
            </div>
          </div>

          {/* Tags Positions */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-blue-400 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              Floating Tags
            </h3>
            {tagPositions.map((tag, index) => (
              <div key={index} className="bg-black/50 rounded-lg p-4 space-y-2 border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-2 h-2 rounded-full ${['bg-purple-400', 'bg-red-400', 'bg-blue-400', 'bg-green-400', 'bg-yellow-400'][index]}`}></div>
                  <span className="text-white font-semibold text-sm">{tag.name}</span>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-xs">Top:</span>
                    <span className="text-white font-mono text-xs bg-blue-500/20 px-2 py-1 rounded">{tag.top}px</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-xs">Left:</span>
                    <span className="text-white font-mono text-xs bg-blue-500/20 px-2 py-1 rounded">{tag.left}px</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-xs">Rotate:</span>
                    <span className="text-white font-mono text-xs bg-blue-500/20 px-2 py-1 rounded">{tag.rotate}°</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Instructions */}
          <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-lg p-4 border border-purple-500/20">
            <h4 className="text-white font-semibold mb-2 text-sm">Instructions:</h4>
            <ul className="text-gray-300 text-xs space-y-1">
              <li>• Click and drag the profile image</li>
              <li>• Click and drag any floating tag</li>
              <li>• Positions update in real-time</li>
              <li>• Copy final positions when done</li>
            </ul>
          </div>

          {/* Copy positions button */}
          <button
            onClick={() => {
              const positions = {
                image: imagePosition,
                tags: tagPositions
              };
              navigator.clipboard.writeText(JSON.stringify(positions, null, 2));
              alert('Positions copied to clipboard!');
            }}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all duration-200"
          >
            Copy All Positions
          </button>
        </div>
      </div>

      {/* Main Hero Section - Right Side with margin for preview panel */}
      <section 
        ref={containerRef}
        className="ml-80 flex-1 relative min-h-screen bg-gradient-to-br from-black via-slate-950 to-black overflow-hidden"
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
              <div className="flex items-center justify-center lg:justify-start">
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
              <div className="text-center lg:text-left">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight" style={{ fontFamily: 'Encode Sans Semi Expanded, sans-serif' }}>
                  <span className="text-white">Julian </span>
                  <span className="text-purple-400 relative">
                    D'Rozario
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transform scale-x-100 animate-pulse"></div>
                  </span>
                </h1>
              </div>

              {/* Professional Title */}
              <div className="text-center lg:text-left">
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-200 leading-relaxed" style={{ fontFamily: 'Encode Sans Semi Expanded, sans-serif' }}>
                  Business Relations Manager &<br />
                  Company Formation Specialist
                </h2>
              </div>

              {/* Supporting Tagline */}
              <div className="text-center lg:text-left">
                <p className="text-lg sm:text-xl text-gray-300 font-light leading-relaxed max-w-2xl">
                  Empowering Corporate Service Providers with End-to-End Licensing Expertise.
                </p>
              </div>

              {/* CTA Button */}
              <div className="flex justify-center lg:justify-start">
                <button
                  onClick={handleCTAClick}
                  className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl transition-all duration-300 hover:from-purple-700 hover:to-blue-700 hover:scale-[1.02] hover:shadow-xl hover:shadow-purple-500/25 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-black"
                  style={{ 
                    fontFamily: 'Encode Sans Semi Expanded, sans-serif'
                  }}
                >
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-400/20 to-blue-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
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

            {/* Right Column - Draggable Image with decorative elements */}
            <div className="flex justify-center lg:justify-end relative">
              <div className="relative" ref={imageContainerRef}>
                {/* Abstract background shape - blob */}
                <div className="absolute -inset-8 bg-gradient-to-br from-purple-500/20 to-blue-500/20 opacity-50 blur-3xl"
                  style={{
                    borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%'
                  }}
                ></div>
                
                {/* Draggable Main image container with blob shape */}
                <div 
                  className="relative z-20 p-8 cursor-move"
                  onMouseDown={(e) => handleMouseDown(e, 'image')}
                  style={{
                    transform: `translate(${imagePosition.left}px, ${imagePosition.top}px)`,
                    transition: draggingItem?.type === 'image' ? 'none' : 'transform 0.2s ease-out'
                  }}
                >
                  <div className="relative w-80 h-80 lg:w-96 lg:h-96 overflow-hidden shadow-2xl border-4 border-white/20 hover:border-purple-400/50 transition-all duration-200"
                    style={{
                      borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%'
                    }}
                  >
                    <img 
                      src="https://customer-assets.emergentagent.com/job_cd459998-3640-40ec-a059-7a5253a00dd1/artifacts/nm7o42x4_IMG-20210906-WA0002.png"
                      alt="Julian D'Rozario"
                      className="w-full h-full object-cover pointer-events-none"
                    />
                    {/* Drag indicator overlay */}
                    <div className="absolute inset-0 bg-purple-500/10 opacity-0 hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                      <div className="bg-black/80 px-4 py-2 rounded-lg">
                        <span className="text-white text-sm font-semibold">Drag to Move</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Draggable Floating tags - surrounding the blob (Desktop only) */}
                {tagPositions.map((position, index) => {
                  const colors = ['bg-purple-400', 'bg-red-400', 'bg-blue-400', 'bg-green-400', 'bg-yellow-400'];
                  return (
                    <div 
                      key={index}
                      className="hidden lg:block absolute bg-white/10 backdrop-blur-md px-4 py-2 rounded-full shadow-lg border border-white/20 z-30 whitespace-nowrap cursor-move hover:bg-white/20 hover:border-purple-400/50 hover:scale-105 transition-all duration-200"
                      style={{
                        transform: `translate(${position.left}px, ${position.top}px) rotate(${position.rotate}deg)`,
                        left: '50%',
                        top: '50%',
                        transition: draggingItem?.type === 'tag' && draggingItem?.index === index ? 'none' : 'transform 0.2s ease-out'
                      }}
                      onMouseDown={(e) => handleMouseDown(e, 'tag', index)}
                    >
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 ${colors[index]} rounded-full`}></div>
                        <span className="text-sm font-medium text-white">{position.name}</span>
                      </div>
                      {/* Drag indicator */}
                      <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-black/80 px-2 py-1 rounded text-xs text-white opacity-0 hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                        Drag to Move
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Modern Flowing Services Strip */}
          <div className="mt-16 pt-8 border-t border-white/5">
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
    </div>
  );
};

export default HeroSectionDragEditor;
