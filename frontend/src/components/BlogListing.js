import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

// Mobile Card Component - Enhanced Modern Design
const MobileBlogCard = ({ blog, index }) => {
  const navigate = useNavigate();
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    // Skip image loading check for now - always show card
    setImageLoaded(true);
  }, []);

  const handleCardClick = () => {
    navigate(`/blog/${blog.id}`);
  };

  return (
    <article 
      onClick={handleCardClick}
      className="group p-5 bg-gradient-to-br from-white/10 to-white/[0.04] backdrop-blur-md rounded-2xl border border-white/20 hover:border-purple-400/40 hover:from-white/15 hover:to-white/[0.07] transition-all duration-500 cursor-pointer shadow-lg hover:shadow-xl hover:shadow-purple-500/10 active:scale-[0.98]"
    >
      <div className="flex gap-4">
        {/* Enhanced Thumbnail */}
        <div className="flex-shrink-0 relative">
          <div className="w-24 h-24 rounded-xl overflow-hidden bg-slate-800 shadow-lg">
            {imageLoaded ? (
              <img 
                src={blog.image_url || blog.featured_image || blog.image || 'https://via.placeholder.com/400x300/1e293b/94a3b8?text=No+Image'} 
                alt={blog.title}
                className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110 group-hover:brightness-110"
                loading="lazy"
                onError={(e) => {
                  e.target.src = '/api/placeholder/400/300';
                }}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-700 animate-pulse flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
            {/* Modern overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
          </div>
          
          {/* Status indicator */}
          {blog.featured && (
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
              </svg>
            </div>
          )}
        </div>

        {/* Enhanced Content */}
        <div className="flex-1 min-w-0 flex flex-col">
          {/* Meta Info */}
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
            <span className="inline-flex items-center px-2 py-1 bg-purple-600/20 text-purple-300 rounded-md font-medium text-xs">
              <div className="w-1.5 h-1.5 bg-purple-400 rounded-full mr-1"></div>
              {blog.category}
            </span>
            <span>•</span>
            <span className="font-medium">{blog.readTime || '5 min read'}</span>
          </div>

          {/* Enhanced Title */}
          <h3 className="text-base font-bold text-white leading-tight mb-2 line-clamp-2 group-hover:text-purple-200 transition-colors duration-300 font-display">
            {blog.title}
          </h3>

          {/* Excerpt for longer mobile cards */}
          <p className="text-sm text-gray-300 line-clamp-2 mb-3 flex-grow">
            {blog.excerpt}
          </p>

          {/* Enhanced Footer */}
          <div className="flex items-center justify-between mt-auto">
            <div className="flex items-center gap-3">
              {/* Author */}
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  J
                </div>
                <span className="text-xs text-gray-400 font-medium truncate max-w-16">{blog.author}</span>
              </div>
              
              {/* Stats */}
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12S5 4 12 4S23 12 23 12S19 20 12 20S1 12 1 12Z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                  <span>{blog.views || 0}</span>
                </div>
                <div className="flex items-center gap-1 text-red-400">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"/>
                  </svg>
                  <span>{blog.likes || 0}</span>
                </div>
              </div>
            </div>
            
            {/* Read More Arrow */}
            <div className="flex items-center text-purple-400">
              <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>

          {/* Date */}
          <div className="text-xs text-gray-500 mt-2 text-right">
            {new Date(blog.created_at || blog.date).toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric',
              year: 'numeric' 
            })}
          </div>
        </div>
      </div>
    </article>
  );
};

// Desktop Card Component - Enhanced Modern Design
const DesktopBlogCard = ({ blog, index }) => {
  const navigate = useNavigate();
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    // Skip image loading check for now - always show card
    setImageLoaded(true);
  }, []);

  const handleCardClick = () => {
    navigate(`/blog/${blog.id}`);
  };

  return (
    <article 
      onClick={handleCardClick}
      className="group relative bg-gradient-to-br from-white/8 to-white/[0.03] backdrop-blur-sm border border-white/15 rounded-2xl overflow-hidden hover:border-purple-500/40 hover:from-white/12 hover:to-white/[0.06] transition-all duration-500 hover:scale-[1.02] hover:-translate-y-2 cursor-pointer shadow-lg hover:shadow-2xl hover:shadow-purple-500/10"
      style={{
        animation: `fadeInUp 0.6s ease-out ${index * 0.15}s both`
      }}
    >
      {/* Modern Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600/0 via-transparent to-blue-600/0 group-hover:from-purple-600/5 group-hover:to-blue-600/5 transition-all duration-500"></div>
      
      {/* Enhanced Image Section */}
      <div className="relative h-56 overflow-hidden">
        {imageLoaded ? (
          <img 
            src={blog.image_url || blog.featured_image || blog.image || '/api/placeholder/400/300'} 
            alt={blog.title}
            className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-110"
            loading="lazy"
            onError={(e) => {
              e.target.src = '/api/placeholder/400/300';
            }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-700 animate-pulse flex items-center justify-center">
            <div className="w-8 h-8 border-3 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        {/* Subtle overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
        
        {/* Modern Badges */}
        <div className="absolute top-4 left-4">
          <span className="inline-flex items-center px-3 py-1.5 bg-white/90 backdrop-blur-md rounded-full text-gray-800 text-xs font-semibold shadow-lg border border-white/20">
            <div className="w-2 h-2 bg-purple-500 rounded-full mr-1.5"></div>
            {blog.category}
          </span>
        </div>

        {blog.featured && (
          <div className="absolute top-4 right-4">
            <span className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full text-white text-xs font-semibold shadow-lg">
              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
              </svg>
              Featured
            </span>
          </div>
        )}

        {/* Read Time Badge */}
        <div className="absolute bottom-4 right-4">
          <span className="inline-flex items-center px-3 py-1.5 bg-black/70 backdrop-blur-md rounded-full text-white text-xs font-medium">
            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12,6 12,12 16,14"/>
            </svg>
            {blog.readTime || '5 min read'}
          </span>
        </div>
      </div>

      {/* Enhanced Content Section */}
      <div className="relative z-10 p-6">
        {/* Meta Info */}
        <div className="flex items-center justify-between text-xs text-gray-400 mb-4">
          <div className="flex items-center space-x-3">
            <span className="font-medium">{new Date(blog.created_at || blog.date).toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric',
              year: 'numeric'
            })}</span>
            <span>•</span>
            <div className="flex items-center space-x-1">
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 12S5 4 12 4S23 12 23 12S19 20 12 20S1 12 1 12Z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
              <span>{blog.views || 0} views</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1 text-red-400">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"/>
              </svg>
              <span>{blog.likes || 0}</span>
            </div>
          </div>
        </div>

        {/* Enhanced Title */}
        <h3 className="text-xl font-bold text-white mb-4 leading-tight group-hover:text-purple-200 transition-colors duration-300 line-clamp-2 font-display">
          {blog.title}
        </h3>

        {/* Enhanced Excerpt */}
        <p className="text-gray-300 leading-relaxed line-clamp-3 mb-6 text-sm">
          {blog.excerpt}
        </p>

        {/* Modern Tags */}
        <div className="flex flex-wrap gap-2 mb-6">
          {blog.tags?.slice(0, 3).map((tag, idx) => (
            <span 
              key={idx}
              className="inline-flex items-center px-2.5 py-1 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-full text-xs text-purple-300 font-medium hover:from-purple-500/20 hover:to-blue-500/20 transition-all duration-200"
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* Enhanced Author & Read More */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg">
                J
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-gray-900"></div>
            </div>
            <div>
              <p className="text-gray-300 text-sm font-medium">{blog.author}</p>
              <p className="text-gray-500 text-xs">Business Expert</p>
            </div>
          </div>

          <button className="group/btn inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg text-white text-sm font-medium hover:from-purple-700 hover:to-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-purple-500/25">
            <span>Read More</span>
            <svg className="w-4 h-4 transform group-hover/btn:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </article>
  );
};

// Main Blog Card Component
const BlogCard = ({ blog, index }) => {
  return (
    <>
      {/* Mobile Layout */}
      <div className="block md:hidden">
        <MobileBlogCard blog={blog} index={index} />
      </div>
      
      {/* Desktop Layout */}
      <div className="hidden md:block">
        <DesktopBlogCard blog={blog} index={index} />
      </div>
    </>
  );
};

const BlogListing = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [blogs, setBlogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('date');
  const [isLoading, setIsLoading] = useState(true);
  const articlesPerPage = 12; // Increased for better mobile experience

  // Fetch blogs and categories from Firebase API
  useEffect(() => {
    fetchBlogsAndCategories();
  }, []);

  const fetchBlogsAndCategories = async () => {
    try {
      setIsLoading(true);
      
      // Fetch blogs - using working MySQL backend endpoint
      const apiUrl = '/api/blogs';
      // Fetching blogs from API
      const blogsResponse = await fetch(apiUrl);
      if (blogsResponse.ok) {
        const blogsData = await blogsResponse.json();
        // API returns {blogs: [...], total: n}, we need just the blogs array
        setBlogs(blogsData.blogs || blogsData);
      } else {
        // No fallback - show empty state
        setBlogs([]);
      }

      // Fetch categories - using working MySQL backend endpoint
      const categoriesResponse = await fetch('/api/categories');
      if (categoriesResponse.ok) {
        const categoriesData = await categoriesResponse.json();
        // Categories loaded successfully
        setCategories(categoriesData); // API already includes "All" category
      } else {
        // Default categories if API fails
        setCategories([{ id: 'all', name: 'All' }]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      // Show empty state instead of mock data
      setBlogs([]);
      setCategories([{ id: 'all', name: 'All' }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter and search logic
  const filteredBlogs = blogs.filter(blog => {
    const matchesCategory = selectedCategory === 'All' || blog.category === selectedCategory;
    const matchesSearch = blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         blog.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         blog.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });
  
  // Debug logging removed for production

  // Sort logic
  const sortedBlogs = [...filteredBlogs].sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(b.created_at || b.date) - new Date(a.created_at || a.date);
      case 'views':
        return b.views - a.views;
      case 'likes':
        return b.likes - a.likes;
      default:
        return 0;
    }
  });

  // Pagination logic
  const totalPages = Math.ceil(sortedBlogs.length / articlesPerPage);
  const startIndex = (currentPage - 1) * articlesPerPage;
  const currentBlogs = sortedBlogs.slice(startIndex, startIndex + articlesPerPage);

  // Enhanced Mobile Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-slate-950/30 to-black">
        {/* Navigation Skeleton */}
        <nav className="fixed top-0 left-0 right-0 z-40 bg-black/90 mobile-optimized-blur border-b border-white/10">
          <div className="max-w-7xl mx-auto px-3 xxs:px-4 xs:px-6 py-3 xxs:py-4 flex items-center justify-between">
            <div className="h-6 w-32 mobile-skeleton rounded"></div>
            <div className="h-6 w-24 mobile-skeleton rounded"></div>
          </div>
        </nav>

        {/* Hero Section Skeleton */}
        <section className="relative pt-16 xxs:pt-18 xs:pt-20 pb-8 xxs:pb-12 px-3 xxs:px-4 xs:px-6">
          <div className="relative z-10 max-w-7xl mx-auto text-center">
            <div className="h-8 xxs:h-10 xs:h-12 w-48 xxs:w-56 xs:w-64 mx-auto mb-4 mobile-skeleton rounded"></div>
            <div className="h-4 w-80 mx-auto mb-2 mobile-skeleton rounded"></div>
            <div className="h-4 w-64 mx-auto mb-6 mobile-skeleton rounded"></div>
            <div className="w-16 h-1 mx-auto mobile-skeleton rounded-full"></div>
          </div>
        </section>

        {/* Search Section Skeleton */}
        <section className="relative px-3 xxs:px-4 xs:px-6 mb-6">
          <div className="max-w-7xl mx-auto">
            <div className="bg-gradient-to-br from-white/5 to-white/[0.02] mobile-optimized-blur border border-white/10 mobile-card mobile-compact-spacing">
              <div className="h-12 mb-4 mobile-skeleton rounded"></div>
              <div className="flex gap-2 mb-4">
                <div className="h-6 w-16 mobile-skeleton rounded"></div>
                <div className="h-6 w-24 mobile-skeleton rounded"></div>
              </div>
              <div className="flex flex-wrap gap-2 justify-center">
                {[1,2,3,4,5,6].map(i => (
                  <div key={i} className="h-8 w-20 mobile-skeleton rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Cards Grid Skeleton */}
        <section className="relative px-3 xxs:px-4 xs:px-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 xs:grid-cols-2 md-tablet:grid-cols-3 lg-desktop:grid-cols-4 mobile-content-gap">
              {[1,2,3,4,5,6,7,8].map(i => (
                <div key={i} className="bg-gradient-to-br from-white/5 to-white/[0.02] mobile-optimized-blur border border-white/10 mobile-card overflow-hidden">
                  <div className="h-32 xxs:h-36 mobile-skeleton"></div>
                  <div className="mobile-compact-spacing">
                    <div className="flex justify-between mb-2">
                      <div className="h-3 w-16 mobile-skeleton rounded"></div>
                      <div className="h-3 w-12 mobile-skeleton rounded"></div>
                    </div>
                    <div className="h-5 mb-2 mobile-skeleton rounded"></div>
                    <div className="h-4 mb-2 mobile-skeleton rounded"></div>
                    <div className="h-4 w-3/4 mb-2 mobile-skeleton rounded"></div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 mobile-skeleton rounded-full"></div>
                        <div className="h-3 w-16 mobile-skeleton rounded"></div>
                      </div>
                      <div className="h-3 w-12 mobile-skeleton rounded"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-slate-950/30 to-black">
      {/* Navigation - Mobile Optimized */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-black/90 mobile-optimized-blur border-b border-white/10">
        <div className="max-w-7xl mx-auto px-3 xxs:px-4 xs:px-6 py-2.5 xxs:py-3 flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="flex items-center group touch-target mobile-focus"
          >
            <span className="mobile-text-base xxs:text-lg font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-300 truncate max-w-44 xxs:max-w-none"
            style={{ fontFamily: 'Encode Sans Semi Expanded, sans-serif' }}>
              Julian D'Rozario
            </span>
          </button>

          <button
            onClick={() => navigate('/')}
            className="text-gray-300 hover:text-white transition-colors duration-300 mobile-text-sm touch-target mobile-focus flex items-center gap-1"
          >
            <svg className="w-3 h-3 xxs:w-4 xxs:h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            <span className="hidden xxs:inline">Back to Home</span>
            <span className="xxs:hidden">Home</span>
          </button>
        </div>
      </nav>

      {/* Enhanced Hero Section - Modern & Engaging */}
      <section className="relative pt-16 xxs:pt-18 xs:pt-20 sm-mobile:pt-24 pb-12 xxs:pb-16 xs:pb-20 px-3 xxs:px-4 xs:px-6 overflow-hidden">
        {/* Dynamic Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 right-1/4 w-72 h-72 xxs:w-96 xxs:h-96 bg-gradient-to-r from-purple-500/8 to-blue-500/8 rounded-full filter blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 left-1/4 w-64 h-64 xxs:w-80 xxs:h-80 bg-gradient-to-r from-blue-500/8 to-purple-500/8 rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-indigo-500/5 to-cyan-500/5 rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <nav className="flex items-center text-sm text-gray-400 mb-6">
            <a href="/" className="hover:text-purple-400 transition-colors">Home</a>
            <svg className="w-4 h-4 mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-purple-400">Blog</span>
          </nav>

          <div className="text-left max-w-4xl">
            {/* Enhanced Title with Gradient */}
            <div className="relative">
              <h1 className="text-4xl xxs:text-5xl xs:text-6xl sm-mobile:text-7xl md-tablet:text-8xl font-bold mb-6 leading-tight">
                <span className="bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
                  Insights & 
                </span>
                <br />
                <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  Expertise
                </span>
              </h1>
              
              {/* Decorative elements */}
              <div className="absolute -top-4 -left-4 w-8 h-8 bg-purple-500/20 rounded-full blur-lg"></div>
              <div className="absolute top-1/2 -right-8 w-6 h-6 bg-blue-500/20 rounded-full blur-lg animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>
            
            {/* Enhanced Description */}
            <p className="text-lg xxs:text-xl text-gray-300 max-w-3xl mb-8 leading-relaxed">
              Deep insights into Dubai business formation, corporate services, and the evolving landscape 
              of UAE entrepreneurship from industry expert Julian D'Rozario.
            </p>

            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-4 max-w-lg mb-8">
              <div className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/20 rounded-xl p-4 text-center backdrop-blur-sm">
                <div className="text-2xl xxs:text-3xl font-bold text-purple-400 mb-1">{sortedBlogs.length}</div>
                <div className="text-xs text-gray-400 font-medium">Articles</div>
              </div>
              <div className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20 rounded-xl p-4 text-center backdrop-blur-sm">
                <div className="text-2xl xxs:text-3xl font-bold text-blue-400 mb-1">{categories.length - 1}</div>
                <div className="text-xs text-gray-400 font-medium">Categories</div>
              </div>
              <div className="bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 border border-cyan-500/20 rounded-xl p-4 text-center backdrop-blur-sm">
                <div className="text-2xl xxs:text-3xl font-bold text-cyan-400 mb-1">10+</div>
                <div className="text-xs text-gray-400 font-medium">Years Experience</div>
              </div>
            </div>

            {/* Call to Action */}
            <div className="flex items-center space-x-4">
              <div className="w-16 xxs:w-20 h-1 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"></div>
              <span className="text-gray-400 text-sm font-medium">Scroll to explore</span>
              <div className="animate-bounce">
                <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Clean Search and Filter Section */}
      <section className="relative px-3 xxs:px-4 xs:px-6 mb-8 xxs:mb-12">
        <div className="max-w-7xl mx-auto">
            {/* Section Header */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-4">
                Discover Articles
              </h2>
              <p className="text-gray-400">
                Found {currentBlogs.length} of {sortedBlogs.length} articles
              </p>
            </div>

            {/* Clean Search Layout */}
            <div className="max-w-2xl mx-auto mb-8">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by title, content, or tags..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-5 py-4 pl-12 pr-12 bg-white/5 border border-white/15 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500/50 transition-all duration-300 text-base"
                />
                <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setCurrentPage(1);
                    }}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* Clean Category Pills */}
            <div className="flex flex-wrap justify-center gap-3">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => {
                    setSelectedCategory(category.name);
                    setCurrentPage(1);
                  }}
                  className={`px-4 py-2 rounded-full font-medium transition-all duration-300 text-sm ${
                    selectedCategory === category.name
                      ? 'bg-purple-600 text-white'
                      : 'bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white'
                  }`}
                >
                  {category.name === 'All' ? 'All Articles' : category.name}
                  {category.name !== 'All' && category.count && (
                    <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                      selectedCategory === category.name
                        ? 'bg-white/20 text-white'
                        : 'bg-purple-500/20 text-purple-300'
                    }`}>
                      {category.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Clean Results Summary */}
            {(searchQuery || selectedCategory !== 'All') && (
              <div className="mt-6 text-center">
                <div className="text-sm text-gray-400">
                  Showing <span className="font-semibold text-white">{currentBlogs.length}</span> results
                  {searchQuery && <span> for "<span className="text-purple-300 font-medium">{searchQuery}</span>"</span>}
                  {selectedCategory !== 'All' && <span> in <span className="text-blue-300 font-medium">{selectedCategory}</span></span>}
                </div>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('All');
                    setCurrentPage(1);
                  }}
                  className="mt-2 text-xs text-purple-400 hover:text-purple-300 font-medium flex items-center mx-auto transition-colors"
                >
                  Clear filters
                  <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
        </div>
      </section>

      {/* Articles Grid - Separate Mobile and Desktop */}
      <section className="relative px-3 xxs:px-4 xs:px-6 mb-8 xxs:mb-12">
        <div className="max-w-7xl mx-auto">
          {currentBlogs.length > 0 ? (
            <>
              {/* Mobile Layout - Stack Cards Vertically */}
              <div className="block md:hidden space-y-4">
                {currentBlogs.map((blog, index) => (
                  <BlogCard key={blog.id} blog={blog} index={index} />
                ))}
              </div>

              {/* Desktop Layout - Grid */}
              <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {currentBlogs.map((blog, index) => (
                  <BlogCard key={blog.id} blog={blog} index={index} />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-12 xxs:py-16">
              <div className="w-16 h-16 xxs:w-20 xxs:h-20 xs:w-24 xs:h-24 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4 xxs:mb-6">
                <svg className="w-8 h-8 xxs:w-9 xxs:h-9 xs:w-10 xs:h-10 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/>
                  <path d="m21 21l-4.35-4.35"/>
                </svg>
              </div>
              <h3 className="text-lg xxs:text-xl font-semibold text-white mb-2">No articles found</h3>
              <p className="text-gray-400 mb-4 xxs:mb-6 text-sm xxs:text-base">Try adjusting your search or filter criteria</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                  setCurrentPage(1);
                }}
                className="px-4 xxs:px-6 py-2 xxs:py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg text-white font-medium hover:scale-105 transition-all duration-300 text-sm xxs:text-base touch-target"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Pagination - Mobile Optimized */}
      {totalPages > 1 && (
        <section className="relative px-3 xxs:px-4 xs:px-6 mb-8 xxs:mb-12">
          <div className="max-w-7xl mx-auto flex flex-col items-center mobile-content-gap">
            <div className="flex items-center gap-1.5 xxs:gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="mobile-button bg-white/5 border border-white/10 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-600/20 hover:border-purple-500/30 transition-all duration-300 mobile-optimized-blur"
              >
                Prev
              </button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let page;
                  if (totalPages <= 5) {
                    page = i + 1;
                  } else if (currentPage <= 3) {
                    page = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    page = totalPages - 4 + i;
                  } else {
                    page = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-8 h-8 xxs:w-9 xxs:h-9 rounded mobile-text-sm font-medium transition-all duration-300 mobile-optimized-blur touch-target ${
                        currentPage === page
                          ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                          : 'bg-white/5 text-gray-300 border border-white/10 hover:border-purple-500/30 hover:text-purple-300'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="mobile-button bg-white/5 border border-white/10 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-600/20 hover:border-purple-500/30 transition-all duration-300 mobile-optimized-blur"
              >
                Next
              </button>
            </div>
            
            <div className="mobile-text-xs text-gray-400">
              Page {currentPage} of {totalPages}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default BlogListing;