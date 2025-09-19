import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import GradualBlur from './GradualBlur';
import { blogData, blogCategories } from '../data/mockData';

gsap.registerPlugin(ScrollTrigger);

const BlogCard = ({ blog, index, layout = 'standard' }) => {
  const cardRef = useRef(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);

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

    // Enhanced hover animations
    const handleMouseEnter = () => {
      gsap.to(card, {
        y: -15,
        rotateX: 8,
        rotateY: 8,
        scale: 1.03,
        duration: 0.4,
        ease: "power2.out"
      });
      
      // Simulate reading progress
      let progress = 0;
      const interval = setInterval(() => {
        progress += 2;
        setReadingProgress(progress);
        if (progress >= 100) {
          clearInterval(interval);
        }
      }, 50);
    };

    const handleMouseLeave = () => {
      gsap.to(card, {
        y: 0,
        rotateX: 0,
        rotateY: 0,
        scale: 1,
        duration: 0.4,
        ease: "power2.out"
      });
      setReadingProgress(0);
    };

    card.addEventListener('mouseenter', handleMouseEnter);
    card.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      card.removeEventListener('mouseenter', handleMouseEnter);
      card.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [index]);

  const shareArticle = (platform) => {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(blog.title);
    
    const shareUrls = {
      twitter: `https://twitter.com/intent/tweet?text=${title}&url=${url}`,
      linkedin: `https://linkedin.com/sharing/share-offsite/?url=${url}`,
      facebook: `https://facebook.com/sharer/sharer.php?u=${url}`
    };
    
    window.open(shareUrls[platform], '_blank', 'width=600,height=400');
  };

  const featuredClass = layout === 'featured' ? 'lg:col-span-2 lg:row-span-2' : '';
  const compactClass = layout === 'compact' ? 'lg:col-span-1' : '';

  return (
    <article 
      ref={cardRef}
      className={`group relative bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden hover:border-purple-500/30 transition-all duration-300 cursor-pointer ${featuredClass} ${compactClass}`}
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
      {/* Enhanced glow effect */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-purple-600/10 to-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      {/* Floating elements */}
      <div className="absolute -top-2 -right-2 w-4 h-4 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-bounce"></div>
      <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-bounce" style={{ animationDelay: '0.5s' }}></div>

      {/* Reading progress bar */}
      <div className="absolute top-0 left-0 h-1 bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-300 rounded-t-3xl" style={{ width: `${readingProgress}%` }}></div>

      {/* Image */}
      <div className={`relative overflow-hidden ${layout === 'featured' ? 'h-64 lg:h-80' : layout === 'compact' ? 'h-40' : 'h-48'}`}>
        <img 
          src={blog.image} 
          alt={blog.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        
        {/* Category badge */}
        <div className="absolute top-4 left-4 px-3 py-1 bg-gradient-to-r from-purple-600/90 to-blue-600/90 backdrop-blur-sm rounded-full text-white text-sm font-medium border border-white/20 shadow-lg">
          {blog.category}
        </div>

        {/* Featured badge */}
        {blog.featured && (
          <div className="absolute top-4 right-4 px-2 py-1 bg-gradient-to-r from-yellow-500/90 to-orange-500/90 backdrop-blur-sm rounded-full text-white text-xs font-medium border border-white/20 shadow-lg">
            ⭐ Featured
          </div>
        )}

        {/* Bookmark button */}
        <button
          onClick={() => setIsBookmarked(!isBookmarked)}
          className="absolute bottom-4 right-4 w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-purple-600/50 transition-colors duration-300 border border-white/20"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill={isBookmarked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
            <path d="M19 21L12 16L5 21V5C5 4.46957 5.21071 3.96086 5.58579 3.58579C5.96086 3.21071 6.46957 3 7 3H17C17.5304 3 18.0391 3.21071 18.4142 3.58579C18.7893 3.96086 19 4.46957 19 5V21Z"/>
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="relative z-10 p-6">
        <div className="flex items-center justify-between text-sm text-gray-400 mb-3">
          <span>{new Date(blog.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
          <div className="flex items-center gap-4">
            <span>{blog.readTime}</span>
            <div className="flex items-center gap-1">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 12S5 4 12 4S23 12 23 12S19 20 12 20S1 12 1 12Z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
              <span>{blog.views}</span>
            </div>
          </div>
        </div>

        <h3 className={`font-semibold text-white mb-3 group-hover:text-purple-300 transition-colors duration-300 line-clamp-2 ${layout === 'featured' ? 'text-2xl' : 'text-xl'}`}>
          {blog.title}
        </h3>

        <p className={`text-gray-300 leading-relaxed mb-4 line-clamp-3 ${layout === 'featured' ? 'text-base' : 'text-sm'}`}>
          {blog.excerpt}
        </p>

        {/* Tags */}
        {layout !== 'compact' && (
          <div className="flex flex-wrap gap-2 mb-4">
            {blog.tags?.slice(0, 3).map((tag, idx) => (
              <span 
                key={idx}
                className="px-2 py-1 bg-white/5 border border-white/10 rounded-lg text-xs text-gray-400 hover:text-purple-300 hover:border-purple-500/30 transition-colors duration-300 cursor-pointer"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
              JR
            </div>
            <div>
              <div className="text-gray-400 text-sm">{blog.author}</div>
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20.84 4.61C20.3292 4.099 19.7228 3.69364 19.0554 3.41708C18.3879 3.14052 17.6725 2.99817 16.95 3C16.3128 3.00364 15.6865 3.15523 15.1146 3.44361C14.5427 3.73198 14.0389 4.14704 13.64 4.66L12 6.78L10.36 4.66C9.96104 4.14704 9.45727 3.73198 8.88537 3.44361C8.31348 3.15523 7.68717 3.00364 7.05 3C6.32755 2.99817 5.61208 3.14052 4.94463 3.41708C4.27718 3.69364 3.67075 4.099 3.16 4.61C2.14821 5.6228 1.58407 7.01368 1.58407 8.465C1.58407 9.91632 2.14821 11.3072 3.16 12.32L12 21.16L20.84 12.32C21.8518 11.3072 22.4159 9.91632 22.4159 8.465C22.4159 7.01368 21.8518 5.6228 20.84 4.61Z"/>
                  </svg>
                  <span>{blog.likes}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Share buttons */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <button 
                onClick={() => shareArticle('twitter')}
                className="w-8 h-8 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center text-gray-400 hover:text-blue-400 hover:bg-blue-400/10 transition-colors duration-300"
                title="Share on Twitter"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.953 4.57C23.099 4.946 22.192 5.21 21.253 5.35C22.218 4.791 22.954 3.904 23.307 2.853C22.396 3.372 21.396 3.745 20.357 3.954C19.487 3.076 18.281 2.55 16.964 2.55C14.455 2.55 12.427 4.578 12.427 7.087C12.427 7.458 12.472 7.818 12.558 8.163C8.784 7.967 5.488 6.188 3.302 3.435C2.896 4.116 2.665 4.904 2.665 5.749C2.665 7.336 3.473 8.73 4.717 9.548C3.971 9.524 3.274 9.318 2.665 8.97V9.032C2.665 11.233 4.208 13.067 6.291 13.501C5.894 13.609 5.477 13.666 5.047 13.666C4.746 13.666 4.454 13.637 4.168 13.583C4.762 15.383 6.413 16.681 8.387 16.717C6.856 17.921 4.928 18.634 2.83 18.634C2.449 18.634 2.074 18.612 1.708 18.568C3.703 19.838 6.078 20.573 8.626 20.573C16.954 20.573 21.5 13.74 21.5 7.638C21.5 7.435 21.495 7.234 21.486 7.034C22.408 6.395 23.209 5.596 23.954 4.622L23.953 4.57Z"/>
                </svg>
              </button>
              <button 
                onClick={() => shareArticle('linkedin')}
                className="w-8 h-8 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center text-gray-400 hover:text-blue-600 hover:bg-blue-600/10 transition-colors duration-300"
                title="Share on LinkedIn"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.447 20.452H16.893V14.883C16.893 13.555 16.866 11.846 15.041 11.846C13.188 11.846 12.905 13.291 12.905 14.785V20.452H9.351V9H12.765V10.561H12.811C13.288 9.661 14.448 8.711 16.181 8.711C19.782 8.711 20.448 11.081 20.448 14.166V20.452H20.447ZM5.337 7.433C4.193 7.433 3.274 6.507 3.274 5.368C3.274 4.23 4.194 3.305 5.337 3.305C6.477 3.305 7.401 4.23 7.401 5.368C7.401 6.507 6.476 7.433 5.337 7.433ZM7.119 20.452H3.555V9H7.119V20.452ZM22.225 0H1.771C0.792 0 0 0.774 0 1.729V22.271C0 23.227 0.792 24 1.771 24H22.222C23.2 24 24 23.227 24 22.271V1.729C24 0.774 23.2 0 22.222 0H22.225Z"/>
                </svg>
              </button>
            </div>
            
            <button className="flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors duration-300 text-sm font-medium ml-2">
              Read More
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced gradual blur overlay */}
      <div className="absolute inset-0 pointer-events-none">
        <GradualBlur
          position="bottom"
          height="4rem"
          strength={1.5}
          divCount={5}
          opacity={0.4}
          curve="bezier"
        />
      </div>
    </article>
  );
};

const BlogSection = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('date');
  const articlesPerPage = 6;

  // Filter and search logic
  const filteredBlogs = blogData.filter(blog => {
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
        return new Date(b.date) - new Date(a.date);
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

  // Get layout for each article
  const getArticleLayout = (blog, index) => {
    if (blog.featured && index === 0) return 'featured';
    if (index >= 4) return 'compact';
    return 'standard';
  };

  return (
    <section id="blog" className="relative py-24 px-4 bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 overflow-hidden">
      {/* Enhanced background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-purple-500/5 to-blue-500/5 rounded-full filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 left-1/4 w-72 h-72 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-gradient-to-r from-purple-500/3 to-blue-500/3 rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Enhanced Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
            Latest Insights
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
            Explore cutting-edge strategies, industry insights, and expert analysis in business consulting, licensing, and digital transformation
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-purple-500 to-blue-500 mx-auto rounded-full"></div>
        </div>

        {/* Search and Filter Controls */}
        <div className="mb-12">
          <div className="flex flex-col lg:flex-row gap-6 items-center justify-between mb-8">
            {/* Search Bar */}
            <div className="relative w-full lg:w-96">
              <input
                type="text"
                placeholder="Search articles, topics, or tags..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-3 pl-12 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 backdrop-blur-sm transition-all duration-300"
              />
              <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-4">
              <label className="text-gray-300 text-sm">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500/50 backdrop-blur-sm transition-all duration-300"
              >
                <option value="date">Latest</option>
                <option value="views">Most Viewed</option>
                <option value="likes">Most Liked</option>
              </select>
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-3 justify-center">
            {blogCategories.map((category) => (
              <button
                key={category.name}
                onClick={() => {
                  setSelectedCategory(category.name);
                  setCurrentPage(1);
                }}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 backdrop-blur-sm border ${
                  selectedCategory === category.name
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white border-transparent shadow-lg'
                    : 'bg-white/5 text-gray-300 border-white/10 hover:border-purple-500/30 hover:text-purple-300'
                }`}
              >
                {category.name} {category.name !== 'All' && `(${category.count})`}
              </button>
            ))}
          </div>
        </div>

        {/* Results Summary */}
        <div className="text-center mb-8">
          <p className="text-gray-400">
            Showing {currentBlogs.length} of {sortedBlogs.length} articles
            {searchQuery && ` for "${searchQuery}"`}
            {selectedCategory !== 'All' && ` in ${selectedCategory}`}
          </p>
        </div>

        {/* Enhanced Blog Grid */}
        {currentBlogs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {currentBlogs.map((blog, index) => (
              <BlogCard 
                key={blog.id} 
                blog={blog} 
                index={index} 
                layout={getArticleLayout(blog, index)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21l-4.35-4.35"/>
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No articles found</h3>
            <p className="text-gray-400 mb-6">Try adjusting your search or filter criteria</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
                setCurrentPage(1);
              }}
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg text-white font-medium hover:scale-105 transition-all duration-300"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* Enhanced Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-600/20 hover:border-purple-500/30 transition-all duration-300 backdrop-blur-sm"
              >
                Previous
              </button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-10 h-10 rounded-lg font-medium transition-all duration-300 backdrop-blur-sm ${
                      currentPage === page
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                        : 'bg-white/5 text-gray-300 border border-white/10 hover:border-purple-500/30 hover:text-purple-300'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
              
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-600/20 hover:border-purple-500/30 transition-all duration-300 backdrop-blur-sm"
              >
                Next
              </button>
            </div>
            
            <div className="text-sm text-gray-400">
              Page {currentPage} of {totalPages}
            </div>
          </div>
        )}

        {/* Newsletter Signup */}
        <div className="relative">
          <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl border border-white/10 rounded-3xl p-8 text-center">
            <h3 className="text-2xl font-bold text-white mb-4">Stay Updated</h3>
            <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
              Get the latest business insights and strategic advice delivered directly to your inbox. Join over 5,000+ business leaders who trust our expertise.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email address"
                className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 backdrop-blur-sm transition-all duration-300"
              />
              <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl text-white font-semibold hover:scale-105 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/25">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BlogSection;