import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const BlogSection = () => {
  const sectionRef = useRef(null);
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dataSource, setDataSource] = useState('');
  const [debugInfo, setDebugInfo] = useState([]);

  // Add debug info
  const addDebug = (message) => {
    console.log('BlogSection DEBUG:', message);
    setDebugInfo(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  // Immediate data loading on component mount
  useEffect(() => {
    const loadBlogs = async () => {
      addDebug('Starting to load blogs...');
      
      try {
        // Test simple endpoint first
        addDebug('Testing simple API endpoint...');
        let response = await fetch('/api/test');
        addDebug(`Test API response status: ${response.status}`);
        
        if (response.ok) {
          const testResult = await response.text();
          addDebug(`Test API response: ${testResult.substring(0, 100)}...`);
        }
      } catch (error) {
        addDebug(`Test API error: ${error.message}`);
      }

      try {
        // Now try the real blogs API
        addDebug('Trying blogs API...');
        const apiUrl = '/api/blogs';
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });
        
        addDebug(`Blogs API response status: ${response.status}`);
        addDebug(`Blogs API response headers: ${JSON.stringify([...response.headers.entries()])}`);
        
        const responseText = await response.text();
        addDebug(`Blogs API raw response (first 200 chars): ${responseText.substring(0, 200)}`);
        
        // Try to parse as JSON
        try {
          const apiResponse = JSON.parse(responseText);
          addDebug(`Blogs API parsed successfully`);
          
          // API returns {blogs: [...], total: n}, we need just the blogs array
          const apiBlogs = apiResponse.blogs || apiResponse;
          addDebug(`Extracted blogs count: ${apiBlogs ? apiBlogs.length : 'null/undefined'}`);
          
          if (apiBlogs && Array.isArray(apiBlogs) && apiBlogs.length > 0) {
            addDebug(`Setting ${apiBlogs.length} blogs`);
            setBlogs(apiBlogs.slice(0, 6));
            setDataSource('API');
            setIsLoading(false);
            return;
          } else {
            addDebug('No valid blogs found in response');
          }
        } catch (parseError) {
          addDebug(`JSON parse error: ${parseError.message}`);
          addDebug(`Response was probably HTML: ${responseText.includes('<!doctype') || responseText.includes('<html>')}`);
        }
        
        // If we get here, something went wrong
        addDebug('API failed - showing no blogs');
        setBlogs([]);
        setDataSource('Failed');
        setIsLoading(false);
        
      } catch (error) {
        addDebug(`Network error: ${error.message}`);
        setBlogs([]);
        setDataSource('Error');
        setIsLoading(false);
      }
    };

    loadBlogs();
  }, []);

  const handleArticleClick = (articleId) => {
    navigate(`/blog/${articleId}`);
  };

  const handleViewAllClick = () => {
    navigate('/blog');
  };

  return (
    <section 
      ref={sectionRef}
      id="blog" 
      className="relative py-12 xxs:py-14 xs:py-16 sm-mobile:py-18 md-tablet:py-20 lg-desktop:py-24 px-3 xxs:px-4 xs:px-5 sm-mobile:px-6 md-tablet:px-8 bg-gradient-to-br from-black via-slate-950/50 to-black"
    >
      {/* Background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 xxs:w-40 xxs:h-40 xs:w-48 xs:h-48 sm-mobile:w-56 sm-mobile:h-56 md-tablet:w-64 md-tablet:h-64 bg-gradient-to-r from-purple-500/[0.03] to-blue-500/[0.03] rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-24 h-24 xxs:w-32 xxs:h-32 xs:w-40 xs:h-40 sm-mobile:w-44 sm-mobile:h-44 md-tablet:w-48 md-tablet:h-48 bg-gradient-to-r from-blue-500/[0.03] to-purple-500/[0.03] rounded-full filter blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-8 xxs:mb-10 xs:mb-12 sm-mobile:mb-14 md-tablet:mb-16">
          <h2 
            className="text-2xl xxs:text-2xl xs:text-3xl sm-mobile:text-4xl md-tablet:text-5xl lg-desktop:text-5xl xl-desktop:text-6xl font-bold mb-3 xxs:mb-4 xs:mb-4 bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent leading-tight"
            style={{ fontFamily: 'Encode Sans Semi Expanded, sans-serif' }}
          >
            Latest Insights
          </h2>
          <p className="text-sm xxs:text-base xs:text-lg sm-mobile:text-lg md-tablet:text-xl text-gray-300 max-w-xs xxs:max-w-sm xs:max-w-md sm-mobile:max-w-lg md-tablet:max-w-2xl mx-auto px-2">
            Expert perspectives on Dubai business formation, UAE licensing, and corporate advisory services
          </p>
        </div>

        {/* Debug Information */}
        <div className="mb-8 p-4 bg-gray-800 rounded-lg">
          <h3 className="text-white font-bold mb-2">Debug Info (Data Source: {dataSource}):</h3>
          <div className="text-sm text-gray-300 max-h-40 overflow-y-auto">
            {debugInfo.map((info, index) => (
              <div key={index} className="mb-1">{info}</div>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
            <span className="ml-3 text-gray-300">Loading insights...</span>
          </div>
        )}

        {/* No Blogs State */}
        {!isLoading && blogs.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg mb-4">No blog posts available at the moment.</div>
            <p className="text-gray-500">Please check back later for the latest insights.</p>
          </div>
        )}

        {/* Blog Articles Grid */}
        {!isLoading && blogs.length > 0 && (
          <div className="grid grid-cols-1 md-tablet:grid-cols-2 lg-desktop:grid-cols-3 gap-6 md-tablet:gap-8">
            {blogs.map((article) => (
              <article 
                key={article.id}
                className="group bg-gradient-to-br from-slate-900/50 to-slate-800/30 rounded-xl p-6 border border-slate-700/50 hover:border-purple-500/30 transition-all duration-300 cursor-pointer backdrop-blur-sm"
                onClick={() => handleArticleClick(article.id)}
              >
                <div className="mb-4">
                  <span className="inline-block px-3 py-1 text-xs font-medium text-purple-300 bg-purple-500/10 rounded-full border border-purple-500/20">
                    {article.category}
                  </span>
                </div>
                
                <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-purple-300 transition-colors duration-300 line-clamp-2">
                  {article.title}
                </h3>
                
                <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                  {article.excerpt}
                </p>
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{article.read_time}</span>
                  <span>{article.date}</span>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* View All Button */}
        {!isLoading && blogs.length > 0 && (
          <div className="text-center mt-12">
            <button
              onClick={handleViewAllClick}
              className="inline-flex items-center px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-105"
            >
              View All Articles
              <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default BlogSection;