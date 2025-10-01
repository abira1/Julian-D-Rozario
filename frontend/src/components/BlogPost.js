import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { gsap } from 'gsap';
import Navigation from './Navigation';
import Footer from './Footer';
import BlogComments from './blog/BlogComments';
import BlogInteractions from './blog/BlogInteractions';

// Reading Progress Component
const ReadingProgress = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const updateProgress = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = (scrollTop / docHeight) * 100;
      setProgress(Math.min(scrollPercent, 100));
    };

    window.addEventListener('scroll', updateProgress);
    return () => window.removeEventListener('scroll', updateProgress);
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full h-1 bg-gray-900 z-50">
      <div 
        className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-150 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};

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
      
      // Fetch the specific blog - using working MySQL backend endpoint
      const response = await fetch(`/api/blogs/${id}`);
      console.log('BlogPost: Fetching blog from /api/blogs/' + id);
      if (response.ok) {
        const blogData = await response.json();
        setBlog(blogData);
        
        // Fetch related blogs (same category, excluding current)
        const allBlogsResponse = await fetch('/api/blogs');
        console.log('BlogPost: Fetching related blogs from /api/blogs');
        if (allBlogsResponse.ok) {
          const allBlogs = await allBlogsResponse.json();
          const related = allBlogs
            .filter(b => b.id !== blogData.id)
            .slice(0, 3);
          setRelatedBlogs(related);
        }
      } else if (response.status === 404) {
        // Blog not found, redirect to blog list
        navigate('/blog');
        return;
      } else {
        navigate('/blog');
        return;
      }
    } catch (error) {
      console.error('Error fetching blog:', error);
      // No fallback, redirect to blog list
      navigate('/blog');
      return;
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
      {/* Reading Progress Bar */}
      <ReadingProgress />
      
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-48 h-48 xxs:w-64 xxs:h-64 xs:w-80 xs:h-80 sm-mobile:w-96 sm-mobile:h-96 bg-gradient-to-r from-purple-500/5 to-blue-500/5 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-36 h-36 xxs:w-48 xxs:h-48 xs:w-60 xs:h-60 sm-mobile:w-72 sm-mobile:h-72 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-full filter blur-3xl"></div>
      </div>

      <Navigation />

      <main className="relative z-10">
        {/* Enhanced Hero Section - Better Reading Experience */}
        <section className="pt-12 xxs:pt-16 xs:pt-20 sm-mobile:pt-24 pb-8 xxs:pb-12 xs:pb-16 px-3 xxs:px-4 xs:px-6">
          <div className="max-w-5xl mx-auto">
            {/* Breadcrumb Navigation */}
            <nav className="flex items-center text-sm text-gray-400 mb-6">
              <a href="/" className="hover:text-purple-400 transition-colors">Home</a>
              <svg className="w-4 h-4 mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <a href="/blog" className="hover:text-purple-400 transition-colors">Blog</a>
              <svg className="w-4 h-4 mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <span className="text-purple-400 truncate max-w-32">{blog.title}</span>
            </nav>

            <div className="text-left">
              {/* Category Badge */}
              <div className="mb-6">
                <span className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30 text-purple-300 rounded-full text-sm font-medium backdrop-blur-sm">
                  <div className="w-2 h-2 bg-purple-400 rounded-full mr-2 animate-pulse"></div>
                  {blog.category}
                </span>
              </div>

              {/* Enhanced Title */}
              <h1 className="text-3xl xxs:text-4xl xs:text-5xl sm-mobile:text-6xl font-bold leading-tight mb-6 bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent" style={{ fontFamily: 'Encode Sans Semi Expanded, sans-serif' }}>
                {blog.title}
              </h1>

              {/* Enhanced Excerpt */}
              <p className="text-xl text-gray-300 leading-relaxed mb-8 max-w-3xl">
                {blog.excerpt}
              </p>

              {/* Enhanced Author & Meta Info */}
              <div className="flex items-center justify-between flex-wrap gap-4 mb-8 p-6 bg-gradient-to-r from-white/8 to-white/[0.03] backdrop-blur-xl border border-white/15 rounded-2xl">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <div className="w-14 h-14 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                      JD
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-gray-900"></div>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-lg">{blog.author}</h3>
                    <p className="text-gray-400 text-sm">Business Relations Manager & Company Formation Specialist</p>
                    <p className="text-gray-500 text-xs">10+ years experience • 3200+ licenses incorporated</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-6 text-sm">
                  <div className="flex items-center space-x-2 text-gray-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>{new Date(blog.created_at || blog.date).toLocaleDateString('en-US', { 
                      month: 'long', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10"/>
                      <polyline points="12,6 12,12 16,14"/>
                    </svg>
                    <span>{blog.readTime || '5 min read'}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-400">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12S5 4 12 4S23 12 23 12S19 20 12 20S1 12 1 12Z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                    <span>{blog.views || 0} views</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Enhanced Featured Image */}
            <div className="relative rounded-2xl overflow-hidden shadow-2xl mb-12">
              <img
                src={blog.image}
                alt={blog.title}
                className="w-full h-64 xxs:h-80 xs:h-96 sm-mobile:h-[28rem] md-tablet:h-[32rem] lg:h-[36rem] object-cover"
              />
              {/* Minimal overlay for better image visibility */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
              
              {/* Image Caption */}
              <div className="absolute bottom-4 left-4 right-4">
                <div className="bg-black/70 backdrop-blur-md rounded-lg p-3">
                  <p className="text-white text-sm font-medium">{blog.title}</p>
                  <p className="text-gray-300 text-xs mt-1">Featured image for this article</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Enhanced Content Section - Optimized for Reading */}
        <section className="pb-16 xxs:pb-20 px-4 xxs:px-6 xs:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="lg-desktop:grid lg-desktop:grid-cols-12 lg-desktop:gap-12">
              {/* Main Content */}
              <div className="lg-desktop:col-span-8">
                <article className="bg-gradient-to-br from-white/8 to-white/[0.03] backdrop-blur-xl border border-white/15 rounded-3xl overflow-hidden shadow-2xl">
                  <div className="p-8 xxs:p-10 md-tablet:p-12 lg-desktop:p-16" ref={contentRef}>
                    {/* Enhanced Table of Contents */}
                    <div className="mb-12 p-8 bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-2xl backdrop-blur-sm">
                      <div className="flex items-center mb-6">
                        <svg className="w-6 h-6 text-purple-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <h3 className="text-xl font-bold text-white">Table of Contents</h3>
                      </div>
                      <nav className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <a href="#introduction" className="group flex items-center p-3 text-gray-300 hover:text-purple-300 hover:bg-white/10 rounded-lg transition-all duration-200">
                          <div className="w-2 h-2 bg-purple-500 rounded-full mr-3 group-hover:scale-125 transition-transform"></div>
                          <span className="font-medium">Introduction</span>
                        </a>
                        <a href="#key-points" className="group flex items-center p-3 text-gray-300 hover:text-purple-300 hover:bg-white/10 rounded-lg transition-all duration-200">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 group-hover:scale-125 transition-transform"></div>
                          <span className="font-medium">Key Points</span>
                        </a>
                        <a href="#detailed-analysis" className="group flex items-center p-3 text-gray-300 hover:text-purple-300 hover:bg-white/10 rounded-lg transition-all duration-200">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-3 group-hover:scale-125 transition-transform"></div>
                          <span className="font-medium">Detailed Analysis</span>
                        </a>
                        <a href="#conclusion" className="group flex items-center p-3 text-gray-300 hover:text-purple-300 hover:bg-white/10 rounded-lg transition-all duration-200">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3 group-hover:scale-125 transition-transform"></div>
                          <span className="font-medium">Conclusion</span>
                        </a>
                      </nav>
                    </div>

                    {/* Enhanced Blog Content */}
                    <div className="prose prose-lg prose-invert max-w-none">
                      <section id="introduction" className="mb-12">
                        <div className="flex items-center mb-6">
                          <div className="w-3 h-3 bg-purple-500 rounded-full mr-4"></div>
                          <h2 className="text-3xl font-bold text-white m-0">Introduction</h2>
                        </div>
                        <div className="text-lg leading-relaxed text-gray-300 space-y-6">
                          <p className="text-xl font-medium text-purple-200 border-l-4 border-purple-500 pl-6 py-2 bg-purple-500/5 rounded-r-lg">
                            {blog.excerpt}
                          </p>
                          <p>
                            In this comprehensive guide, we'll explore the intricacies of {blog.title.toLowerCase()}, 
                            providing you with actionable insights and strategies that you can implement immediately in Dubai's dynamic business landscape.
                          </p>
                        </div>
                      </section>

                      <section id="key-points" className="mb-12">
                        <div className="flex items-center mb-6">
                          <div className="w-3 h-3 bg-blue-500 rounded-full mr-4"></div>
                          <h2 className="text-3xl font-bold text-white m-0">Key Insights</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                          <div className="group p-6 bg-gradient-to-br from-purple-600/15 to-purple-600/5 border border-purple-600/25 rounded-2xl hover:from-purple-600/20 hover:to-purple-600/10 transition-all duration-300">
                            <div className="flex items-center mb-4">
                              <svg className="w-8 h-8 text-purple-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                              </svg>
                              <h4 className="text-lg font-bold text-purple-300">Strategic Approach</h4>
                            </div>
                            <p className="text-gray-300 leading-relaxed">Understanding the fundamentals of UAE business formation and building a solid foundation for long-term success.</p>
                          </div>
                          <div className="group p-6 bg-gradient-to-br from-blue-600/15 to-blue-600/5 border border-blue-600/25 rounded-2xl hover:from-blue-600/20 hover:to-blue-600/10 transition-all duration-300">
                            <div className="flex items-center mb-4">
                              <svg className="w-8 h-8 text-blue-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                              </svg>
                              <h4 className="text-lg font-bold text-blue-300">Implementation</h4>
                            </div>
                            <p className="text-gray-300 leading-relaxed">Practical steps and real-world applications based on 10+ years of experience in Dubai's business ecosystem.</p>
                          </div>
                        </div>
                      </section>

                      <section id="detailed-analysis" className="mb-12">
                        <div className="flex items-center mb-6">
                          <div className="w-3 h-3 bg-green-500 rounded-full mr-4"></div>
                          <h2 className="text-3xl font-bold text-white m-0">Expert Analysis</h2>
                        </div>
                        
                        <div className="text-lg leading-relaxed text-gray-300 space-y-8">
                          <p>
                            The landscape of business formation in Dubai has evolved significantly over the past decade. 
                            With my experience at Meydan Free Zone Authority, I've witnessed firsthand how regulatory 
                            changes and market dynamics have shaped the opportunities available to entrepreneurs and investors.
                          </p>
                          
                          <blockquote className="relative border-l-4 border-purple-500 pl-8 py-6 my-8 bg-gradient-to-r from-purple-500/10 to-transparent rounded-r-2xl">
                            <div className="absolute -left-2 top-6 w-4 h-4 bg-purple-500 rounded-full"></div>
                            <p className="text-xl text-purple-200 italic font-medium leading-relaxed mb-4">
                              "Success in Dubai's business environment requires not just understanding the regulations, 
                              but also building the right relationships and choosing the optimal structure for your specific needs."
                            </p>
                            <cite className="text-gray-400 font-semibold">- Julian D'Rozario, Business Relations Manager</cite>
                          </blockquote>

                          <div className="bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 border border-cyan-500/20 rounded-2xl p-8">
                            <h3 className="text-2xl font-bold text-cyan-300 mb-6 flex items-center">
                              <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                              </svg>
                              Market Insights
                            </h3>
                            <p className="text-gray-300 leading-relaxed mb-6">
                              Based on my experience incorporating over 3,200 licenses and working with 100+ channel partners, 
                              here are the critical factors that determine success in Dubai's business formation landscape.
                            </p>

                            <ul className="space-y-4">
                              <li className="flex items-start space-x-4">
                                <div className="flex-shrink-0 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center mt-1">
                                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
                                  </svg>
                                </div>
                                <span className="text-gray-300 text-lg">Regulatory compliance and proper documentation processes</span>
                              </li>
                              <li className="flex items-start space-x-4">
                                <div className="flex-shrink-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mt-1">
                                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
                                  </svg>
                                </div>
                                <span className="text-gray-300 text-lg">Strategic location and business activity selection</span>
                              </li>
                              <li className="flex items-start space-x-4">
                                <div className="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mt-1">
                                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
                                  </svg>
                                </div>
                                <span className="text-gray-300 text-lg">Post-formation support and ongoing compliance management</span>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </section>

                      <section id="conclusion" className="mb-12">
                        <div className="flex items-center mb-6">
                          <div className="w-3 h-3 bg-yellow-500 rounded-full mr-4"></div>
                          <h2 className="text-3xl font-bold text-white m-0">Key Takeaways</h2>
                        </div>
                        <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-2xl p-8">
                          <p className="text-lg leading-relaxed text-gray-300 mb-6">
                            The opportunities in Dubai's business landscape continue to expand, but success requires 
                            expert guidance and strategic planning. Whether you're a corporate service provider or 
                            an entrepreneur looking to establish your presence in the UAE, understanding these 
                            fundamentals will set you on the path to success.
                          </p>
                          
                          <div className="flex items-center justify-between flex-wrap gap-4 p-6 bg-gradient-to-r from-purple-600/10 to-blue-600/10 border border-purple-500/20 rounded-xl">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-purple-400">3200+</div>
                              <div className="text-sm text-gray-400">Licenses Incorporated</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-blue-400">100+</div>
                              <div className="text-sm text-gray-400">Channel Partners</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-green-400">10+</div>
                              <div className="text-sm text-gray-400">Years Experience</div>
                            </div>
                          </div>
                        </div>
                      </section>
                    </div>

                    {/* Enhanced Author Bio */}
                    <div className="mt-16 p-8 bg-gradient-to-br from-white/10 to-white/[0.04] backdrop-blur-xl border border-white/20 rounded-2xl">
                      <div className="flex items-start space-x-6">
                        <div className="relative flex-shrink-0">
                          <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                            JD
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-400 rounded-full border-3 border-gray-900 flex items-center justify-center">
                            <svg className="w-3 h-3 text-gray-900" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
                            </svg>
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-2xl font-bold text-white">About the Author</h4>
                            <div className="flex items-center space-x-2">
                              <div className="px-3 py-1 bg-purple-600/20 text-purple-300 rounded-full text-sm font-medium">
                                Expert
                              </div>
                              <div className="px-3 py-1 bg-green-600/20 text-green-300 rounded-full text-sm font-medium">
                                Verified
                              </div>
                            </div>
                          </div>
                          <p className="text-gray-300 leading-relaxed text-lg mb-4">
                            Julian D'Rozario is a Business Relations Manager at Meydan Free Zone Authority with over 
                            a decade of experience in company formation and corporate services. He has facilitated 
                            the incorporation of over 3,200 licenses and works with 100+ active channel partners 
                            across the UAE business formation landscape.
                          </p>
                          <div className="flex items-center space-x-4 text-sm text-gray-400">
                            <div className="flex items-center space-x-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                              </svg>
                              <span>Business Relations Manager</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              <span>Dubai, UAE</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Blog Interactions */}
                    <div className="mt-12">
                      <BlogInteractions 
                        blogId={blog.id.toString()} 
                        blogTitle={blog.title}
                        blogUrl={window.location.href}
                      />
                    </div>

                    {/* Comments Section */}
                    <div id="comments-section" className="mt-16">
                      <BlogComments blogId={blog.id.toString()} blogTitle={blog.title} />
                    </div>
                  </div>
                </article>
              </div>
              
              {/* Sidebar - Mobile Drawer on Small Screens */}
              <div className="lg-desktop:col-span-1 mt-6 lg-desktop:mt-0">
                {/* Mobile Sidebar Toggle */}
                <button 
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="lg-desktop:hidden w-full mb-3 mobile-button bg-gradient-to-r from-purple-600 to-blue-600 text-white flex items-center justify-center gap-1.5"
                >
                  <span className="mobile-text-sm font-medium">Article Info</span>
                  <svg className={`w-3.5 h-3.5 transition-transform duration-300 ${sidebarOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Sidebar Content */}
                <div className={`lg-desktop:sticky lg-desktop:top-8 mobile-content-gap ${sidebarOpen ? 'block' : 'hidden lg-desktop:block'}`}>
                  {/* Author Info */}
                  <div className="bg-gradient-to-br from-white/5 to-white/[0.02] mobile-optimized-blur border border-white/10 mobile-card mobile-compact-spacing">
                    <h4 className="mobile-text-sm font-medium text-white mb-2" style={{ fontFamily: 'Encode Sans Semi Expanded, sans-serif' }}>
                      About the Author
                    </h4>
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-8 h-8 xxs:w-10 xxs:h-10 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white font-semibold mobile-text-xs">
                        JD
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="mobile-text-xs font-medium text-white truncate">{blog.author}</p>
                        <p className="mobile-text-xs text-gray-400">Business Relations Manager</p>
                      </div>
                    </div>
                    <p className="mobile-text-xs leading-relaxed text-gray-400">
                      Expert in UAE business formation with 10+ years experience in company setup and licensing.
                    </p>
                  </div>
                  
                  {/* Blog Categories */}
                  <div className="bg-gradient-to-br from-white/5 to-white/[0.02] mobile-optimized-blur border border-white/10 mobile-card mobile-compact-spacing">
                    <h4 className="mobile-text-sm font-medium text-white mb-2" style={{ fontFamily: 'Encode Sans Semi Expanded, sans-serif' }}>
                      Categories
                    </h4>
                    <div className="space-y-0.5">
                      {['Company Formation', 'Immigration', 'Technology', 'Operations', 'Business Development', 'Compliance'].map(category => (
                        <Link 
                          key={category}
                          to={`/blog?category=${category}`}
                          className="block mobile-text-xs text-gray-400 hover:text-purple-400 transition-colors duration-200 touch-target py-1 truncate"
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

        {/* Related Posts - Left Aligned */}
        {relatedBlogs.length > 0 && (
          <section className="pb-12 xxs:pb-16 px-3 xxs:px-4 xs:px-6">
            <div className="max-w-7xl mx-auto">
              <h2 className="text-xl xxs:text-2xl xs:text-3xl font-bold text-left mb-8 xxs:mb-12" style={{ fontFamily: 'Encode Sans Semi Expanded, sans-serif' }}>
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