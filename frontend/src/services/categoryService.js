import { database } from '../firebase/config';
import { ref, get, set, update, remove } from 'firebase/database';

/**
 * Category Service for Firebase Realtime Database
 */

class CategoryService {
  constructor() {
    this.categoriesRef = ref(database, 'categories');
  }

  // Get all categories
  async getAllCategories() {
    try {
      const snapshot = await get(this.categoriesRef);
      if (snapshot.exists()) {
        const categoriesObj = snapshot.val();
        return Object.keys(categoriesObj).map(key => ({
          id: key,
          ...categoriesObj[key]
        }));
      }
      return [];
    } catch (error) {
      console.error('Error getting categories:', error);
      throw error;
    }
  }

  // Get unique categories from blogs
  async getCategoriesFromBlogs() {
    try {
      const blogsRef = ref(database, 'blogs');
      const snapshot = await get(blogsRef);
      if (snapshot.exists()) {
        const blogsObj = snapshot.val();
        const categories = new Set();
        Object.values(blogsObj).forEach(blog => {
          if (blog.category) {
            categories.add(blog.category);
          }
        });
        return Array.from(categories).map(name => ({ name }));
      }
      return [];
    } catch (error) {
      console.error('Error getting categories from blogs:', error);
      throw error;
    }
  }

  // Create category
  async createCategory(categoryData) {
    try {
      const categoryId = categoryData.name.toLowerCase().replace(/\s+/g, '-');
      const categoryRef = ref(database, `categories/${categoryId}`);
      await set(categoryRef, categoryData);
      return { id: categoryId, ...categoryData };
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  }
}

export default new CategoryService();
