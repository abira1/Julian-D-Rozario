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
  Facebook
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
      {/* Slim Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Brand */}
            <Link to="/" className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Julian D'Rozario
            </Link>
            
            {/* Utility Icons */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/blog')}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setShareMenuOpen(!shareMenuOpen)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors relative"
              >
                <Share2 className="w-5 h-5" />
                {shareMenuOpen && (
                  <div className="absolute top-full right-0 mt-2 w-48 bg-charcoal-800 border border-white/20 rounded-lg shadow-xl py-2 z-50">
                    <button
                      onClick={() => handleShare('copy')}
                      className="w-full px-4 py-2 text-left hover:bg-white/10 transition-colors"
                    >
                      Copy Link
                    </button>
                    <button
                      onClick={() => handleShare('twitter')}
                      className="w-full px-4 py-2 text-left hover:bg-white/10 transition-colors flex items-center gap-2"
                    >
                      <Twitter className="w-4 h-4" /> Twitter
                    </button>
                    <button
                      onClick={() => handleShare('linkedin')}
                      className="w-full px-4 py-2 text-left hover:bg-white/10 transition-colors flex items-center gap-2"
                    >
                      <Linkedin className="w-4 h-4" /> LinkedIn
                    </button>
                    <button
                      onClick={() => handleShare('facebook')}
                      className="w-full px-4 py-2 text-left hover:bg-white/10 transition-colors flex items-center gap-2"
                    >
                      <Facebook className="w-4 h-4" /> Facebook
                    </button>
                  </div>
                )}
              </button>
              <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <Bookmark className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section with Cover Image */}
      <section ref={heroRef} className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src={blog.image_url || blog.featured_image || '/api/placeholder/1920/1080'}
            alt={blog.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Category Badge */}
          <div className="animate-in mb-6">
            <span className="inline-flex items-center px-4 py-2 bg-purple-600/90 text-white text-sm font-medium rounded-full backdrop-blur-sm border border-purple-500/50">
              <Tag className="w-4 h-4 mr-2" />
              {blog.category}
            </span>
          </div>

          {/* Title */}
          <h1 className="animate-in text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            {blog.title}
          </h1>

          {/* Subtitle/Excerpt */}
          <p className="animate-in text-xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            {blog.excerpt}
          </p>

          {/* Author Meta Row */}
          <div className="animate-in flex flex-col sm:flex-row items-center justify-between max-w-2xl mx-auto">
            <div className="flex items-center space-x-4 mb-4 sm:mb-0">
              <img 
                src="/api/placeholder/48/48" 
                alt={blog.author}
                className="w-12 h-12 rounded-full border-2 border-purple-500/50"
              />
              <div className="text-left">
                <p className="text-white font-semibold">{blog.author}</p>
                <div className="flex items-center text-gray-400 text-sm space-x-4">
                  <span className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {new Date(blog.created_at).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </span>
                  <span className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {blog.read_time || '5 min read'}
                  </span>
                </div>
              </div>
            </div>

            {/* Reaction Counters */}
            <div className="flex items-center space-x-6">
              <button
                onClick={handleLike}
                className={`flex items-center space-x-2 transition-colors ${
                  liked ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
                }`}
              >
                <Heart className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
                <span>{likes}</span>
              </button>
              <div className="flex items-center space-x-2 text-gray-400">
                <MessageCircle className="w-5 h-5" />
                <span>{blog.comments || 0}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/30 rounded-full mt-2"></div>
          </div>
        </div>
      </section>

      {/* Main Content Panel */}
      <section ref={contentRef} className="relative -mt-20 z-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-zinc-900 rounded-t-3xl border border-white/10 shadow-2xl overflow-hidden">
            
            {/* Quick Highlight Cards */}
            <div className="content-section p-8 border-b border-white/10">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-purple-600/10 border border-purple-500/20 rounded-xl p-6">
                  <h4 className="text-purple-400 font-semibold mb-2">Key Insight</h4>
                  <p className="text-gray-300 text-sm">Understanding Dubai's business formation landscape requires expertise in multiple jurisdictions.</p>
                </div>
                <div className="bg-blue-600/10 border border-blue-500/20 rounded-xl p-6">
                  <h4 className="text-blue-400 font-semibold mb-2">Experience</h4>
                  <p className="text-gray-300 text-sm">Over 10 years helping corporate service providers establish their presence.</p>
                </div>
                <div className="bg-amber-600/10 border border-amber-500/20 rounded-xl p-6">
                  <h4 className="text-amber-400 font-semibold mb-2">Results</h4>
                  <p className="text-gray-300 text-sm">3200+ licenses incorporated across various free zones and mainland.</p>
                </div>
              </div>
            </div>

            {/* Main Article Content */}
            <div className="content-section px-8 py-12">
              <div className="prose prose-invert prose-lg max-w-none">
                <div 
                  className="text-gray-300 leading-relaxed space-y-6"
                  dangerouslySetInnerHTML={{ __html: blog.content }}
                />
              </div>
            </div>

            {/* Pull Quote */}
            <div className="content-section px-8 py-12 border-t border-b border-white/10 bg-gradient-to-r from-purple-600/5 to-blue-600/5">
              <blockquote className="text-center">
                <p className="text-2xl font-light text-white italic mb-4">
                  "Empowering corporate service providers with end-to-end licensing expertise that drives real business growth."
                </p>
                <cite className="text-purple-400 font-medium">— Julian D'Rozario</cite>
              </blockquote>
            </div>

            {/* Process Steps */}
            <div className="content-section px-8 py-12">
              <h3 className="text-2xl font-bold text-white mb-8">Our Approach</h3>
              <div className="space-y-6">
                {[
                  { step: '01', title: 'Initial Consultation', desc: 'Understanding your specific business requirements and goals.' },
                  { step: '02', title: 'Jurisdiction Analysis', desc: 'Comprehensive review of the most suitable free zones and mainland options.' },
                  { step: '03', title: 'License Processing', desc: 'End-to-end handling of all documentation and regulatory requirements.' },
                  { step: '04', title: 'Post-Formation Support', desc: 'Ongoing compliance and business development assistance.' }
                ].map((item, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                      {item.step}
                    </div>
                    <div>
                      <h4 className="text-xl font-semibold text-white mb-2">{item.title}</h4>
                      <p className="text-gray-400">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tags Cloud */}
            <div className="content-section px-8 py-12 border-t border-white/10 bg-black/20">
              <h3 className="text-xl font-bold text-white mb-6">Related Topics</h3>
              <div className="flex flex-wrap gap-3">
                {blog.tags && blog.tags.length > 0 ? blog.tags.map((tag, index) => (
                  <span key={index} className="px-4 py-2 bg-white/10 hover:bg-purple-600/20 border border-white/20 hover:border-purple-500/30 rounded-full text-sm text-gray-300 hover:text-white transition-all cursor-pointer">
                    #{tag}
                  </span>
                )) : [
                  'Dubai Business Setup', 'Free Zone Licensing', 'Corporate Services', 'Immigration', 'Compliance'
                ].map((tag, index) => (
                  <span key={index} className="px-4 py-2 bg-white/10 hover:bg-purple-600/20 border border-white/20 hover:border-purple-500/30 rounded-full text-sm text-gray-300 hover:text-white transition-all cursor-pointer">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Author Bio Card */}
            <div className="content-section px-8 py-12 border-t border-white/10">
              <div className="bg-gradient-to-r from-purple-600/10 to-blue-600/10 border border-purple-500/20 rounded-2xl p-8">
                <div className="flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-6">
                  <img 
                    src="/api/placeholder/80/80"
                    alt={blog.author}
                    className="w-20 h-20 rounded-full border-2 border-purple-500/50"
                  />
                  <div className="flex-1">
                    <h4 className="text-xl font-bold text-white mb-2">{blog.author}</h4>
                    <p className="text-purple-400 font-medium mb-3">Business Relations Manager & Company Formation Specialist</p>
                    <p className="text-gray-300 mb-4">
                      Julian brings over 10 years of expertise in Dubai business formation, having facilitated 3200+ license incorporations 
                      and built relationships with 100+ active channel partners across the UAE.
                    </p>
                    <Link 
                      to="/contact"
                      className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-full transition-all transform hover:scale-105"
                    >
                      Get In Touch
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Comments Preview */}
            <div className="content-section px-8 py-12 border-t border-white/10">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold text-white">Discussion</h3>
                <span className="text-gray-400">{blog.comments || 0} comments</span>
              </div>
              
              <div className="text-center py-12">
                <MessageCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 mb-6">Be the first to share your thoughts on this article</p>
                <button className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-full transition-colors">
                  Join the Discussion
                </button>
              </div>
            </div>

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