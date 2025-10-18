import React, { useState, useEffect } from 'react';
import { useFirebaseAuth } from '../../contexts/FirebaseAuthContext';
import LoginPopup from '../auth/LoginPopup';
import commentService from '../../services/commentService';
import { MessageCircle, Send, Edit2, Trash2, User } from 'lucide-react';
import { database } from '../../firebase/config';
import { ref, onValue, off } from 'firebase/database';

const BlogComments = ({ blogId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const { user, backendToken } = useFirebaseAuth();

  // Real-time comments listener
  useEffect(() => {
    if (!blogId) return;

    setLoading(true);
    
    // Set up real-time listener for comments
    const commentsRef = ref(database, 'blog_comments');
    
    const commentsListener = onValue(commentsRef, (snapshot) => {
      try {
        const commentsData = snapshot.val() || {};
        
        // Filter comments for this blog and sort by timestamp
        const blogComments = Object.values(commentsData)
          .filter(comment => comment.blog_id === blogId)
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        setComments(blogComments);
        setLoading(false);
      } catch (error) {
        console.error('Error processing comments data:', error);
        // Fallback to API call
        fetchCommentsFromAPI();
      }
    });

    // Cleanup listeners on unmount
    return () => {
      try {
        off(commentsRef, commentsListener);
      } catch (error) {
        console.error('Error cleaning up listeners:', error);
      }
    };
  }, [blogId]);

  // Fallback API function for when Firebase listeners fail
  const fetchCommentsFromAPI = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/blog/${blogId}/comments`);
      if (response.ok) {
        const data = await response.json();
        setComments(data);
      }
    } catch (error) {
      console.error('Error fetching comments from API:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      setShowLoginPopup(true);
      return;
    }

    if (!newComment.trim()) return;

    try {
      setIsSubmitting(true);
      
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/blog/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${backendToken}`
        },
        body: JSON.stringify({
          blog_id: blogId,
          comment_text: newComment.trim()
        })
      });

      if (response.ok) {
        const comment = await response.json();
        setComments(prev => [comment, ...prev]);
        setNewComment('');
      } else {
        console.error('Failed to submit comment');
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-20 bg-white/5 rounded-lg"></div>
        <div className="h-32 bg-white/5 rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Comment Form */}
      <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl border border-white/10 rounded-xl p-6">
        <h3 className="text-xl font-semibold text-white mb-4" style={{ fontFamily: 'Encode Sans Semi Expanded, sans-serif' }}>
          Join the Discussion
        </h3>
        
        <form onSubmit={handleCommentSubmit} className="space-y-4">
          <div className="relative">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={user ? "Share your thoughts..." : "Sign in to join the conversation"}
              className="w-full h-24 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors duration-200 resize-none"
              disabled={!user}
            />
          </div>
          
          <div className="flex items-center justify-between">
            {user ? (
              <div className="flex items-center space-x-3">
                <img
                  src={user.photoURL || '/default-avatar.png'}
                  alt={user.displayName}
                  className="w-8 h-8 rounded-full"
                />
                <span className="text-sm text-gray-400">
                  Commenting as {user.displayName || user.email}
                </span>
              </div>
            ) : (
              <span className="text-sm text-gray-400">
                Please sign in to comment
              </span>
            )}
            
            <button
              type="submit"
              disabled={!user || !newComment.trim() || isSubmitting}
              className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Send size={16} />
              )}
              <span>{isSubmitting ? 'Posting...' : 'Post Comment'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Comments List */}
      <div className="space-y-6">
        {comments.length > 0 ? (
          <div className="mb-6">
            <h4 className="text-lg font-medium text-white mb-4">
              {comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}
            </h4>
            {comments.map((comment) => (
              <div key={comment.id} className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl border border-white/10 rounded-xl p-6 mb-4">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {comment.user_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="font-medium text-white">{comment.user_name}</span>
                      <span className="text-xs text-gray-500">•</span>
                      <span className="text-xs text-gray-500">{formatDate(comment.timestamp)}</span>
                    </div>
                    <p className="text-gray-300 leading-relaxed">{comment.comment_text}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <MessageCircle size={48} className="mx-auto text-gray-600 mb-4" />
            <h4 className="text-lg font-medium text-white mb-2">No comments yet</h4>
            <p className="text-gray-400">Be the first to share your thoughts on this blog post!</p>
          </div>
        )}
      </div>

      {/* Login Popup */}
      <LoginPopup
        isOpen={showLoginPopup}
        onClose={() => setShowLoginPopup(false)}
        purpose="comment"
      />
    </div>
  );
};

export default BlogComments;