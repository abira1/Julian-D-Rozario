import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { gsap } from 'gsap';
import Navigation from './Navigation';
import Footer from './Footer';
import BlogComments from './blog/BlogComments';
import BlogInteractions from './blog/BlogInteractions';
import { blogData } from '../data/mockData';

const BlogPost = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const contentRef = useRef(null);
  const [blog, setBlog] = useState(null);
  const [relatedBlogs, setRelatedBlogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    // Fetch blog from Firebase API
    fetchBlog();
  }, [id, navigate]);

  const fetchBlog = async () => {
    try {
      setIsLoading(true);
      
      // Fetch the specific blog
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/blogs/${id}`);
      if (response.ok) {
        const blogData = await response.json();
        setBlog(blogData);
        
        // Fetch related blogs (same category, excluding current)
        const allBlogsResponse = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/blogs?category=${blogData.category}`);
        if (allBlogsResponse.ok) {
          const allBlogs = await allBlogsResponse.json();
          const related = allBlogs
            .filter(b => b.id !== blogData.id)
            .slice(0, 3);
          setRelatedBlogs(related);
        }
      } else if (response.status === 404) {
        // Blog not found, fallback to mock data
        const foundBlog = blogData.find(b => b.id === parseInt(id));
        if (!foundBlog) {
          navigate('/blog');
          return;
        }
        setBlog(foundBlog);
        
        // Get related blogs from mock data
        const related = blogData
          .filter(b => b.category === foundBlog.category && b.id !== foundBlog.id)
          .slice(0, 3);
        setRelatedBlogs(related);
      } else {
        navigate('/blog');
        return;
      }
    } catch (error) {
      console.error('Error fetching blog:', error);
      // Fallback to mock data
      const foundBlog = blogData.find(b => b.id === parseInt(id));
      if (!foundBlog) {
        navigate('/blog');
        return;
      }
      setBlog(foundBlog);
      
      const related = blogData
        .filter(b => b.category === foundBlog.category && b.id !== foundBlog.id)
        .slice(0, 3);
      setRelatedBlogs(related);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoading && contentRef.current) {
      // GSAP animations
      gsap.fromTo(contentRef.current.children, 
        { opacity: 0, y: 30 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 0.8, 
          stagger: 0.2,
          ease: "power2.out"
        }
      );
    }
  }, [isLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Navigation />
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-20 w-20 xxs:h-24 xxs:w-24 xs:h-32 xs:w-32 border-b-2 border-purple-500"></div>
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Navigation />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-xl xxs:text-2xl font-bold mb-4">Blog post not found</h1>
            <Link to="/blog" className="text-purple-400 hover:text-purple-300">
              Return to blog listing
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white relative">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-48 h-48 xxs:w-64 xxs:h-64 xs:w-80 xs:h-80 sm-mobile:w-96 sm-mobile:h-96 bg-gradient-to-r from-purple-500/5 to-blue-500/5 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-36 h-36 xxs:w-48 xxs:h-48 xs:w-60 xs:h-60 sm-mobile:w-72 sm-mobile:h-72 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-full filter blur-3xl"></div>
      </div>

      <Navigation />

      <main className="relative z-10">
        {/* Hero Section - Mobile First */}
        <section className="pt-16 xxs:pt-18 xs:pt-20 sm-mobile:pt-24 pb-8 xxs:pb-12 xs:pb-16 px-3 xxs:px-4 xs:px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-4 xxs:mb-6">
              <span className="inline-block px-3 xxs:px-4 py-1 xxs:py-2 bg-purple-600/20 text-purple-400 rounded-full text-xs xxs:text-sm font-medium mb-3 xxs:mb-4">
                {blog.category}
              </span>
              <h1 className="hero-title-mobile font-bold leading-tight px-2" style={{ fontFamily: 'Encode Sans Semi Expanded, sans-serif' }}>
                {blog.title}
              </h1>
              <div className="flex items-center justify-center space-x-2 xxs:space-x-3 text-gray-400 mobile-text-xs xxs:mobile-text-sm">
                <div className="flex items-center space-x-1.5 xxs:space-x-2">
                  <div className="w-6 h-6 xxs:w-8 xxs:h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white font-semibold mobile-text-xs">
                    JD
                  </div>
                  <span className="truncate max-w-20 xxs:max-w-none">{blog.author}</span>
                </div>
                <span>•</span>
                <span className="truncate">{blog.date}</span>
                <span className="hidden xs:inline">•</span>
                <span className="hidden xs:inline">{blog.readTime}</span>
              </div>
            </div>
            
            {/* Featured Image - Responsive */}
            <div className="relative mobile-card overflow-hidden shadow-2xl">
              <img
                src={blog.image}
                alt={blog.title}
                className="w-full h-40 xxs:h-48 xs:h-56 sm-mobile:h-72 md-tablet:h-80 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
            </div>
          </div>
        </section>

        {/* Content Section - Mobile First Layout */}
        <section className="pb-12 xxs:pb-16 px-3 xxs:px-4 xs:px-6">
          <div className="max-w-7xl mx-auto">
            <div className="lg-desktop:grid lg-desktop:grid-cols-4 lg-desktop:gap-8">
              {/* Main Content */}
              <div className="lg-desktop:col-span-3">
                <div className="bg-gradient-to-br from-white/5 to-white/[0.02] mobile-optimized-blur border border-white/10 mobile-card">
                  <div className="mobile-compact-spacing md-tablet:p-8 lg-desktop:p-12" ref={contentRef}>
                    {/* Table of Contents - Collapsible on Mobile */}
                    <div className="bg-gradient-to-br from-white/5 to-white/[0.02] mobile-optimized-blur border border-white/10 mobile-card mobile-compact-spacing mb-4 xxs:mb-6">
                      <h3 className="mobile-title font-semibold text-white">Table of Contents</h3>
                      <ul className="space-y-1 xxs:space-y-1.5">
                        <li><a href="#introduction" className="text-gray-400 hover:text-purple-400 transition-colors mobile-text-sm touch-target block py-1">Introduction</a></li>
                        <li><a href="#key-points" className="text-gray-400 hover:text-purple-400 transition-colors mobile-text-sm touch-target block py-1">Key Points</a></li>
                        <li><a href="#detailed-analysis" className="text-gray-400 hover:text-purple-400 transition-colors mobile-text-sm touch-target block py-1">Detailed Analysis</a></li>
                        <li><a href="#conclusion" className="text-gray-400 hover:text-purple-400 transition-colors mobile-text-sm touch-target block py-1">Conclusion</a></li>
                      </ul>
                    </div>

                    {/* Blog Content - Mobile Optimized Typography */}
                    <div className="prose prose-sm xxs:prose-base xs:prose-lg prose-invert max-w-none">
                      <section id="introduction" className="mb-6 xxs:mb-8">
                        <h2 className="text-xl xxs:text-2xl font-bold mb-3 xxs:mb-4 text-white">Introduction</h2>
                        <p className="text-gray-300 leading-relaxed mb-3 xxs:mb-4 text-sm xxs:text-base">
                          {blog.excerpt}
                        </p>
                        <p className="text-gray-300 leading-relaxed text-sm xxs:text-base">
                          In this comprehensive guide, we'll explore the intricacies of {blog.title.toLowerCase()}, 
                          providing you with actionable insights and strategies that you can implement immediately.
                        </p>
                      </section>

                      <section id="key-points" className="mb-6 xxs:mb-8">
                        <h2 className="text-xl xxs:text-2xl font-bold mb-3 xxs:mb-4 text-white">Key Points</h2>
                        <div className="grid grid-cols-1 md-tablet:grid-cols-2 gap-4 xxs:gap-6 mb-4 xxs:mb-6">
                          <div className="bg-gradient-to-br from-purple-600/10 to-purple-600/5 border border-purple-600/20 rounded-lg p-4 xxs:p-6">
                            <h4 className="font-semibold text-purple-300 mb-2 text-sm xxs:text-base">Strategic Approach</h4>
                            <p className="text-gray-300 text-xs xxs:text-sm">Understanding the fundamentals and building a solid foundation.</p>
                          </div>
                          <div className="bg-gradient-to-br from-blue-600/10 to-blue-600/5 border border-blue-600/20 rounded-lg p-4 xxs:p-6">
                            <h4 className="font-semibold text-blue-300 mb-2 text-sm xxs:text-base">Implementation</h4>
                            <p className="text-gray-300 text-xs xxs:text-sm">Practical steps and real-world applications.</p>
                          </div>
                        </div>
                      </section>

                      <section id="detailed-analysis" className="mb-6 xxs:mb-8">
                        <h2 className="text-xl xxs:text-2xl font-bold mb-3 xxs:mb-4 text-white">Detailed Analysis</h2>
                        <p className="text-gray-300 leading-relaxed mb-3 xxs:mb-4 text-sm xxs:text-base">
                          The landscape of business formation in Dubai has evolved significantly over the past decade. 
                          With my experience at Meydan Free Zone Authority, I've witnessed firsthand how regulatory 
                          changes and market dynamics have shaped the opportunities available to entrepreneurs and investors.
                        </p>
                        
                        <blockquote className="border-l-4 border-purple-500 pl-4 xxs:pl-6 py-2 my-4 xxs:my-6 bg-gradient-to-r from-purple-500/10 to-transparent">
                          <p className="text-purple-300 italic text-sm xxs:text-base">
                            "Success in Dubai's business environment requires not just understanding the regulations, 
                            but also building the right relationships and choosing the optimal structure for your specific needs."
                          </p>
                          <cite className="text-gray-400 text-xs xxs:text-sm">- Julian D'Rozario</cite>
                        </blockquote>

                        <h3 className="text-lg xxs:text-xl font-semibold mb-2 xxs:mb-3 text-white">Market Insights</h3>
                        <p className="text-gray-300 leading-relaxed mb-3 xxs:mb-4 text-sm xxs:text-base">
                          Based on my experience incorporating over 3,200 licenses and working with 100+ channel partners, 
                          here are the critical factors that determine success in Dubai's business formation landscape.
                        </p>

                        <ul className="space-y-1 xxs:space-y-2 mb-4 xxs:mb-6">
                          <li className="flex items-start space-x-2 xxs:space-x-3">
                            <div className="w-2 h-2 bg-purple-500 rounded-full mt-1.5 xxs:mt-2 flex-shrink-0"></div>
                            <span className="text-gray-300 text-sm xxs:text-base">Regulatory compliance and proper documentation</span>
                          </li>
                          <li className="flex items-start space-x-2 xxs:space-x-3">
                            <div className="w-2 h-2 bg-purple-500 rounded-full mt-1.5 xxs:mt-2 flex-shrink-0"></div>
                            <span className="text-gray-300 text-sm xxs:text-base">Strategic location and business activity selection</span>
                          </li>
                          <li className="flex items-start space-x-2 xxs:space-x-3">
                            <div className="w-2 h-2 bg-purple-500 rounded-full mt-1.5 xxs:mt-2 flex-shrink-0"></div>
                            <span className="text-gray-300 text-sm xxs:text-base">Post-formation support and ongoing compliance</span>
                          </li>
                        </ul>
                      </section>

                      <section id="conclusion" className="mb-6 xxs:mb-8">
                        <h2 className="text-xl xxs:text-2xl font-bold mb-3 xxs:mb-4 text-white">Conclusion</h2>
                        <p className="text-gray-300 leading-relaxed text-sm xxs:text-base">
                          The opportunities in Dubai's business landscape continue to expand, but success requires 
                          expert guidance and strategic planning. Whether you're a corporate service provider or 
                          an entrepreneur looking to establish your presence in the UAE, understanding these 
                          fundamentals will set you on the path to success.
                        </p>
                      </section>
                    </div>

                    {/* Author Bio - Mobile Optimized */}
                    <div className="mt-8 xxs:mt-12 p-4 xxs:p-6 bg-gradient-to-br from-white/5 to-white/[0.02] mobile-optimized-blur border border-white/10 rounded-lg xxs:rounded-xl">
                      <div className="flex items-start space-x-3 xxs:space-x-4">
                        <div className="w-12 h-12 xxs:w-16 xxs:h-16 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-sm xxs:text-xl">
                          JD
                        </div>
                        <div className="flex-1">
                          <h4 className="text-base xxs:text-lg font-semibold text-white mb-1 xxs:mb-2">About the Author</h4>
                          <p className="text-gray-300 text-xs xxs:text-sm leading-relaxed">
                            Julian D'Rozario is a Business Relations Manager at Meydan Free Zone Authority with over 
                            a decade of experience in company formation and corporate services. He has facilitated 
                            the incorporation of over 3,200 licenses and works with 100+ active channel partners 
                            across the UAE business formation landscape.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Blog Interactions - Mobile Optimized */}
                    <div className="mt-6 xxs:mt-8">
                      <BlogInteractions 
                        blogId={blog.id.toString()} 
                        blogTitle={blog.title}
                        blogUrl={window.location.href}
                      />
                    </div>

                    {/* Comments Section - Mobile Optimized */}
                    <div id="comments-section" className="mt-8 xxs:mt-12">
                      <BlogComments blogId={blog.id.toString()} blogTitle={blog.title} />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Sidebar - Mobile Drawer on Small Screens */}
              <div className="lg-desktop:col-span-1 mt-6 lg-desktop:mt-0">
                {/* Mobile Sidebar Toggle */}
                <button 
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="lg-desktop:hidden w-full mb-4 px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg flex items-center justify-center gap-2 touch-target"
                >
                  <span className="text-sm font-medium">Article Info</span>
                  <svg className={`w-4 h-4 transition-transform duration-300 ${sidebarOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Sidebar Content */}
                <div className={`lg-desktop:sticky lg-desktop:top-8 space-y-4 xxs:space-y-6 ${sidebarOpen ? 'block' : 'hidden lg-desktop:block'}`}>
                  {/* Quick Actions section removed per user request */}
                  
                  {/* Author Info */}
                  <div className="bg-gradient-to-br from-white/5 to-white/[0.02] mobile-optimized-blur border border-white/10 rounded-lg xxs:rounded-xl p-3 xxs:p-4">
                    <h4 className="text-sm font-medium text-white mb-2 xxs:mb-3" style={{ fontFamily: 'Encode Sans Semi Expanded, sans-serif' }}>
                      About the Author
                    </h4>
                    <div className="flex items-center space-x-2 xxs:space-x-3 mb-2 xxs:mb-3">
                      <div className="w-10 h-10 xxs:w-12 xxs:h-12 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white font-semibold text-xs xxs:text-sm">
                        JD
                      </div>
                      <div>
                        <p className="text-xs xxs:text-sm font-medium text-white">{blog.author}</p>
                        <p className="text-xs text-gray-400">Business Relations Manager</p>
                      </div>
                    </div>
                    <p className="text-xs leading-relaxed text-gray-400">
                      Expert in UAE business formation with 10+ years experience in company setup and licensing.
                    </p>
                  </div>
                  
                  {/* Blog Categories */}
                  <div className="bg-gradient-to-br from-white/5 to-white/[0.02] mobile-optimized-blur border border-white/10 rounded-lg xxs:rounded-xl p-3 xxs:p-4">
                    <h4 className="text-sm font-medium text-white mb-2 xxs:mb-3" style={{ fontFamily: 'Encode Sans Semi Expanded, sans-serif' }}>
                      Blog Categories
                    </h4>
                    <div className="space-y-1 xxs:space-y-2">
                      {['Company Formation', 'Immigration', 'Technology', 'Operations', 'Business Development', 'Compliance'].map(category => (
                        <Link 
                          key={category}
                          to={`/blog?category=${category}`}
                          className="block text-xs text-gray-400 hover:text-purple-400 transition-colors duration-200 touch-target py-1"
                        >
                          {category}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Related Posts - Mobile Optimized */}
        {relatedBlogs.length > 0 && (
          <section className="pb-12 xxs:pb-16 px-3 xxs:px-4 xs:px-6">
            <div className="max-w-7xl mx-auto">
              <h2 className="text-xl xxs:text-2xl xs:text-3xl font-bold text-center mb-8 xxs:mb-12" style={{ fontFamily: 'Encode Sans Semi Expanded, sans-serif' }}>
                Related Articles
              </h2>
              
              <div className="grid grid-cols-1 sm-mobile:grid-cols-2 md-tablet:grid-cols-3 gap-6 xxs:gap-8">
                {relatedBlogs.map((relatedBlog) => (
                  <Link 
                    key={relatedBlog.id} 
                    to={`/blog/${relatedBlog.id}`}
                    className="group block"
                  >
                    <div className="bg-gradient-to-br from-white/5 to-white/[0.02] mobile-optimized-blur border border-white/10 rounded-lg xxs:rounded-xl p-4 xxs:p-6 hover:from-white/10 hover:to-white/[0.05] transition-all duration-300">
                      <img
                        src={relatedBlog.image}
                        alt={relatedBlog.title}
                        className="w-full h-32 xxs:h-40 xs:h-48 object-cover rounded-lg mb-3 xxs:mb-4 group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="space-y-1 xxs:space-y-2">
                        <span className="inline-block px-2 xxs:px-3 py-1 bg-purple-600/20 text-purple-400 rounded-full text-xs font-medium">
                          {relatedBlog.category}
                        </span>
                        <h3 className="font-semibold text-white group-hover:text-purple-300 transition-colors duration-200 text-sm xxs:text-base">
                          {relatedBlog.title}
                        </h3>
                        <p className="text-gray-400 text-xs xxs:text-sm line-clamp-2">
                          {relatedBlog.excerpt}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default BlogPost;