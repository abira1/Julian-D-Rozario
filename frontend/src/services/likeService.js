import { database } from '../firebase/config';
import { ref, get, set, remove } from 'firebase/database';

/**
 * Like Service for Firebase Realtime Database
 */

class LikeService {
  // Check if user has liked a blog
  async hasUserLiked(blogId, userId) {
    try {
      const likeRef = ref(database, `likes/${blogId}/${userId}`);
      const snapshot = await get(likeRef);
      return snapshot.exists();
    } catch (error) {
      console.error('Error checking like:', error);
      throw error;
    }
  }

  // Toggle like (add or remove)
  async toggleLike(blogId, userId, userEmail) {
    try {
      const likeRef = ref(database, `likes/${blogId}/${userId}`);
      const snapshot = await get(likeRef);
      
      if (snapshot.exists()) {
        // Unlike - remove like
        await remove(likeRef);
        
        // Decrement like count on blog
        const blogRef = ref(database, `blogs/${blogId}/likes`);
        const blogSnapshot = await get(ref(database, `blogs/${blogId}`));
        if (blogSnapshot.exists()) {
          const currentLikes = blogSnapshot.val().likes || 0;
          await set(blogRef, Math.max(0, currentLikes - 1));
        }
        
        return { liked: false };
      } else {
        // Like - add like
        await set(likeRef, {
          userId,
          userEmail,
          createdAt: Date.now()
        });
        
        // Increment like count on blog
        const blogRef = ref(database, `blogs/${blogId}/likes`);
        const blogSnapshot = await get(ref(database, `blogs/${blogId}`));
        if (blogSnapshot.exists()) {
          const currentLikes = blogSnapshot.val().likes || 0;
          await set(blogRef, currentLikes + 1);
        }
        
        return { liked: true };
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      throw error;
    }
  }

  // Get all users who liked a blog
  async getLikesByBlogId(blogId) {
    try {
      const likesRef = ref(database, `likes/${blogId}`);
      const snapshot = await get(likesRef);
      if (snapshot.exists()) {
        const likesObj = snapshot.val();
        return Object.keys(likesObj).map(key => ({
          userId: key,
          ...likesObj[key]
        }));
      }
      return [];
    } catch (error) {
      console.error('Error getting likes:', error);
      throw error;
    }
  }
}

export default new LikeService();
