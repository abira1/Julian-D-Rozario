import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useNavigate } from 'react-router-dom';
import GradualBlur from './GradualBlur';
import { blogData } from '../data/mockData';

gsap.registerPlugin(ScrollTrigger);

const BlogCard = ({ blog, index, gridPosition }) => {
  const cardRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const card = cardRef.current;
    
    // Entrance animation
    gsap.fromTo(card,
      {
        opacity: 0,
        y: 30,
        scale: 0.95
      },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.6,
        ease: "power3.out",
        scrollTrigger: {
          trigger: card,
          start: "top 85%",
          toggleActions: "play none none reverse"
        },
        delay: index * 0.1
      }
    );

    // Hover animations
    const handleMouseEnter = () => {
      gsap.to(card, {
        y: -8,
        scale: 1.02,
        duration: 0.3,
        ease: "power2.out"
      });
    };

    const handleMouseLeave = () => {
      gsap.to(card, {
        y: 0,
        scale: 1,
        duration: 0.3,
        ease: "power2.out"
      });
    };

    card.addEventListener('mouseenter', handleMouseEnter);
    card.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      card.removeEventListener('mouseenter', handleMouseEnter);
      card.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [index]);

  const handleCardClick = () => {
    navigate(`/blog/${blog.id}`);
  };

  // Compact Bento-style grid positioning - smaller cards
  const getBentoClass = () => {
    const positions = {
      0: 'md:col-span-2 md:row-span-1', // Medium featured (reduced from span-2)
      1: 'md:col-span-1 md:row-span-1', // Small
      2: 'md:col-span-1 md:row-span-1', // Small  
      3: 'md:col-span-2 md:row-span-1', // Wide (but shorter)
      4: 'md:col-span-1 md:row-span-1', // Small
      5: 'md:col-span-1 md:row-span-1', // Small (reduced from tall)
      6: 'md:col-span-1 md:row-span-1', // Small
      7: 'md:col-span-1 md:row-span-1', // Small
    };
    return positions[gridPosition] || 'md:col-span-1 md:row-span-1';
  };

  const isFeatured = gridPosition === 0;
  const isWide = gridPosition === 3;

  return (
    <article 
      ref={cardRef}
      onClick={handleCardClick}
      className={`group relative bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden hover:border-purple-500/30 transition-all duration-300 cursor-pointer ${getBentoClass()}`}
      style={{
        background: `
          linear-gradient(135deg, 
            rgba(139, 92, 246, 0.08) 0%, 
            rgba(59, 130, 246, 0.04) 50%, 
            rgba(30, 58, 138, 0.08) 100%
          )
        `,
        boxShadow: `
          0 10px 25px rgba(0, 0, 0, 0.15),
          inset 0 1px 0 rgba(255, 255, 255, 0.1)
        `,
        transformStyle: 'preserve-3d'
      }}
    >
      {/* Glow effect */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-600/10 to-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      {/* Floating elements */}
      <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-bounce"></div>

      {/* Image */}
      <div className={`relative overflow-hidden ${isLarge ? 'h-48 lg:h-72' : isTall ? 'h-64' : isWide ? 'h-32' : 'h-32'}`}>
        <img 
          src={blog.image} 
          alt={blog.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
        
        {/* Category badge */}
        <div className="absolute top-3 left-3 px-2 py-1 bg-gradient-to-r from-purple-600/90 to-blue-600/90 backdrop-blur-sm rounded-lg text-white text-xs font-medium border border-white/20 shadow-lg">
          {blog.category}
        </div>

        {/* Reading time */}
        <div className="absolute top-3 right-3 px-2 py-1 bg-black/50 backdrop-blur-sm rounded-lg text-white text-xs border border-white/20">
          {blog.readTime}
        </div>
      </div>

      {/* Content */}
      <div className={`relative z-10 ${isLarge ? 'p-6' : isWide ? 'p-4' : 'p-4'}`}>
        <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
          <span>{new Date(blog.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
          <div className="flex items-center gap-1">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M1 12S5 4 12 4S23 12 23 12S19 20 12 20S1 12 1 12Z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
            <span>{blog.views}</span>
          </div>
        </div>

        <h3 className={`font-semibold text-white mb-2 group-hover:text-purple-300 transition-colors duration-300 line-clamp-2 ${isLarge ? 'text-xl' : isWide ? 'text-base' : 'text-sm'}`}>
          {blog.title}
        </h3>

        {(isLarge || isTall) && (
          <p className="text-gray-300 text-sm leading-relaxed mb-3 line-clamp-2">
            {blog.excerpt}
          </p>
        )}

        {/* Tags - only for large cards */}
        {isLarge && (
          <div className="flex flex-wrap gap-1 mb-3">
            {blog.tags?.slice(0, 2).map((tag, idx) => (
              <span 
                key={idx}
                className="px-2 py-1 bg-white/5 border border-white/10 rounded-md text-xs text-gray-400"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white text-xs font-semibold">
              JR
            </div>
            <div className="text-gray-400 text-xs">{blog.author}</div>
          </div>

          <div className="flex items-center gap-1 text-xs text-gray-500">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20.84 4.61C20.3292 4.099 19.7228 3.69364 19.0554 3.41708C18.3879 3.14052 17.6725 2.99817 16.95 3C16.3128 3.00364 15.6865 3.15523 15.1146 3.44361C14.5427 3.73198 14.0389 4.14704 13.64 4.66L12 6.78L10.36 4.66C9.96104 4.14704 9.45727 3.73198 8.88537 3.44361C8.31348 3.15523 7.68717 3.00364 7.05 3C6.32755 2.99817 5.61208 3.14052 4.94463 3.41708C4.27718 3.69364 3.67075 4.099 3.16 4.61C2.14821 5.6228 1.58407 7.01368 1.58407 8.465C1.58407 9.91632 2.14821 11.3072 3.16 12.32L12 21.16L20.84 12.32C21.8518 11.3072 22.4159 9.91632 22.4159 8.465C22.4159 7.01368 21.8518 5.6228 20.84 4.61Z"/>
            </svg>
            <span>{blog.likes}</span>
          </div>
        </div>
      </div>

      {/* Subtle gradual blur overlay */}
      <div className="absolute inset-0 pointer-events-none">
        <GradualBlur
          position="bottom"
          height="2rem"
          strength={0.8}
          divCount={3}
          opacity={0.2}
        />
      </div>
    </article>
  );
};

const BlogSection = () => {
  return (
    <section id="blog" className="relative py-20 px-4 bg-gradient-to-br from-slate-900 via-purple-900/15 to-slate-900 overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-purple-500/3 to-blue-500/3 rounded-full filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 left-1/4 w-60 h-60 bg-gradient-to-r from-blue-500/3 to-purple-500/3 rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
            Latest Insights
          </h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto mb-6">
            Expert analysis and strategic insights from the world of business consulting
          </p>
          <div className="w-20 h-1 bg-gradient-to-r from-purple-500 to-blue-500 mx-auto rounded-full"></div>
        </div>

        {/* Bento-style Blog Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
          {blogData.slice(0, 8).map((blog, index) => (
            <BlogCard 
              key={blog.id} 
              blog={blog} 
              index={index} 
              gridPosition={index}
            />
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center">
          <button 
            onClick={() => window.location.href = '/blog'}
            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl text-white font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/25 backdrop-blur-sm border border-white/10"
          >
            View All Articles
          </button>
        </div>
      </div>
    </section>
  );
};

export default BlogSection;