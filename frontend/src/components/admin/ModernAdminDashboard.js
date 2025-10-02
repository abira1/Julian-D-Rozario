import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Eye, 
  Heart, 
  MessageSquare, 
  Users, 
  TrendingUp,
  Calendar,
  Plus,
  Edit3,
  Trash2,
  BarChart3,
  Activity,
  Clock,
  Star
} from 'lucide-react';

const ModernAdminDashboard = () => {
  const [stats, setStats] = useState({
    totalPosts: 0,
    publishedPosts: 0,
    draftPosts: 0,
    totalViews: 0,
    totalLikes: 0,
    totalComments: 0,
    // totalWorkedWith removed as requested
  });
  
  const [recentPosts, setRecentPosts] = useState([]);
  const [popularPosts, setPopularPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch blogs
      const blogsResponse = await fetch('/api/blogs');
      const blogs = blogsResponse.ok ? await blogsResponse.json() : [];
      
      // WorkedWith fetch removed as requested
      
      // Calculate stats
      const publishedBlogs = blogs.filter(blog => blog.status === 'published' || !blog.status);
      const draftBlogs = blogs.filter(blog => blog.status === 'draft');
      const totalViews = blogs.reduce((sum, blog) => sum + (blog.views || 0), 0);
      const totalLikes = blogs.reduce((sum, blog) => sum + (blog.likes || 0), 0);
      
      setStats({
        totalPosts: blogs.length,
        publishedPosts: publishedBlogs.length,
        draftPosts: draftBlogs.length,
        totalViews,
        totalLikes,
        totalComments: 0, // Will be implemented later
        totalWorkedWith: workedWith.length
      });
      
      // Set recent and popular posts
      const sortedByDate = [...blogs].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      const sortedByViews = [...blogs].sort((a, b) => (b.views || 0) - (a.views || 0));
      
      setRecentPosts(sortedByDate.slice(0, 5));
      setPopularPosts(sortedByViews.slice(0, 5));
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, title, value, change, changeType, color = "blue" }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`p-3 rounded-lg bg-${color}-50`}>
            <Icon className={`w-6 h-6 text-${color}-600`} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          </div>
        </div>
        {change && (
          <div className={`flex items-center space-x-1 ${
            changeType === 'increase' ? 'text-green-600' : 'text-red-600'
          }`}>
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm font-medium">{change}</span>
          </div>
        )}
      </div>
    </div>
  );

  const PostListItem = ({ post, showViews = false }) => (
    <div className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors">
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2 mb-1">
          <h4 className="text-sm font-medium text-gray-900 truncate">{post.title}</h4>
          {post.featured && <Star className="w-4 h-4 text-yellow-500" />}
        </div>
        <div className="flex items-center space-x-4 text-xs text-gray-500">
          <span className="flex items-center space-x-1">
            <Calendar className="w-3 h-3" />
            <span>{new Date(post.created_at).toLocaleDateString()}</span>
          </span>
          {showViews && (
            <span className="flex items-center space-x-1">
              <Eye className="w-3 h-3" />
              <span>{post.views || 0}</span>
            </span>
          )}
          <span className={`px-2 py-1 rounded-full text-xs ${
            post.status === 'published' || !post.status
              ? 'bg-green-100 text-green-800'
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            {post.status || 'published'}
          </span>
        </div>
      </div>
      <div className="flex items-center space-x-2 ml-4">
        <button className="p-1 text-gray-400 hover:text-blue-600 transition-colors">
          <Edit3 className="w-4 h-4" />
        </button>
        <button className="p-1 text-gray-400 hover:text-red-600 transition-colors">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="h-16 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-sm text-gray-600 mt-1">
              Welcome back! Here's what's happening with your content.
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
              <Plus className="w-4 h-4 mr-2" />
              New Post
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={FileText}
            title="Total Posts"
            value={stats.totalPosts}
            color="blue"
          />
          <StatCard
            icon={Eye}
            title="Total Views"
            value={stats.totalViews.toLocaleString()}
            color="green"
          />
          <StatCard
            icon={Heart}
            title="Total Likes"
            value={stats.totalLikes}
            color="red"
          />
          <StatCard
            icon={Users}
            title="Companies"
            value={stats.totalWorkedWith}
            color="purple"
          />
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            icon={Activity}
            title="Published"
            value={stats.publishedPosts}
            color="green"
          />
          <StatCard
            icon={Clock}
            title="Drafts"
            value={stats.draftPosts}
            color="yellow"
          />
          <StatCard
            icon={MessageSquare}
            title="Comments"
            value={stats.totalComments}
            color="blue"
          />
        </div>

        {/* Content Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Posts */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Recent Posts</h3>
                <BarChart3 className="w-5 h-5 text-gray-400" />
              </div>
            </div>
            <div className="p-2">
              {recentPosts.length > 0 ? (
                recentPosts.map(post => (
                  <PostListItem key={post.id} post={post} />
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p>No posts yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Popular Posts */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Popular Posts</h3>
                <TrendingUp className="w-5 h-5 text-gray-400" />
              </div>
            </div>
            <div className="p-2">
              {popularPosts.length > 0 ? (
                popularPosts.map(post => (
                  <PostListItem key={post.id} post={post} showViews={true} />
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <TrendingUp className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p>No popular posts yet</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="flex items-center p-4 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors">
              <Plus className="w-5 h-5 mr-3" />
              <span className="font-medium">Create New Post</span>
            </button>
            <button className="flex items-center p-4 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors">
              <Users className="w-5 h-5 mr-3" />
              <span className="font-medium">Add Company</span>
            </button>
            <button className="flex items-center p-4 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors">
              <BarChart3 className="w-5 h-5 mr-3" />
              <span className="font-medium">View Analytics</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernAdminDashboard;