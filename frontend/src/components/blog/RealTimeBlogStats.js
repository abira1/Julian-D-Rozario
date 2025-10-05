import React, { useState, useEffect } from 'react';
import { database } from '../../firebase/config';
import { ref, onValue, off } from 'firebase/database';
import { Eye, Heart, MessageCircle, TrendingUp } from 'lucide-react';

const RealTimeBlogStats = ({ blogId }) => {
  const [stats, setStats] = useState({
    views: 0,
    likes: 0,
    comments: 0,
    isUpdating: false
  });
  const [previousStats, setPreviousStats] = useState({ views: 0, likes: 0, comments: 0 });

  useEffect(() => {
    if (!blogId) return;

    // Set up real-time listeners for blog statistics
    const blogRef = ref(database, `blogs/${blogId}`);
    const commentsRef = ref(database, 'blog_comments');
    const likesRef = ref(database, 'blog_likes');
    
    const blogListener = onValue(blogRef, (snapshot) => {
      try {
        const blogData = snapshot.val();
        if (blogData) {
          setStats(prev => ({
            ...prev,
            views: blogData.views || 0
          }));
        }
      } catch (error) {
        console.error('Error processing blog stats:', error);
      }
    });

    const commentsListener = onValue(commentsRef, (snapshot) => {
      try {
        const commentsData = snapshot.val() || {};
        const blogComments = Object.values(commentsData)
          .filter(comment => comment.blog_id === blogId);
        
        setStats(prev => {
          const newCommentsCount = blogComments.length;
          if (newCommentsCount !== prev.comments) {
            // Show update animation
            setStats(current => ({ ...current, isUpdating: true }));
            setTimeout(() => setStats(current => ({ ...current, isUpdating: false })), 1000);
          }
          return { ...prev, comments: newCommentsCount };
        });
      } catch (error) {
        console.error('Error processing comments count:', error);
      }
    });

    const likesListener = onValue(likesRef, (snapshot) => {
      try {
        const likesData = snapshot.val() || {};
        const blogLikes = Object.values(likesData)
          .filter(like => like.blog_id === blogId);
        
        setStats(prev => {
          const newLikesCount = blogLikes.length;
          if (newLikesCount !== prev.likes) {
            // Show update animation
            setStats(current => ({ ...current, isUpdating: true }));
            setTimeout(() => setStats(current => ({ ...current, isUpdating: false })), 1000);
          }
          return { ...prev, likes: newLikesCount };
        });
      } catch (error) {
        console.error('Error processing likes count:', error);
      }
    });

    // Cleanup listeners
    return () => {
      try {
        off(blogRef, blogListener);
        off(commentsRef, commentsListener);
        off(likesRef, likesListener);
      } catch (error) {
        console.error('Error cleaning up stats listeners:', error);
      }
    };
  }, [blogId]);

  // Track changes for animation effects
  useEffect(() => {
    setPreviousStats({
      views: stats.views,
      likes: stats.likes,
      comments: stats.comments
    });
  }, [stats.views, stats.likes, stats.comments]);

  const StatItem = ({ icon: Icon, value, label, isIncreasing = false }) => (
    <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-300 ${
      stats.isUpdating ? 'bg-purple-500/20 scale-105' : 'bg-white/5'
    }`}>
      <Icon size={16} className={`transition-colors duration-300 ${
        stats.isUpdating ? 'text-purple-400' : 'text-gray-400'
      }`} />
      <div className="flex items-center space-x-1">
        <span className={`font-medium transition-all duration-300 ${
          stats.isUpdating ? 'text-white scale-110' : 'text-gray-300'
        }`}>
          {value}
        </span>
        {isIncreasing && (
          <TrendingUp size={12} className="text-green-400 animate-pulse" />
        )}
      </div>
      <span className="text-xs text-gray-500">{label}</span>
    </div>
  );

  return (
    <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl border border-white/10 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium text-white" style={{ fontFamily: 'Encode Sans Semi Expanded, sans-serif' }}>
          Live Stats
        </h4>
        {stats.isUpdating && (
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-xs text-green-400">Live</span>
          </div>
        )}
      </div>
      
      <div className="space-y-2">
        <StatItem
          icon={Eye}
          value={stats.views}
          label="views"
          isIncreasing={stats.views > previousStats.views}
        />
        <StatItem
          icon={Heart}
          value={stats.likes}
          label="likes"
          isIncreasing={stats.likes > previousStats.likes}
        />
        <StatItem
          icon={MessageCircle}
          value={stats.comments}
          label="comments"
          isIncreasing={stats.comments > previousStats.comments}
        />
      </div>

      {/* Real-time indicator */}
      <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-center">
        <div className="flex items-center space-x-2 text-xs text-gray-500">
          <div className="w-1 h-1 bg-green-400 rounded-full animate-pulse"></div>
          <span>Real-time updates</span>
        </div>
      </div>
    </div>
  );
};

export default RealTimeBlogStats;