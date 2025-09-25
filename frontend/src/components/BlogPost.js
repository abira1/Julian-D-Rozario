import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { gsap } from 'gsap';
import Navigation from './Navigation';
import Footer from './Footer';
import BlogComments from './blog/BlogComments';
import { mockBlogs } from '../data/mockData';
import GradualBlur from './ui/GradualBlur';

const BlogPost = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const contentRef = useRef(null);
  const [blog, setBlog] = useState(null);
  const [relatedBlogs, setRelatedBlogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Find the blog post
    const foundBlog = mockBlogs.find(b => b.id === parseInt(id));
    if (!foundBlog) {
      navigate('/blog');
      return;
    }
    
    setBlog(foundBlog);
    
    // Get related blogs (same category, excluding current)
    const related = mockBlogs
      .filter(b => b.category === foundBlog.category && b.id !== foundBlog.id)
      .slice(0, 3);
    setRelatedBlogs(related);
    
    setIsLoading(false);
  }, [id, navigate]);

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
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500"></div>
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
            <h1 className="text-2xl font-bold mb-4">Blog post not found</h1>
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
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-purple-500/5 to-blue-500/5 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-full filter blur-3xl"></div>
      </div>

      <Navigation />

      <main className="relative z-10">
        {/* Hero Section */}
        <section className="pt-24 pb-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-6">
              <span className="inline-block px-4 py-2 bg-purple-600/20 text-purple-400 rounded-full text-sm font-medium mb-4">
                {blog.category}
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight" style={{ fontFamily: 'Encode Sans Semi Expanded, sans-serif' }}>
                {blog.title}
              </h1>
              <div className="flex items-center justify-center space-x-6 text-gray-400">
                <div className="flex items-center space-x-2">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white font-semibold">
                    JD
                  </div>
                  <span>{blog.author}</span>
                </div>
                <span>•</span>
                <span>{blog.date}</span>
                <span>•</span>
                <span>{blog.readTime}</span>
              </div>
            </div>
            
            {/* Featured Image */}
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img
                src={blog.image}
                alt={blog.title}
                className="w-full h-64 md:h-96 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
            </div>
          </div>
        </section>

        {/* Content Section */}
        <section className="pb-16 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-lg border border-white/10 rounded-2xl">
              <div className="p-8 md:p-12" ref={contentRef}>
                {/* Table of Contents */}
                <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-lg border border-white/10 rounded-xl p-6 mb-8">
                  <h3 className="text-lg font-semibold mb-4 text-white">Table of Contents</h3>
                  <ul className="space-y-2">
                    <li><a href="#introduction" className="text-gray-400 hover:text-purple-400 transition-colors">Introduction</a></li>
                    <li><a href="#key-points" className="text-gray-400 hover:text-purple-400 transition-colors">Key Points</a></li>
                    <li><a href="#detailed-analysis" className="text-gray-400 hover:text-purple-400 transition-colors">Detailed Analysis</a></li>
                    <li><a href="#conclusion" className="text-gray-400 hover:text-purple-400 transition-colors">Conclusion</a></li>
                  </ul>
                </div>

                {/* Blog Content */}
                <div className="prose prose-lg prose-invert max-w-none">
                  <section id="introduction" className="mb-8">
                    <h2 className="text-2xl font-bold mb-4 text-white">Introduction</h2>
                    <p className="text-gray-300 leading-relaxed mb-4">
                      {blog.excerpt}
                    </p>
                    <p className="text-gray-300 leading-relaxed">
                      In this comprehensive guide, we'll explore the intricacies of {blog.title.toLowerCase()}, 
                      providing you with actionable insights and strategies that you can implement immediately.
                    </p>
                  </section>

                  <section id="key-points" className="mb-8">
                    <h2 className="text-2xl font-bold mb-4 text-white">Key Points</h2>
                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                      <div className="bg-gradient-to-br from-purple-600/10 to-purple-600/5 border border-purple-600/20 rounded-lg p-6">
                        <h4 className="font-semibold text-purple-300 mb-2">Strategic Approach</h4>
                        <p className="text-gray-300 text-sm">Understanding the fundamentals and building a solid foundation.</p>
                      </div>
                      <div className="bg-gradient-to-br from-blue-600/10 to-blue-600/5 border border-blue-600/20 rounded-lg p-6">
                        <h4 className="font-semibold text-blue-300 mb-2">Implementation</h4>
                        <p className="text-gray-300 text-sm">Practical steps and real-world applications.</p>
                      </div>
                    </div>
                  </section>

                  <section id="detailed-analysis" className="mb-8">
                    <h2 className="text-2xl font-bold mb-4 text-white">Detailed Analysis</h2>
                    <p className="text-gray-300 leading-relaxed mb-4">
                      The landscape of business formation in Dubai has evolved significantly over the past decade. 
                      With my experience at Meydan Free Zone Authority, I've witnessed firsthand how regulatory 
                      changes and market dynamics have shaped the opportunities available to entrepreneurs and investors.
                    </p>
                    
                    <blockquote className="border-l-4 border-purple-500 pl-6 py-2 my-6 bg-gradient-to-r from-purple-500/10 to-transparent">
                      <p className="text-purple-300 italic">
                        "Success in Dubai's business environment requires not just understanding the regulations, 
                        but also building the right relationships and choosing the optimal structure for your specific needs."
                      </p>
                      <cite className="text-gray-400 text-sm">- Julian D'Rozario</cite>
                    </blockquote>

                    <h3 className="text-xl font-semibold mb-3 text-white">Market Insights</h3>
                    <p className="text-gray-300 leading-relaxed mb-4">
                      Based on my experience incorporating over 3,200 licenses and working with 100+ channel partners, 
                      here are the critical factors that determine success in Dubai's business formation landscape.
                    </p>

                    <ul className="space-y-2 mb-6">
                      <li className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-300">Regulatory compliance and proper documentation</span>
                      </li>
                      <li className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-300">Strategic location and business activity selection</span>
                      </li>
                      <li className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-300">Post-formation support and ongoing compliance</span>
                      </li>
                    </ul>
                  </section>

                  <section id="conclusion" className="mb-8">
                    <h2 className="text-2xl font-bold mb-4 text-white">Conclusion</h2>
                    <p className="text-gray-300 leading-relaxed">
                      The opportunities in Dubai's business landscape continue to expand, but success requires 
                      expert guidance and strategic planning. Whether you're a corporate service provider or 
                      an entrepreneur looking to establish your presence in the UAE, understanding these 
                      fundamentals will set you on the path to success.
                    </p>
                  </section>
                </div>

                {/* Author Bio */}
                <div className="mt-12 p-6 bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-lg border border-white/10 rounded-xl">
                  <div className="flex items-start space-x-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-xl">
                      JD
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-white mb-2">About the Author</h4>
                      <p className="text-gray-300 text-sm leading-relaxed">
                        Julian D'Rozario is a Business Relations Manager at Meydan Free Zone Authority with over 
                        a decade of experience in company formation and corporate services. He has facilitated 
                        the incorporation of over 3,200 licenses and works with 100+ active channel partners 
                        across the UAE business formation landscape.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Comments Section */}
                <div className="mt-12">
                  <BlogComments blogId={blog.id.toString()} blogTitle={blog.title} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Related Posts */}
        {relatedBlogs.length > 0 && (
          <section className="pb-16 px-4">
            <div className="max-w-7xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12" style={{ fontFamily: 'Encode Sans Semi Expanded, sans-serif' }}>
                Related Articles
              </h2>
              
              <div className="grid md:grid-cols-3 gap-8">
                {relatedBlogs.map((relatedBlog) => (
                  <Link 
                    key={relatedBlog.id} 
                    to={`/blog/${relatedBlog.id}`}
                    className="group block"
                  >
                    <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl border border-white/10 rounded-xl p-6 hover:from-white/10 hover:to-white/[0.05] transition-all duration-300">
                      <img
                        src={relatedBlog.image}
                        alt={relatedBlog.title}
                        className="w-full h-48 object-cover rounded-lg mb-4 group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="space-y-2">
                        <span className="inline-block px-3 py-1 bg-purple-600/20 text-purple-400 rounded-full text-xs font-medium">
                          {relatedBlog.category}
                        </span>
                        <h3 className="font-semibold text-white group-hover:text-purple-300 transition-colors duration-200">
                          {relatedBlog.title}
                        </h3>
                        <p className="text-gray-400 text-sm line-clamp-2">
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
      <GradualBlur />
    </div>
  );
};

export default BlogPost;