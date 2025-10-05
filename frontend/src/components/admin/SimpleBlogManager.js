import React, { useState, useEffect } from 'react';
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

const SimpleBlogManager = () => {
  const [blogs, setBlogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentBlog, setCurrentBlog] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // list, create, edit

  const { control, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      title: '',
      excerpt: '',
      content: '',
      category: '',
      tags: [],
      status: 'draft',
      featured_image: ''
    }
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch blogs
      const blogsResponse = await fetch('/api/blogs?admin=true');
      const blogsData = blogsResponse.ok ? await blogsResponse.json() : [];
      setBlogs(Array.isArray(blogsData) ? blogsData : []);
      
      // Set default categories (since we're using category strings)
      setCategories([
        { name: 'Business Formation' },
        { name: 'Legal Advisory' },
        { name: 'Dubai Business' },
        { name: 'Corporate Services' },
        { name: 'UAE Licensing' },
        { name: 'General' }
      ]);
      
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
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('backend_token')}`
        },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        const result = await response.json();
        
        if (currentBlog) {
          setBlogs(prevBlogs => prevBlogs.map(b => b.id === result.id ? result : b));
        } else {
          setBlogs(prevBlogs => [result, ...prevBlogs]);
        }
        
        setViewMode('list');
        setCurrentBlog(null);
        reset();
      } else {
        throw new Error('Failed to save blog post');
      }
    } catch (error) {
      console.error('Error saving blog:', error);
      alert('Error saving blog post. Please try again.');
    }
  };

  const deleteBlog = async (blogId) => {
    if (!window.confirm('Are you sure you want to delete this blog post?')) return;
    
    try {
      const response = await fetch(`/api/blogs/${blogId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('backend_token')}`
        }
      });

      if (response.ok) {
        setBlogs(prevBlogs => prevBlogs.filter(b => b.id !== blogId));
      } else {
        throw new Error('Failed to delete blog post');
      }
    } catch (error) {
      console.error('Error deleting blog:', error);
      alert('Error deleting blog post. Please try again.');
    }
  };

  const editBlog = (blog) => {
    setCurrentBlog(blog);
    reset({
      title: blog.title || '',
      excerpt: blog.excerpt || '',
      content: blog.content || '',
      category: blog.category || blog.category_name || '',
      tags: blog.tags || [],
      status: blog.status || 'draft',
      featured_image: blog.featured_image || ''
    });
    setViewMode('edit');
  };

  const createNewBlog = () => {
    setCurrentBlog(null);
    reset({
      title: '',
      excerpt: '',
      content: '',
      category: '',
      tags: [],
      status: 'draft',
      featured_image: ''
    });
    setViewMode('create');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-slate-950 to-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  // List View
  if (viewMode === 'list') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-slate-950 to-black p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-white">Blog Manager</h1>
            <button
              onClick={createNewBlog}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Plus className="w-5 h-5" />
              New Blog Post
            </button>
          </div>

          <div className="bg-zinc-900 border border-white/20 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-zinc-800 border-b border-white/20">
                  <tr>
                    <th className="text-left p-4 text-white font-semibold">Title</th>
                    <th className="text-left p-4 text-white font-semibold">Status</th>
                    <th className="text-left p-4 text-white font-semibold">Category</th>
                    <th className="text-left p-4 text-white font-semibold">Created</th>
                    <th className="text-right p-4 text-white font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {blogs.map((blog) => (
                    <tr key={blog.id} className="border-b border-white/10 hover:bg-zinc-800/50">
                      <td className="p-4">
                        <div className="text-white font-medium">{blog.title}</div>
                        <div className="text-gray-400 text-sm">{blog.excerpt}</div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          blog.status === 'published' 
                            ? 'bg-green-600 text-white' 
                            : 'bg-yellow-600 text-white'
                        }`}>
                          {blog.status}
                        </span>
                      </td>
                      <td className="p-4 text-gray-300">{blog.category_name || 'Uncategorized'}</td>
                      <td className="p-4 text-gray-400">
                        {new Date(blog.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => editBlog(blog)}
                            className="text-blue-400 hover:text-blue-300 p-1"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteBlog(blog.id)}
                            className="text-red-400 hover:text-red-300 p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Create/Edit View
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-slate-950 to-black p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setViewMode('list')}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-3xl font-bold text-white">
              {currentBlog ? 'Edit Blog Post' : 'Create Blog Post'}
            </h1>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title */}
            <div className="bg-zinc-900 border border-white/20 rounded-lg p-6">
              <label className="block text-white font-semibold mb-2">Title</label>
              <Controller
                name="title"
                control={control}
                rules={{ required: 'Title is required' }}
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    className="w-full bg-zinc-800 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Enter blog title..."
                  />
                )}
              />
              {errors.title && (
                <p className="text-red-400 text-sm mt-2">{errors.title.message}</p>
              )}
            </div>

            {/* Excerpt */}
            <div className="bg-zinc-900 border border-white/20 rounded-lg p-6">
              <label className="block text-white font-semibold mb-2">Excerpt</label>
              <Controller
                name="excerpt"
                control={control}
                render={({ field }) => (
                  <textarea
                    {...field}
                    rows={3}
                    className="w-full bg-zinc-800 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Brief description of the blog post..."
                  />
                )}
              />
            </div>

            {/* Content */}
            <div className="bg-zinc-900 border border-white/20 rounded-lg p-6">
              <label className="block text-white font-semibold mb-2">Content</label>
              <Controller
                name="content"
                control={control}
                rules={{ required: 'Content is required' }}
                render={({ field }) => (
                  <textarea
                    {...field}
                    rows={20}
                    className="w-full bg-zinc-800 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-sm"
                    placeholder="Write your blog content here... (HTML supported)"
                  />
                )}
              />
              {errors.content && (
                <p className="text-red-400 text-sm mt-2">{errors.content.message}</p>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Publish Options */}
            <div className="bg-zinc-900 border border-white/20 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Publish</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-white font-medium mb-2">Status</label>
                  <Controller
                    name="status"
                    control={control}
                    render={({ field }) => (
                      <select
                        {...field}
                        className="w-full bg-zinc-800 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                      </select>
                    )}
                  />
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">Category</label>
                  <Controller
                    name="category"
                    control={control}
                    render={({ field }) => (
                      <select
                        {...field}
                        className="w-full bg-zinc-800 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="">Select Category</option>
                        {categories.map((category) => (
                          <option key={category.name} value={category.name}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    )}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  {currentBlog ? 'Update Post' : 'Create Post'}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SimpleBlogManager;