import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import GradualBlur from './GradualBlur';
import { blogData, blogCategories } from '../data/mockData';

const BlogCard = ({ blog, index }) => {
  const cardRef = useRef(null);
  const navigate = useNavigate();
  const [imageLoaded, setImageLoaded] = useState(false);

  // Preload image for better performance
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
      ref={cardRef}
      onClick={handleCardClick}
      className="group relative bg-gradient-to-br from-white/5 to-white/[0.02] mobile-optimized-blur border border-white/10 mobile-card hover:border-purple-500/30 transition-all duration-300 cursor-pointer hover:scale-[1.01] xxs:hover:scale-[1.02] hover:-translate-y-1 touch-target"
      style={{
        background: `
          linear-gradient(135deg, 
            rgba(139, 92, 246, 0.08) 0%, 
            rgba(59, 130, 246, 0.04) 50%, 
            rgba(30, 58, 138, 0.08) 100%
          )
        `,
        boxShadow: `
          0 4px 15px rgba(0, 0, 0, 0.1),
          inset 0 1px 0 rgba(255, 255, 255, 0.1)
        `,
        animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`
      }}
    >
      <div className="absolute inset-0 rounded-xl xxs:rounded-2xl bg-gradient-to-r from-purple-600/10 to-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      <div className="relative h-32 xxs:h-36 xs:h-40 sm-mobile:h-44 overflow-hidden bg-slate-800">
        {imageLoaded ? (
          <img 
            src={blog.image_url || blog.image} 
            alt={blog.title}
            className="responsive-blog-image transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-700 animate-pulse flex items-center justify-center">
            <div className="w-6 h-6 xxs:w-8 xxs:h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
        
        <div className="absolute top-2 xxs:top-3 xs:top-4 left-2 xxs:left-3 xs:left-4 px-2 xxs:px-3 py-1 bg-gradient-to-r from-purple-600/90 to-blue-600/90 mobile-optimized-blur rounded-md xxs:rounded-lg text-white text-xs xxs:text-sm font-medium border border-white/20">
          {blog.category}
        </div>

        {blog.featured && (
          <div className="absolute top-2 xxs:top-3 xs:top-4 right-2 xxs:right-3 xs:right-4 px-2 py-1 bg-gradient-to-r from-yellow-500/90 to-orange-500/90 mobile-optimized-blur rounded-md xxs:rounded-lg text-white text-xs font-medium border border-white/20">
            ⭐ Featured
          </div>
        )}
      </div>

      <div className="relative z-10 mobile-compact-spacing">
        <div className="flex items-center justify-between mobile-text-xs text-gray-400 mb-1 xxs:mb-2">
          <span className="truncate max-w-[60%]">{new Date(blog.created_at || blog.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
          <div className="flex items-center gap-1 xxs:gap-2">
            <span className="hidden xs:inline mobile-text-xs">{blog.readTime}</span>
            <div className="flex items-center gap-1">
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 12S5 4 12 4S23 12 23 12S19 20 12 20S1 12 1 12Z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
              <span>{blog.views}</span>
            </div>
          </div>
        </div>

        <h3 className="mobile-title font-semibold text-white group-hover:text-purple-300 transition-colors duration-300 line-clamp-2">
          {blog.title}
        </h3>

        <p className="text-gray-300 mobile-text-sm leading-relaxed mb-2 xxs:mb-3 line-clamp-2">
          {blog.excerpt}
        </p>

        <div className="flex flex-wrap gap-1 mb-2 xxs:mb-3">
          {blog.tags?.slice(0, 2).map((tag, idx) => (
            <span 
              key={idx}
              className="px-1.5 xxs:px-2 py-0.5 xxs:py-1 bg-white/5 border border-white/10 rounded mobile-text-xs text-gray-400"
            >
              #{tag}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 xxs:gap-2">
            <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white mobile-text-xs font-semibold">
              JD
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-gray-400 mobile-text-xs truncate">{blog.author}</div>
              <div className="flex items-center gap-1 mobile-text-xs text-gray-500">
                <svg className="w-2.5 h-2.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20.84 4.61C20.3292 4.099 19.7228 3.69364 19.0554 3.41708C18.3879 3.14052 17.6725 2.99817 16.95 3C16.3128 3.00364 15.6865 3.15523 15.1146 3.44361C14.5427 3.73198 14.0389 4.14704 13.64 4.66L12 6.78L10.36 4.66C9.96104 4.14704 9.45727 3.73198 8.88537 3.44361C8.31348 3.15523 7.68717 3.00364 7.05 3C6.32755 2.99817 5.61208 3.14052 4.94463 3.41708C4.27718 3.69364 3.67075 4.099 3.16 4.61C2.14821 5.6228 1.58407 7.01368 1.58407 8.465C1.58407 9.91632 2.14821 11.3072 3.16 12.32L12 21.16L20.84 12.32C21.8518 11.3072 22.4159 9.91632 22.4159 8.465C22.4159 7.01368 21.8518 5.6228 20.84 4.61Z"/>
                </svg>
                <span>{blog.likes}</span>
              </div>
            </div>
          </div>

          <button className="hidden sm-mobile:flex items-center gap-1.5 text-purple-400 hover:text-purple-300 transition-colors duration-300 mobile-text-sm font-medium touch-target">
            Read
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none">
              <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>

      <div className="absolute inset-0 pointer-events-none">
        <GradualBlur
          position="bottom"
          height="2rem"
          strength={1}
          divCount={3}
          opacity={0.3}
        />
      </div>
    </article>
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
      
      // Fetch blogs
      const blogsResponse = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/blogs`);
      if (blogsResponse.ok) {
        const blogsData = await blogsResponse.json();
        setBlogs(blogsData);
      } else {
        // Fallback to mock data
        setBlogs(blogData);
      }

      // Fetch categories
      const categoriesResponse = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/categories`);
      if (categoriesResponse.ok) {
        const categoriesData = await categoriesResponse.json();
        setCategories(categoriesData);
      } else {
        // Fallback to mock data
        setCategories(blogCategories);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      // Fallback to mock data
      setBlogs(blogData);
      setCategories(blogCategories);
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

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-slate-950/30 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-20 w-20 xxs:h-24 xxs:w-24 xs:h-32 xs:w-32 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-white text-sm xxs:text-base xs:text-lg">Loading blogs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-slate-950/30 to-black">
      {/* Navigation - Mobile Optimized */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-black/90 mobile-optimized-blur border-b border-white/10">
        <div className="max-w-7xl mx-auto px-3 xxs:px-4 xs:px-6 py-3 xxs:py-4 flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 xxs:gap-3 group touch-target"
          >
            <span className="text-base xxs:text-lg xs:text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-300"
            style={{ fontFamily: 'Encode Sans Semi Expanded, sans-serif' }}>
              Julian D'Rozario
            </span>
          </button>

          <button
            onClick={() => navigate('/')}
            className="text-gray-300 hover:text-white transition-colors duration-300 text-sm xxs:text-base touch-target"
          >
            ← Back to Home
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
                  key={category.name}
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

      {/* Articles Grid - Mobile First Responsive */}
      <section className="relative px-3 xxs:px-4 xs:px-6 mb-8 xxs:mb-12">
        <div className="max-w-7xl mx-auto">
          {currentBlogs.length > 0 ? (
            <div className="grid grid-cols-1 xs:grid-cols-2 md-tablet:grid-cols-3 lg-desktop:grid-cols-4 mobile-content-gap">
              {currentBlogs.map((blog, index) => (
                <BlogCard key={blog.id} blog={blog} index={index} />
              ))}
            </div>
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
        <section className="relative px-3 xxs:px-4 xs:px-6 mb-12 xxs:mb-16">
          <div className="max-w-7xl mx-auto flex flex-col items-center gap-4 xxs:gap-6">
            <div className="flex items-center gap-2 xxs:gap-3">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 xxs:px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-600/20 hover:border-purple-500/30 transition-all duration-300 mobile-optimized-blur text-sm xxs:text-base touch-target"
              >
                Previous
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
                      className={`w-8 h-8 xxs:w-10 xxs:h-10 rounded-lg font-medium transition-all duration-300 mobile-optimized-blur text-sm xxs:text-base touch-target ${
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
                className="px-3 xxs:px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-600/20 hover:border-purple-500/30 transition-all duration-300 mobile-optimized-blur text-sm xxs:text-base touch-target"
              >
                Next
              </button>
            </div>
            
            <div className="text-xs xxs:text-sm text-gray-400">
              Page {currentPage} of {totalPages}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default BlogListing;