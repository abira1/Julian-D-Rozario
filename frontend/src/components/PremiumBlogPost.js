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
  Quote
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
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Brand */}
            <Link 
              to="/" 
              className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent hover:scale-105 transition-transform duration-200"
              style={{ fontFamily: 'Encode Sans Semi Expanded, sans-serif' }}
            >
              Julian D'Rozario
            </Link>
            
            {/* Navigation & Utility Icons */}
            <div className="flex items-center space-x-2">
              <Link 
                to="/blog"
                className="flex items-center space-x-2 px-4 py-2 text-gray-300 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Back to Blog</span>
              </Link>
              
              <div className="flex items-center space-x-1 ml-4">
                <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
                  <Menu className="w-5 h-5" />
                </button>
                <button 
                  onClick={handleLike}
                  className={`p-2 hover:bg-white/10 rounded-full transition-colors ${liked ? 'text-red-500' : 'text-gray-300'}`}
                >
                  <Heart className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
                </button>
                <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
                  <Bookmark className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section ref={heroRef} className="relative h-[70vh] flex items-center justify-center overflow-hidden pt-16">
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
          <div className="animate-in mb-6 flex items-center space-x-3">
            <span className="inline-flex items-center px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-full">
              Company Formation
            </span>
            <span className="inline-flex items-center px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-full">
              ⭐ Featured
            </span>
          </div>

          {/* Title */}
          <h1 
            className="animate-in text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight max-w-4xl"
            style={{ fontFamily: 'Encode Sans Semi Expanded, sans-serif' }}
          >
            {blog.title}
          </h1>

          {/* Subtitle */}
          <p className="animate-in text-xl text-gray-200 mb-8 max-w-3xl leading-relaxed">
            Understanding the key differences between Free Zone and Mainland company formation in Dubai and which option suits your business needs.
          </p>

          {/* Author Info */}
          <div className="animate-in flex items-center space-x-4 mb-8">
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
      </section>

      {/* Main Content */}
      <section ref={contentRef} className="relative bg-black">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          
          {/* Opening Content */}
          <div className="content-section mb-12">
            <p className="text-gray-300 text-lg leading-relaxed mb-8">
              Choosing between Free Zone and Mainland company formation is one of the most critical decisions when setting up a business in Dubai...
            </p>
          </div>

          {/* Key Takeaways and Quick Stats */}
          <div className="content-section grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            {/* Key Takeaways */}
            <div className="bg-gray-900/80 border border-gray-700 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">Key Takeaways</h3>
              <ul className="space-y-3">
                <li className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
                  <span className="text-gray-300">Strategic planning drives sustainable growth</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
                  <span className="text-gray-300">Data-driven decisions improve outcomes</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
                  <span className="text-gray-300">Implementation requires systematic approach</span>
                </li>
              </ul>
            </div>

            {/* Quick Stats */}
            <div className="bg-gray-900/80 border border-gray-700 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">Quick Stats</h3>
              <ul className="space-y-3">
                <li className="flex items-start space-x-3">
                  <TrendingUp className="w-5 h-5 text-blue-400 mt-1 flex-shrink-0" />
                  <span className="text-gray-300">85% success rate in implementations</span>
                </li>
                <li className="flex items-start space-x-3">
                  <BarChart3 className="w-5 h-5 text-purple-400 mt-1 flex-shrink-0" />
                  <span className="text-gray-300">3x ROI improvement on average</span>
                </li>
                <li className="flex items-start space-x-3">
                  <Clock className="w-5 h-5 text-orange-400 mt-1 flex-shrink-0" />
                  <span className="text-gray-300">6-month typical timeline</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Main Article Content */}
          <div className="content-section mb-12">
            <p className="text-gray-300 text-lg leading-relaxed mb-8">
              In today's rapidly evolving business landscape, companies must adapt quickly to remain competitive. 
              This comprehensive approach to strategic planning ensures that organizations can navigate challenges 
              while capitalizing on emerging opportunities.
            </p>
          </div>

          {/* Pull Quote */}
          <div className="content-section mb-12 border-l-4 border-purple-500 bg-gray-900/50 p-8 rounded-r-xl">
            <Quote className="w-8 h-8 text-purple-400 mb-4" />
            <blockquote className="text-xl text-white italic font-light mb-4 leading-relaxed">
              "Success in business requires training and discipline and hard work. But if you're not frightened by these things, the opportunities are just as great today as they ever were."
            </blockquote>
            <cite className="text-purple-400 font-medium">— David Rockefeller</cite>
          </div>

          {/* Article Content */}
          <div className="content-section mb-12">
            <p className="text-gray-300 text-lg leading-relaxed mb-6">
              The methodology outlined in this article has been successfully implemented across various industries, 
              from technology startups to established manufacturing companies. Each implementation is customized to 
              address specific organizational needs and market conditions.
            </p>
          </div>

          {/* Implementation Framework */}
          <div className="content-section mb-12">
            <h2 className="text-3xl font-bold text-white mb-8">Implementation Framework</h2>
            <p className="text-gray-300 text-lg leading-relaxed mb-8">
              Our framework consists of five key phases that ensure successful execution and sustainable results. 
              Each phase builds upon the previous one, creating momentum and buy-in throughout the organization.
            </p>

            {/* Phase 1 */}
            <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-6 mb-6">
              <h3 className="text-xl font-bold text-white mb-4">Phase 1: Assessment & Analysis</h3>
              <p className="text-gray-300 leading-relaxed">
                Comprehensive evaluation of current state, market position, and competitive landscape to 
                identify opportunities and challenges.
              </p>
            </div>
          </div>

          <div className="content-section mb-12">
            <p className="text-gray-300 text-lg leading-relaxed">
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

      {/* Related Articles */}
      {relatedBlogs.length > 0 && (
        <section className="py-16 bg-black">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h3 className="text-3xl font-bold text-white mb-12 text-center">Related Articles</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {relatedBlogs.map((relatedBlog, index) => (
                <Link
                  key={relatedBlog.id}
                  to={`/blog/${relatedBlog.id}`}
                  className="group bg-zinc-900 border border-white/10 rounded-2xl overflow-hidden hover:border-purple-500/30 transition-all duration-300 transform hover:scale-105"
                >
                  <div className="aspect-w-16 aspect-h-9 bg-gray-800">
                    <img 
                      src={relatedBlog.image_url || '/api/placeholder/400/225'}
                      alt={relatedBlog.title}
                      className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-6">
                    <span className="inline-block px-3 py-1 bg-purple-600/20 text-purple-300 text-sm rounded-full mb-3">
                      {relatedBlog.category}
                    </span>
                    <h4 className="text-lg font-semibold text-white mb-2 group-hover:text-purple-300 transition-colors">
                      {relatedBlog.title}
                    </h4>
                    <p className="text-gray-400 text-sm">
                      {relatedBlog.excerpt}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default PremiumBlogPost;