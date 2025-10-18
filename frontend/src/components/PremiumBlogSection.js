import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { BookOpen, ArrowRight, Calendar, Clock, Tag, TrendingUp } from 'lucide-react';
import BlurImage from './ui/BlurImage';
import { SectionTransition, SkeletonLoader, ProgressiveImage } from './LoadingSystem';
import blogService from '../services/blogService';

const PremiumBlogSection = () => {
  const sectionRef = useRef(null);
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadBlogs = async () => {
      try {
        console.log('PremiumBlogSection: Loading blogs from Firebase...');
        
        // Fetch from Firebase Realtime Database
        const firebaseBlogs = await blogService.getAllBlogs();
        console.log('PremiumBlogSection: Firebase blogs loaded:', firebaseBlogs?.length || 0);
        
        if (firebaseBlogs && Array.isArray(firebaseBlogs) && firebaseBlogs.length > 0) {
          // Filter for published blogs
          let publishedBlogs = firebaseBlogs.filter(blog => {
            return blog.status === 'published' || 
                   blog.published === true || 
                   blog.status === 'active' ||
                   !blog.hasOwnProperty('status');
          });
          
          // If no published blogs found but we have blogs, show all blogs
          if (publishedBlogs.length === 0 && firebaseBlogs.length > 0) {
            console.log('PremiumBlogSection: No published blogs found, showing all blogs');
            publishedBlogs = firebaseBlogs;
          }
          
          // Sort by date (newest first) and take the latest 6
          publishedBlogs = publishedBlogs
            .sort((a, b) => {
              const dateA = new Date(b.date || b.createdAt || b.created_at || 0);
              const dateB = new Date(a.date || a.createdAt || a.created_at || 0);
              return dateA - dateB;
            })
            .slice(0, 6);
          
          console.log('PremiumBlogSection: Final blogs to display:', publishedBlogs.length);
          console.log('PremiumBlogSection: Blog IDs:', publishedBlogs.map(b => ({ id: b.id, title: b.title })));
          setBlogs(publishedBlogs);
        } else {
          console.log('PremiumBlogSection: No blogs found in Firebase');
          setBlogs([]);
        }
      } catch (error) {
        console.error('PremiumBlogSection: Error loading blogs from Firebase:', error);
        setBlogs([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadBlogs();
  }, []);

  useEffect(() => {
    if (!isLoading && sectionRef.current) {
      try {
        // GSAP animations for entrance with safety checks
        const tl = gsap.timeline();
        
        const sectionHeader = sectionRef.current.querySelector('.section-header');
        const blogCards = sectionRef.current.querySelectorAll('.blog-card');
        
        if (sectionHeader) {
          tl.fromTo(sectionHeader, 
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }
          );
        }
        
        if (blogCards.length > 0) {
          tl.fromTo(blogCards, 
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: "power2.out" },
            "-=0.4"
          );
        }
      } catch (error) {
        console.error('GSAP animation error:', error);
        // If GSAP fails, at least make elements visible
        if (sectionRef.current) {
          sectionRef.current.style.opacity = '1';
        }
      }
    }
  }, [isLoading]);

  const handleViewAll = () => {
    navigate('/blog');
  };

  const handleBlogClick = (blogId) => {
    console.log('PremiumBlogSection: Navigating to blog post with ID:', blogId);
    navigate(`/blog/${blogId}`);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <section ref={sectionRef} className="py-16 bg-gradient-to-br from-black via-zinc-900 to-black relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-600/5 via-transparent to-blue-600/5"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="section-header text-center max-w-4xl mx-auto mb-16">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-full border border-purple-500/30">
              <TrendingUp className="w-6 h-6 text-purple-400" />
            </div>
          </div>
          
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent leading-tight">
            Latest Insights
          </h2>
          
          <p className="text-xl text-gray-400 mb-8 leading-relaxed">
            Expert perspectives on Dubai business formation, UAE licensing, and corporate advisory services from Julian D'Rozario
          </p>

          {/* Stats Row */}
          <div className="flex items-center justify-center space-x-8 text-gray-500 mb-8">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">{blogs.length}</div>
              <div className="text-sm">Articles</div>
            </div>
            <div className="w-px h-8 bg-gray-600"></div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">10+</div>
              <div className="text-sm">Years Experience</div>
            </div>
            <div className="w-px h-8 bg-gray-600"></div>
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-400">3200+</div>
              <div className="text-sm">Licenses</div>
            </div>
          </div>
        </div>

        {/* Enhanced Loading State */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <SkeletonLoader type="blog-card" count={6} />
          </div>
        ) : blogs.length === 0 ? (
          /* Empty State */
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-6 bg-zinc-800 rounded-full flex items-center justify-center">
              <BookOpen className="w-10 h-10 text-gray-600" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Coming Soon</h3>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              Our expert insights on Dubai business formation and UAE corporate services will be published here soon.
            </p>
            <button
              onClick={() => navigate('/contact')}
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-full transition-all transform hover:scale-105"
            >
              Get Expert Consultation
            </button>
          </div>
        ) : (
          /* Blog Grid */
          <>
            <SectionTransition delay={0.2}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                {blogs.map((blog, index) => (
                <article
                  key={blog.id}
                  className="blog-card group cursor-pointer h-full"
                  onClick={() => handleBlogClick(blog.id)}
                >
                  <div className="bg-zinc-900 border border-white/10 rounded-2xl overflow-hidden hover:border-purple-500/30 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 h-full flex flex-col">
                    
                    {/* Image - Fixed Height */}
                    <div className="relative h-48 bg-gradient-to-br from-zinc-800 to-zinc-700 overflow-hidden flex-shrink-0">
                      {blog.featured_image || blog.image_url ? (
                        <ProgressiveImage 
                          src={blog.featured_image || blog.image_url}
                          alt={blog.title}
                          className="w-full h-48 group-hover:scale-110 transition-transform duration-300"
                          priority={index < 3} // Prioritize first 3 images
                        />
                      ) : null}
                      
                      {/* Fallback image container */}
                      <div 
                        className={`absolute inset-0 bg-gradient-to-br from-purple-600/20 to-blue-600/20 flex items-center justify-center ${
                          (blog.featured_image || blog.image_url) ? 'hidden' : 'flex'
                        }`}
                      >
                        <BookOpen className="w-12 h-12 text-purple-400" />
                      </div>
                      
                      {(blog.is_featured || blog.featured || index === 0) && (
                        <div className="absolute top-4 left-4 bg-purple-600/90 text-white px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm">
                          Featured
                        </div>
                      )}
                    </div>

                    {/* Content - Flexible Height */}
                    <div className="p-6 flex flex-col flex-grow">
                      {/* Category & Meta */}
                      <div className="flex items-center justify-between mb-4 flex-shrink-0">
                        <span className="inline-flex items-center px-3 py-1 bg-purple-600/20 text-purple-300 text-sm font-medium rounded-full">
                          <Tag className="w-3 h-3 mr-1" />
                          {blog.category || 'Business Insights'}
                        </span>
                        <div className="text-xs text-gray-500 flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {formatDate(blog.created_at || blog.published_at)}
                        </div>
                      </div>

                      {/* Title - Fixed Height */}
                      <h3 className="text-xl font-bold text-white mb-3 line-clamp-2 group-hover:text-purple-300 transition-colors flex-shrink-0 min-h-[3.5rem]">
                        {blog.title}
                      </h3>

                      {/* Excerpt - Flexible Height */}
                      <p className="text-gray-400 text-sm mb-6 line-clamp-3 flex-grow">
                        {blog.excerpt || 'Expert insights on Dubai business formation and UAE corporate services.'}
                      </p>

                      {/* Footer - Fixed at Bottom */}
                      <div className="flex items-center justify-between flex-shrink-0 mt-auto">
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span className="flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {blog.read_time || '5 min read'}
                          </span>
                          {blog.views && blog.views > 0 && (
                            <span>{blog.views} views</span>
                          )}
                        </div>
                        
                        <div className="text-purple-400 group-hover:text-purple-300 transition-colors">
                          <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* View All Button */}
            <div className="text-center">
              <button
                onClick={handleViewAll}
                className="group inline-flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-full transition-all transform hover:scale-105 shadow-lg hover:shadow-purple-500/25"
              >
                <BookOpen className="w-5 h-5" />
                <span>Explore All Articles</span>
                <ArrowRight className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
            </SectionTransition>
          </>
        )}
      </div>
    </section>
  );
};

export default PremiumBlogSection;