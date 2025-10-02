import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Calendar, 
  Clock, 
  User, 
  Tag, 
  ArrowLeft,
  Bookmark,
  BookOpen,
  Twitter,
  Linkedin,
  Facebook,
  Menu,
  CheckCircle,
  TrendingUp,
  Users,
  BarChart3,
  MessageSquare,
  Send,
  Quote,
  Copy,
  ExternalLink
} from 'lucide-react';

const PremiumBlogPost = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const heroRef = useRef(null);
  const contentRef = useRef(null);
  const [blog, setBlog] = useState(null);
  const [relatedBlogs, setRelatedBlogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(0);
  const [shareMenuOpen, setShareMenuOpen] = useState(false);
  const [comment, setComment] = useState('');
  const [showComments, setShowComments] = useState(false);

  useEffect(() => {
    fetchBlog();
  }, [id, navigate]);

  const fetchBlog = async () => {
    try {
      setIsLoading(true);
      
      const response = await fetch(`/api/blogs/${id}`);
      if (response.ok) {
        const blogData = await response.json();
        setBlog(blogData);
        setLikes(blogData.likes || 0);
        
        // Fetch related blogs
        const allBlogsResponse = await fetch('/api/blogs');
        if (allBlogsResponse.ok) {
          const allBlogs = await allBlogsResponse.json();
          const related = allBlogs
            .filter(b => b.id !== blogData.id && b.category === blogData.category)
            .slice(0, 3);
          setRelatedBlogs(related);
        }
      } else {
        navigate('/blog');
        return;
      }
    } catch (error) {
      console.error('Error fetching blog:', error);
      navigate('/blog');
      return;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoading && heroRef.current && contentRef.current) {
      // Animate hero elements
      gsap.fromTo(heroRef.current.querySelectorAll('.animate-in'), 
        { opacity: 0, y: 30 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 0.8, 
          stagger: 0.15,
          ease: "power2.out"
        }
      );

      // Animate content sections
      gsap.fromTo(contentRef.current.querySelectorAll('.content-section'), 
        { opacity: 0, y: 20 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 0.6, 
          stagger: 0.1,
          ease: "power2.out",
          delay: 0.3
        }
      );
    }
  }, [isLoading]);

  const handleLike = () => {
    setLiked(!liked);
    setLikes(prev => liked ? prev - 1 : prev + 1);
  };

  const handleShare = (platform) => {
    const url = window.location.href;
    const title = blog?.title || '';
    
    const shareUrls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
    };

    if (platform === 'copy') {
      navigator.clipboard.writeText(url);
      // You could add a toast notification here
    } else if (shareUrls[platform]) {
      window.open(shareUrls[platform], '_blank');
    }
    
    setShareMenuOpen(false);
  };

  const shareArticle = () => {
    if (navigator.share) {
      navigator.share({
        title: blog?.title || '',
        text: blog?.excerpt || '',
        url: window.location.href,
      });
    } else {
      // Fallback to copy URL
      navigator.clipboard.writeText(window.location.href);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black">
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-20 w-20 border-b-2 border-purple-500"></div>
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Blog post not found</h1>
          <Link to="/blog" className="text-purple-400 hover:text-purple-300 transition-colors">
            Return to blog listing
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Modern Mobile-Style Navigation Bar */}
      <div className="fixed top-16 lg:top-18 left-0 right-0 z-40 bg-black/95 border-b border-white/[0.08] shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-12 lg:h-14">
            {/* Back Navigation */}
            <Link 
              to="/blog"
              className="group flex items-center space-x-3 text-gray-300 hover:text-white transition-all duration-200 hover:translate-x-1"
              title="Back to Articles"
            >
              <div className="w-8 h-8 lg:w-9 lg:h-9 border border-white/20 hover:border-white/40 rounded-lg flex items-center justify-center transition-all duration-200">
                <ArrowLeft className="w-4 h-4 lg:w-5 lg:h-5" />
              </div>
              <span className="hidden sm:inline text-sm lg:text-base font-medium">Back to Articles</span>
            </Link>
            
            {/* Reading Mode Toggle (Mobile-friendly) */}
            <div className="ml-auto">
              <button className="p-2 lg:p-2.5 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-200" title="Reading mode">
                <BookOpen className="w-4 h-4 lg:w-5 lg:h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section ref={heroRef} className="relative h-[60vh] sm:h-[70vh] flex items-center justify-center overflow-hidden pt-28 lg:pt-32">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src={blog.image_url || blog.featured_image || '/api/placeholder/1920/1080'}
            alt={blog.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/60"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Badges */}
          <div className="animate-in mb-4 sm:mb-6 flex flex-wrap items-center gap-2 sm:gap-3">
            <span className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 bg-purple-600 text-white text-xs sm:text-sm font-medium rounded-full">
              Company Formation
            </span>
            <span className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 bg-orange-500 text-white text-xs sm:text-sm font-medium rounded-full">
              ⭐ Featured
            </span>
          </div>

          {/* Title */}
          <h1 
            className="animate-in text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6 leading-tight max-w-4xl"
            style={{ fontFamily: 'Encode Sans Semi Expanded, sans-serif' }}
          >
            {blog.title}
          </h1>

          {/* Subtitle */}
          <p className="animate-in text-base sm:text-lg lg:text-xl text-gray-200 mb-6 sm:mb-8 max-w-3xl leading-relaxed">
            Understanding the key differences between Free Zone and Mainland company formation in Dubai and which option suits your business needs.
          </p>

          {/* Author Info - Mobile Responsive */}
          <div className="animate-in space-y-4 sm:space-y-0 mb-6 sm:mb-8">
            {/* Mobile Layout */}
            <div className="sm:hidden">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  JR
                </div>
                <div>
                  <div className="text-white font-semibold text-sm">Julian D'Rozario</div>
                  <div className="text-gray-400 text-xs">Updated on 18, 2024</div>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-400">
                <div className="flex items-center space-x-3">
                  <span>1 min read</span>
                  <span>2947 views</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Twitter className="w-4 h-4 hover:text-white cursor-pointer transition-colors" />
                  <Linkedin className="w-4 h-4 hover:text-white cursor-pointer transition-colors" />
                  <Share2 className="w-4 h-4 hover:text-white cursor-pointer transition-colors" />
                </div>
              </div>
            </div>

            {/* Desktop Layout */}
            <div className="hidden sm:flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                JR
              </div>
              <div>
                <div className="flex items-center space-x-4 text-sm text-gray-300">
                  <span className="font-semibold text-white">Julian D'Rozario</span>
                  <span>Updated on 18, 2024</span>
                  <span>1 min read</span>
                  <span>2947 views</span>
                </div>
              </div>
              <div className="flex items-center space-x-4 ml-auto">
                <Twitter className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer transition-colors" />
                <Linkedin className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer transition-colors" />
                <Facebook className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer transition-colors" />
                <Share2 className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer transition-colors" />
                <div className="flex items-center space-x-1 text-gray-400">
                  <Heart className="w-4 h-4" />
                  <span className="text-sm">89 likes</span>
                </div>
                <div className="flex items-center space-x-1 text-gray-400">
                  <MessageCircle className="w-4 h-4" />
                  <span className="text-sm">3 comments</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section ref={contentRef} className="relative bg-black">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16">
          
          {/* Opening Content */}
          <div className="content-section mb-8 sm:mb-12">
            <p className="text-gray-300 text-base sm:text-lg leading-relaxed mb-6 sm:mb-8">
              Choosing between Free Zone and Mainland company formation is one of the most critical decisions when setting up a business in Dubai...
            </p>
          </div>

          {/* Key Takeaways and Quick Stats */}
          <div className="content-section grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-12 sm:mb-16">
            {/* Key Takeaways */}
            <div className="bg-gray-900/80 border border-gray-700 rounded-xl p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4">Key Takeaways</h3>
              <ul className="space-y-2.5 sm:space-y-3">
                <li className="flex items-start space-x-2.5 sm:space-x-3">
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-400 mt-1 flex-shrink-0" />
                  <span className="text-gray-300 text-sm sm:text-base">Strategic planning drives sustainable growth</span>
                </li>
                <li className="flex items-start space-x-2.5 sm:space-x-3">
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-400 mt-1 flex-shrink-0" />
                  <span className="text-gray-300 text-sm sm:text-base">Data-driven decisions improve outcomes</span>
                </li>
                <li className="flex items-start space-x-2.5 sm:space-x-3">
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-400 mt-1 flex-shrink-0" />
                  <span className="text-gray-300 text-sm sm:text-base">Implementation requires systematic approach</span>
                </li>
              </ul>
            </div>

            {/* Quick Stats */}
            <div className="bg-gray-900/80 border border-gray-700 rounded-xl p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4">Quick Stats</h3>
              <ul className="space-y-2.5 sm:space-y-3">
                <li className="flex items-start space-x-2.5 sm:space-x-3">
                  <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400 mt-1 flex-shrink-0" />
                  <span className="text-gray-300 text-sm sm:text-base">85% success rate in implementations</span>
                </li>
                <li className="flex items-start space-x-2.5 sm:space-x-3">
                  <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400 mt-1 flex-shrink-0" />
                  <span className="text-gray-300 text-sm sm:text-base">3x ROI improvement on average</span>
                </li>
                <li className="flex items-start space-x-2.5 sm:space-x-3">
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-orange-400 mt-1 flex-shrink-0" />
                  <span className="text-gray-300 text-sm sm:text-base">6-month typical timeline</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Main Article Content */}
          <div className="content-section mb-8 sm:mb-12">
            <p className="text-gray-300 text-base sm:text-lg leading-relaxed mb-6 sm:mb-8">
              In today's rapidly evolving business landscape, companies must adapt quickly to remain competitive. 
              This comprehensive approach to strategic planning ensures that organizations can navigate challenges 
              while capitalizing on emerging opportunities.
            </p>
          </div>

          {/* Pull Quote */}
          <div className="content-section mb-8 sm:mb-12 border-l-3 sm:border-l-4 border-purple-500 bg-gray-900/50 p-4 sm:p-6 lg:p-8 rounded-r-xl">
            <Quote className="w-6 h-6 sm:w-8 sm:h-8 text-purple-400 mb-3 sm:mb-4" />
            <blockquote className="text-lg sm:text-xl text-white italic font-light mb-3 sm:mb-4 leading-relaxed">
              "Success in business requires training and discipline and hard work. But if you're not frightened by these things, the opportunities are just as great today as they ever were."
            </blockquote>
            <cite className="text-purple-400 font-medium text-sm sm:text-base">— David Rockefeller</cite>
          </div>

          {/* Article Content */}
          <div className="content-section mb-8 sm:mb-12">
            <p className="text-gray-300 text-base sm:text-lg leading-relaxed mb-4 sm:mb-6">
              The methodology outlined in this article has been successfully implemented across various industries, 
              from technology startups to established manufacturing companies. Each implementation is customized to 
              address specific organizational needs and market conditions.
            </p>
          </div>

          {/* Implementation Framework */}
          <div className="content-section mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6 sm:mb-8">Implementation Framework</h2>
            <p className="text-gray-300 text-base sm:text-lg leading-relaxed mb-6 sm:mb-8">
              Our framework consists of five key phases that ensure successful execution and sustainable results. 
              Each phase builds upon the previous one, creating momentum and buy-in throughout the organization.
            </p>

            {/* Phase 1 */}
            <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-4 sm:p-6 mb-4 sm:mb-6">
              <h3 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4">Phase 1: Assessment & Analysis</h3>
              <p className="text-gray-300 leading-relaxed text-sm sm:text-base">
                Comprehensive evaluation of current state, market position, and competitive landscape to 
                identify opportunities and challenges.
              </p>
            </div>
          </div>

          <div className="content-section mb-8 sm:mb-12">
            <p className="text-gray-300 text-base sm:text-lg leading-relaxed">
              The remaining phases focus on strategic development, implementation planning, execution, and 
              continuous monitoring to ensure long-term success:
            </p>
          </div>

          {/* Tags Section */}
          <div className="content-section mb-12">
            <h3 className="text-xl font-bold text-white mb-6">Tags</h3>
            <div className="flex flex-wrap gap-3">
              {[
                '#Dubai Business', '#Free Zone', '#Mainland', '#Company Formation'
              ].map((tag, index) => (
                <span 
                  key={index} 
                  className="px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-all cursor-pointer"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Author Bio */}
          <div className="content-section mb-12 bg-gray-900/50 border border-gray-700 rounded-xl p-8">
            <div className="flex items-start space-x-6">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                JR
              </div>
              <div className="flex-1">
                <h4 className="text-xl font-bold text-white mb-2">Julian D Rozario</h4>
                <p className="text-gray-300 mb-4">
                  Business Consultant & Licensing Advisor with over 8 years of experience helping companies 
                  achieve sustainable growth through strategic planning and innovative licensing solutions.
                </p>
                <Link 
                  to="#"
                  className="text-purple-400 hover:text-purple-300 transition-colors font-medium"
                >
                  Follow on LinkedIn →
                </Link>
              </div>
            </div>
          </div>

          {/* Comments Section */}
          <div className="content-section">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-bold text-white">Comments (3)</h3>
              <button
                onClick={() => setShowComments(!showComments)}
                className="text-purple-400 hover:text-purple-300 transition-colors"
              >
                {showComments ? 'Hide Comments' : 'Show Comments'}
              </button>
            </div>

            {/* Comment Form */}
            <div className="mb-8">
              <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-white mb-4">Join the Discussion</h4>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your thoughts on this article..."
                  className="w-full h-32 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 resize-none"
                />
                <div className="flex justify-between items-center mt-4">
                  <span className="text-gray-400 text-sm">
                    {comment.length}/500 characters
                  </span>
                  <button className="flex items-center space-x-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors">
                    <Send className="w-4 h-4" />
                    <span>Post Comment</span>
                  </button>
                </div>
              </div>
            </div>

            {showComments && (
              <div className="space-y-6">
                {/* Sample Comments */}
                {[
                  {
                    author: "Sarah Mitchell",
                    time: "2 hours ago",
                    content: "Great insights on Dubai business formation! The comparison between Free Zone and Mainland is very helpful."
                  },
                  {
                    author: "Ahmed Al-Rashid", 
                    time: "4 hours ago",
                    content: "As someone who's been through this process, I can confirm Julian's advice is spot-on. The strategic approach makes all the difference."
                  },
                  {
                    author: "Lisa Chen",
                    time: "6 hours ago", 
                    content: "The implementation framework section is particularly valuable. Looking forward to applying these insights to our business expansion."
                  }
                ].map((commentItem, index) => (
                  <div key={index} className="bg-gray-900/30 border border-gray-700 rounded-lg p-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {commentItem.author.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="font-semibold text-white">{commentItem.author}</span>
                          <span className="text-gray-400 text-sm">{commentItem.time}</span>
                        </div>
                        <p className="text-gray-300">{commentItem.content}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </section>

      {/* Share & Save Section */}
      <section className="py-12 bg-black border-t border-gray-800/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 py-8">
            {/* Left side - Action prompt */}
            <div className="text-center sm:text-left">
              <h3 className="text-xl lg:text-2xl font-semibold text-white mb-2" style={{ fontFamily: 'Encode Sans Semi Expanded, sans-serif' }}>
                Found this helpful?
              </h3>
              <p className="text-gray-400 text-sm lg:text-base">
                Share this article with your network or save it for later
              </p>
            </div>
            
            {/* Right side - Action buttons */}
            <div className="flex items-center gap-4">
              {/* Save/Bookmark Button */}
              <button
                onClick={() => setLiked(!liked)}
                className={`group flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all duration-200 ${
                  liked 
                    ? 'bg-purple-600 border-purple-600 text-white' 
                    : 'bg-transparent border-white/20 text-gray-300 hover:border-purple-500/50 hover:text-white hover:bg-purple-600/10'
                }`}
                title="Save article"
              >
                <Bookmark className={`w-4 h-4 transition-transform duration-200 ${liked ? 'fill-current' : 'group-hover:scale-110'}`} />
                <span className="text-sm font-medium">
                  {liked ? 'Saved' : 'Save'}
                </span>
              </button>
              
              {/* Share Button with Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShareMenuOpen(!shareMenuOpen)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-transparent border border-white/20 text-gray-300 hover:border-purple-500/50 hover:text-white hover:bg-purple-600/10 rounded-xl transition-all duration-200"
                  title="Share article"
                >
                  <Share2 className="w-4 h-4" />
                  <span className="text-sm font-medium">Share</span>
                </button>
                
                {/* Share Menu Dropdown */}
                {shareMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-gray-900 border border-gray-700 rounded-xl shadow-xl z-50">
                    <div className="p-2">
                      <button
                        onClick={() => handleShare('copy')}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                      >
                        <Copy className="w-4 h-4" />
                        <span className="text-sm">Copy Link</span>
                      </button>
                      <button
                        onClick={() => handleShare('twitter')}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                      >
                        <Twitter className="w-4 h-4" />
                        <span className="text-sm">Share on Twitter</span>
                      </button>
                      <button
                        onClick={() => handleShare('linkedin')}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                      >
                        <Linkedin className="w-4 h-4" />
                        <span className="text-sm">Share on LinkedIn</span>
                      </button>
                      <button
                        onClick={() => handleShare('facebook')}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                      >
                        <Facebook className="w-4 h-4" />
                        <span className="text-sm">Share on Facebook</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related Articles */}
      <section className="py-16 bg-black border-t border-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-2xl font-bold text-white mb-8">More Articles</h3>
          <div className="space-y-6">
            {[
              {
                title: "UAE Visa Requirements: Complete Guide for Business Investors",
                excerpt: "Comprehensive overview of visa options available for business investors in the UAE.",
                category: "Immigration",
                readTime: "4 min read"
              },
              {
                title: "Free Zone vs Mainland: Cost Comparison Analysis", 
                excerpt: "Detailed cost breakdown to help you make an informed decision for your business setup.",
                category: "Business Setup",
                readTime: "6 min read"
              },
              {
                title: "Corporate Banking in Dubai: Opening Your Business Account",
                excerpt: "Step-by-step guide to opening corporate bank accounts for your UAE business.",
                category: "Banking",
                readTime: "5 min read"
              }
            ].map((article, index) => (
              <Link
                key={index}
                to={`/blog/${index + 2}`}
                className="block group bg-gray-900/30 border border-gray-700 rounded-lg p-6 hover:bg-gray-900/50 hover:border-purple-500/30 transition-all duration-300"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="px-3 py-1 bg-purple-600/20 text-purple-300 text-xs rounded-full">
                        {article.category}
                      </span>
                      <span className="text-gray-400 text-sm">{article.readTime}</span>
                    </div>
                    <h4 className="text-lg font-semibold text-white mb-2 group-hover:text-purple-300 transition-colors">
                      {article.title}
                    </h4>
                    <p className="text-gray-400 text-sm leading-relaxed">
                      {article.excerpt}
                    </p>
                  </div>
                  <div className="ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowLeft className="w-5 h-5 text-purple-400 rotate-180" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default PremiumBlogPost;