import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BlurImage from './ui/BlurImage';
import blogService from '../services/blogService';

const BlogSection = () => {
  const sectionRef = useRef(null);
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dataSource, setDataSource] = useState('');

  // Immediate data loading on component mount
  useEffect(() => {
    const loadBlogs = async () => {
      console.log('BlogSection: Starting to load blogs from Firebase...');
      
      try {
        setIsLoading(true);
        
        // Use Firebase blog service
        const firebaseBlogs = await blogService.getAllBlogs();
        console.log('BlogSection: Firebase blogs loaded:', firebaseBlogs);
        
        if (firebaseBlogs && Array.isArray(firebaseBlogs) && firebaseBlogs.length > 0) {
          console.log('BlogSection: Raw blogs from Firebase:', firebaseBlogs);
          
          // Filter for published blogs - more flexible approach
          let publishedBlogs = firebaseBlogs.filter(blog => {
            // Consider a blog published if:
            // 1. status is 'published'
            // 2. published field is true
            // 3. no status field exists (assume published)
            return blog.status === 'published' || 
                   blog.published === true || 
                   blog.status === 'active' ||
                   !blog.hasOwnProperty('status');
          });
          
          console.log('BlogSection: Published blogs after filter:', publishedBlogs);
          
          // If no published blogs found but we have blogs, show all blogs
          if (publishedBlogs.length === 0 && firebaseBlogs.length > 0) {
            console.log('BlogSection: No published blogs found, showing all blogs');
            publishedBlogs = firebaseBlogs;
          }
          
          // Sort by date (newest first) and take the latest 6
          publishedBlogs = publishedBlogs
            .sort((a, b) => {
              const dateA = new Date(b.date || b.createdAt || b.created_at || 0);
              const dateB = new Date(a.date || a.createdAt || a.created_at || 0);
              return dateA - dateB;
            })
            .slice(0, 6);
          
          console.log('BlogSection: Final blogs to display:', publishedBlogs);
          setBlogs(publishedBlogs);
          setDataSource('Firebase');
        } else {
          console.log('BlogSection: No blogs found in Firebase - database might need seeding');
          setBlogs([]);
          setDataSource('Empty Database');
        }
      } catch (error) {
        console.error('BlogSection: Error loading blogs from Firebase:', error);
        setBlogs([]);
        setDataSource('Error');
      } finally {
        setIsLoading(false);
      }
    };

    loadBlogs();
  }, []);

  const handleArticleClick = (articleId) => {
    console.log('BlogSection: Navigating to blog post with ID:', articleId);
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
          <p className="text-sm xxs:text-base xs:text-lg sm-mobile:text-lg md-tablet:text-xl text-gray-300 max-w-xs xxs:max-w-sm xs:max-w-md sm-mobile:max-w-lg md-tablet:max-w-2xl mx-auto px-2 mb-4">
            Expert perspectives on Dubai business formation, UAE licensing, and corporate advisory services from Julian D'Rozario
          </p>
          
          {/* Stats Row */}
          <div className="flex items-center justify-center gap-4 xxs:gap-6 text-xs xxs:text-sm text-gray-400">
            <div className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>{blogs.length} Articles</span>
            </div>
            <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
            <div className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m8 0h4a2 2 0 012 2v12a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2h4" />
              </svg>
              <span>10+ Years Experience</span>
            </div>
            <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
            <div className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>3200+ Licenses</span>
            </div>
          </div>
          
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
                  ) : (
          <div className="text-center py-12 xxs:py-14 xs:py-16">
            <p className="text-gray-300 text-base xxs:text-lg mb-4">No blog posts available at the moment.</p>
            <p className="text-gray-500 text-xs xxs:text-sm">
              {dataSource === 'Empty Database' 
                ? 'The blog database needs to be seeded with content. Please contact the administrator.' 
                : 'Please check back later for the latest insights.'}
            </p>
          </div>
        ) : (
          <>
            {/* Mobile-First Layout */}
            
            {/* Modern Mobile Layout - All Mobile Sizes */}
            <div className="block md-tablet:hidden">
              
              {/* Featured Article Card - Mobile */}
              <div className="mb-6">
                {blogs.length > 0 && (
                  <div
                    onClick={() => handleArticleClick(blogs[0].id)}
                    className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900/50 to-slate-800/50 border border-white/10 hover:border-purple-400/30 transition-all duration-300 cursor-pointer"
                  >
                    {/* Featured Image */}
                    <div className="relative h-48 overflow-hidden">
                      <BlurImage 
                        src={blogs[0].image_url || blogs[0].featured_image || blogs[0].image || 'https://via.placeholder.com/600x400/1e293b/94a3b8?text=No+Image'} 
                        alt={blogs[0].title}
                        className="w-full h-48 group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                      
                      {/* Featured Badge */}
                      <div className="absolute top-4 left-4">
                        <span className="px-3 py-1 bg-purple-600 text-white text-xs font-semibold rounded-full">
                          ⭐ Featured
                        </span>
                      </div>
                      
                      {/* Category Badge */}
                      <div className="absolute top-4 right-4">
                        <span className="px-3 py-1 bg-black/60 backdrop-blur-sm text-white text-xs font-medium rounded-full border border-white/20">
                          {blogs[0].category}
                        </span>
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="p-5">
                      <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
                        <span>{new Date(blogs[0].date || blogs[0].created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                        <span>•</span>
                        <span>{blogs[0].readTime || blogs[0].read_time || '5 min read'}</span>
                      </div>
                      
                      <h3 className="text-lg font-bold text-white mb-3 leading-tight group-hover:text-purple-200 transition-colors duration-300">
                        {blogs[0].title}
                      </h3>
                      
                      <p className="text-sm text-gray-300 leading-relaxed line-clamp-2 mb-4">
                        {blogs[0].excerpt}
                      </p>
                      
                      {/* Author */}
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          J
                        </div>
                        <span className="text-gray-400 text-sm font-medium">{blogs[0].author}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Recent Articles List - Mobile */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-white mb-4" style={{ fontFamily: 'Encode Sans Semi Expanded, sans-serif' }}>
                  Recent Articles
                </h4>
                
                {blogs.slice(1, 6).map((article, index) => (
                  <div
                    key={article.id}
                    onClick={() => handleArticleClick(article.id)}
                    className="group p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:border-purple-400/30 hover:bg-white/10 transition-all duration-300 cursor-pointer"
                  >
                    <div className="flex gap-4">
                      {/* Thumbnail */}
                      <div className="flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden bg-slate-800">
                        <BlurImage 
                          src={article.image_url || article.featured_image || article.image || 'https://via.placeholder.com/80x80/1e293b/94a3b8?text=No+Image'} 
                          alt={article.title}
                          className="w-20 h-20 group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        {/* Meta */}
                        <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
                          <span className="px-2 py-1 bg-purple-600/20 text-purple-300 rounded-md font-medium">
                            {article.category}
                          </span>
                          <span>•</span>
                          <span>{article.readTime || article.read_time || '5 min read'}</span>
                        </div>

                        {/* Title */}
                        <h4 className="text-sm font-semibold text-white leading-tight mb-2 line-clamp-2 group-hover:text-purple-200 transition-colors duration-300">
                          {article.title}
                        </h4>

                        {/* Date & Author */}
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-400">
                            {new Date(article.date || article.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                          
                          {/* Read More Arrow */}
                          <svg className="w-4 h-4 text-purple-400 transform group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
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
                    className="group touch-interactive bg-white/[0.02] mobile-optimized-blur rounded-xl overflow-hidden border border-white/[0.05] hover:border-white/[0.15] transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-purple-500/10"
                    style={{ 
                      animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`
                    }}
                  >
                    {/* Image */}
                    <div className="relative h-40 overflow-hidden bg-slate-800">
                       
                        <BlurImage 
                          src={article.image_url || article.featured_image || article.image || 'https://via.placeholder.com/400x300/1e293b/94a3b8?text=No+Image'} 
                          alt={article.title}
                          className="responsive-blog-image group-hover:scale-110 transition-transform duration-500"
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
                    className="group touch-interactive bg-white/[0.02] mobile-optimized-blur rounded-xl overflow-hidden border border-white/[0.05] hover:border-white/[0.15] transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-purple-500/10"
                    style={{ 
                      animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`
                    }}
                  >
                    {/* Image */}
                    <div className="relative h-48 overflow-hidden bg-slate-800">
                       
                        <BlurImage 
                          src={article.image_url || article.featured_image || article.image || 'https://via.placeholder.com/400x300/1e293b/94a3b8?text=No+Image'} 
                          alt={article.title}
                          className="responsive-blog-image group-hover:scale-110 transition-transform duration-500"
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