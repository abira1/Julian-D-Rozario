import React, { useState, useEffect } from 'react';
import { useFirebaseAuth } from '../../contexts/FirebaseAuthContext';
import LoginPopup from '../auth/LoginPopup';
import likeService from '../../services/likeService';
import commentService from '../../services/commentService';
import saveService from '../../services/saveService';
import { Heart, MessageCircle, Share2, Copy, Link, Facebook, Twitter, Bookmark } from 'lucide-react';

const BlogInteractions = ({ blogId, blogTitle, blogUrl }) => {
  const [likes, setLikes] = useState({ count: 0, isLiked: false });
  const [comments, setComments] = useState({ count: 0 });
  const [saves, setSaves] = useState({ count: 0, isSaved: false });
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [loginPurpose, setLoginPurpose] = useState('like');
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [isLoading, setIsLoading] = useState({ like: false, save: false });
  const [copySuccess, setCopySuccess] = useState(false);
  
  const { user, backendToken } = useFirebaseAuth();

  // Fetch initial interaction data
  useEffect(() => {
    fetchInteractionData();
  }, [blogId, user]);

  const fetchInteractionData = async () => {
    try {
      if (blogId) {
        // Fetch likes using Firebase
        const likesData = await likeService.getLikesByBlogId(blogId);
        const isLiked = user ? await likeService.hasUserLiked(blogId, user.uid) : false;
        
        setLikes({
          count: likesData.length || 0,
          isLiked: isLiked
        });

        // Fetch comments count using Firebase
        const commentsData = await commentService.getCommentsByBlogId(blogId);
        setComments({ count: commentsData.length || 0 });

        // Fetch saves using Firebase
        const savesData = await saveService.getSavesByBlogId(blogId);
        const isSaved = user ? await saveService.hasUserSaved(blogId, user.uid) : false;
        
        setSaves({
          count: savesData.length || 0,
          isSaved: isSaved
        });
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
      
      // Use Firebase like service
      const result = await likeService.toggleLike(blogId, user.uid, user.email);
      
      setLikes(prev => ({
        count: result.liked ? prev.count + 1 : prev.count - 1,
        isLiked: result.liked
      }));
      
    } catch (error) {
      console.error('Error toggling like:', error);
    } finally {
      setIsLoading({ ...isLoading, like: false });
    }
  };

  const handleSave = async () => {
    if (!user) {
      setLoginPurpose('save');
      setShowLoginPopup(true);
      return;
    }

    try {
      setIsLoading({ ...isLoading, save: true });
      
      // Use Firebase save service
      const result = await saveService.toggleSave(blogId, user.uid, user.email);
      
      setSaves(prev => ({
        count: result.saved ? prev.count + 1 : prev.count - 1,
        isSaved: result.saved
      }));
      
    } catch (error) {
      console.error('Error toggling save:', error);
    } finally {
      setIsLoading({ ...isLoading, save: false });
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
    <div className="mt-4 xxs:mt-6 xs:mt-8">
      {/* Mobile-Optimized Interaction Bar */}
      <div className="bg-gradient-to-br from-white/[0.08] to-white/[0.02] mobile-optimized-blur border border-white/[0.12] rounded-xl xxs:rounded-2xl mobile-compact-spacing xxs:p-4 xs:p-5 lg:p-6 shadow-xl xxs:shadow-2xl shadow-purple-500/5">
        
        {/* Mobile-First Engagement Stats */}
        <div className="flex items-center justify-between mb-3 xxs:mb-4 xs:mb-6 pb-2 xxs:pb-3 xs:pb-4 border-b border-white/[0.08]">
          <div className="flex items-center space-x-3 xxs:space-x-4 xs:space-x-6">
            <div className="flex items-center space-x-1.5 xxs:space-x-2">
              <div className="w-1.5 h-1.5 xxs:w-2 xxs:h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-xs xxs:text-sm font-medium text-white">
                {likes.count} {likes.count === 1 ? 'like' : 'likes'}
              </span>
            </div>
            <div className="flex items-center space-x-1.5 xxs:space-x-2">
              <div className="w-1.5 h-1.5 xxs:w-2 xxs:h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-xs xxs:text-sm font-medium text-white">
                {comments.count} {comments.count === 1 ? 'comment' : 'comments'}
              </span>
            </div>
            <div className="flex items-center space-x-1.5 xxs:space-x-2">
              <div className="w-1.5 h-1.5 xxs:w-2 xxs:h-2 bg-yellow-500 rounded-full animate-pulse"></div>
              <span className="text-xs xxs:text-sm font-medium text-white">
                {saves.count} {saves.count === 1 ? 'save' : 'saves'}
              </span>
            </div>
          </div>
          
          <div className="text-xs text-gray-500 font-medium px-2 xxs:px-3 py-0.5 xxs:py-1 bg-white/5 rounded-full">
            Interactive
          </div>
        </div>

        {/* Mobile-Optimized Action Buttons */}
        <div className="flex items-center justify-center gap-2 xxs:gap-3 xs:gap-4">
          
          {/* Like Button - Mobile Enhanced */}
          <button
            onClick={handleLike}
            disabled={isLoading.like}
            className={`mobile-reaction-button mobile-interactive group relative flex items-center justify-center xxs:space-x-2 xs:space-x-3 px-3 xxs:px-4 xs:px-6 py-2.5 xxs:py-3 rounded-lg xxs:rounded-xl font-semibold text-xs xxs:text-sm transition-all duration-300 transform hover:scale-105 hover:shadow-lg touch-target ${
              likes.isLiked 
                ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-red-500/25' 
                : 'bg-gradient-to-r from-white/10 to-white/5 text-gray-300 hover:from-red-500/20 hover:to-pink-500/20 hover:text-red-400 border border-white/10 hover:border-red-500/30'
            } ${isLoading.like ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <div className="relative flex items-center justify-center">
              {isLoading.like ? (
                <div className="w-4 h-4 xxs:w-5 xxs:h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Heart 
                    size={16} 
                    className={`xxs:w-5 xxs:h-5 transition-transform duration-200 ${likes.isLiked ? 'animate-pulse fill-current' : 'group-hover:scale-110'}`}
                    fill={likes.isLiked ? 'currentColor' : 'none'} 
                  />
                  {likes.isLiked && (
                    <div className="absolute inset-0 bg-red-400 rounded-full opacity-20 animate-ping"></div>
                  )}
                </>
              )}
            </div>
            <span className="hidden xxs:inline">Like</span>
          </button>

          {/* Comment Button - Mobile Enhanced */}
          <button
            onClick={handleComment}
            className="mobile-reaction-button mobile-interactive touch-interactive group flex items-center justify-center xxs:space-x-2 xs:space-x-3 px-3 xxs:px-4 xs:px-6 py-2.5 xxs:py-3 rounded-lg xxs:rounded-xl bg-gradient-to-r from-white/10 to-white/5 text-gray-300 hover:from-blue-500/20 hover:to-indigo-500/20 hover:text-blue-400 border border-white/10 hover:border-blue-500/30 font-semibold text-xs xxs:text-sm transition-all duration-300 transform hover:scale-105 hover:shadow-lg touch-target"
          >
            <MessageCircle size={16} className="xxs:w-5 xxs:h-5 transition-transform duration-200 group-hover:scale-110" />
            <span className="hidden xxs:inline">Comment</span>
          </button>

          {/* Save Button - Mobile Enhanced */}
          <button
            onClick={handleSave}
            disabled={isLoading.save}
            className={`mobile-reaction-button mobile-interactive group relative flex items-center justify-center xxs:space-x-2 xs:space-x-3 px-3 xxs:px-4 xs:px-6 py-2.5 xxs:py-3 rounded-lg xxs:rounded-xl font-semibold text-xs xxs:text-sm transition-all duration-300 transform hover:scale-105 hover:shadow-lg touch-target ${
              saves.isSaved 
                ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-yellow-500/25' 
                : 'bg-gradient-to-r from-white/10 to-white/5 text-gray-300 hover:from-yellow-500/20 hover:to-orange-500/20 hover:text-yellow-400 border border-white/10 hover:border-yellow-500/30'
            } ${isLoading.save ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <div className="relative flex items-center justify-center">
              {isLoading.save ? (
                <div className="w-4 h-4 xxs:w-5 xxs:h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Bookmark 
                    size={16} 
                    className={`xxs:w-5 xxs:h-5 transition-transform duration-200 ${saves.isSaved ? 'animate-pulse fill-current' : 'group-hover:scale-110'}`}
                    fill={saves.isSaved ? 'currentColor' : 'none'} 
                  />
                  {saves.isSaved && (
                    <div className="absolute inset-0 bg-yellow-400 rounded-full opacity-20 animate-ping"></div>
                  )}
                </>
              )}
            </div>
            <span className="hidden xxs:inline">Save</span>
          </button>

          {/* Share Button - Mobile Enhanced */}
          <div className="relative">
            <button
              onClick={() => setShowShareMenu(!showShareMenu)}
              className="mobile-reaction-button mobile-interactive touch-interactive group flex items-center justify-center xxs:space-x-2 xs:space-x-3 px-3 xxs:px-4 xs:px-6 py-2.5 xxs:py-3 rounded-lg xxs:rounded-xl bg-gradient-to-r from-white/10 to-white/5 text-gray-300 hover:from-green-500/20 hover:to-emerald-500/20 hover:text-green-400 border border-white/10 hover:border-green-500/30 font-semibold text-xs xxs:text-sm transition-all duration-300 transform hover:scale-105 hover:shadow-lg touch-target"
            >
              <Share2 size={16} className="xxs:w-5 xxs:h-5 transition-transform duration-200 group-hover:scale-110" />
              <span className="hidden xxs:inline">Share</span>
            </button>

            {/* Mobile-Optimized Share Menu */}
            {showShareMenu && (
              <div className="absolute right-0 xxs:right-auto xxs:left-0 top-14 xxs:top-16 w-48 xxs:w-56 bg-slate-900/95 mobile-optimized-blur border border-white/20 rounded-xl xxs:rounded-2xl shadow-xl xxs:shadow-2xl shadow-black/50 z-20 transform animate-in fade-in-0 zoom-in-95 duration-200">
                <div className="p-2 xxs:p-3">
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 xxs:mb-3 px-2 xxs:px-3">Share Article</div>
                  
                  <button
                    onClick={() => handleShare('copy')}
                    className="w-full flex items-center space-x-3 xxs:space-x-4 px-3 xxs:px-4 py-2.5 xxs:py-3 text-left text-gray-300 hover:bg-white/10 hover:text-white rounded-lg xxs:rounded-xl transition-all duration-200 group touch-target"
                  >
                    {copySuccess ? (
                      <>
                        <div className="w-5 h-5 xxs:w-6 xxs:h-6 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 flex items-center justify-center">
                          <svg className="w-2.5 h-2.5 xxs:w-3 xxs:h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <span className="text-xs xxs:text-sm font-medium text-green-400">Link Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={16} className="xxs:w-[18px] xxs:h-[18px] group-hover:scale-110 transition-transform duration-200" />
                        <span className="text-xs xxs:text-sm font-medium">Copy Link</span>
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={() => handleShare('facebook')}
                    className="w-full flex items-center space-x-3 xxs:space-x-4 px-3 xxs:px-4 py-2.5 xxs:py-3 text-left text-gray-300 hover:bg-blue-500/10 hover:text-blue-400 rounded-lg xxs:rounded-xl transition-all duration-200 group touch-target"
                  >
                    <Facebook size={16} className="xxs:w-[18px] xxs:h-[18px] group-hover:scale-110 transition-transform duration-200" />
                    <span className="text-xs xxs:text-sm font-medium">Facebook</span>
                  </button>
                  
                  <button
                    onClick={() => handleShare('twitter')}
                    className="w-full flex items-center space-x-3 xxs:space-x-4 px-3 xxs:px-4 py-2.5 xxs:py-3 text-left text-gray-300 hover:bg-sky-500/10 hover:text-sky-400 rounded-lg xxs:rounded-xl transition-all duration-200 group touch-target"
                  >
                    <Twitter size={16} className="xxs:w-[18px] xxs:h-[18px] group-hover:scale-110 transition-transform duration-200" />
                    <span className="text-xs xxs:text-sm font-medium">Twitter</span>
                  </button>
                  
                  <button
                    onClick={() => handleShare('linkedin')}
                    className="w-full flex items-center space-x-3 xxs:space-x-4 px-3 xxs:px-4 py-2.5 xxs:py-3 text-left text-gray-300 hover:bg-blue-600/10 hover:text-blue-500 rounded-lg xxs:rounded-xl transition-all duration-200 group touch-target"
                  >
                    <svg className="w-4 h-4 xxs:w-5 xxs:h-5 group-hover:scale-110 transition-transform duration-200" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                    <span className="text-xs xxs:text-sm font-medium">LinkedIn</span>
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