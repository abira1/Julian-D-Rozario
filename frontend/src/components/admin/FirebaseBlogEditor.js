import React, { useState, useEffect } from 'react';
import { useFirebaseAuth } from '../../contexts/FirebaseAuthContext';
import { useNavigate } from 'react-router-dom';
import blogService from '../../services/blogService';
import categoryService from '../../services/categoryService';
import { Save, Eye, Upload, Tag, Calendar, Globe, Star, FileText, Image as ImageIcon, ArrowLeft } from 'lucide-react';

const FirebaseBlogEditor = ({ blogId, onSave, onCancel }) => {
  const { user } = useFirebaseAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    category: 'Business Formation',
    image_url: '',
    featured_image: '',
    author: 'Julian D\'Rozario',
    status: 'draft',
    is_featured: false,
    read_time: '5 min read',
    date: new Date().toISOString().split('T')[0]
  });
  
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [notification, setNotification] = useState(null);

  // Check if user is admin
  const isAdmin = user && (
    user.email === 'juliandrozario@gmail.com' || 
    user.email === 'abirsabirhossain@gmail.com'
  );

  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
      return;
    }
    
    loadCategories();
    
    if (blogId) {
      loadBlog();
    }
  }, [blogId, isAdmin, navigate]);

  const loadCategories = async () => {
    try {
      const categoriesData = await categoryService.getAllCategories();
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadBlog = async () => {
    try {
      setIsLoading(true);
      const blog = await blogService.getBlogById(blogId);
      if (blog) {
        setFormData({
          title: blog.title || '',
          excerpt: blog.excerpt || '',
          content: blog.content || '',
          category: blog.category || 'Business Formation',
          image_url: blog.image_url || '',
          featured_image: blog.featured_image || '',
          author: blog.author || 'Julian D\'Rozario',
          status: blog.status || 'draft',
          is_featured: blog.is_featured || false,
          read_time: blog.read_time || '5 min read',
          date: blog.date || new Date().toISOString().split('T')[0]
        });
      }
    } catch (error) {
      console.error('Error loading blog:', error);
      showNotification('Error loading blog', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = async (status = formData.status) => {
    try {
      setSaving(true);
      
      const blogData = {
        ...formData,
        status,
        date: formData.date || new Date().toISOString().split('T')[0]
      };

      let result;
      if (blogId) {
        await blogService.updateBlog(blogId, blogData);
        result = { id: blogId, ...blogData };
      } else {
        result = await blogService.createBlog(blogData);
      }

      showNotification(
        `Blog ${blogId ? 'updated' : 'created'} successfully!`, 
        'success'
      );
      
      if (onSave) {
        onSave(result);
      }
      
      // Redirect to blog list after successful save
      setTimeout(() => {
        navigate('/admin/blogs');
      }, 1500);
      
    } catch (error) {
      console.error('Error saving blog:', error);
      showNotification('Error saving blog. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const estimateReadTime = (content) => {
    const wordsPerMinute = 200;
    const wordCount = content.split(' ').length;
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    return `${minutes} min read`;
  };

  const handleContentChange = (e) => {
    const content = e.target.value;
    setFormData(prev => ({
      ...prev,
      content,
      read_time: estimateReadTime(content)
    }));
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-gray-400">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg ${
          notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'
        }`}>
          {notification.message}
        </div>
      )}

      {/* Header */}
      <div className="border-b border-white/10 bg-white/5">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/admin/blogs')}
                className="flex items-center space-x-2 text-gray-300 hover:text-white"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Blogs</span>
              </button>
              <h1 className="text-2xl font-bold">
                {blogId ? 'Edit Blog' : 'Create New Blog'}
              </h1>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setPreviewMode(!previewMode)}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg"
              >
                <Eye className="w-4 h-4" />
                <span>{previewMode ? 'Edit' : 'Preview'}</span>
              </button>
              
              <button
                onClick={() => handleSave('draft')}
                disabled={isSaving}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Saving...' : 'Save Draft'}</span>
              </button>
              
              <button
                onClick={() => handleSave('published')}
                disabled={isSaving}
                className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg disabled:opacity-50"
              >
                <Globe className="w-4 h-4" />
                <span>{isSaving ? 'Publishing...' : 'Publish'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {previewMode ? (
          /* Preview Mode */
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/5 rounded-xl p-8 border border-white/10">
              {formData.featured_image && (
                <img
                  src={formData.featured_image}
                  alt={formData.title}
                  className="w-full h-64 object-cover rounded-lg mb-6"
                />
              )}
              
              <div className="flex items-center space-x-4 mb-4 text-sm text-gray-400">
                <span>{formData.date}</span>
                <span>•</span>
                <span>{formData.read_time}</span>
                <span>•</span>
                <span>{formData.category}</span>
              </div>
              
              <h1 className="text-4xl font-bold mb-4">{formData.title}</h1>
              <p className="text-xl text-gray-300 mb-8">{formData.excerpt}</p>
              
              <div 
                className="prose prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: formData.content.replace(/\n/g, '<br>') }}
              />
            </div>
          </div>
        ) : (
          /* Edit Mode */
          <div className="grid grid-cols-12 gap-8">
            {/* Main Content */}
            <div className="col-span-8 space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium mb-2">Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
                  placeholder="Enter blog title..."
                />
              </div>

              {/* Excerpt */}
              <div>
                <label className="block text-sm font-medium mb-2">Excerpt</label>
                <textarea
                  name="excerpt"
                  value={formData.excerpt}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-purple-500 focus:outline-none resize-none"
                  placeholder="Brief description of the blog..."
                />
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium mb-2">Content</label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleContentChange}
                  rows={20}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-purple-500 focus:outline-none resize-none font-mono"
                  placeholder="Write your blog content here..."
                />
              </div>
            </div>

            {/* Sidebar */}
            <div className="col-span-4 space-y-6">
              {/* Publishing Options */}
              <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                  <Globe className="w-5 h-5" />
                  <span>Publishing</span>
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Status</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-purple-500 focus:outline-none"
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Publish Date</label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-purple-500 focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      name="is_featured"
                      checked={formData.is_featured}
                      onChange={handleInputChange}
                      className="rounded border-white/10 bg-white/5 text-purple-600 focus:ring-purple-500"
                    />
                    <label className="text-sm">Featured Blog</label>
                  </div>
                </div>
              </div>

              {/* Category & Metadata */}
              <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                  <Tag className="w-5 h-5" />
                  <span>Metadata</span>
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Category</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-purple-500 focus:outline-none"
                    >
                      {categories.map(category => (
                        <option key={category.name} value={category.name}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Author</label>
                    <input
                      type="text"
                      name="author"
                      value={formData.author}
                      onChange={handleInputChange}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-purple-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Read Time</label>
                    <input
                      type="text"
                      name="read_time"
                      value={formData.read_time}
                      onChange={handleInputChange}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-purple-500 focus:outline-none"
                      placeholder="5 min read"
                    />
                  </div>
                </div>
              </div>

              {/* Featured Image */}
              <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                  <ImageIcon className="w-5 h-5" />
                  <span>Images</span>
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Featured Image URL</label>
                    <input
                      type="url"
                      name="featured_image"
                      value={formData.featured_image}
                      onChange={handleInputChange}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-purple-500 focus:outline-none"
                      placeholder="https://..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Image URL</label>
                    <input
                      type="url"
                      name="image_url"
                      value={formData.image_url}
                      onChange={handleInputChange}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-purple-500 focus:outline-none"
                      placeholder="https://..."
                    />
                  </div>

                  {(formData.featured_image || formData.image_url) && (
                    <div>
                      <p className="text-sm text-gray-400 mb-2">Preview:</p>
                      <img
                        src={formData.featured_image || formData.image_url}
                        alt="Preview"
                        className="w-full h-32 object-cover rounded-lg"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FirebaseBlogEditor;