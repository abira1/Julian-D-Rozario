import { database } from '../firebase/config';
import { ref, get, set, update, remove, push, serverTimestamp, onValue, off } from 'firebase/database';

/**
 * Comment Service for Firebase Realtime Database
 */

class CommentService {
  // Get all comments for a blog (one-time fetch)
  async getCommentsByBlogId(blogId) {
    try {
      const commentsRef = ref(database, `comments/${blogId}`);
      const snapshot = await get(commentsRef);
      if (snapshot.exists()) {
        const commentsObj = snapshot.val();
        return Object.keys(commentsObj)
          .map(key => ({
            id: key,
            ...commentsObj[key]
          }))
          .sort((a, b) => b.createdAt - a.createdAt);
      }
      return [];
    } catch (error) {
      console.error('Error getting comments:', error);
      throw error;
    }
  }

  // Listen to real-time comment updates
  subscribeToComments(blogId, callback) {
    const commentsRef = ref(database, `comments/${blogId}`);
    
    const unsubscribe = onValue(commentsRef, (snapshot) => {
      if (snapshot.exists()) {
        const commentsObj = snapshot.val();
        const comments = Object.keys(commentsObj)
          .map(key => ({
            id: key,
            ...commentsObj[key]
          }))
          .sort((a, b) => b.createdAt - a.createdAt);
        callback(comments);
      } else {
        callback([]);
      }
    }, (error) => {
      console.error('Error listening to comments:', error);
      callback([]);
    });

    return unsubscribe;
  }

  // Unsubscribe from comment updates
  unsubscribeFromComments(unsubscribe) {
    if (unsubscribe && typeof unsubscribe === 'function') {
      unsubscribe();
    }
  }

  // Add comment
  async addComment(blogId, commentData, userId, userName, userEmail, userPhoto) {
    try {
      const commentsRef = ref(database, `comments/${blogId}`);
      const newCommentRef = push(commentsRef);
      
      const comment = {
        text: commentData.text,
        userId,
        userName,
        userEmail,
        userPhoto,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      await set(newCommentRef, comment);
      
      // Increment comment count on blog
      const blogRef = ref(database, `blogs/${blogId}/commentsCount`);
      const blogSnapshot = await get(ref(database, `blogs/${blogId}`));
      if (blogSnapshot.exists()) {
        const currentCount = blogSnapshot.val().commentsCount || 0;
        await set(blogRef, currentCount + 1);
      }
      
      return {
        id: newCommentRef.key,
        ...comment
      };
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  }

  // Update comment
  async updateComment(blogId, commentId, text) {
    try {
      const commentRef = ref(database, `comments/${blogId}/${commentId}`);
      await update(commentRef, {
        text,
        updatedAt: Date.now(),
        isEdited: true
      });
      return true;
    } catch (error) {
      console.error('Error updating comment:', error);
      throw error;
    }
  }

  // Delete comment
  async deleteComment(blogId, commentId) {
    try {
      const commentRef = ref(database, `comments/${blogId}/${commentId}`);
      await remove(commentRef);
      
      // Decrement comment count on blog
      const blogRef = ref(database, `blogs/${blogId}/commentsCount`);
      const blogSnapshot = await get(ref(database, `blogs/${blogId}`));
      if (blogSnapshot.exists()) {
        const currentCount = blogSnapshot.val().commentsCount || 0;
        await set(blogRef, Math.max(0, currentCount - 1));
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting comment:', error);
      throw error;
    }
  }
}

export default new CommentService();
