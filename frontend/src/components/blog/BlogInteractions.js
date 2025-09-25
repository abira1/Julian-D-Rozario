import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import LoginPopup from '../auth/LoginPopup';
import { Heart, MessageCircle, Share2, Copy, Link, Facebook, Twitter } from 'lucide-react';

const BlogInteractions = ({ blogId, blogTitle, blogUrl }) => {
  const [likes, setLikes] = useState({ count: 0, isLiked: false });
  const [comments, setComments] = useState({ count: 0 });
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [loginPurpose, setLoginPurpose] = useState('like');
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [isLoading, setIsLoading] = useState({ like: false });
  const [copySuccess, setCopySuccess] = useState(false);
  
  const { user, backendToken } = useAuth();

  // Fetch initial interaction data
  useEffect(() => {
    fetchInteractionData();
  }, [blogId, user]);

  const fetchInteractionData = async () => {
    try {
      // Fetch likes
      const likesResponse = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/blog/${blogId}/likes`);
      if (likesResponse.ok) {
        const likesData = await likesResponse.json();
        setLikes({
          count: likesData.likes_count || 0,
          isLiked: user && likesData.likes ? 
            likesData.likes.some(like => like.user_email === user.email) : false
        });
      }

      // Fetch comments count
      const commentsResponse = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/blog/${blogId}/comments`);
      if (commentsResponse.ok) {
        const commentsData = await commentsResponse.json();
        setComments({ count: Array.isArray(commentsData) ? commentsData.length : 0 });
      }
    } catch (error) {
      console.error('Error fetching interaction data:', error);
    }
  };

  const handleLike = async () => {
    if (!user) {
      setLoginPurpose('like');
      setShowLoginPopup(true);
      return;
    }

    try {
      setIsLoading({ ...isLoading, like: true });
      
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/blog/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${backendToken}`
        },
        body: JSON.stringify({ blog_id: blogId })
      });

      if (response.ok) {
        const data = await response.json();
        setLikes(prev => ({
          count: data.liked ? prev.count + 1 : prev.count - 1,
          isLiked: data.liked
        }));
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    } finally {
      setIsLoading({ ...isLoading, like: false });
    }
  };

  const handleComment = () => {
    if (!user) {
      setLoginPurpose('comment');
      setShowLoginPopup(true);
      return;
    }
    
    // Scroll to comments section
    const commentsSection = document.querySelector('#comments-section');
    if (commentsSection) {
      commentsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleShare = (platform) => {
    const url = blogUrl || window.location.href;
    const text = `Check out this insightful article: "${blogTitle}"`;
    
    switch (platform) {
      case 'copy':
        navigator.clipboard.writeText(url).then(() => {
          setCopySuccess(true);
          setTimeout(() => setCopySuccess(false), 2000);
        });
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank');
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
        break;
      default:
        break;
    }
    setShowShareMenu(false);
  };

  return (
    <div className="border-t border-white/10 pt-6 mt-8">
      <div className="flex items-center justify-between">
        {/* Interaction Stats */}
        <div className="flex items-center space-x-6 text-sm text-gray-400">
          <span>{likes.count} {likes.count === 1 ? 'like' : 'likes'}</span>
          <span>{comments.count} {comments.count === 1 ? 'comment' : 'comments'}</span>
        </div>

        {/* Interaction Buttons */}
        <div className="flex items-center space-x-4">
          {/* Like Button */}
          <button
            onClick={handleLike}
            disabled={isLoading.like}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
              likes.isLiked 
                ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' 
                : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-red-400'
            } ${isLoading.like ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isLoading.like ? (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <Heart size={18} fill={likes.isLiked ? 'currentColor' : 'none'} />
            )}
            <span className="font-medium">Like</span>
          </button>

          {/* Comment Button */}
          <button
            onClick={handleComment}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-white/5 text-gray-400 hover:bg-white/10 hover:text-blue-400 transition-all duration-200"
          >
            <MessageCircle size={18} />
            <span className="font-medium">Comment</span>
          </button>

          {/* Share Button */}
          <div className="relative">
            <button
              onClick={() => setShowShareMenu(!showShareMenu)}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-white/5 text-gray-400 hover:bg-white/10 hover:text-green-400 transition-all duration-200"
            >
              <Share2 size={18} />
              <span className="font-medium">Share</span>
            </button>

            {/* Share Menu */}
            {showShareMenu && (
              <div className="absolute right-0 top-12 w-48 bg-slate-900 border border-white/10 rounded-lg shadow-xl z-10">
                <div className="p-2">
                  <button
                    onClick={() => handleShare('copy')}
                    className="w-full flex items-center space-x-3 px-3 py-2 text-left text-gray-300 hover:bg-white/5 rounded-md transition-colors duration-200"
                  >
                    {copySuccess ? (
                      <>
                        <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <span className="text-sm text-green-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={16} />
                        <span className="text-sm">Copy Link</span>
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={() => handleShare('facebook')}
                    className="w-full flex items-center space-x-3 px-3 py-2 text-left text-gray-300 hover:bg-white/5 rounded-md transition-colors duration-200"
                  >
                    <Facebook size={16} />
                    <span className="text-sm">Facebook</span>
                  </button>
                  
                  <button
                    onClick={() => handleShare('twitter')}
                    className="w-full flex items-center space-x-3 px-3 py-2 text-left text-gray-300 hover:bg-white/5 rounded-md transition-colors duration-200"
                  >
                    <Twitter size={16} />
                    <span className="text-sm">Twitter</span>
                  </button>
                  
                  <button
                    onClick={() => handleShare('linkedin')}
                    className="w-full flex items-center space-x-3 px-3 py-2 text-left text-gray-300 hover:bg-white/5 rounded-md transition-colors duration-200"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                    <span className="text-sm">LinkedIn</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Click outside to close share menu */}
      {showShareMenu && (
        <div 
          className="fixed inset-0 z-5" 
          onClick={() => setShowShareMenu(false)}
        />
      )}

      {/* Login Popup */}
      <LoginPopup
        isOpen={showLoginPopup}
        onClose={() => setShowLoginPopup(false)}
        purpose={loginPurpose}
      />
    </div>
  );
};

export default BlogInteractions;