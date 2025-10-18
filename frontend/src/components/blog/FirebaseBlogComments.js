import React, { useState, useEffect } from 'react';
import { useFirebaseAuth } from '../../contexts/FirebaseAuthContext';
import LoginPopup from '../auth/LoginPopup';
import commentService from '../../services/commentService';
import { MessageCircle, Send, Edit2, Trash2, User, Clock } from 'lucide-react';

const FirebaseBlogComments = ({ blogId, onCommentsUpdate }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingComment, setEditingComment] = useState(null);
  const [editText, setEditText] = useState('');
  
  const { user } = useFirebaseAuth();

  // Fetch comments with real-time listener
  useEffect(() => {
    if (blogId) {
      setLoading(true);
      
      // Set up real-time listener
      const unsubscribe = commentService.subscribeToComments(blogId, (fetchedComments) => {
        setComments(fetchedComments);
        if (onCommentsUpdate) {
          onCommentsUpdate(fetchedComments.length);
        }
        setLoading(false);
      });

      // Cleanup listener on unmount
      return () => {
        commentService.unsubscribeFromComments(unsubscribe);
      };
    }
  }, [blogId]);

  // Remove the old fetchComments function since we're using real-time listeners

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    
    if (!user) {
      console.log('No user found, showing login popup');
      setShowLoginPopup(true);
      return;
    }

    if (!newComment.trim()) return;

    try {
      setIsSubmitting(true);
      
      console.log('Submitting comment with user:', {
        uid: user.uid,
        displayName: user.displayName,
        email: user.email
      });
      
      const commentData = { text: newComment.trim() };
      const addedComment = await commentService.addComment(
        blogId,
        commentData,
        user.uid,
        user.displayName || 'Anonymous User',
        user.email,
        user.photoURL
      );

      // No need to manually update comments since real-time listener will handle it
      setNewComment('');
      
      // Note: onCommentsUpdate will be called by the real-time listener
      
    } catch (error) {
      console.error('Error adding comment:', error);
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        blogId: blogId,
        userId: user?.uid,
        userEmail: user?.email
      });
      
      let errorMessage = 'Failed to add comment. Please try again.';
      
      if (error.code === 'PERMISSION_DENIED') {
        errorMessage = 'Permission denied. Please make sure you are logged in and try again.';
      } else if (error.code === 'NETWORK_ERROR') {
        errorMessage = 'Network error. Please check your internet connection and try again.';
      } else if (error.message) {
        errorMessage = `Failed to add comment: ${error.message}`;
      }
      
      // Use a more user-friendly notification instead of alert
      console.error('Comment error for user:', errorMessage);
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditComment = async (commentId) => {
    if (!editText.trim()) return;

    try {
      await commentService.updateComment(blogId, commentId, editText.trim());
      
      // No need to manually update comments since real-time listener will handle it
      setEditingComment(null);
      setEditText('');
    } catch (error) {
      console.error('Error updating comment:', error);
      alert('Failed to update comment. Please try again.');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;

    try {
      await commentService.deleteComment(blogId, commentId);
      // No need to manually update comments since real-time listener will handle it
      
      // Note: onCommentsUpdate will be called by the real-time listener
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert('Failed to delete comment. Please try again.');
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="mt-8 p-6 bg-white/5 rounded-xl border border-white/10">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-white/10 rounded w-1/4"></div>
          <div className="space-y-3">
            <div className="h-3 bg-white/10 rounded"></div>
            <div className="h-3 bg-white/10 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="comments-section" className="mt-8 space-y-6">
      {/* Comments Header */}
      <div className="flex items-center space-x-3">
        <MessageCircle className="w-6 h-6 text-purple-400" />
        <h3 className="text-xl font-bold text-white">
          Comments ({comments.length})
        </h3>
      </div>

      {/* Comment Form */}
      <div className="bg-white/5 rounded-xl border border-white/10 p-6">
        {user ? (
          <form onSubmit={handleSubmitComment} className="space-y-4">
            <div className="flex items-start space-x-4">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
              )}
              <div className="flex-1">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Share your thoughts..."
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none resize-none"
                  rows={3}
                />
              </div>
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting || !newComment.trim()}
                className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 disabled:cursor-not-allowed px-6 py-2 rounded-lg text-white font-medium transition-colors"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? 'Posting...' : 'Post Comment'}</span>
              </button>
            </div>
          </form>
        ) : (
          <div className="text-center py-8">
            <MessageCircle className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400 mb-4">Sign in to join the conversation</p>
            <button
              onClick={() => setShowLoginPopup(true)}
              className="bg-purple-600 hover:bg-purple-700 px-6 py-2 rounded-lg text-white font-medium"
            >
              Sign In to Comment
            </button>
          </div>
        )}
      </div>

      {/* Comments List */}
      {comments.length > 0 ? (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="bg-white/5 rounded-xl border border-white/10 p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  {comment.userPhoto ? (
                    <img
                      src={comment.userPhoto}
                      alt={comment.userName}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="font-medium text-white">{comment.userName}</h4>
                      <div className="flex items-center space-x-1 text-xs text-gray-400">
                        <Clock className="w-3 h-3" />
                        <span>{formatTimeAgo(comment.createdAt)}</span>
                        {comment.isEdited && <span>(edited)</span>}
                      </div>
                    </div>
                    
                    {editingComment === comment.id ? (
                      <div className="space-y-3">
                        <textarea
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white"
                          rows={3}
                        />
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditComment(comment.id)}
                            className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-sm text-white"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => {
                              setEditingComment(null);
                              setEditText('');
                            }}
                            className="bg-gray-600 hover:bg-gray-700 px-3 py-1 rounded text-sm text-white"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-300 leading-relaxed">{comment.text}</p>
                    )}
                  </div>
                </div>
                
                {/* Comment Actions */}
                {user && user.uid === comment.userId && editingComment !== comment.id && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setEditingComment(comment.id);
                        setEditText(comment.text);
                      }}
                      className="text-gray-400 hover:text-purple-400 p-1"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteComment(comment.id)}
                      className="text-gray-400 hover:text-red-400 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white/5 rounded-xl border border-white/10">
          <MessageCircle className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No comments yet</h3>
          <p className="text-gray-400">Be the first to share your thoughts!</p>
        </div>
      )}

      {/* Login Popup */}
      {showLoginPopup && (
        <LoginPopup 
          onClose={() => setShowLoginPopup(false)}
          purpose="comment"
        />
      )}
    </div>
  );
};

export default FirebaseBlogComments;