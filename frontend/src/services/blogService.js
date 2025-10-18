import { database } from '../firebase/config';
import { ref, get, set, update, remove, push, query, orderByChild, limitToFirst, serverTimestamp, increment } from 'firebase/database';

/**
 * Blog Service for Firebase Realtime Database
 */

class BlogService {
  constructor() {
    this.blogsRef = ref(database, 'blogs');
  }

  // Generate slug from title
  generateSlug(title) {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  // Get all blogs
  async getAllBlogs() {
    try {
      const snapshot = await get(this.blogsRef);
      if (snapshot.exists()) {
        const blogsObj = snapshot.val();
        // Convert object to array and sort by date (newest first)
        return Object.keys(blogsObj)
          .map(key => ({
            id: key,
            ...blogsObj[key]
          }))
          .sort((a, b) => new Date(b.date) - new Date(a.date));
      }
      return [];
    } catch (error) {
      console.error('Error getting blogs:', error);
      throw error;
    }
  }

  // Get single blog by ID
  async getBlogById(blogId) {
    try {
      const blogRef = ref(database, `blogs/${blogId}`);
      const snapshot = await get(blogRef);
      if (snapshot.exists()) {
        return {
          id: blogId,
          ...snapshot.val()
        };
      }
      return null;
    } catch (error) {
      console.error('Error getting blog:', error);
      throw error;
    }
  }

  // Get blog by slug
  async getBlogBySlug(slug) {
    try {
      const snapshot = await get(this.blogsRef);
      if (snapshot.exists()) {
        const blogsObj = snapshot.val();
        const blogEntry = Object.entries(blogsObj).find(
          ([_, blog]) => blog.slug === slug
        );
        if (blogEntry) {
          return {
            id: blogEntry[0],
            ...blogEntry[1]
          };
        }
      }
      return null;
    } catch (error) {
      console.error('Error getting blog by slug:', error);
      throw error;
    }
  }

  // Create new blog
  async createBlog(blogData) {
    try {
      const newBlogRef = push(this.blogsRef);
      const slug = this.generateSlug(blogData.title);
      
      const blog = {
        ...blogData,
        slug,
        views: 0,
        likes: 0,
        commentsCount: 0,
        status: blogData.status || 'published',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await set(newBlogRef, blog);
      return {
        id: newBlogRef.key,
        ...blog
      };
    } catch (error) {
      console.error('Error creating blog:', error);
      throw error;
    }
  }

  // Update blog
  async updateBlog(blogId, updates) {
    try {
      const blogRef = ref(database, `blogs/${blogId}`);
      
      // If title is being updated, regenerate slug
      if (updates.title) {
        updates.slug = this.generateSlug(updates.title);
      }
      
      updates.updatedAt = serverTimestamp();
      
      await update(blogRef, updates);
      return true;
    } catch (error) {
      console.error('Error updating blog:', error);
      throw error;
    }
  }

  // Delete blog
  async deleteBlog(blogId) {
    try {
      const blogRef = ref(database, `blogs/${blogId}`);
      await remove(blogRef);
      
      // Also delete associated comments and likes
      const commentsRef = ref(database, `comments/${blogId}`);
      const likesRef = ref(database, `likes/${blogId}`);
      await remove(commentsRef);
      await remove(likesRef);
      
      return true;
    } catch (error) {
      console.error('Error deleting blog:', error);
      throw error;
    }
  }

  // Increment view count
  async incrementViews(blogId) {
    try {
      const blogRef = ref(database, `blogs/${blogId}`);
      await update(blogRef, {
        views: increment(1)
      });
    } catch (error) {
      console.error('Error incrementing views:', error);
      // Don't throw error for view increment failures - it's not critical
      // Just log it and continue - try a fallback approach
      try {
        const blogSnapshot = await get(blogRef);
        if (blogSnapshot.exists()) {
          const currentViews = blogSnapshot.val().views || 0;
          await update(blogRef, { views: currentViews + 1 });
        }
      } catch (fallbackError) {
        console.error('Fallback view increment also failed:', fallbackError);
      }
    }
  }

  // Get blogs by category
  async getBlogsByCategory(category) {
    try {
      const allBlogs = await this.getAllBlogs();
      if (category === 'All') {
        return allBlogs;
      }
      return allBlogs.filter(blog => blog.category === category);
    } catch (error) {
      console.error('Error getting blogs by category:', error);
      throw error;
    }
  }

  // Search blogs
  async searchBlogs(searchTerm) {
    try {
      const allBlogs = await this.getAllBlogs();
      const term = searchTerm.toLowerCase();
      return allBlogs.filter(blog => 
        blog.title.toLowerCase().includes(term) ||
        blog.excerpt.toLowerCase().includes(term) ||
        blog.content.toLowerCase().includes(term)
      );
    } catch (error) {
      console.error('Error searching blogs:', error);
      throw error;
    }
  }
}

export default new BlogService();
