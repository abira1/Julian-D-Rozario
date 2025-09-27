import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import SimpleTextEditor from '../SimpleTextEditor';

const BlogManager = () => {
  const { action, id } = useParams();
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // Form state for create/edit
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    category: '',
    read_time: '5 min read',
    featured: false,
    tags: [],
    image_url: ''
  });
  const [tagInput, setTagInput] = useState('');
  const [uploadedImage, setUploadedImage] = useState(null);

  const isCreateMode = action === 'create';
  const isEditMode = action === 'edit' && id;
  const isFormMode = isCreateMode || isEditMode;

  useEffect(() => {
    fetchBlogs();
    fetchCategories();
    
    if (isEditMode) {
      fetchBlogForEdit();
    }
  }, [action, id]);

  const fetchBlogs = async () => {
    try {
      // Use relative URL to avoid domain/protocol issues
      const apiUrl = process.env.REACT_APP_BACKEND_URL 
        ? `${process.env.REACT_APP_BACKEND_URL}/api/blogs`
        : '/api/blogs';
        
      const response = await fetch(apiUrl);
      if (response.ok) {
        const data = await response.json();
        // API returns {"blogs": [...], "total": n}, extract blogs array
        setBlogs(data.blogs || data);
      }
    } catch (error) {
      console.error('Error fetching blogs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const apiUrl = process.env.REACT_APP_BACKEND_URL 
        ? `${process.env.REACT_APP_BACKEND_URL}/api/categories`
        : '/api/categories';
      const response = await fetch(apiUrl);
      if (response.ok) {
        const data = await response.json();
        setCategories(data.filter(cat => cat.name !== 'All'));
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchBlogForEdit = async () => {
    try {
      const apiUrl = process.env.REACT_APP_BACKEND_URL 
        ? `${process.env.REACT_APP_BACKEND_URL}/api/blogs/${id}`
        : `/api/blogs/${id}`;
      const response = await fetch(apiUrl);
      if (response.ok) {
        const blog = await response.json();
        setFormData({
          title: blog.title,
          excerpt: blog.excerpt,
          content: blog.content,
          category: blog.category,
          read_time: blog.read_time,
          featured: blog.featured,
          tags: blog.tags || [],
          image_url: blog.image_url || ''
        });
      } else {
        setMessage({ type: 'error', text: 'Blog not found' });
        navigate('/julian_portfolio/blogs');
      }
    } catch (error) {
      console.error('Error fetching blog:', error);
      setMessage({ type: 'error', text: 'Failed to load blog' });
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleContentChange = (content) => {
    setFormData(prev => ({ ...prev, content }));
  };

  const handleTagAdd = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleTagRemove = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formDataUpload = new FormData();
    formDataUpload.append('file', file);

    try {
      const token = localStorage.getItem('admin_token');
      const apiUrl = process.env.REACT_APP_BACKEND_URL 
        ? `${process.env.REACT_APP_BACKEND_URL}/api/upload`
        : '/api/upload';
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formDataUpload,
      });

      if (response.ok) {
        const data = await response.json();
        setFormData(prev => ({ ...prev, image_url: data.url }));
        setUploadedImage(data.url);
        setMessage({ type: 'success', text: 'Image uploaded successfully!' });
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      setMessage({ type: 'error', text: 'Failed to upload image' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('admin_token');
      const baseUrl = process.env.REACT_APP_BACKEND_URL || '';
      const url = isEditMode 
        ? `${baseUrl}/api/blogs/${id}`
        : `${baseUrl}/api/blogs`;
      
      const method = isEditMode ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setMessage({ 
          type: 'success', 
          text: `Blog ${isEditMode ? 'updated' : 'created'} successfully!` 
        });
        
        // Refresh blogs list immediately for better UX
        await fetchBlogs();
        
        setTimeout(() => {
          navigate('/julian_portfolio/blogs');
        }, 1500);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to save blog');
      }
    } catch (error) {
      console.error('Error saving blog:', error);
      setMessage({ type: 'error', text: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (blogId) => {
    if (!window.confirm('Are you sure you want to delete this blog? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('admin_token');
      const apiUrl = process.env.REACT_APP_BACKEND_URL 
        ? `${process.env.REACT_APP_BACKEND_URL}/api/blogs/${blogId}`
        : `/api/blogs/${blogId}`;
      const response = await fetch(apiUrl, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Blog deleted successfully!' });
        fetchBlogs();
      } else {
        throw new Error('Failed to delete blog');
      }
    } catch (error) {
      console.error('Error deleting blog:', error);
      setMessage({ type: 'error', text: 'Failed to delete blog' });
    }
  };

  // Simple text editor - no configuration needed

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-white/10 rounded w-1/3 mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-white/5 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isFormMode) {
    return (
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: 'Encode Sans Semi Expanded, sans-serif' }}>
              {isEditMode ? 'Edit Blog' : 'Create New Blog'}
            </h1>
            <p className="text-gray-400">
              {isEditMode ? 'Update your blog post' : 'Write and publish a new blog post'}
            </p>
          </div>
          <Link
            to="/julian_portfolio/blogs"
            className="px-4 py-2 bg-white/10 text-gray-300 rounded-lg hover:bg-white/20 hover:text-white transition-colors duration-200"
          >
            ← Back to Blogs
          </Link>
        </div>

        {/* Status Message */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-500/10 border border-green-500/20 text-green-400' 
              : 'bg-red-500/10 border border-red-500/20 text-red-400'
          }`}>
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {message.type === 'success' ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13L9 17L19 7" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8V12M12 16H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" />
                )}
              </svg>
              {message.text}
            </div>
          </div>
        )}

        {/* Blog Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Title */}
              <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl border border-white/10 rounded-xl p-6">
                <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
                  Blog Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter an engaging blog title..."
                />
              </div>

              {/* Excerpt */}
              <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl border border-white/10 rounded-xl p-6">
                <label htmlFor="excerpt" className="block text-sm font-medium text-gray-300 mb-2">
                  Excerpt *
                </label>
                <textarea
                  id="excerpt"
                  name="excerpt"
                  value={formData.excerpt}
                  onChange={handleInputChange}
                  required
                  rows={3}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 resize-none"
                  placeholder="Write a brief description of your blog post..."
                />
              </div>

              {/* Content Editor */}
              <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl border border-white/10 rounded-xl p-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Blog Content *
                </label>
                <SimpleTextEditor
                  value={formData.content}
                  onChange={handleContentChange}
                  placeholder="Start writing your blog content here..."
                  style={{ minHeight: '300px' }}
                />
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Publish Settings */}
              <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl border border-white/10 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Publish Settings</h3>
                
                {/* Category */}
                <div className="mb-4">
                  <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-2">
                    Category *
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.name} className="bg-gray-800">
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Read Time */}
                <div className="mb-4">
                  <label htmlFor="read_time" className="block text-sm font-medium text-gray-300 mb-2">
                    Read Time
                  </label>
                  <input
                    type="text"
                    id="read_time"
                    name="read_time"
                    value={formData.read_time}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="5 min read"
                  />
                </div>

                {/* Featured */}
                <div className="mb-4">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      name="featured"
                      checked={formData.featured}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-purple-600 bg-white/5 border-white/10 rounded focus:ring-purple-500 focus:ring-2"
                    />
                    <span className="text-sm font-medium text-gray-300">Feature this blog</span>
                  </label>
                </div>
              </div>

              {/* Image Upload */}
              <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl border border-white/10 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Featured Image</h3>
                
                <div className="space-y-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-purple-600 file:text-white hover:file:bg-purple-700"
                  />
                  
                  {(formData.image_url || uploadedImage) && (
                    <div className="mt-4">
                      <img 
                        src={formData.image_url || uploadedImage} 
                        alt="Preview" 
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Tags */}
              <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl border border-white/10 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Tags</h3>
                
                <div className="space-y-3">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleTagAdd())}
                      className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Add tag..."
                    />
                    <button
                      type="button"
                      onClick={handleTagAdd}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200"
                    >
                      Add
                    </button>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 bg-blue-500/20 text-blue-400 text-sm rounded-full"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleTagRemove(tag)}
                          className="ml-2 text-blue-300 hover:text-red-400 transition-colors duration-200"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl border border-white/10 rounded-xl p-6">
                <div className="space-y-3">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-black transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        {isEditMode ? 'Updating...' : 'Publishing...'}
                      </div>
                    ) : (
                      isEditMode ? 'Update Blog' : 'Publish Blog'
                    )}
                  </button>
                  
                  <Link
                    to="/julian_portfolio/blogs"
                    className="w-full block text-center py-3 bg-white/10 text-gray-300 font-medium rounded-lg hover:bg-white/20 hover:text-white transition-colors duration-200"
                  >
                    Cancel
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    );
  }

  // Blog listing view
  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: 'Encode Sans Semi Expanded, sans-serif' }}>
            Blog Management
          </h1>
          <p className="text-gray-400">Manage your blog posts and content</p>
        </div>
        <Link
          to="/julian_portfolio/blogs/create"
          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4V20M20 12H4" />
          </svg>
          <span>Create New Blog</span>
        </Link>
      </div>

      {/* Status Message */}
      {message.text && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-500/10 border border-green-500/20 text-green-400' 
            : 'bg-red-500/10 border border-red-500/20 text-red-400'
        }`}>
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {message.type === 'success' ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13L9 17L19 7" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8V12M12 16H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" />
              )}
            </svg>
            {message.text}
          </div>
        </div>
      )}

      {/* Blog List */}
      <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden">
        {blogs.length > 0 ? (
          <div className="divide-y divide-white/10">
            {blogs.map((blog) => (
              <div key={blog.id} className="p-6 hover:bg-white/5 transition-colors duration-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-white truncate">
                        {blog.title}
                      </h3>
                      {blog.featured && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400">
                          Featured
                        </span>
                      )}
                    </div>
                    <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                      {blog.excerpt}
                    </p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>{blog.category}</span>
                      <span>{blog.read_time}</span>
                      <span>{blog.views} views</span>
                      <span>{blog.likes} likes</span>
                      <span>{new Date(blog.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <Link
                      to={`/julian_portfolio/blogs/edit/${blog.id}`}
                      className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition-all duration-200"
                      title="Edit blog"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232L18.768 8.768M15.232 5.232C14.83 4.83 14.17 4.83 13.768 5.232L5.232 13.768C4.83 14.17 4.83 14.83 5.232 15.232L8.768 18.768C9.17 19.17 9.83 19.17 10.232 18.768L18.768 10.232C19.17 9.83 19.17 9.17 18.768 8.768L15.232 5.232Z" />
                      </svg>
                    </Link>
                    <button
                      onClick={() => handleDelete(blog.id)}
                      className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all duration-200"
                      title="Delete blog"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7L5 7M10 11V17M14 11V17M6 7V17C6 18.1046 6.89543 19 8 19H16C17.1046 19 18 18.1046 18 17V7M9 7V4C9 3.44772 9.44772 3 10 3H14C14.5523 3 15 3.44772 15 4V7" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3Z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-400 mb-2">No blogs found</h3>
            <p className="text-gray-500 mb-4">Get started by creating your first blog post.</p>
            <Link
              to="/julian_portfolio/blogs/create"
              className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4V20M20 12H4" />
              </svg>
              Create First Blog
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogManager;