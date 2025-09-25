import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { blogData } from '../data/mockData';
import { database } from '../firebase/config';
import { ref, on, off } from 'firebase/database';

const BlogSection = () => {
  const sectionRef = useRef(null);
  const navigate = useNavigate();
  const [loadedImages, setLoadedImages] = useState(new Set());

  // Preload images for better performance
  useEffect(() => {
    const preloadImages = async () => {
      const imagePromises = blogData.slice(0, 6).map((article) => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => {
            setLoadedImages(prev => new Set([...prev, article.id]));
            resolve(article.id);
          };
          img.onerror = reject;
          img.src = article.image;
        });
      });
      
      try {
        await Promise.allSettled(imagePromises);
      } catch (error) {
        console.log('Some images failed to preload:', error);
      }
    };

    preloadImages();
  }, []);

  const handleArticleClick = (articleId) => {
    navigate(`/blog/${articleId}`);
  };

  const handleViewAllClick = () => {
    navigate('/blog');
  };

  // Show 6 articles in uniform grid

  return (
    <section 
      ref={sectionRef}
      id="blog" 
      className="relative py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-black via-slate-950/50 to-black"
    >
      {/* Background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-purple-500/[0.03] to-blue-500/[0.03] rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-gradient-to-r from-blue-500/[0.03] to-purple-500/[0.03] rounded-full filter blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12 lg:mb-16">
          <h2 
            className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent leading-tight"
            style={{ fontFamily: 'Encode Sans Semi Expanded, sans-serif' }}
          >
            Latest Insights
          </h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Expert perspectives on Dubai business formation, UAE licensing, and corporate advisory services
          </p>
        </div>

        {/* Desktop Layout - Uniform Grid (768px and above) */}
        <div className="hidden min-[768px]:block">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
            {blogData.slice(0, 6).map((article, index) => (
              <div
                key={article.id}
                onClick={() => handleArticleClick(article.id)}
                className="group cursor-pointer bg-white/[0.02] backdrop-blur-sm rounded-xl overflow-hidden border border-white/[0.05] hover:border-white/[0.15] transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-purple-500/10 opacity-100"
                style={{ 
                  opacity: 1, 
                  transform: 'translateY(0px)',
                  animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`
                }}
              >
                {/* Image */}
                <div className="relative h-48 overflow-hidden bg-slate-800">
                  {loadedImages.has(article.id) ? (
                    <img 
                      src={article.image} 
                      alt={article.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-700 animate-pulse flex items-center justify-center">
                      <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                  
                  {/* Category Badge */}
                  <div className="absolute top-3 left-3 px-3 py-1 bg-purple-600/90 backdrop-blur-sm rounded-full text-white text-xs font-medium">
                    {article.category}
                  </div>
                  
                  {/* Featured Badge - only for first article */}
                  {index === 0 && (
                    <div className="absolute top-3 right-3 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-black text-xs font-medium">
                      Featured
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-5">
                  <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
                    <span>{new Date(article.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    <span>•</span>
                    <span>{article.readTime}</span>
                    <span>•</span>
                    <span>{article.views} views</span>
                  </div>

                  <h3 className="text-base font-bold text-white mb-3 leading-tight group-hover:text-purple-200 transition-colors duration-300 line-clamp-2">
                    {article.title}
                  </h3>

                  <p className="text-sm text-gray-300 leading-relaxed line-clamp-3 mb-4">
                    {article.excerpt}
                  </p>

                  {/* Author */}
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                      J
                    </div>
                    <span className="text-gray-400 text-xs">{article.author}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile Layout - Simple List (below 768px) */}
        <div className="min-[768px]:hidden space-y-4">
          {blogData.slice(0, 6).map((article, index) => (
            <div
              key={article.id}
              onClick={() => handleArticleClick(article.id)}
              className="group cursor-pointer bg-white/[0.08] backdrop-blur-sm rounded-xl border border-white/[0.12] hover:border-white/[0.25] hover:bg-white/[0.12] transition-all duration-300 hover:scale-[1.01] hover:shadow-lg hover:shadow-purple-500/10 p-4 opacity-100"
              style={{ 
                opacity: 1, 
                transform: 'translateY(0px)',
                animation: `slideInLeft 0.5s ease-out ${index * 0.1}s both`
              }}
            >
              <div className="flex gap-4">
                {/* Image */}
                <div className="flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden bg-slate-800">
                  {loadedImages.has(article.id) ? (
                    <img 
                      src={article.image} 
                      alt={article.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-700 animate-pulse flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-gray-300 mb-2">
                    <span className="px-2 py-1 bg-purple-600/30 rounded text-purple-200 font-medium">{article.category}</span>
                    <span>•</span>
                    <span>{new Date(article.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    <span>•</span>
                    <span>{article.readTime}</span>
                  </div>

                  <h4 className="text-sm sm:text-base font-semibold text-white leading-tight mb-2 line-clamp-2 group-hover:text-purple-200 transition-colors duration-300">
                    {article.title}
                  </h4>

                  <p className="text-xs sm:text-sm text-gray-300 leading-relaxed line-clamp-2">
                    {article.excerpt}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <button
            onClick={handleViewAllClick}
            className="group inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-purple-500/25"
            style={{ fontFamily: 'Encode Sans Semi Expanded, sans-serif' }}
          >
            <span>View All Articles</span>
            <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
};

export default BlogSection;