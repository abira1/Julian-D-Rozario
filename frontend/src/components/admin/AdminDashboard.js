import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    total_blogs: 0,
    featured_blogs: 0,
    total_views: 0,
    total_likes: 0,
    categories: 0
  });
  const [recentBlogs, setRecentBlogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch blogs and calculate stats from the data
      const blogsResponse = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/blogs`);
      if (blogsResponse.ok) {
        const blogsData = await blogsResponse.json();
        // API returns {blogs: [...], total: n}, we need just the blogs array
        const blogs = blogsData.blogs || blogsData;
        
        // Calculate stats from blogs data
        const calculatedStats = {
          total_blogs: blogs.length,
          featured_blogs: blogs.filter(blog => blog.is_featured || blog.featured).length,
          total_views: blogs.reduce((sum, blog) => sum + (blog.views || 0), 0),
          total_likes: blogs.reduce((sum, blog) => sum + (blog.likes || 0), 0),
          categories: [...new Set(blogs.map(blog => blog.category))].length
        };
        
        setStats(calculatedStats);
        setRecentBlogs(blogs.slice(0, 5)); // Get latest 5 blogs
      }
      
      // Fetch categories for stats
      try {
        const categoriesResponse = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/categories`);
        if (categoriesResponse.ok) {
          const categories = await categoriesResponse.json();
          setStats(prev => ({ ...prev, categories: categories.length }));
        }
      } catch (catError) {
        console.log('Categories endpoint not available, using calculated count');
      }
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const StatCard = ({ title, value, icon, color, change }) => (
    <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl border border-white/10 rounded-xl p-6 hover:from-white/10 hover:to-white/[0.05] transition-all duration-300">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm font-medium">{title}</p>
          <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
          {change && (
            <p className="text-green-400 text-xs mt-1 flex items-center">
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              {change}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color.replace('text', 'bg').replace('white', 'white/10')}`}>
          <svg className={`w-6 h-6 ${color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
          </svg>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-white/10 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-white/5 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: 'Encode Sans Semi Expanded, sans-serif' }}>
          Dashboard
        </h1>
        <p className="text-gray-400">Welcome to Julian D'Rozario's portfolio admin panel</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Blogs"
          value={stats.total_blogs}
          icon="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3Z"
          color="text-blue-400"
          change="+12% this month"
        />
        <StatCard
          title="Featured Blogs"
          value={stats.featured_blogs}
          icon="M11.049 2.927C11.3 2.348 11.7 2.348 12.951 2.927L14.998 6.584L19.18 7.296C19.815 7.383 20.081 8.166 19.618 8.607L16.792 11.307L17.492 15.453C17.6 16.083 16.929 16.56 16.382 16.27L12 14.027L7.618 16.27C7.071 16.56 6.4 16.083 6.508 15.453L7.208 11.307L4.382 8.607C3.919 8.166 4.185 7.383 4.82 7.296L9.002 6.584L11.049 2.927Z"
          color="text-yellow-400"
        />
        <StatCard
          title="Total Views"
          value={stats.total_views?.toLocaleString() || '0'}
          icon="M15 12C15 13.657 13.657 15 12 15C10.343 15 9 13.657 9 12C9 10.343 10.343 9 12 9C13.657 9 15 10.343 15 12Z M2.458 12C3.732 7.943 7.523 5 12 5C16.478 5 20.268 7.943 21.542 12C20.268 16.057 16.478 19 12 19C7.523 19 3.732 16.057 2.458 12Z"
          color="text-green-400"
          change="+8% this week"
        />
        <StatCard
          title="Total Likes"
          value={stats.total_likes}
          icon="M4.318 6.318C5.055 5.581 6.041 5.25 7 5.25C7.959 5.25 8.945 5.581 9.682 6.318L12 8.636L14.318 6.318C15.794 4.842 18.206 4.842 19.682 6.318C21.158 7.794 21.158 10.206 19.682 11.682L12 19.364L4.318 11.682C2.842 10.206 2.842 7.794 4.318 6.318Z"
          color="text-red-400"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Blogs */}
        <div className="lg:col-span-2">
          <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white" style={{ fontFamily: 'Encode Sans Semi Expanded, sans-serif' }}>
                Recent Blogs
              </h3>
              <Link
                to="/admin/blogs"
                className="text-purple-400 hover:text-purple-300 transition-colors duration-200 text-sm font-medium"
              >
                View All →
              </Link>
            </div>
            
            <div className="space-y-4">
              {recentBlogs.length > 0 ? (
                recentBlogs.map((blog) => (
                  <div key={blog.id} className="flex items-center space-x-4 p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors duration-200">
                    <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                      {(blog.image_url || blog.featured_image || blog.image) ? (
                        <img 
                          src={blog.image_url || blog.featured_image || blog.image} 
                          alt={blog.title} 
                          className="w-full h-full object-cover" 
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div className={`w-full h-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center ${(blog.image_url || blog.featured_image || blog.image) ? 'hidden' : ''}`}>
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16L12 8L20 16" />
                        </svg>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-medium truncate">{blog.title}</h4>
                      <div className="flex items-center space-x-4 mt-1 text-xs text-gray-400">
                        <span>{blog.category}</span>
                        <span>{blog.read_time}</span>
                        <span>{blog.views} views</span>
                        {blog.featured && (
                          <span className="bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full">Featured</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3Z" />
                  </svg>
                  <p>No blogs available</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl border border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4" style={{ fontFamily: 'Encode Sans Semi Expanded, sans-serif' }}>
              Quick Actions
            </h3>
            <div className="space-y-3">
              <Link
                to="/admin/blogs/create"
                className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4V20M20 12H4" />
                </svg>
                Create New Blog
              </Link>
              <Link
                to="/admin/contact"
                className="w-full flex items-center justify-center px-4 py-3 bg-white/10 text-white font-medium rounded-lg hover:bg-white/20 transition-colors duration-200"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6C4.895 5 4 5.895 4 7V17C4 18.105 4.895 19 6 19H18C19.105 19 20 18.105 20 17V7C20 5.895 19.105 5 18 5H13M11 5C11 6.105 11.895 7 13 7H18M11 5C11 3.895 11.895 3 13 3H16C17.105 3 18 3.895 18 5" />
                </svg>
                Update Contact Info
              </Link>
            </div>
          </div>

          {/* System Status */}
          <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl border border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4" style={{ fontFamily: 'Encode Sans Semi Expanded, sans-serif' }}>
              System Status
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Database</span>
                <span className="flex items-center text-green-400">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                  Connected
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">API</span>
                <span className="flex items-center text-green-400">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                  Online
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Categories</span>
                <span className="text-white">{stats.categories}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;