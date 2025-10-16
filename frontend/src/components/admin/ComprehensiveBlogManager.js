import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Save, Eye, ArrowLeft, Upload, Tag, Calendar, Globe, Star, FileText, 
  Image as ImageIcon, Search, Filter, Plus, Edit3, Trash2, MoreVertical, 
  Clock, Check, X, AlertCircle, Zap, BookOpen, TrendingUp, Users
} from 'lucide-react';
import SEOEditor from './SEOEditor';

const ComprehensiveBlogManager = () => {
  const navigate = useNavigate();
  const { action, id } = useParams();
  
  // State Management
  const [blogs, setBlogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [currentBlog, setCurrentBlog] = useState(null);
  const [viewMode, setViewMode] = useState('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [notification, setNotification] = useState(null);
  
  // Form State
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    category: 'Business Formation',
    image_url: '',
    author: 'Julian D\'Rozario',
    status: 'draft',
    is_featured: false,
    featured_image: '',
    meta_title: '',
    meta_description: '',
    read_time: '5 min read',
    // SEO Fields
    slug: '',
    keywords: '',
    og_image: '',
    canonical_url: ''
  });

  const textareaRef = useRef(null);

  // Predefined categories for Julian's business
  const defaultCategories = [
    { name: 'Business Formation', id: 'business-formation' },
    { name: 'Legal Advisory', id: 'legal-advisory' },
    { name: 'Dubai Business', id: 'dubai-business' },
    { name: 'Corporate Services', id: 'corporate-services' },
    { name: 'UAE Licensing', id: 'uae-licensing' },
    { name: 'Immigration', id: 'immigration' },
    { name: 'Technology', id: 'technology' },
    { name: 'Operations', id: 'operations' },
    { name: 'Compliance', id: 'compliance' },
    { name: 'General', id: 'general' }
  ];

  // Initialize component
  useEffect(() => {
    fetchData();
    
    if (action === 'create') {
      setViewMode('create');
      resetForm();
    } else if (action === 'edit' && id) {
      setViewMode('edit');
      loadBlog(id);
    } else {
      setViewMode('list');
    }
  }, [action, id]);

  // Fetch blogs and set categories
  const fetchData = async () => {
    try {
      setIsLoading(true);
      
      // Use backend URL from environment variable
      const backendUrl = process.env.REACT_APP_BACKEND_URL || '';
      
      const blogsResponse = await fetch(`${backendUrl}/api/blogs?admin=true`);
      const blogsData = blogsResponse.ok ? await blogsResponse.json() : [];
      setBlogs(Array.isArray(blogsData) ? blogsData : blogsData.blogs || []);
      
      // Use predefined categories
      setCategories(defaultCategories);
      
    } catch (error) {
      console.error('Error fetching data:', error);
      showNotification('Error loading data', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Load specific blog for editing
  const loadBlog = async (blogId) => {
    try {
      const response = await fetch(`/api/blogs/${blogId}`);
      if (response.ok) {
        const blog = await response.json();
        setCurrentBlog(blog);
        setFormData({
          title: blog.title || '',
          excerpt: blog.excerpt || '',
          content: blog.content || '',
          category: blog.category || blog.category_name || 'Business Formation',
          image_url: blog.image_url || blog.featured_image || '',
          author: blog.author || 'Julian D\'Rozario',
          status: blog.status || 'draft',
          is_featured: blog.is_featured || blog.featured || false,
          featured_image: blog.featured_image || blog.image_url || '',
          meta_title: blog.meta_title || '',
          meta_description: blog.meta_description || '',
          read_time: blog.read_time || '5 min read',
          // SEO Fields
          slug: blog.slug || '',
          keywords: blog.keywords || '',
          og_image: blog.og_image || blog.image_url || blog.featured_image || '',
          canonical_url: blog.canonical_url || ''
        });
      }
    } catch (error) {
      console.error('Error loading blog:', error);
      showNotification('Error loading blog', 'error');
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      title: '',
      excerpt: '',
      content: '',
      category: 'Business Formation',
      image_url: '',
      author: 'Julian D\'Rozario',
      status: 'draft',
      is_featured: false,
      featured_image: '',
      meta_title: '',
      meta_description: '',
      read_time: '5 min read',
      // SEO Fields
      slug: '',
      keywords: '',
      og_image: '',
      canonical_url: ''
    });
    setCurrentBlog(null);
  };

  // Handle SEO data updates from SEOEditor
  const handleSEOUpdate = (seoData) => {
    setFormData(prev => ({
      ...prev,
      ...seoData
    }));
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Save blog (create or update)
  const handleSave = async (status = 'draft') => {
    try {
      setIsSaving(true);
      
      const dataToSave = {
        ...formData,
        status: status,
        featured_image: formData.image_url,
        featured: formData.is_featured
      };

      // Use backend URL from environment variable
      const backendUrl = process.env.REACT_APP_BACKEND_URL || '';

      let response;
      if (currentBlog) {
        response = await fetch(`${backendUrl}/api/blogs/${currentBlog.id}`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('backend_token')}`
          },
          body: JSON.stringify(dataToSave)
        });
      } else {
        response = await fetch(`${backendUrl}/api/blogs`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('backend_token')}`
          },
          body: JSON.stringify(dataToSave)
        });
      }

      if (response.ok) {
        const savedBlog = await response.json();
        showNotification(
          currentBlog ? 'Blog updated successfully!' : 'Blog created successfully!',
          'success'
        );
        
        await fetchData();
        
        setTimeout(() => {
          navigate('/julian_portfolio/blogs');
        }, 1500);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Server response:', response.status, errorData);
        throw new Error(errorData.detail || 'Failed to save blog');
      }
    } catch (error) {
      console.error('Error saving blog:', error);
      showNotification(`Error saving blog: ${error.message}`, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Delete blog
  const handleDelete = async (blogId) => {
    try {
      const response = await fetch(`/api/blogs/${blogId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('backend_token')}`
        }
      });

      if (response.ok) {
        showNotification('Blog deleted successfully!', 'success');
        await fetchData();
        setShowDeleteConfirm(null);
      } else {
        throw new Error('Failed to delete blog');
      }
    } catch (error) {
      console.error('Error deleting blog:', error);
      showNotification('Error deleting blog', 'error');
    }
  };

  // Show notification
  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Filter blogs
  const filteredBlogs = blogs.filter(blog => {
    const matchesSearch = !searchQuery || 
      blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      blog.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || blog.status === filterStatus;
    const matchesCategory = filterCategory === 'all' || blog.category === filterCategory || blog.category_name === filterCategory;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Calculate statistics
  const stats = {
    total: blogs.length,
    published: blogs.filter(b => b.status === 'published').length,
    draft: blogs.filter(b => b.status === 'draft').length,
    featured: blogs.filter(b => b.is_featured || b.featured).length
  };

  // Render loading state
  if (isLoading && viewMode === 'list') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-slate-950 to-black">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  // === RENDER LIST VIEW ===
  if (viewMode === 'list') {
    return (
      <div className="min-h-screen p-6 bg-gradient-to-br from-black via-slate-950 to-black">
        {/* Notification */}
        {notification && (
          <div className={`fixed top-20 right-6 z-50 px-6 py-4 rounded-xl shadow-2xl border backdrop-blur-sm ${
            notification.type === 'success' ? 'bg-green-500/20 border-green-500/30 text-green-100' :
            notification.type === 'error' ? 'bg-red-500/20 border-red-500/30 text-red-100' :
            'bg-blue-500/20 border-blue-500/30 text-blue-100'
          }`}>
            <div className="flex items-center space-x-3">
              {notification.type === 'success' ? <Check className="w-5 h-5" /> :
               notification.type === 'error' ? <AlertCircle className="w-5 h-5" /> :
               <AlertCircle className="w-5 h-5" />}
              <span className="font-medium">{notification.message}</span>
            </div>
          </div>
        )}

        <div className="max-w-7xl mx-auto">
          {/* Header with Statistics */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent mb-2">
                  Blog Management
                </h1>
                <p className="text-gray-400">Create, edit, and manage your blog articles</p>
              </div>
              <button
                onClick={() => navigate('/julian_portfolio/blogs/create')}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-xl font-semibold transition-all transform hover:scale-105 flex items-center space-x-2 shadow-lg"
              >
                <Plus className="w-5 h-5" />
                <span>Create New Blog</span>
              </button>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/20 rounded-xl p-6 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-2">
                  <BookOpen className="w-8 h-8 text-purple-400" />
                  <span className="text-3xl font-bold text-white">{stats.total}</span>
                </div>
                <p className="text-gray-400 text-sm">Total Blogs</p>
              </div>
              
              <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/20 rounded-xl p-6 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-2">
                  <Globe className="w-8 h-8 text-green-400" />
                  <span className="text-3xl font-bold text-white">{stats.published}</span>
                </div>
                <p className="text-gray-400 text-sm">Published</p>
              </div>
              
              <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 border border-yellow-500/20 rounded-xl p-6 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-2">
                  <FileText className="w-8 h-8 text-yellow-400" />
                  <span className="text-3xl font-bold text-white">{stats.draft}</span>
                </div>
                <p className="text-gray-400 text-sm">Drafts</p>
              </div>
              
              <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20 rounded-xl p-6 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-2">
                  <Star className="w-8 h-8 text-blue-400" />
                  <span className="text-3xl font-bold text-white">{stats.featured}</span>
                </div>
                <p className="text-gray-400 text-sm">Featured</p>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-4 bg-slate-900/50 backdrop-blur-sm border border-white/10 rounded-xl p-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search blogs by title or excerpt..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 bg-slate-800/50 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">All Status</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
              
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-4 py-2 bg-slate-800/50 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">All Categories</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.name}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Blogs List */}
          <div className="space-y-4">
            {filteredBlogs.length === 0 ? (
              <div className="text-center py-16 bg-slate-900/30 border border-white/10 rounded-xl">
                <BookOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-400 mb-2">No blogs found</h3>
                <p className="text-gray-500 mb-6">
                  {searchQuery || filterStatus !== 'all' || filterCategory !== 'all'
                    ? 'Try adjusting your filters'
                    : 'Create your first blog to get started'}
                </p>
                {!searchQuery && filterStatus === 'all' && filterCategory === 'all' && (
                  <button
                    onClick={() => navigate('/julian_portfolio/blogs/create')}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-xl font-semibold transition-all inline-flex items-center space-x-2"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Create Your First Blog</span>
                  </button>
                )}
              </div>
            ) : (
              filteredBlogs.map(blog => (
                <div
                  key={blog.id}
                  className="bg-slate-900/50 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:border-purple-500/30 transition-all group"
                >
                  <div className="flex items-start space-x-4">
                    {/* Blog Image */}
                    <div className="w-48 h-32 rounded-lg overflow-hidden flex-shrink-0 bg-slate-800">
                      {(blog.image_url || blog.featured_image) ? (
                        <img 
                          src={blog.image_url || blog.featured_image} 
                          alt={blog.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="w-12 h-12 text-gray-600" />
                        </div>
                      )}
                    </div>

                    {/* Blog Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0 pr-4">
                          <h3 className="text-xl font-bold text-white mb-2 truncate group-hover:text-purple-400 transition-colors">
                            {blog.title}
                          </h3>
                          <p className="text-gray-400 text-sm line-clamp-2 mb-3">
                            {blog.excerpt}
                          </p>
                        </div>
                        
                        {/* Actions */}
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => navigate(`/julian_portfolio/blogs/edit/${blog.id}`)}
                            className="p-2 hover:bg-purple-500/20 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit3 className="w-5 h-5 text-purple-400" />
                          </button>
                          <button
                            onClick={() => window.open(`/blog/${blog.id}`, '_blank')}
                            className="p-2 hover:bg-blue-500/20 rounded-lg transition-colors"
                            title="Preview"
                          >
                            <Eye className="w-5 h-5 text-blue-400" />
                          </button>
                          <button
                            onClick={() => setShowDeleteConfirm(blog.id)}
                            className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-5 h-5 text-red-400" />
                          </button>
                        </div>
                      </div>

                      {/* Meta Info */}
                      <div className="flex flex-wrap items-center gap-4 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          blog.status === 'published' 
                            ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                            : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                        }`}>
                          {blog.status === 'published' ? 'Published' : 'Draft'}
                        </span>
                        
                        {(blog.is_featured || blog.featured) && (
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center space-x-1">
                            <Star className="w-3 h-3" />
                            <span>Featured</span>
                          </span>
                        )}
                        
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30">
                          {blog.category || blog.category_name}
                        </span>
                        
                        <span className="text-gray-500 flex items-center space-x-1">
                          <Eye className="w-4 h-4" />
                          <span>{blog.views || 0} views</span>
                        </span>
                        
                        <span className="text-gray-500 flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{blog.read_time || '5 min read'}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 border border-red-500/30 rounded-2xl p-8 max-w-md w-full">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-8 h-8 text-red-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Delete Blog?</h3>
                <p className="text-gray-400">
                  Are you sure you want to delete this blog? This action cannot be undone.
                </p>
              </div>
              
              <div className="flex space-x-4">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 px-4 py-3 bg-slate-800 hover:bg-slate-700 rounded-xl font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(showDeleteConfirm)}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 rounded-xl font-semibold transition-all"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // === RENDER CREATE/EDIT VIEW ===
  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-black via-slate-950 to-black">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-20 right-6 z-50 px-6 py-4 rounded-xl shadow-2xl border backdrop-blur-sm ${
          notification.type === 'success' ? 'bg-green-500/20 border-green-500/30 text-green-100' :
          notification.type === 'error' ? 'bg-red-500/20 border-red-500/30 text-red-100' :
          'bg-blue-500/20 border-blue-500/30 text-blue-100'
        }`}>
          <div className="flex items-center space-x-3">
            {notification.type === 'success' ? <Check className="w-5 h-5" /> :
             notification.type === 'error' ? <AlertCircle className="w-5 h-5" /> :
             <AlertCircle className="w-5 h-5" />}
            <span className="font-medium">{notification.message}</span>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/julian_portfolio/blogs')}
              className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-gray-400" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-white">
                {currentBlog ? 'Edit Blog' : 'Create New Blog'}
              </h1>
              <p className="text-gray-400 text-sm mt-1">
                {currentBlog ? 'Update your existing blog article' : 'Write and publish a new blog article'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => handleSave('draft')}
              disabled={isSaving}
              className="px-6 py-3 bg-slate-800 hover:bg-slate-700 rounded-xl font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <Save className="w-5 h-5" />
              <span>Save Draft</span>
            </button>
            <button
              onClick={() => handleSave('published')}
              disabled={isSaving}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <Globe className="w-5 h-5" />
              <span>{isSaving ? 'Publishing...' : 'Publish'}</span>
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="space-y-6">
          {/* Title */}
          <div className="bg-slate-900/50 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Blog Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Enter an engaging title for your blog..."
              className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 text-xl font-semibold"
              required
            />
          </div>

          {/* Excerpt */}
          <div className="bg-slate-900/50 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Excerpt <span className="text-red-400">*</span>
            </label>
            <textarea
              name="excerpt"
              value={formData.excerpt}
              onChange={handleInputChange}
              placeholder="Write a brief summary of your blog (2-3 sentences)..."
              rows="3"
              className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              required
            />
            <p className="text-sm text-gray-500 mt-2">
              {formData.excerpt.length} characters
            </p>
          </div>

          {/* Content */}
          <div className="bg-slate-900/50 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Blog Content <span className="text-red-400">*</span>
            </label>
            <textarea
              ref={textareaRef}
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              placeholder="Write your blog content here... You can use HTML tags like <h2>, <p>, <ul>, <li>, <strong>, <em>, etc."
              rows="15"
              className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none font-mono text-sm"
              required
            />
            <p className="text-sm text-gray-500 mt-2">
              Supports HTML formatting • {formData.content.length} characters
            </p>
          </div>

          {/* Category, Read Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Category */}
            <div className="bg-slate-900/50 backdrop-blur-sm border border-white/10 rounded-xl p-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Category <span className="text-red-400">*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              >
                {categories.map(cat => (
                  <option key={cat.id} value={cat.name}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* Read Time */}
            <div className="bg-slate-900/50 backdrop-blur-sm border border-white/10 rounded-xl p-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Read Time
              </label>
              <input
                type="text"
                name="read_time"
                value={formData.read_time}
                onChange={handleInputChange}
                placeholder="e.g., 5 min read"
                className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Image Upload & URL */}
          <div className="bg-slate-900/50 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <label className="block text-sm font-medium text-gray-300 mb-4">
              Featured Image
            </label>
            
            {/* Upload from Computer */}
            <div className="mb-4">
              <label className="block text-sm text-gray-400 mb-2">
                📁 Upload from Computer
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files[0];
                  if (file) {
                    // Show uploading state
                    setFormData(prev => ({ ...prev, image_url: 'uploading...' }));
                    
                    try {
                      const formData = new FormData();
                      formData.append('image', file);
                      
                      // Use backend URL from environment variable
                      const backendUrl = process.env.REACT_APP_BACKEND_URL || '';
                      const uploadUrl = `${backendUrl}/upload_image.php`;
                      
                      const response = await fetch(uploadUrl, {
                        method: 'POST',
                        body: formData
                      });
                      
                      const result = await response.json();
                      
                      if (result.success) {
                        // Construct full image URL
                        const imageUrl = result.url.startsWith('http') 
                          ? result.url 
                          : `${backendUrl}${result.url}`;
                        setFormData(prev => ({ ...prev, image_url: imageUrl }));
                        showNotification('Image uploaded successfully!', 'success');
                      } else {
                        throw new Error(result.error || 'Upload failed');
                      }
                    } catch (error) {
                      console.error('Upload error:', error);
                      showNotification('Upload failed: ' + error.message, 'error');
                      setFormData(prev => ({ ...prev, image_url: '' }));
                    }
                  }
                }}
                className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700 cursor-pointer"
              />
              <p className="text-xs text-gray-500 mt-1">
                Max 5MB • JPEG, PNG, GIF, WebP
              </p>
            </div>

            {/* OR Divider */}
            <div className="flex items-center my-4">
              <div className="flex-1 border-t border-white/10"></div>
              <span className="px-3 text-gray-500 text-sm">OR</span>
              <div className="flex-1 border-t border-white/10"></div>
            </div>

            {/* URL Input */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                🔗 Paste Image URL
              </label>
              <input
                type="url"
                name="image_url"
                value={formData.image_url === 'uploading...' ? 'Uploading...' : formData.image_url}
                onChange={handleInputChange}
                placeholder="https://images.unsplash.com/photo-..."
                disabled={formData.image_url === 'uploading...'}
                className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
              />
            </div>

            {/* Image Preview */}
            {formData.image_url && formData.image_url !== 'uploading...' && (
              <div className="mt-4 rounded-lg overflow-hidden">
                <img 
                  src={formData.image_url} 
                  alt="Preview" 
                  className="w-full h-64 object-cover"
                  onError={(e) => e.target.src = 'https://via.placeholder.com/800x400?text=Invalid+Image+URL'}
                />
              </div>
            )}

            {/* Uploading State */}
            {formData.image_url === 'uploading...' && (
              <div className="mt-4 p-4 bg-slate-800/50 rounded-lg flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500 mr-3"></div>
                <span className="text-gray-300">Uploading image...</span>
              </div>
            )}
          </div>

          {/* Featured Checkbox */}
          <div className="bg-slate-900/50 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                name="is_featured"
                checked={formData.is_featured}
                onChange={handleInputChange}
                className="w-5 h-5 rounded bg-slate-800 border-white/10 text-purple-600 focus:ring-2 focus:ring-purple-500"
              />
              <div>
                <span className="text-white font-medium">Mark as Featured</span>
                <p className="text-sm text-gray-400">Featured blogs appear prominently on the homepage</p>
              </div>
            </label>
          </div>

          {/* SEO Section - Comprehensive SEO Editor */}
          <SEOEditor 
            formData={formData}
            onUpdate={handleSEOUpdate}
          />
        </div>
      </div>
    </div>
  );
};

export default ComprehensiveBlogManager;