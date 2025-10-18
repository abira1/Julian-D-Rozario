import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import { useForm, Controller } from 'react-hook-form';
import { 
  Save, 
  Eye, 
  ArrowLeft,
  Upload,
  Tag,
  Calendar,
  Globe,
  Star,
  FileText,
  Image as ImageIcon,
  Search,
  Filter,
  Plus,
  Edit3,
  Trash2,
  MoreVertical,
  Clock,
  Settings,
  Check,
  X,
  AlertCircle,
  Zap
} from 'lucide-react';

const EnhancedBlogManagerV2 = () => {
  const [blogs, setBlogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [currentBlog, setCurrentBlog] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // list, create, edit
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [lastSaved, setLastSaved] = useState(null);
  const [showPublishOptions, setShowPublishOptions] = useState(false);
  
  const editorRef = useRef(null);
  const autoSaveTimeoutRef = useRef(null);

  const { control, handleSubmit, reset, watch, setValue, formState: { errors, isDirty } } = useForm({
    defaultValues: {
      title: '',
      excerpt: '',
      content: '',
      category: '',
      meta_title: '',
      meta_description: '',
      meta_keywords: '',
      featured_image: '',
      read_time: '5 min read',
      status: 'draft',
      is_featured: false,
      is_sticky: false,
      tags: [],
      published_at: null,
      scheduled_at: null
    }
  });

  const watchedValues = watch();

  useEffect(() => {
    fetchData();
  }, []);

  // Auto-save functionality
  useEffect(() => {
    if (autoSaveEnabled && isDirty && (viewMode === 'edit' || viewMode === 'create') && currentBlog) {
      // Clear existing timeout
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
      
      // Set new timeout for auto-save
      autoSaveTimeoutRef.current = setTimeout(() => {
        handleAutoSave();
      }, 2000); // Auto-save after 2 seconds of inactivity
    }
    
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [watchedValues, autoSaveEnabled, isDirty, viewMode, currentBlog]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch blogs
      const blogsResponse = await fetch('/api/blogs', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      const blogsData = blogsResponse.ok ? await blogsResponse.json() : [];
      setBlogs(Array.isArray(blogsData) ? blogsData : []);
      
      // Fetch categories
      const categoriesResponse = await fetch('/api/categories');
      const categoriesData = categoriesResponse.ok ? await categoriesResponse.json() : [];
      setCategories(Array.isArray(categoriesData) ? categoriesData.filter(cat => cat.name !== 'All') : []);
      
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAutoSave = async () => {
    if (!currentBlog) return;
    
    try {
      const formData = watchedValues;
      
      const response = await fetch(`/api/blogs/${currentBlog.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({
          ...formData,
          status: 'draft' // Keep as draft for auto-save
        })
      });

      if (response.ok) {
        const updatedBlog = await response.json();
        setBlogs(prevBlogs => prevBlogs.map(b => b.id === updatedBlog.id ? updatedBlog : b));
        setLastSaved(new Date());
      }
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  };

  const onSubmit = async (data) => {
    try {
      setIsSaving(true);
      const method = currentBlog ? 'PUT' : 'POST';
      const url = currentBlog ? `/api/blogs/${currentBlog.id}` : '/api/blogs';
      
      // Handle publishing logic
      if (data.status === 'published' && !data.published_at) {
        data.published_at = new Date().toISOString();
      }

      // Handle scheduled publishing
      if (data.status === 'scheduled' && data.scheduled_at) {
        data.scheduled_at = new Date(data.scheduled_at).toISOString();
      }
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        const result = await response.json();
        
        if (currentBlog) {
          setBlogs(prevBlogs => prevBlogs.map(b => b.id === result.id ? result : b));
        } else {
          setBlogs(prevBlogs => [result, ...prevBlogs]);
          setCurrentBlog(result);
        }
        
        setLastSaved(new Date());
        setShowPublishOptions(false);
        
        // Show success message or redirect
        if (data.status === 'published') {
          // Optionally redirect to the published post
          // window.open(`/blog/${result.id}`, '_blank');
        }
      } else {
        throw new Error('Failed to save blog post');
      }
    } catch (error) {
      console.error('Error saving blog:', error);
      // Handle error (show toast, etc.)
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (blogId) => {
    if (!confirm('Are you sure you want to delete this blog post?')) return;
    
    try {
      const response = await fetch(`/api/blogs/${blogId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });

      if (response.ok) {
        setBlogs(prevBlogs => prevBlogs.filter(b => b.id !== blogId));
        if (currentBlog && currentBlog.id === blogId) {
          setViewMode('list');
          setCurrentBlog(null);
        }
      }
    } catch (error) {
      console.error('Error deleting blog:', error);
    }
  };

  const handleEdit = (blog) => {
    setCurrentBlog(blog);
    setViewMode('edit');
    reset({
      title: blog.title || '',
      excerpt: blog.excerpt || '',
      content: blog.content || '',
      category: blog.category || '',
      meta_title: blog.meta_title || '',
      meta_description: blog.meta_description || '',
      meta_keywords: blog.meta_keywords || '',
      featured_image: blog.featured_image || blog.image_url || '',
      read_time: blog.read_time || '5 min read',
      status: blog.status || 'draft',
      is_featured: blog.is_featured || false,
      is_sticky: blog.is_sticky || false,
      tags: blog.tags || [],
      published_at: blog.published_at,
      scheduled_at: blog.scheduled_at
    });
  };

  const handleCreate = () => {
    setCurrentBlog(null);
    setViewMode('create');
    reset({
      title: '',
      excerpt: '',
      content: '',
      category: categories.length > 0 ? categories[0].name : '',
      meta_title: '',
      meta_description: '',
      meta_keywords: '',
      featured_image: '',
      read_time: '5 min read',
      status: 'draft',
      is_featured: false,
      is_sticky: false,
      tags: [],
      published_at: null,
      scheduled_at: null
    });
  };

  const handleImageUpload = async (file) => {
    const formData = new FormData();
    formData.append('image', file);

    try {
      // Use backend URL from environment variable
      const backendUrl = process.env.REACT_APP_BACKEND_URL || '';
      const uploadUrl = `${backendUrl}/upload_image.php`;
      
      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        // Construct full image URL
        const imageUrl = result.url.startsWith('http') 
          ? result.url 
          : `${backendUrl}${result.url}`;
        return imageUrl;
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Image upload error:', error);
      return null;
    }
  };

  const filteredBlogs = blogs.filter(blog => {
    const matchesSearch = !searchQuery || 
      blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      blog.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || blog.status === filterStatus;
    const matchesCategory = filterCategory === 'all' || blog.category === filterCategory;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'published': return 'text-green-400 bg-green-400/10';
      case 'draft': return 'text-yellow-400 bg-yellow-400/10';
      case 'scheduled': return 'text-blue-400 bg-blue-400/10';
      case 'archived': return 'text-gray-400 bg-gray-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white">
        <div className="animate-spin rounded-full h-20 w-20 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  // Editor View
  if (viewMode === 'create' || viewMode === 'edit') {
    return (
      <div className="min-h-screen bg-black text-white">
        {/* Header */}
        <div className="sticky top-0 z-50 bg-black/90 backdrop-blur-md border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setViewMode('list')}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <h1 className="text-xl font-bold">
                  {viewMode === 'create' ? 'Create New Post' : 'Edit Post'}
                </h1>
                {lastSaved && (
                  <span className="text-sm text-gray-400 flex items-center">
                    <Check className="w-4 h-4 mr-1 text-green-400" />
                    Saved {lastSaved.toLocaleTimeString()}
                  </span>
                )}
              </div>
              
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2 text-sm">
                  <input
                    type="checkbox"
                    checked={autoSaveEnabled}
                    onChange={(e) => setAutoSaveEnabled(e.target.checked)}
                    className="rounded border-gray-600"
                  />
                  <span>Auto-save</span>
                </label>
                
                <button
                  onClick={() => window.open(`/blog/${currentBlog?.id}`, '_blank')}
                  disabled={!currentBlog}
                  className="flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50"
                >
                  <Eye className="w-4 h-4" />
                  <span>Preview</span>
                </button>
                
                <div className="relative">
                  <button
                    onClick={() => setShowPublishOptions(!showPublishOptions)}
                    className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save & Publish</span>
                    <Settings className="w-4 h-4" />
                  </button>
                  
                  {showPublishOptions && (
                    <div className="absolute top-full right-0 mt-2 w-64 bg-zinc-800 border border-white/20 rounded-lg shadow-xl z-50 p-4">
                      <h3 className="font-semibold mb-3">Publishing Options</h3>
                      
                      <div className="space-y-3">
                        <button
                          onClick={() => {
                            setValue('status', 'draft');
                            handleSubmit(onSubmit)();
                          }}
                          className="w-full text-left p-2 hover:bg-white/10 rounded flex items-center space-x-2"
                        >
                          <FileText className="w-4 h-4" />
                          <span>Save as Draft</span>
                        </button>
                        
                        <button
                          onClick={() => {
                            setValue('status', 'published');
                            handleSubmit(onSubmit)();
                          }}
                          className="w-full text-left p-2 hover:bg-white/10 rounded flex items-center space-x-2"
                        >
                          <Globe className="w-4 h-4" />
                          <span>Publish Now</span>
                        </button>
                        
                        <div className="border-t border-white/20 pt-3">
                          <label className="block text-sm text-gray-400 mb-2">Schedule for later</label>
                          <Controller
                            name="scheduled_at"
                            control={control}
                            render={({ field }) => (
                              <input
                                type="datetime-local"
                                {...field}
                                className="w-full px-3 py-2 bg-black/50 border border-white/20 rounded text-white focus:border-purple-500 focus:outline-none"
                              />
                            )}
                          />
                          <button
                            onClick={() => {
                              setValue('status', 'scheduled');
                              handleSubmit(onSubmit)();
                            }}
                            className="w-full mt-2 p-2 hover:bg-white/10 rounded flex items-center space-x-2"
                          >
                            <Clock className="w-4 h-4" />
                            <span>Schedule Post</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Editor Form */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Title */}
                <div>
                  <Controller
                    name="title"
                    control={control}
                    rules={{ required: 'Title is required' }}
                    render={({ field }) => (
                      <input
                        {...field}
                        placeholder="Enter your post title..."
                        className="w-full px-0 py-4 bg-transparent border-0 border-b-2 border-white/20 focus:border-purple-500 text-3xl font-bold text-white placeholder-gray-500 focus:outline-none"
                      />
                    )}
                  />
                  {errors.title && (
                    <p className="text-red-400 text-sm mt-2 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.title.message}
                    </p>
                  )}
                </div>

                {/* Excerpt */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Excerpt
                  </label>
                  <Controller
                    name="excerpt"
                    control={control}
                    rules={{ required: 'Excerpt is required' }}
                    render={({ field }) => (
                      <textarea
                        {...field}
                        rows={3}
                        placeholder="Write a compelling excerpt..."
                        className="w-full px-4 py-3 bg-zinc-900 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none resize-none"
                      />
                    )}
                  />
                  {errors.excerpt && (
                    <p className="text-red-400 text-sm mt-2 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.excerpt.message}
                    </p>
                  )}
                </div>

                {/* Content Editor */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Content
                  </label>
                  <Controller
                    name="content"
                    control={control}
                    rules={{ required: 'Content is required' }}
                    render={({ field }) => (
                      <Editor
                        ref={editorRef}
                        apiKey="no-api-key"
                        value={field.value}
                        onEditorChange={field.onChange}
                        init={{
                          height: 600,
                          menubar: false,
                          statusbar: false,
                          plugins: [
                            'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                            'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                            'insertdatetime', 'media', 'table', 'help', 'wordcount'
                          ],
                          toolbar: 'undo redo | blocks | bold italic forecolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | help',
                          content_style: `
                            body { 
                              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; 
                              font-size: 16px; 
                              background: #18181b; 
                              color: #fff; 
                            }
                          `,
                          skin: 'oxide-dark',
                          content_css: 'dark',
                          branding: false,
                          promotion: false
                        }}
                      />
                    )}
                  />
                  {errors.content && (
                    <p className="text-red-400 text-sm mt-2 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.content.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Featured Image */}
                <div className="bg-zinc-900 border border-white/20 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <ImageIcon className="w-5 h-5 mr-2" />
                    Featured Image
                  </h3>
                  
                  <Controller
                    name="featured_image"
                    control={control}
                    render={({ field }) => (
                      <div className="space-y-4">
                        {field.value && (
                          <div className="relative">
                            <img
                              src={field.value}
                              alt="Featured"
                              className="w-full h-32 object-cover rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={() => field.onChange('')}
                              className="absolute top-2 right-2 p-1 bg-red-600 hover:bg-red-700 text-white rounded-full"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                        
                        <input
                          type="url"
                          placeholder="Image URL"
                          value={field.value}
                          onChange={field.onChange}
                          className="w-full px-3 py-2 bg-black/50 border border-white/20 rounded text-white focus:border-purple-500 focus:outline-none"
                        />
                        
                        <input
                          type="file"
                          accept="image/*"
                          onChange={async (e) => {
                            const file = e.target.files[0];
                            if (file) {
                              const url = await handleImageUpload(file);
                              if (url) field.onChange(url);
                            }
                          }}
                          className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700"
                        />
                      </div>
                    )}
                  />
                </div>

                {/* Category & Settings */}
                <div className="bg-zinc-900 border border-white/20 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Settings</h3>
                  
                  <div className="space-y-4">
                    {/* Category */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Category
                      </label>
                      <Controller
                        name="category"
                        control={control}
                        render={({ field }) => (
                          <select
                            {...field}
                            className="w-full px-3 py-2 bg-black/50 border border-white/20 rounded text-white focus:border-purple-500 focus:outline-none"
                          >
                            {categories.map((category) => (
                              <option key={category.name} value={category.name}>
                                {category.name}
                              </option>
                            ))}
                          </select>
                        )}
                      />
                    </div>

                    {/* Read Time */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Read Time
                      </label>
                      <Controller
                        name="read_time"
                        control={control}
                        render={({ field }) => (
                          <input
                            {...field}
                            type="text"
                            placeholder="5 min read"
                            className="w-full px-3 py-2 bg-black/50 border border-white/20 rounded text-white focus:border-purple-500 focus:outline-none"
                          />
                        )}
                      />
                    </div>

                    {/* Featured & Sticky */}
                    <div className="space-y-3">
                      <Controller
                        name="is_featured"
                        control={control}
                        render={({ field }) => (
                          <label className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={field.value}
                              onChange={field.onChange}
                              className="rounded border-gray-600 text-purple-600 focus:ring-purple-500"
                            />
                            <span className="text-sm">Featured Post</span>
                          </label>
                        )}
                      />
                      
                      <Controller
                        name="is_sticky"
                        control={control}
                        render={({ field }) => (
                          <label className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={field.value}
                              onChange={field.onChange}
                              className="rounded border-gray-600 text-purple-600 focus:ring-purple-500"
                            />
                            <span className="text-sm">Pin to Top</span>
                          </label>
                        )}
                      />
                    </div>
                  </div>
                </div>

                {/* SEO */}
                <div className="bg-zinc-900 border border-white/20 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">SEO</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Meta Title
                      </label>
                      <Controller
                        name="meta_title"
                        control={control}
                        render={({ field }) => (
                          <input
                            {...field}
                            type="text"
                            className="w-full px-3 py-2 bg-black/50 border border-white/20 rounded text-white focus:border-purple-500 focus:outline-none"
                          />
                        )}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Meta Description
                      </label>
                      <Controller
                        name="meta_description"
                        control={control}
                        render={({ field }) => (
                          <textarea
                            {...field}
                            rows={3}
                            className="w-full px-3 py-2 bg-black/50 border border-white/20 rounded text-white focus:border-purple-500 focus:outline-none resize-none"
                          />
                        )}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // List View
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-black/90 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-2xl font-bold">Blog Manager</h1>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search posts..."
                  className="pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-sm focus:outline-none focus:border-purple-500/50"
                />
              </div>
              
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-sm focus:outline-none focus:border-purple-500/50"
              >
                <option value="all">All Status</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="scheduled">Scheduled</option>
              </select>
              
              <button
                onClick={handleCreate}
                className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>New Post</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Blog List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-zinc-900 border border-white/20 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-black/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filteredBlogs.map((blog) => (
                  <tr key={blog.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {blog.featured_image && (
                          <img
                            src={blog.featured_image || blog.image_url}
                            alt=""
                            className="w-10 h-10 rounded object-cover mr-3"
                          />
                        )}
                        <div>
                          <div className="text-sm font-medium text-white">
                            {blog.title}
                          </div>
                          <div className="text-sm text-gray-400 truncate max-w-xs">
                            {blog.excerpt}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(blog.status)}`}>
                        {blog.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">
                      {blog.category}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">
                      {new Date(blog.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEdit(blog)}
                          className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => window.open(`/blog/${blog.id}`, '_blank')}
                          className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(blog.id)}
                          className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredBlogs.length === 0 && (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">No posts found</h3>
                <p className="text-gray-400 mb-6">Get started by creating your first blog post</p>
                <button
                  onClick={handleCreate}
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors"
                >
                  Create New Post
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedBlogManagerV2;