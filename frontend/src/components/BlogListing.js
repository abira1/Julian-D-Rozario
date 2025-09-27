import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

// Mobile Card Component - Simplified and Modern
const MobileBlogCard = ({ blog, index }) => {
  const navigate = useNavigate();
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.onload = () => setImageLoaded(true);
    img.src = blog.image_url || blog.image;
  }, [blog.image_url, blog.image]);

  const handleCardClick = () => {
    navigate(`/blog/${blog.id}`);
  };

  return (
    <article 
      onClick={handleCardClick}
      className="group p-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:border-purple-400/30 hover:bg-white/10 transition-all duration-300 cursor-pointer"
    >
      <div className="flex gap-4">
        {/* Thumbnail */}
        <div className="flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden bg-slate-800">
          {imageLoaded ? (
            <img 
              src={blog.image_url || blog.image} 
              alt={blog.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
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
          {/* Meta */}
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
            <span className="px-2 py-1 bg-purple-600/20 text-purple-300 rounded-md font-medium">
              {blog.category}
            </span>
            <span>•</span>
            <span>{blog.readTime || '5 min read'}</span>
          </div>

          {/* Title */}
          <h3 className="text-sm font-semibold text-white leading-tight mb-2 line-clamp-2 group-hover:text-purple-200 transition-colors duration-300">
            {blog.title}
          </h3>

          {/* Footer */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 12S5 4 12 4S23 12 23 12S19 20 12 20S1 12 1 12Z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
                <span>{blog.views || 0}</span>
              </div>
              <span className="text-xs text-gray-500">•</span>
              <span className="text-xs text-gray-400">
                {new Date(blog.created_at || blog.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            </div>
            
            {/* Read More Arrow */}
            <svg className="w-4 h-4 text-purple-400 transform group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </article>
  );
};

// Desktop Card Component - Enhanced
const DesktopBlogCard = ({ blog, index }) => {
  const navigate = useNavigate();
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.onload = () => setImageLoaded(true);
    img.src = blog.image_url || blog.image;
  }, [blog.image_url, blog.image]);

  const handleCardClick = () => {
    navigate(`/blog/${blog.id}`);
  };

  return (
    <article 
      onClick={handleCardClick}
      className="group relative bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden hover:border-purple-500/30 transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 cursor-pointer"
      style={{
        animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 to-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      {/* Image */}
      <div className="relative h-48 overflow-hidden bg-slate-800">
        {imageLoaded ? (
          <img 
            src={blog.image_url || blog.image} 
            alt={blog.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-700 animate-pulse flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        
        {/* Badges */}
        <div className="absolute top-3 left-3">
          <span className="px-3 py-1 bg-purple-600/90 backdrop-blur-sm rounded-full text-white text-xs font-medium border border-white/20">
            {blog.category}
          </span>
        </div>

        {blog.featured && (
          <div className="absolute top-3 right-3">
            <span className="px-3 py-1 bg-yellow-500/90 backdrop-blur-sm rounded-full text-white text-xs font-medium border border-white/20">
              ⭐ Featured
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="relative z-10 p-5">
        <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
          <span>{new Date(blog.created_at || blog.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
          <div className="flex items-center gap-2">
            <span>{blog.readTime || '5 min read'}</span>
            <span>•</span>
            <div className="flex items-center gap-1">
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 12S5 4 12 4S23 12 23 12S19 20 12 20S1 12 1 12Z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
              <span>{blog.views || 0}</span>
            </div>
          </div>
        </div>

        <h3 className="text-base font-bold text-white mb-3 leading-tight group-hover:text-purple-200 transition-colors duration-300 line-clamp-2">
          {blog.title}
        </h3>

        <p className="text-sm text-gray-300 leading-relaxed line-clamp-3 mb-4">
          {blog.excerpt}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {blog.tags?.slice(0, 2).map((tag, idx) => (
            <span 
              key={idx}
              className="px-2 py-1 bg-white/5 border border-white/10 rounded text-xs text-gray-400"
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* Author & Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
              J
            </div>
            <span className="text-gray-400 text-xs">{blog.author}</span>
          </div>

          <button className="flex items-center gap-1 text-purple-400 hover:text-purple-300 transition-colors duration-300 text-sm font-medium">
            Read
            <svg className="w-3 h-3 transform group-hover:translate-x-1 transition-transform duration-200" viewBox="0 0 24 24" fill="none">
              <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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
      console.log('BlogListing: Fetching blogs from', apiUrl);
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
        console.log('BlogListing: Categories data received:', categoriesData);
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
  
  // Debug logging
  console.log('BlogListing Debug:', {
    totalBlogs: blogs.length,
    selectedCategory,
    filteredBlogs: filteredBlogs.length,
    searchQuery,
    firstBlog: blogs[0]
  });

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

      {/* Hero Section - Mobile First */}
      <section className="relative pt-16 xxs:pt-18 xs:pt-20 sm-mobile:pt-24 pb-8 xxs:pb-12 xs:pb-16 px-3 xxs:px-4 xs:px-6">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 right-1/4 w-48 h-48 xxs:w-64 xxs:h-64 xs:w-80 xs:h-80 sm-mobile:w-96 sm-mobile:h-96 bg-gradient-to-r from-purple-500/5 to-blue-500/5 rounded-full filter blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 left-1/4 w-36 h-36 xxs:w-48 xxs:h-48 xs:w-60 xs:h-60 sm-mobile:w-72 sm-mobile:h-72 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto text-center">
          <h1 className="hero-title-mobile font-bold bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
            All Articles
          </h1>
          <p className="mobile-text-sm xxs:mobile-text-base text-gray-300 max-w-xs xxs:max-w-sm xs:max-w-md sm-mobile:max-w-lg md-tablet:max-w-3xl mx-auto mb-4 xxs:mb-6 xs:mb-8 px-3 leading-relaxed">
            Comprehensive insights on business consulting, licensing strategies, and industry trends
          </p>
          <div className="w-12 xxs:w-16 xs:w-20 h-0.5 xxs:h-1 bg-gradient-to-r from-purple-500 to-blue-500 mx-auto rounded-full"></div>
        </div>
      </section>

      {/* Search and Filter Controls - Mobile First */}
      <section className="relative px-3 xxs:px-4 xs:px-6 mb-6 xxs:mb-8 xs:mb-10">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gradient-to-br from-white/5 to-white/[0.02] mobile-optimized-blur border border-white/10 mobile-card mobile-compact-spacing">
            <div className="flex flex-col mobile-content-gap mb-4 xxs:mb-6">
              {/* Search Bar */}
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full mobile-button pl-8 xxs:pl-10 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 mobile-optimized-blur transition-all duration-300"
                />
                <svg className="absolute left-2.5 xxs:left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              {/* Sort Dropdown */}
              <div className="flex items-center gap-2 xxs:gap-3">
                <label className="text-gray-300 mobile-text-xs flex-shrink-0">Sort:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="mobile-button bg-white/5 border border-white/10 text-white focus:outline-none focus:border-purple-500/50 mobile-optimized-blur transition-all duration-300"
                >
                  <option value="date">Latest</option>
                  <option value="views">Most Viewed</option>
                  <option value="likes">Most Liked</option>
                </select>
              </div>
            </div>

            {/* Category Pills - Mobile Optimized */}
            <div className="flex flex-wrap gap-1.5 xxs:gap-2 justify-center">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => {
                    setSelectedCategory(category.name);
                    setCurrentPage(1);
                  }}
                  className={`px-2.5 xxs:px-3 py-1.5 xxs:py-2 rounded mobile-text-xs xxs:mobile-text-sm font-medium transition-all duration-300 mobile-optimized-blur border touch-target ${
                    selectedCategory === category.name
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white border-transparent shadow-lg'
                      : 'bg-white/5 text-gray-300 border-white/10 hover:border-purple-500/30 hover:text-purple-300'
                  }`}
                >
                  {category.name === 'All' ? 'All' : category.name.split(' ')[0]} 
                  {category.name !== 'All' && ` (${category.count})`}
                </button>
              ))}
            </div>

            <div className="text-center mt-4 xxs:mt-6">
              <p className="text-gray-400 text-xs xxs:text-sm">
                Showing {currentBlogs.length} of {sortedBlogs.length} articles
                {searchQuery && ` for "${searchQuery}"`}
                {selectedCategory !== 'All' && ` in ${selectedCategory}`}
              </p>
            </div>
          </div>
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