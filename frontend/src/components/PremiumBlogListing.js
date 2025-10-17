import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { gsap } from 'gsap';
import BlurImage from './ui/BlurImage';
import blogService from '../services/blogService';
import categoryService from '../services/categoryService';
import { 
  Search, 
  Filter, 
  Calendar, 
  Clock, 
  Tag, 
  Heart, 
  MessageCircle, 
  Eye,
  ArrowRight,
  ChevronDown,
  X
} from 'lucide-react';

const PremiumBlogListing = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const heroRef = useRef(null);
  const gridRef = useRef(null);
  
  const [blogs, setBlogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!isLoading && heroRef.current && gridRef.current) {
      // Animate hero
      gsap.fromTo(heroRef.current.children, 
        { opacity: 0, y: 30 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 0.8, 
          stagger: 0.15,
          ease: "power2.out"
        }
      );

      // Animate blog cards
      gsap.fromTo(gridRef.current.querySelectorAll('.blog-card'), 
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

  const fetchData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch blogs from Firebase
      const blogsList = await blogService.getAllBlogs();
      setBlogs(Array.isArray(blogsList) ? blogsList : []);
      
      // Fetch categories from Firebase
      const categoriesData = await categoryService.getCategoriesFromBlogs();
      setCategories([{ name: 'All' }, ...categoriesData]);
      
    } catch (error) {
      console.error('Error fetching data:', error);
      setBlogs([]);
      setCategories([{ name: 'All' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredBlogs = blogs.filter(blog => {
    const matchesSearch = !searchQuery || 
      blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      blog.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'All' || blog.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set('search', value);
    } else {
      params.delete('search');
    }
    setSearchParams(params);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    
    const params = new URLSearchParams(searchParams);
    if (category !== 'All') {
      params.set('category', category);
    } else {
      params.delete('category');
    }
    setSearchParams(params);
    setShowFilters(false);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSearchParams({});
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

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section with Integrated Navigation */}
      <section className="pt-24 lg:pt-28 pb-16 bg-gradient-to-br from-black via-zinc-900 to-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div ref={heroRef} className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent leading-tight">
              Insights & Expertise
            </h1>
            <p className="text-xl text-gray-400 mb-8 leading-relaxed">
              Deep insights into Dubai business formation, corporate services, and the evolving landscape 
              of UAE entrepreneurship from industry expert Julian D'Rozario.
            </p>

            {/* Integrated Search - Clean Mobile Style */}
            <div className="mb-8 max-w-lg mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-300 w-5 h-5 z-10" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearch}
                  placeholder="Search articles..."
                  className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 hover:border-white/20 focus:border-purple-500/50 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:bg-white/10 transition-all"
                />
              </div>
            </div>

            <div className="flex items-center justify-center space-x-8 text-gray-500 mb-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">{filteredBlogs.length}</div>
                <div className="text-sm">Articles Found</div>
              </div>
              <div className="w-px h-8 bg-gray-600"></div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">{categories.length - 1}</div>
                <div className="text-sm">Categories</div>
              </div>
              <div className="w-px h-8 bg-gray-600"></div>
              <div className="text-center">
                <div className="text-2xl font-bold text-amber-400">10+</div>
                <div className="text-sm">Years Experience</div>
              </div>
            </div>

            {/* Category Pills - Mobile-Friendly */}
            <div className="flex flex-wrap justify-center gap-3">
              {categories.map((category) => (
                <button
                  key={category.name}
                  onClick={() => handleCategoryChange(category.name)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedCategory === category.name
                      ? 'bg-purple-600 text-white'
                      : 'bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white'
                  }`}
                >
                  {category.name}
                </button>
              ))}
              
              {(searchQuery || selectedCategory !== 'All') && (
                <button
                  onClick={clearFilters}
                  className="flex items-center space-x-2 px-4 py-2 text-red-400 hover:text-red-300 transition-colors rounded-full bg-red-500/10 hover:bg-red-500/20"
                >
                  <X className="w-4 h-4" />
                  <span className="text-sm">Clear</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Blog Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Blog Cards Grid */}
          {filteredBlogs.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-6 bg-gray-800 rounded-full flex items-center justify-center">
                <Search className="w-12 h-12 text-gray-600" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">No articles found</h3>
              <p className="text-gray-400 mb-8">
                Try adjusting your search terms or filter criteria
              </p>
              <button
                onClick={clearFilters}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-full transition-colors"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredBlogs.map((blog, index) => (
                <article
                  key={blog.id}
                  className="blog-card group cursor-pointer"
                  onClick={() => navigate(`/blog/${blog.id}`)}
                >
                  <div className="bg-zinc-900 border border-white/10 rounded-2xl overflow-hidden hover:border-purple-500/30 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1">
                    {/* Image */}
                    <div className="aspect-w-16 aspect-h-9 bg-gray-800 overflow-hidden relative">
                      <BlurImage 
                        src={blog.image_url || blog.featured_image || '/api/placeholder/400/225'}
                        alt={blog.title}
                        className="w-full h-48 group-hover:scale-110 transition-transform duration-300"
                      />
                      {blog.featured && (
                        <div className="absolute top-4 left-4 bg-purple-600/90 text-white px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm z-10">
                          Featured
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      {/* Category & Meta */}
                      <div className="flex items-center justify-between mb-4">
                        <span className="inline-flex items-center px-3 py-1 bg-purple-600/20 text-purple-300 text-sm font-medium rounded-full">
                          <Tag className="w-3 h-3 mr-1" />
                          {blog.category}
                        </span>
                        <div className="text-xs text-gray-500 flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {new Date(blog.created_at || blog.date).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </div>
                      </div>

                      {/* Title */}
                      <h3 className="text-xl font-bold text-white mb-3 line-clamp-2 group-hover:text-purple-300 transition-colors">
                        {blog.title}
                      </h3>

                      {/* Excerpt */}
                      <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                        {blog.excerpt}
                      </p>

                      {/* Footer */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span className="flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {blog.read_time || '5 min read'}
                          </span>
                          <span className="flex items-center">
                            <Eye className="w-3 h-3 mr-1" />
                            {blog.views || 0}
                          </span>
                          <span className="flex items-center">
                            <Heart className="w-3 h-3 mr-1" />
                            {blog.likes || 0}
                          </span>
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
          )}

          {/* Load More */}
          {filteredBlogs.length >= 9 && (
            <div className="text-center mt-16">
              <button className="px-8 py-4 bg-zinc-800 hover:bg-zinc-700 border border-white/20 hover:border-purple-500/30 text-white font-semibold rounded-full transition-all transform hover:scale-105">
                Load More Articles
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-16 bg-gradient-to-r from-purple-600/10 to-blue-600/10 border-t border-white/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-3xl font-bold text-white mb-4">Stay Updated</h3>
          <p className="text-gray-400 mb-8">
            Get the latest insights on Dubai business formation and corporate services delivered to your inbox.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Your email address"
              className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-full text-white placeholder-gray-400 focus:outline-none focus:border-purple-500/50"
            />
            <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-full transition-all transform hover:scale-105">
              Subscribe
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PremiumBlogListing;