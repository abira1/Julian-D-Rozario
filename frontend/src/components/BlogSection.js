import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import GradualBlur from './GradualBlur';
import { blogData } from '../data/mockData';

gsap.registerPlugin(ScrollTrigger);

const BlogCard = ({ blog, index }) => {
  const cardRef = useRef(null);

  useEffect(() => {
    const card = cardRef.current;
    
    // Entrance animation
    gsap.fromTo(card,
      {
        opacity: 0,
        y: 50,
        rotateX: 15,
        scale: 0.9
      },
      {
        opacity: 1,
        y: 0,
        rotateX: 0,
        scale: 1,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: card,
          start: "top 80%",
          toggleActions: "play none none reverse"
        },
        delay: index * 0.1
      }
    );

    // Hover animations
    const handleMouseEnter = () => {
      gsap.to(card, {
        y: -10,
        rotateX: 5,
        rotateY: 5,
        scale: 1.02,
        duration: 0.3,
        ease: "power2.out"
      });
    };

    const handleMouseLeave = () => {
      gsap.to(card, {
        y: 0,
        rotateX: 0,
        rotateY: 0,
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

  return (
    <article 
      ref={cardRef}
      className="group relative bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden hover:border-purple-500/30 transition-all duration-300 cursor-pointer"
      style={{
        background: `
          linear-gradient(135deg, 
            rgba(139, 92, 246, 0.1) 0%, 
            rgba(59, 130, 246, 0.05) 50%, 
            rgba(30, 58, 138, 0.1) 100%
          )
        `,
        boxShadow: `
          0 20px 40px rgba(0, 0, 0, 0.2),
          inset 0 1px 0 rgba(255, 255, 255, 0.1)
        `,
        transformStyle: 'preserve-3d'
      }}
    >
      {/* Glow effect */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-purple-600/10 to-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <img 
          src={blog.image} 
          alt={blog.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
        
        {/* Category badge */}
        <div className="absolute top-4 left-4 px-3 py-1 bg-gradient-to-r from-purple-600/80 to-blue-600/80 backdrop-blur-sm rounded-full text-white text-sm font-medium border border-white/20">
          {blog.category}
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 p-6">
        <div className="flex items-center justify-between text-sm text-gray-400 mb-3">
          <span>{new Date(blog.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
          <span>{blog.readTime}</span>
        </div>

        <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-purple-300 transition-colors duration-300 line-clamp-2">
          {blog.title}
        </h3>

        <p className="text-gray-300 text-sm leading-relaxed mb-4 line-clamp-3">
          {blog.excerpt}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
              JR
            </div>
            <span className="text-gray-400 text-sm">{blog.author}</span>
          </div>

          <button className="flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors duration-300 text-sm font-medium">
            Read More
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Gradual blur overlay */}
      <div className="absolute inset-0 pointer-events-none">
        <GradualBlur
          position="bottom"
          height="3rem"
          strength={1}
          divCount={3}
          opacity={0.3}
        />
      </div>
    </article>
  );
};

const BlogSection = () => {
  return (
    <section id="blog" className="relative py-24 px-4 bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-purple-500/5 to-blue-500/5 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-1/4 left-1/4 w-72 h-72 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-full filter blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
            Latest Insights
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
            Stay updated with the latest trends and strategies in business consulting and licensing
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-purple-500 to-blue-500 mx-auto rounded-full"></div>
        </div>

        {/* Blog Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {blogData.slice(0, 6).map((blog, index) => (
            <BlogCard key={blog.id} blog={blog} index={index} />
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center">
          <button className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl text-white font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/25 backdrop-blur-sm border border-white/10">
            View All Articles
          </button>
        </div>
      </div>
    </section>
  );
};

export default BlogSection;