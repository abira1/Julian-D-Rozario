import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Menu, Heart, Bookmark, Twitter, Linkedin, Facebook, 
  Link as LinkIcon, MessageCircle, Send, CheckCircle, 
  TrendingUp, ThumbsUp, Eye, Clock, Share2, Copy,
  ChevronUp, ArrowUp
} from 'lucide-react';

const PremiumBlogDisplay = () => {
  const { id } = useParams();
  
  // State management
  const [blog, setBlog] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [comments, setComments] = useState([]);
  const [blogStats, setBlogStats] = useState({
    likes: 0,
    views: 0,
    bookmarks: 0,
    comments: 0,
    userLiked: false,
    userBookmarked: false
  });
  
  // Comment form state
  const [newComment, setNewComment] = useState({ name: '', email: '', message: '' });
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  
  // UI state
  const [isLiking, setIsLiking] = useState(false);
  const [isBookmarking, setIsBookmarking] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);
  
  // Author info
  const authorInfo = {
    name: "Julian D'Rozario",
    title: "Business Consultant & Licensing Advisor",
    bio: "Business Consultant & Licensing Advisor with over 8 years of experience helping companies achieve sustainable growth through strategic planning and innovative licensing solutions.",
    avatar: "/images/julian-avatar.jpg",
    linkedin: "https://linkedin.com/in/julian-d-rozario"
  };

  // Fetch blog data
  const fetchBlog = useCallback(async () => {
    try {
      const response = await fetch(`https://drozario.blog/api/blogs/${id}`);
      if (response.ok) {
        const blogData = await response.json();
        setBlog(blogData);
      } else {
        console.error('Failed to fetch blog');
      }
    } catch (error) {
      console.error('Error fetching blog:', error);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  // Fetch blog statistics
  const fetchBlogStats = useCallback(async () => {
    try {
      const response = await fetch(`https://drozario.blog/api/blogs/${id}/stats`);
      if (response.ok) {
        const stats = await response.json();
        setBlogStats(stats);
      }
    } catch (error) {
      console.error('Error fetching blog stats:', error);
    }
  }, [id]);

  // Fetch comments
  const fetchComments = useCallback(async () => {
    try {
      const response = await fetch(`https://drozario.blog/api/blogs/${id}/comments`);
      if (response.ok) {
        const commentsData = await response.json();
        setComments(commentsData.comments || []);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  }, [id]);

  // Handle like functionality
  const handleLike = async () => {
    if (isLiking) return;
    setIsLiking(true);
    
    try {
      const response = await fetch(`https://drozario.blog/api/blogs/${id}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        const data = await response.json();
        setBlogStats(prev => ({
          ...prev,
          likes: data.likes,
          userLiked: data.userLiked
        }));
      }
    } catch (error) {
      console.error('Error liking blog:', error);
    } finally {
      setIsLiking(false);
    }
  };

  // Handle bookmark functionality
  const handleBookmark = async () => {
    if (isBookmarking) return;
    setIsBookmarking(true);
    
    try {
      const response = await fetch(`https://drozario.blog/api/blogs/${id}/bookmark`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        const data = await response.json();
        setBlogStats(prev => ({
          ...prev,
          userBookmarked: data.bookmarked
        }));
      }
    } catch (error) {
      console.error('Error bookmarking blog:', error);
    } finally {
      setIsBookmarking(false);
    }
  };

  // Handle comment submission
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (isSubmittingComment) return;
    
    setIsSubmittingComment(true);
    
    try {
      const response = await fetch(`https://drozario.blog/api/blogs/${id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newComment)
      });

      if (response.ok) {
        const newCommentData = await response.json();
        setComments(prev => [newCommentData, ...prev]);
        setNewComment({ name: '', email: '', message: '' });
        setBlogStats(prev => ({ ...prev, comments: prev.comments + 1 }));
      } else {
        console.error('Failed to submit comment');
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  // Social sharing functions
  const shareToTwitter = () => {
    const text = encodeURIComponent(blog.title);
    const url = encodeURIComponent(window.location.href);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank', 'width=600,height=400');
  };

  const shareToLinkedIn = () => {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank', 'width=600,height=400');
  };

  const shareToFacebook = () => {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank', 'width=600,height=400');
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      // You could add a toast notification here
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
  };

  // Scroll handling
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY;
      const maxHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrolled / maxHeight) * 100;
      
      setReadingProgress(Math.min(progress, 100));
      setShowScrollTop(scrolled > 500);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Initialize data
  useEffect(() => {
    fetchBlog();
    fetchBlogStats();
    fetchComments();
  }, [fetchBlog, fetchBlogStats, fetchComments]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full animate-pulse mx-auto mb-4"></div>
          <div className="text-xl font-medium text-gray-300">Loading premium content...</div>
        </div>
      </div>
    );
  }

  // Error state
  if (!blog) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Blog Not Found</h2>
          <p className="text-xl text-gray-400 mb-8">The blog post you're looking for doesn't exist.</p>
          <Link to="/" className="text-purple-400 hover:text-purple-300 underline text-lg">Return to Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black relative">
      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-gray-800 z-50">
        <div 
          className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-150"
          style={{ width: `${readingProgress}%` }}
        />
      </div>

      {/* Slim Header Navigation */}
      <header className="sticky top-0 z-40 bg-black/90 backdrop-blur-sm border-b border-gray-800/50">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* Brand/Title */}
            <div className="flex items-center">
              <Link to="/" className="text-xl font-semibold text-white hover:text-gray-300 transition-colors">
                Julian D'Rozario
              </Link>
            </div>
            
            {/* Utility Icons */}
            <div className="flex items-center gap-3">
              <button className="w-10 h-10 bg-gray-800/60 hover:bg-gray-700/60 text-gray-300 hover:text-white rounded-lg transition-all duration-200 flex items-center justify-center shadow-sm hover:shadow-md">
                <Menu className="w-5 h-5" />
              </button>
              <button 
                onClick={handleLike}
                disabled={isLiking}
                className={`w-10 h-10 bg-gray-800/60 hover:bg-gray-700/60 rounded-lg transition-all duration-200 flex items-center justify-center shadow-sm hover:shadow-md ${
                  blogStats.userLiked ? 'text-pink-400' : 'text-gray-300 hover:text-pink-400'
                } ${isLiking ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Heart className={`w-5 h-5 ${blogStats.userLiked ? 'fill-current' : ''}`} />
              </button>
              <button 
                onClick={handleBookmark}
                disabled={isBookmarking}
                className={`w-10 h-10 bg-gray-800/60 hover:bg-gray-700/60 rounded-lg transition-all duration-200 flex items-center justify-center shadow-sm hover:shadow-md ${
                  blogStats.userBookmarked ? 'text-blue-400' : 'text-gray-300 hover:text-blue-400'
                } ${isBookmarking ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Bookmark className={`w-5 h-5 ${blogStats.userBookmarked ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section - Full Width with Enhanced Banner Background */}
      <section className="relative h-[85vh] flex items-center justify-center overflow-hidden">
        {/* Enhanced Banner Background */}
        <div className="absolute inset-0">
          {blog.featured_image || blog.image_url || blog.image ? (
            <>
              {/* Main banner image with blur effect */}
              <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{ 
                  backgroundImage: `url(${blog.featured_image || blog.image_url || blog.image})`,
                  filter: 'blur(2px) brightness(0.25) contrast(1.1)'
                }}
              />
              {/* Sharp banner image overlay with gradient */}
              <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
                style={{ 
                  backgroundImage: `url(${blog.featured_image || blog.image_url || blog.image})`,
                  mixBlendMode: 'overlay'
                }}
              />
            </>
          ) : (
            // Enhanced gradient fallback
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-gray-900" />
          )}
          {/* Dynamic overlay based on image presence */}
          <div className={`absolute inset-0 ${blog.featured_image || blog.image_url || blog.image ? 'bg-black/40' : 'bg-black/60'}`} />
          
          {/* Animated particles effect */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
            <div className="absolute top-3/4 right-1/3 w-1 h-1 bg-blue-400 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
            <div className="absolute bottom-1/4 left-1/2 w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse" style={{animationDelay: '2s'}}></div>
          </div>
        </div>

        <div className="relative z-10 container mx-auto px-6 text-center">
          <div className="max-w-5xl mx-auto">
            
            {/* Category Badges Row */}
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              <span className="px-6 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-medium rounded-full text-sm shadow-lg">
                Company Formation
              </span>
              <span className="px-6 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium rounded-full text-sm shadow-lg">
                AI Research
              </span>
              {blog.category && (
                <span className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-full text-sm shadow-lg">
                  {blog.category}
                </span>
              )}
            </div>

            {/* Large Bold Headline */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.1] mb-8 tracking-tight">
              {blog.title}
            </h1>

            {/* Subtitle/Description */}
            <p className="text-xl md:text-2xl text-gray-400 mb-16 max-w-4xl mx-auto leading-relaxed font-light">
              {blog.subtitle || blog.excerpt || 'Understanding the key differences between Free Zone and Mainland company formation in Dubai and which option suits your business needs.'}
            </p>

            {/* Author Meta Row */}
            <div className="flex flex-col lg:flex-row items-center justify-between max-w-4xl mx-auto">
              {/* Author Info Left */}
              <div className="flex items-center gap-6 mb-8 lg:mb-0">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                  JD
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-semibold text-white mb-1">{authorInfo.name}</h3>
                  <p className="text-gray-400 text-sm">
                    {new Date(blog.created_at || blog.date).toLocaleDateString()} • 
                    {blog.reading_time || blog.read_time || 5} min read • 
                    {blogStats.views} views
                  </p>
                </div>
              </div>

              {/* Social Sharing Buttons Right */}
              <div className="flex items-center gap-4">
                <button
                  onClick={shareToTwitter}
                  className="w-12 h-12 bg-gray-800/60 hover:bg-blue-500/20 text-gray-300 hover:text-blue-400 rounded-lg transition-all duration-200 flex items-center justify-center shadow-sm hover:shadow-md"
                  title="Share on Twitter"
                >
                  <Twitter className="w-5 h-5" />
                </button>
                <button
                  onClick={shareToLinkedIn}
                  className="w-12 h-12 bg-gray-800/60 hover:bg-blue-500/20 text-gray-300 hover:text-blue-400 rounded-lg transition-all duration-200 flex items-center justify-center shadow-sm hover:shadow-md"
                  title="Share on LinkedIn"
                >
                  <Linkedin className="w-5 h-5" />
                </button>
                <button
                  onClick={shareToFacebook}
                  className="w-12 h-12 bg-gray-800/60 hover:bg-blue-500/20 text-gray-300 hover:text-blue-400 rounded-lg transition-all duration-200 flex items-center justify-center shadow-sm hover:shadow-md"
                  title="Share on Facebook"
                >
                  <Facebook className="w-5 h-5" />
                </button>
                <button
                  onClick={copyLink}
                  className="w-12 h-12 bg-gray-800/60 hover:bg-gray-500/20 text-gray-300 hover:text-gray-100 rounded-lg transition-all duration-200 flex items-center justify-center shadow-sm hover:shadow-md"
                  title="Copy Link"
                >
                  <LinkIcon className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Reaction Indicators */}
            <div className="flex items-center justify-center gap-8 mt-8 text-gray-500 text-sm">
              <span className="flex items-center gap-2">
                <Heart className="w-4 h-4" />
                {blogStats.likes} likes
              </span>
              <span className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                {blogStats.comments} comments
              </span>
              <span className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                {blogStats.views} views
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Container - Large Centered Rounded Panel */}
      <main className="relative -mt-20 z-20">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <article className="bg-gray-900/95 backdrop-blur-sm rounded-3xl p-12 lg:p-16 shadow-2xl border border-gray-800/50">
              
              {/* Quick Info Modules - Side by Side */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
                {/* Key Takeaways */}
                <div className="bg-gray-800/50 rounded-2xl p-8 shadow-lg border border-gray-700/30">
                  <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                    Key Takeaways
                  </h3>
                  <ul className="space-y-4">
                    {blog.key_takeaways && blog.key_takeaways.length > 0 ? (
                      blog.key_takeaways.map((takeaway, index) => (
                        <li key={index} className="flex items-start gap-4 text-gray-300">
                          <div className="w-2 h-2 bg-blue-400 rounded-full mt-3 flex-shrink-0"></div>
                          <span className="text-lg leading-relaxed">{takeaway}</span>
                        </li>
                      ))
                    ) : (
                      <>
                        <li className="flex items-start gap-4 text-gray-300">
                          <div className="w-2 h-2 bg-blue-400 rounded-full mt-3 flex-shrink-0"></div>
                          <span className="text-lg leading-relaxed">Strategic planning drives sustainable growth</span>
                        </li>
                        <li className="flex items-start gap-4 text-gray-300">
                          <div className="w-2 h-2 bg-blue-400 rounded-full mt-3 flex-shrink-0"></div>
                          <span className="text-lg leading-relaxed">Data-driven decisions improve outcomes</span>
                        </li>
                        <li className="flex items-start gap-4 text-gray-300">
                          <div className="w-2 h-2 bg-blue-400 rounded-full mt-3 flex-shrink-0"></div>
                          <span className="text-lg leading-relaxed">Implementation requires systematic approach</span>
                        </li>
                      </>
                    )}
                  </ul>
                </div>

                {/* Quick Stats */}
                <div className="bg-gray-800/50 rounded-2xl p-8 shadow-lg border border-gray-700/30">
                  <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                    Quick Stats
                  </h3>
                  <ul className="space-y-4">
                    {blog.quick_stats && blog.quick_stats.length > 0 ? (
                      blog.quick_stats.map((stat, index) => (
                        <li key={index} className="flex items-start gap-4 text-gray-300">
                          <div className="w-2 h-2 bg-purple-400 rounded-full mt-3 flex-shrink-0"></div>
                          <span className="text-lg leading-relaxed font-medium">{stat}</span>
                        </li>
                      ))
                    ) : (
                      <>
                        <li className="flex items-start gap-4 text-gray-300">
                          <div className="w-2 h-2 bg-purple-400 rounded-full mt-3 flex-shrink-0"></div>
                          <span className="text-lg leading-relaxed font-medium">85% success rate in implementations</span>
                        </li>
                        <li className="flex items-start gap-4 text-gray-300">
                          <div className="w-2 h-2 bg-purple-400 rounded-full mt-3 flex-shrink-0"></div>
                          <span className="text-lg leading-relaxed font-medium">3x ROI improvement on average</span>
                        </li>
                        <li className="flex items-start gap-4 text-gray-300">
                          <div className="w-2 h-2 bg-purple-400 rounded-full mt-3 flex-shrink-0"></div>
                          <span className="text-lg leading-relaxed font-medium">6-month typical timeline</span>
                        </li>
                      </>
                    )}
                  </ul>
                </div>
              </div>

              {/* Pull Quote Block */}
              {(blog.quote_text || !blog.main_content) && (
                <div className="relative mb-16">
                  <div className="bg-gradient-to-r from-purple-500/10 to-purple-600/10 border-l-8 border-purple-500 rounded-r-2xl p-12 text-center">
                    <blockquote className="text-3xl lg:text-4xl font-bold text-white mb-6 leading-tight">
                      "{blog.quote_text || 'Success in business requires training and discipline and hard work. But if you\'re not frightened by these things, the opportunities are just as great today as they ever were.'}"
                    </blockquote>
                    <cite className="text-xl text-purple-400 font-medium">
                      — {blog.quote_author || 'David Rockefeller'}
                    </cite>
                  </div>
                </div>
              )}

              {/* Featured Banner Image Section */}
              {(blog.featured_image || blog.image_url || blog.image) && (
                <div className="mb-16">
                  <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                    <img
                      src={blog.featured_image || blog.image_url || blog.image}
                      alt={`${blog.title} - Featured Banner`}
                      className="w-full h-96 object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                    <div className="absolute bottom-6 left-6 right-6">
                      <div className="bg-black/60 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                        <h3 className="text-white font-semibold text-lg mb-2">Featured Insight</h3>
                        <p className="text-gray-300 text-sm leading-relaxed">
                          {blog.subtitle || blog.excerpt || 'Visual representation of the key concepts discussed in this comprehensive analysis.'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Core Article Sections */}
              <div className="prose prose-lg max-w-none mb-16">
                {blog.main_content && blog.main_content.length > 0 ? (
                  blog.main_content.map((paragraph, index) => (
                    <p key={index} className="text-lg text-gray-300 leading-relaxed mb-8 text-left">
                      {paragraph}
                    </p>
                  ))
                ) : blog.content ? (
                  <div className="text-lg text-gray-300 leading-relaxed text-left whitespace-pre-wrap">
                    {blog.content}
                  </div>
                ) : (
                  <div className="space-y-8">
                    <p className="text-lg text-gray-300 leading-relaxed text-left">
                      Choosing between Free Zone and Mainland company formation is one of the most critical 
                      decisions when setting up a business in Dubai. This comprehensive approach to strategic 
                      planning ensures that organizations can navigate challenges while capitalizing on emerging opportunities.
                    </p>
                    
                    <p className="text-lg text-gray-300 leading-relaxed text-left">
                      In today's rapidly evolving business landscape, companies must adapt quickly to remain competitive. 
                      This comprehensive approach to strategic planning ensures that organizations can navigate challenges 
                      while capitalizing on emerging opportunities.
                    </p>

                    <p className="text-lg text-gray-300 leading-relaxed text-left">
                      The methodology outlined in this article has been successfully implemented across various industries, 
                      from technology startups to established manufacturing companies. Each implementation is customized 
                      to address specific organizational needs and market conditions.
                    </p>
                  </div>
                )}
              </div>

              {/* Implementation Framework with Process Cards */}
              {(blog.implementation_framework || blog.phases) && (
                <section className="mb-16">
                  <h2 className="text-4xl font-bold text-white mb-8 text-center">Implementation Framework</h2>
                  {blog.implementation_framework && (
                    <div className="bg-gray-800/50 rounded-2xl p-8 mb-12 shadow-lg border border-gray-700/30">
                      <p className="text-lg text-gray-300 leading-relaxed font-medium text-center">
                        {blog.implementation_framework}
                      </p>
                    </div>
                  )}

                  {/* Process Step Cards */}
                  {blog.phases && blog.phases.length > 0 && (
                    <div className="space-y-6">
                      {blog.phases.map((phase, index) => (
                        <div key={index} className="bg-gray-800/30 rounded-2xl p-8 border border-gray-700/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-gray-800/40">
                          <div className="flex items-start gap-6">
                            <div className="w-14 h-14 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center text-white font-bold text-xl flex-shrink-0 shadow-lg">
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <h3 className="text-2xl font-bold text-white mb-4">{phase.title}</h3>
                              <p className="text-lg text-gray-300 leading-relaxed">{phase.description}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              )}

              {/* Tag Cloud Section */}
              {blog.tags && blog.tags.length > 0 && (
                <section className="mb-16">
                  <h3 className="text-2xl font-bold text-white mb-8">Tags</h3>
                  <div className="flex flex-wrap gap-4">
                    {blog.tags.map((tag, index) => (
                      <span key={index} className="px-6 py-3 bg-gray-800/40 text-gray-300 rounded-full border border-gray-700/30 hover:bg-gray-700/40 hover:border-gray-600/30 transition-all duration-200 text-lg font-medium shadow-sm hover:shadow-md cursor-pointer">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </section>
              )}

              {/* Author Bio Card */}
              <section className="mb-16">
                <div className="bg-gray-800/50 rounded-2xl p-10 shadow-lg border border-gray-700/30">
                  <div className="flex items-start gap-8">
                    <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-3xl font-bold flex-shrink-0 shadow-lg">
                      JD
                    </div>
                    <div className="flex-1">
                      <h3 className="text-3xl font-bold text-white mb-2">{authorInfo.name}</h3>
                      <p className="text-xl text-purple-400 font-semibold mb-6">{authorInfo.title}</p>
                      <p className="text-lg text-gray-300 leading-relaxed mb-8">{authorInfo.bio}</p>
                      <a 
                        href={authorInfo.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 text-lg font-semibold shadow-lg hover:shadow-xl"
                      >
                        <Linkedin className="w-6 h-6" />
                        Follow on LinkedIn →
                      </a>
                    </div>
                  </div>
                </div>
              </section>

            </article>
          </div>
        </div>
      </main>

      {/* Comments Preview Section */}
      <section className="bg-gray-900/50 py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <h3 className="text-3xl font-bold text-white mb-12 text-center flex items-center justify-center gap-4">
              <MessageCircle className="w-8 h-8 text-purple-400" />
              Comments ({comments.length})
            </h3>

            {/* Comment Form */}
            <form onSubmit={handleCommentSubmit} className="mb-12 bg-gray-800/30 rounded-2xl p-10 border border-gray-700/20 shadow-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <input
                  type="text"
                  placeholder="Your name"
                  value={newComment.name}
                  onChange={(e) => setNewComment({...newComment, name: e.target.value})}
                  className="px-6 py-4 border border-gray-600/50 bg-gray-700/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all text-lg"
                  required
                />
                <input
                  type="email"
                  placeholder="Your email"
                  value={newComment.email}
                  onChange={(e) => setNewComment({...newComment, email: e.target.value})}
                  className="px-6 py-4 border border-gray-600/50 bg-gray-700/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all text-lg"
                  required
                />
              </div>
              <textarea
                placeholder="Share your thoughts..."
                value={newComment.message}
                onChange={(e) => setNewComment({...newComment, message: e.target.value})}
                rows="6"
                className="w-full px-6 py-4 border border-gray-600/50 bg-gray-700/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all mb-8 text-lg"
                required
              />
              <button
                type="submit"
                disabled={isSubmittingComment}
                className="inline-flex items-center gap-3 px-10 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 text-white rounded-xl transition-all duration-200 text-lg font-semibold shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
                {isSubmittingComment ? 'Posting...' : 'Post Comment'}
              </button>
            </form>

            {/* Comments List */}
            <div className="space-y-6">
              {comments.length === 0 ? (
                <div className="text-center py-16">
                  <MessageCircle className="w-20 h-20 text-gray-600 mx-auto mb-6" />
                  <p className="text-xl text-gray-400">No comments yet. Be the first to share your thoughts!</p>
                </div>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="bg-gray-800/30 rounded-2xl p-8 border border-gray-700/20 shadow-sm">
                    <div className="flex items-start gap-6">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
                        {comment.author_name[0].toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-3">
                          <h4 className="font-bold text-white text-lg">{comment.author_name}</h4>
                          <span className="text-sm text-gray-500">
                            {new Date(comment.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-gray-300 leading-relaxed text-lg">{comment.content}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center z-30"
          title="Scroll to top"
        >
          <ArrowUp className="w-6 h-6" />
        </button>
      )}
    </div>
  );
};

export default PremiumBlogDisplay;