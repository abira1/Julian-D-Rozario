import { database } from '../firebase/config';
import { ref, get, set, remove } from 'firebase/database';

/**
 * Save Service for Firebase Realtime Database
 * Handles saving/bookmarking blog posts
 */

class SaveService {
  // Check if user has saved a blog
  async hasUserSaved(blogId, userId) {
    try {
      const saveRef = ref(database, `saves/${blogId}/${userId}`);
      const snapshot = await get(saveRef);
      return snapshot.exists();
    } catch (error) {
      console.error('Error checking save:', error);
      throw error;
    }
  }

  // Toggle save (add or remove)
  async toggleSave(blogId, userId, userEmail) {
    try {
      const saveRef = ref(database, `saves/${blogId}/${userId}`);
      const snapshot = await get(saveRef);
      
      if (snapshot.exists()) {
        // Unsave - remove save
        await remove(saveRef);
        
        // Decrement save count on blog
        const blogRef = ref(database, `blogs/${blogId}/savesCount`);
        const blogSnapshot = await get(ref(database, `blogs/${blogId}`));
        if (blogSnapshot.exists()) {
          const currentSaves = blogSnapshot.val().savesCount || 0;
          await set(blogRef, Math.max(0, currentSaves - 1));
        }
        
        return { saved: false };
      } else {
        // Save - add save
        await set(saveRef, {
          userId,
          userEmail,
          createdAt: Date.now()
        });
        
        // Increment save count on blog
        const blogRef = ref(database, `blogs/${blogId}/savesCount`);
        const blogSnapshot = await get(ref(database, `blogs/${blogId}`));
        if (blogSnapshot.exists()) {
          const currentSaves = blogSnapshot.val().savesCount || 0;
          await set(blogRef, currentSaves + 1);
        }
        
        return { saved: true };
      }
    } catch (error) {
      console.error('Error toggling save:', error);
      throw error;
    }
  }

  // Get all users who saved a blog
  async getSavesByBlogId(blogId) {
    try {
      const savesRef = ref(database, `saves/${blogId}`);
      const snapshot = await get(savesRef);
      if (snapshot.exists()) {
        const savesObj = snapshot.val();
        return Object.keys(savesObj).map(key => ({
          userId: key,
          ...savesObj[key]
        }));
      }
      return [];
    } catch (error) {
      console.error('Error getting saves:', error);
      throw error;
    }
  }

  // Get all blog IDs that a user has saved
  async getBlogsSavedByUser(userId) {
    try {
      const savesRef = ref(database, 'saves');
      const snapshot = await get(savesRef);
      
      if (!snapshot.exists()) {
        return [];
      }

      const allSaves = snapshot.val();
      const savedBlogIds = [];

      // Iterate through all blogs and check if user saved them
      Object.keys(allSaves).forEach(blogId => {
        const blogSaves = allSaves[blogId];
        if (blogSaves && blogSaves[userId]) {
          savedBlogIds.push(blogId);
        }
      });

      return savedBlogIds;
    } catch (error) {
      console.error('Error getting user saved blogs:', error);
      throw error;
    }
  }
}

export default new SaveService();