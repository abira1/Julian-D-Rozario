import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import LoginPopup from '../auth/LoginPopup';
import { MessageCircle, Send, Heart } from 'lucide-react';
import { database } from '../../firebase/config';
import { ref, onValue, off } from 'firebase/database';

const BlogComments = ({ blogId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const { user, backendToken } = useAuth();

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
      {/* Modern Comment Form */}
      <div className="bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl border border-white/[0.12] rounded-2xl p-6 shadow-2xl shadow-purple-500/5">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
            <MessageCircle size={18} className="text-white" />
          </div>
          <h3 className="text-xl font-semibold text-white" style={{ fontFamily: 'Encode Sans Semi Expanded, sans-serif' }}>
            Join the Discussion
          </h3>
          <div className="flex-1 h-px bg-gradient-to-r from-purple-500/20 to-transparent"></div>
        </div>
        
        <form onSubmit={handleCommentSubmit} className="space-y-6">
          <div className="relative">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={user ? "Share your thoughts and insights..." : "Sign in with Google to join the conversation"}
              className="w-full h-28 bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/[0.15] rounded-xl px-5 py-4 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500/50 focus:bg-white/[0.12] transition-all duration-300 resize-none text-sm leading-relaxed"
              disabled={!user}
            />
            <div className="absolute bottom-3 right-3 text-xs text-gray-500">
              {newComment.length}/1000
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            {user ? (
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <img
                    src={user.photoURL || '/default-avatar.png'}
                    alt={user.displayName}
                    className="w-10 h-10 rounded-full border-2 border-white/20"
                  />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-slate-900"></div>
                </div>
                <div>
                  <div className="text-sm font-medium text-white">
                    {user.displayName || user.email}
                  </div>
                  <div className="text-xs text-gray-400">
                    Verified account
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-gray-600 to-gray-500 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <span className="text-sm text-gray-400">
                  Please sign in to participate
                </span>
              </div>
            )}
            
            <button
              type="submit"
              disabled={!user || !newComment.trim() || isSubmitting}
              className="flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-blue-700 hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg hover:shadow-purple-500/25"
            >
              {isSubmitting ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <Send size={18} className="transition-transform duration-200" />
              )}
              <span className="text-sm">{isSubmitting ? 'Publishing...' : 'Post Comment'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Modern Comments List */}
      <div className="space-y-6">
        {comments.length > 0 ? (
          <div className="mb-6">
            <div className="flex items-center space-x-3 mb-6">
              <h4 className="text-lg font-semibold text-white">
                {comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}
              </h4>
              <div className="flex-1 h-px bg-gradient-to-r from-white/20 to-transparent"></div>
              <div className="text-xs text-gray-500 px-3 py-1 bg-white/5 rounded-full">
                Latest
              </div>
            </div>
            
            <div className="space-y-4">
              {comments.map((comment, index) => (
                <div 
                  key={comment.id} 
                  className="bg-gradient-to-br from-white/[0.06] to-white/[0.01] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6 hover:border-white/[0.15] transition-all duration-300 transform hover:scale-[1.01]"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-start space-x-4">
                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 via-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                        {comment.user_name.charAt(0).toUpperCase()}
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-slate-900"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-3">
                        <span className="font-semibold text-white text-base">{comment.user_name}</span>
                        <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
                        <span className="text-xs text-gray-400 font-medium">{formatDate(comment.timestamp)}</span>
                        <div className="flex-1"></div>
                        <div className="text-xs text-gray-500 px-2 py-1 bg-white/5 rounded-lg">
                          Verified
                        </div>
                      </div>
                      <p className="text-gray-200 leading-relaxed text-sm">{comment.comment_text}</p>
                      
                      {/* Comment Actions */}
                      <div className="flex items-center space-x-4 mt-4 pt-3 border-t border-white/5">
                        <button className="flex items-center space-x-2 text-xs text-gray-400 hover:text-purple-400 transition-colors duration-200">
                          <Heart size={14} />
                          <span>Like</span>
                        </button>
                        <button className="flex items-center space-x-2 text-xs text-gray-400 hover:text-blue-400 transition-colors duration-200">
                          <MessageCircle size={14} />
                          <span>Reply</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="relative mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-full mx-auto flex items-center justify-center">
                <MessageCircle size={40} className="text-purple-400" />
              </div>
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-20 h-20 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-full animate-ping"></div>
            </div>
            <h4 className="text-xl font-semibold text-white mb-3">Start the Conversation</h4>
            <p className="text-gray-400 max-w-md mx-auto leading-relaxed">Be the first to share your insights and thoughts on this article. Your perspective matters!</p>
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