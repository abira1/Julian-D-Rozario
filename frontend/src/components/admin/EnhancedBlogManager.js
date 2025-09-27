import React, { useState, useEffect, useCallback } from 'react';
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
  MoreVertical
} from 'lucide-react';

const EnhancedBlogManager = () => {
  const [blogs, setBlogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentBlog, setCurrentBlog] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // list, create, edit
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');

  const { control, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      title: '',
      excerpt: '',
      content: '',
      category_id: '',
      meta_title: '',
      meta_description: '',
      meta_keywords: '',
      featured_image: '',
      read_time: '5 min read',
      status: 'draft',
      is_featured: false,
      is_sticky: false,
      tag_ids: [],
      published_at: null
    }
  });

  const watchedStatus = watch('status');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch blogs
      const blogsResponse = await fetch('/api/blogs');
      const blogsData = blogsResponse.ok ? await blogsResponse.json() : [];
      setBlogs(Array.isArray(blogsData) ? blogsData : []);
      
      // Fetch categories
      const categoriesResponse = await fetch('/api/categories');
      const categoriesData = categoriesResponse.ok ? await categoriesResponse.json() : [];
      setCategories(Array.isArray(categoriesData) ? categoriesData.filter(cat => cat.name !== 'All') : []);
      
      // TODO: Fetch tags when implemented
      setTags([]);
      
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      const method = currentBlog ? 'PUT' : 'POST';
      const url = currentBlog ? `/api/blogs/${currentBlog.id}` : '/api/blogs';
      
      // Auto-set published_at when status changes to published
      if (data.status === 'published' && !data.published_at) {
        data.published_at = new Date().toISOString();
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
        const savedBlog = await response.json();
        
        if (currentBlog) {
          setBlogs(blogs.map(blog => blog.id === savedBlog.id ? savedBlog : blog));
        } else {
          setBlogs([savedBlog, ...blogs]);
        }
        
        setViewMode('list');
        setCurrentBlog(null);
        reset();
        
        // Show success message
        alert(currentBlog ? 'Blog updated successfully!' : 'Blog created successfully!');
      } else {
        throw new Error('Failed to save blog');
      }
    } catch (error) {
      console.error('Error saving blog:', error);
      alert('Error saving blog. Please try again.');
    }
  };

  const handleEdit = (blog) => {
    setCurrentBlog(blog);
    reset({
      title: blog.title || '',
      excerpt: blog.excerpt || '',
      content: blog.content || '',
      category_id: blog.category_id || '',
      meta_title: blog.meta_title || '',
      meta_description: blog.meta_description || '',
      meta_keywords: blog.meta_keywords || '',
      featured_image: blog.featured_image || blog.image_url || '',
      read_time: blog.read_time || '5 min read',
      status: blog.status || 'draft',
      is_featured: blog.is_featured || blog.featured || false,
      is_sticky: blog.is_sticky || false,
      tag_ids: blog.tag_ids || [],
      published_at: blog.published_at
    });
    setViewMode('edit');
  };

  const handleDelete = async (blogId) => {
    if (!window.confirm('Are you sure you want to delete this blog post?')) return;
    
    try {
      const response = await fetch(`/api/blogs/${blogId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });

      if (response.ok) {
        setBlogs(blogs.filter(blog => blog.id !== blogId));
        alert('Blog deleted successfully!');
      } else {
        throw new Error('Failed to delete blog');
      }
    } catch (error) {
      console.error('Error deleting blog:', error);
      alert('Error deleting blog. Please try again.');
    }
  };

  const filteredBlogs = blogs.filter(blog => {
    const matchesSearch = blog.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         blog.excerpt?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || blog.status === filterStatus || 
                         (filterStatus === 'published' && !blog.status);
    const matchesCategory = filterCategory === 'all' || blog.category === filterCategory;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const BlogForm = () => (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => {
              setViewMode('list');
              setCurrentBlog(null);
              reset();
            }}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Posts
          </button>
          <h2 className="text-2xl font-bold text-gray-900">
            {currentBlog ? 'Edit Post' : 'Create New Post'}
          </h2>
        </div>
        <div className="flex items-center space-x-3">
          <button
            type="button"
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            <Eye className="w-4 h-4 mr-2 inline" />
            Preview
          </button>
          <button
            onClick={handleSubmit(onSubmit)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Save className="w-4 h-4 mr-2 inline" />
            {currentBlog ? 'Update' : 'Save'}
          </button>
        </div>
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Post Title *
              </label>
              <Controller
                name="title"
                control={control}
                rules={{ required: 'Title is required' }}
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter post title..."
                  />
                )}
              />
              {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>}
            </div>

            {/* Excerpt */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Excerpt *
              </label>
              <Controller
                name="excerpt"
                control={control}
                rules={{ required: 'Excerpt is required' }}
                render={({ field }) => (
                  <textarea
                    {...field}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Brief description of the post..."
                  />
                )}
              />
              {errors.excerpt && <p className="mt-1 text-sm text-red-600">{errors.excerpt.message}</p>}
            </div>

            {/* Rich Text Editor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content *
              </label>
              <Controller
                name="content"
                control={control}
                rules={{ required: 'Content is required' }}
                render={({ field }) => (
                  <Editor
                    apiKey="your-tinymce-api-key" // Replace with your TinyMCE API key
                    init={{
                      height: 500,
                      menubar: false,
                      plugins: [
                        'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                        'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                        'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
                      ],
                      toolbar: 'undo redo | blocks | ' +
                        'bold italic forecolor | alignleft aligncenter ' +
                        'alignright alignjustify | bullist numlist outdent indent | ' +
                        'removeformat | help',
                      content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
                    }}
                    value={field.value}
                    onEditorChange={field.onChange}
                  />
                )}
              />
              {errors.content && <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Publish Settings */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Publish Settings</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <Controller
                    name="status"
                    control={control}
                    render={({ field }) => (
                      <select
                        {...field}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                        <option value="archived">Archived</option>
                      </select>
                    )}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <Controller
                    name="category_id"
                    control={control}
                    render={({ field }) => (
                      <select
                        {...field}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select category...</option>
                        {categories.map(category => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    )}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Read Time</label>
                  <Controller
                    name="read_time"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="5 min read"
                      />
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <Controller
                    name="is_featured"
                    control={control}
                    render={({ field }) => (
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Featured Post</span>
                      </label>
                    )}
                  />

                  <Controller
                    name="is_sticky"
                    control={control}
                    render={({ field }) => (
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Sticky Post</span>
                      </label>
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Featured Image */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Featured Image</h3>
              <Controller
                name="featured_image"
                control={control}
                render={({ field }) => (
                  <div className="space-y-3">
                    <input
                      {...field}
                      type="url"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Image URL..."
                    />
                    <button
                      type="button"
                      className="w-full flex items-center justify-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Image
                    </button>
                    {field.value && (
                      <img
                        src={field.value}
                        alt="Featured"
                        className="w-full h-32 object-cover rounded-lg"
                        onError={(e) => e.target.style.display = 'none'}
                      />
                    )}
                  </div>
                )}
              />
            </div>

            {/* SEO Settings */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">SEO Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Meta Title</label>
                  <Controller
                    name="meta_title"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="SEO title..."
                      />
                    )}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Meta Description</label>
                  <Controller
                    name="meta_description"
                    control={control}
                    render={({ field }) => (
                      <textarea
                        {...field}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="SEO description..."
                      />
                    )}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Keywords</label>
                  <Controller
                    name="meta_keywords"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="keyword1, keyword2, keyword3"
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
  );

  const BlogList = () => (
    <div>
      {/* Header with Actions */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Blog Posts</h2>
          <p className="text-sm text-gray-600 mt-1">Manage your blog content</p>
        </div>
        <button
          onClick={() => setViewMode('create')}
          className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Post
        </button>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </select>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Categories</option>
          {categories.map(category => (
            <option key={category.id} value={category.name}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      {/* Blog List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-600">Loading posts...</p>
          </div>
        ) : filteredBlogs.length === 0 ? (
          <div className="p-8 text-center">
            <FileText className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500">
              {blogs.length === 0 ? 'No posts yet' : 'No posts match your filters'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredBlogs.map(blog => (
              <div key={blog.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-lg font-medium text-gray-900 truncate">
                        {blog.title}
                      </h3>
                      {blog.is_featured && <Star className="w-4 h-4 text-yellow-500" />}
                      {blog.is_sticky && <div className="w-2 h-2 bg-red-500 rounded-full" />}
                    </div>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {blog.excerpt}
                    </p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(blog.created_at).toLocaleDateString()}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Eye className="w-3 h-3" />
                        <span>{blog.views || 0}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Heart className="w-3 h-3" />
                        <span>{blog.likes || 0}</span>
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        blog.status === 'published' || !blog.status
                          ? 'bg-green-100 text-green-800'
                          : blog.status === 'draft'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {blog.status || 'published'}
                      </span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                        {blog.category}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => handleEdit(blog)}
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                      title="Edit"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(blog.id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-600">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  if (viewMode === 'create' || viewMode === 'edit') {
    return <BlogForm />;
  }

  return <BlogList />;
};

export default EnhancedBlogManager;