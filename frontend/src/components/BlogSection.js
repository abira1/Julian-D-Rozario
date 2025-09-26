import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { blogData } from '../data/mockData';

const BlogSection = () => {
  const sectionRef = useRef(null);
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dataSource, setDataSource] = useState('');

  // Immediate data loading on component mount
  useEffect(() => {
    const loadBlogs = async () => {
      console.log('BlogSection: Starting to load blogs...');
      
      try {
        // Try API first
        const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
        console.log('BlogSection: Trying API at', `${backendUrl}/api/blogs`);
        
        const response = await fetch(`${backendUrl}/api/blogs`);
        if (response.ok) {
          const apiBlogs = await response.json();
          console.log('BlogSection: Got API blogs:', apiBlogs.length);
          if (apiBlogs.length > 0) {
            setBlogs(apiBlogs.slice(0, 6));
            setDataSource('API');
            setIsLoading(false);
            return;
          }
        }
        
        console.log('API failed or empty, using mock data');
        throw new Error('API not available');
        
      } catch (error) {
        console.error('BlogSection: API error:', error);
        console.log('BlogSection: Falling back to mock data');
        
        // Fallback to mock data
        const mockBlogs = blogData.slice(0, 6);
        setBlogs(mockBlogs);
        setDataSource('Mock Data');
        setIsLoading(false);
      }
    };

    loadBlogs();
  }, []);

  const handleArticleClick = (articleId) => {
    navigate(`/blog/${articleId}`);
  };

  const handleViewAllClick = () => {
    navigate('/blog');
  };

  return (
    <section 
      ref={sectionRef}
      id="blog" 
      className="relative py-12 xxs:py-14 xs:py-16 sm-mobile:py-18 md-tablet:py-20 lg-desktop:py-24 px-3 xxs:px-4 xs:px-5 sm-mobile:px-6 md-tablet:px-8 bg-gradient-to-br from-black via-slate-950/50 to-black"
    >
      {/* Background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 xxs:w-40 xxs:h-40 xs:w-48 xs:h-48 sm-mobile:w-56 sm-mobile:h-56 md-tablet:w-64 md-tablet:h-64 bg-gradient-to-r from-purple-500/[0.03] to-blue-500/[0.03] rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-24 h-24 xxs:w-32 xxs:h-32 xs:w-40 xs:h-40 sm-mobile:w-44 sm-mobile:h-44 md-tablet:w-48 md-tablet:h-48 bg-gradient-to-r from-blue-500/[0.03] to-purple-500/[0.03] rounded-full filter blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Section Header - Mobile First */}
        <div className="text-center mb-8 xxs:mb-10 xs:mb-12 sm-mobile:mb-14 md-tablet:mb-16">
          <h2 
            className="text-2xl xxs:text-2xl xs:text-3xl sm-mobile:text-4xl md-tablet:text-5xl lg-desktop:text-5xl xl-desktop:text-6xl font-bold mb-3 xxs:mb-4 xs:mb-4 bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent leading-tight"
            style={{ fontFamily: 'Encode Sans Semi Expanded, sans-serif' }}
          >
            Latest Insights
          </h2>
          <p className="text-sm xxs:text-base xs:text-lg sm-mobile:text-lg md-tablet:text-xl text-gray-300 max-w-xs xxs:max-w-sm xs:max-w-md sm-mobile:max-w-lg md-tablet:max-w-2xl mx-auto px-2">
            Expert perspectives on Dubai business formation, UAE licensing, and corporate advisory services
          </p>
          
          {/* Debug info - Only show on development */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-4 text-xs text-gray-500">
              Loading: {isLoading ? 'Yes' : 'No'} | Blogs: {blogs.length} | Source: {dataSource}
            </div>
          )}
        </div>

        {/* Loading State - Mobile Optimized */}
        {isLoading ? (
          <div className="text-center py-12 xxs:py-14 xs:py-16">
            <div className="w-8 h-8 xxs:w-10 xxs:h-10 xs:w-12 xs:h-12 border-3 xxs:border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-3 xxs:mb-4"></div>
            <p className="text-gray-300 text-sm xxs:text-base">Loading latest insights...</p>
          </div>
        ) : blogs.length === 0 ? (
          <div className="text-center py-12 xxs:py-14 xs:py-16">
            <p className="text-gray-300 text-base xxs:text-lg mb-4">No blog posts available at the moment.</p>
            <p className="text-gray-500 text-xs xxs:text-sm">Please check back later for the latest insights.</p>
          </div>
        ) : (
          <>
            {/* Mobile-First Layout */}
            
            {/* Ultra Mobile Layout (320px - 374px) */}
            <div className="block xxs:hidden">
              <div className="space-y-4">
                {blogs.slice(0, 4).map((article, index) => (
                  <div
                    key={article.id}
                    onClick={() => handleArticleClick(article.id)}
                    className="group touch-interactive bg-white/[0.08] mobile-optimized-blur rounded-lg border border-white/[0.12] hover:border-purple-500/30 hover:bg-white/[0.12] transition-all duration-300 touch-target mobile-card-spacing"
                    style={{ 
                      animation: `mobileSlideUp 0.5s ease-out ${index * 0.1}s both`
                    }}
                  >
                    <div className="flex gap-3">
                      {/* Compact Image */}
                      <div className="flex-shrink-0 w-16 h-16 rounded-md overflow-hidden bg-slate-800">
                        <img 
                          src={article.image_url || article.image} 
                          alt={article.title}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                          loading="lazy"
                        />
                      </div>

                      {/* Compact Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-1 text-xs text-gray-300 mb-1">
                          <span className="px-2 py-0.5 bg-purple-600/30 rounded text-purple-200 font-medium text-xs">{article.category}</span>
                        </div>
                        <h4 className="text-sm font-semibold text-white leading-tight mb-1 line-clamp-2 group-hover:text-purple-200 transition-colors duration-300">
                          {article.title}
                        </h4>
                        <p className="text-xs text-gray-300 line-clamp-1">
                          {article.readTime || article.read_time || '5 min read'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Small Mobile Layout (375px - 424px) */}
            <div className="hidden xxs:block xs:hidden">
              <div className="space-y-4">
                {blogs.slice(0, 5).map((article, index) => (
                  <div
                    key={article.id}
                    onClick={() => handleArticleClick(article.id)}
                    className="group cursor-pointer bg-white/[0.08] mobile-optimized-blur rounded-xl border border-white/[0.12] hover:border-purple-500/30 hover:bg-white/[0.12] transition-all duration-300 hover:scale-[1.01] touch-target mobile-card-spacing"
                    style={{ 
                      animation: `mobileSlideUp 0.5s ease-out ${index * 0.1}s both`
                    }}
                  >
                    <div className="flex gap-3">
                      {/* Image */}
                      <div className="flex-shrink-0 w-18 h-18 rounded-lg overflow-hidden bg-slate-800">
                        <img 
                          src={article.image_url || article.image} 
                          alt={article.title}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                          loading="lazy"
                        />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-300 mb-2">
                          <span className="px-2 py-1 bg-purple-600/30 rounded text-purple-200 font-medium">{article.category}</span>
                          <span>•</span>
                          <span>{new Date(article.date || article.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                        </div>

                        <h4 className="text-sm font-semibold text-white leading-tight mb-2 line-clamp-2 group-hover:text-purple-200 transition-colors duration-300">
                          {article.title}
                        </h4>

                        <p className="text-xs text-gray-300 leading-relaxed line-clamp-1">
                          {article.readTime || article.read_time || '5 min read'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Medium Mobile Layout (425px - 767px) */}
            <div className="hidden xs:block md-tablet:hidden">
              <div className="space-y-5">
                {blogs.map((article, index) => (
                  <div
                    key={article.id}
                    onClick={() => handleArticleClick(article.id)}
                    className="group cursor-pointer bg-white/[0.08] mobile-optimized-blur rounded-xl border border-white/[0.12] hover:border-white/[0.25] hover:bg-white/[0.12] transition-all duration-300 hover:scale-[1.01] hover:shadow-lg hover:shadow-purple-500/10 touch-target mobile-card-spacing"
                    style={{ 
                      animation: `slideInLeft 0.5s ease-out ${index * 0.1}s both`
                    }}
                  >
                    <div className="flex gap-4">
                      {/* Image */}
                      <div className="flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden bg-slate-800">
                        <img 
                          src={article.image_url || article.image} 
                          alt={article.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          loading="lazy"
                        />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-300 mb-2">
                          <span className="px-2 py-1 bg-purple-600/30 rounded text-purple-200 font-medium">{article.category}</span>
                          <span>•</span>
                          <span>{new Date(article.date || article.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                          <span>•</span>
                          <span>{article.readTime || article.read_time || '5 min read'}</span>
                        </div>

                        <h4 className="text-base font-semibold text-white leading-tight mb-2 line-clamp-2 group-hover:text-purple-200 transition-colors duration-300">
                          {article.title}
                        </h4>

                        <p className="text-sm text-gray-300 leading-relaxed line-clamp-2">
                          {article.excerpt}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tablet Layout (768px - 1023px) */}
            <div className="hidden md-tablet:block lg-desktop:hidden">
              <div className="grid grid-cols-2 gap-5">
                {blogs.map((article, index) => (
                  <div
                    key={article.id}
                    onClick={() => handleArticleClick(article.id)}
                    className="group cursor-pointer bg-white/[0.02] mobile-optimized-blur rounded-xl overflow-hidden border border-white/[0.05] hover:border-white/[0.15] transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-purple-500/10"
                    style={{ 
                      animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`
                    }}
                  >
                    {/* Image */}
                    <div className="relative h-40 overflow-hidden bg-slate-800">
                       
                        <img 
                          src={article.image_url || article.image} 
                          alt={article.title}
                          className="responsive-blog-image transition-transform duration-500 group-hover:scale-110"
                          loading="lazy"
                        />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                      
                      {/* Category Badge */}
                      <div className="absolute top-3 left-3 px-3 py-1 bg-purple-600/90 mobile-optimized-blur rounded-full text-white text-xs font-medium">
                        {article.category}
                      </div>
                      
                      {/* Featured Badge */}
                      {index === 0 && (
                        <div className="absolute top-3 right-3 px-3 py-1 bg-white/90 mobile-optimized-blur rounded-full text-black text-xs font-medium">
                          Featured
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
                        <span>{new Date(article.date || article.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                        <span>•</span>
                        <span>{article.readTime || article.read_time || '5 min read'}</span>
                        <span>•</span>
                        <span>{article.views || 0} views</span>
                      </div>

                      <h3 className="text-sm font-bold text-white mb-3 leading-tight group-hover:text-purple-200 transition-colors duration-300 line-clamp-2">
                        {article.title}
                      </h3>

                      <p className="text-sm text-gray-300 leading-relaxed line-clamp-2 mb-4">
                        {article.excerpt}
                      </p>

                      {/* Author */}
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                          J
                        </div>
                        <span className="text-gray-400 text-xs">{article.author}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Desktop Layout (1024px+) - Enhanced */}
            <div className="hidden lg-desktop:block">
              <div className="grid grid-cols-3 gap-6">
                {blogs.map((article, index) => (
                  <div
                    key={article.id}
                    onClick={() => handleArticleClick(article.id)}
                    className="group cursor-pointer bg-white/[0.02] mobile-optimized-blur rounded-xl overflow-hidden border border-white/[0.05] hover:border-white/[0.15] transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-purple-500/10"
                    style={{ 
                      animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`
                    }}
                  >
                    {/* Image */}
                    <div className="relative h-48 overflow-hidden bg-slate-800">
                       
                        <img 
                          src={article.image_url || article.image} 
                          alt={article.title}
                          className="responsive-blog-image transition-transform duration-500 group-hover:scale-110"
                          loading="lazy"
                        />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                      
                      {/* Category Badge */}
                      <div className="absolute top-3 left-3 px-3 py-1 bg-purple-600/90 mobile-optimized-blur rounded-full text-white text-xs font-medium">
                        {article.category}
                      </div>
                      
                      {/* Featured Badge */}
                      {index === 0 && (
                        <div className="absolute top-3 right-3 px-3 py-1 bg-white/90 mobile-optimized-blur rounded-full text-black text-xs font-medium">
                          Featured
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
                        <span>{new Date(article.date || article.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                        <span>•</span>
                        <span>{article.readTime || article.read_time || '5 min read'}</span>
                        <span>•</span>
                        <span>{article.views || 0} views</span>
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

            {/* View All Button - Mobile Optimized */}
            <div className="text-center mt-8 xxs:mt-10 xs:mt-12">
              <button
                onClick={handleViewAllClick}
                className="group inline-flex items-center gap-2 xxs:gap-3 px-4 xxs:px-5 xs:px-6 py-3 xxs:py-3 xs:py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-lg xxs:rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-purple-500/25 touch-target"
                style={{ fontFamily: 'Encode Sans Semi Expanded, sans-serif' }}
              >
                <span className="text-sm xxs:text-base">View All Articles</span>
                <svg className="w-3 h-3 xxs:w-4 xxs:h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default BlogSection;