import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFirebaseAuth } from '../contexts/FirebaseAuthContext';
import commentService from '../services/commentService';
import blogService from '../services/blogService';
import './UserComments.css';

const UserComments = () => {
  const { user, loading: authLoading } = useFirebaseAuth();
  const navigate = useNavigate();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Wait for auth to load
    if (authLoading) return;
    
    // If not authenticated, redirect
    if (!user) {
      navigate('/');
      return;
    }
    
    fetchUserComments();
  }, [user, authLoading, navigate]);

  const fetchUserComments = async () => {
    try {
      setLoading(true);
      
      if (!user) {
        setComments([]);
        return;
      }

      console.log('Fetching comments for user:', user.uid);

      // Get all blogs first
      const allBlogs = await blogService.getAllBlogs();
      console.log('Total blogs found:', allBlogs.length);
      
      if (allBlogs.length === 0) {
        setComments([]);
        return;
      }

      // Collect all comments by this user across all blogs
      const userComments = [];
      
      for (const blog of allBlogs) {
        try {
          const blogComments = await commentService.getCommentsByBlogId(blog.id);
          const userCommentsForBlog = blogComments.filter(comment => comment.userId === user.uid);
          
          // Add blog information to each comment
          const commentsWithBlogInfo = userCommentsForBlog.map(comment => ({
            ...comment,
            blogId: blog.id,
            blogTitle: blog.title,
            blogExcerpt: blog.excerpt
          }));
          
          userComments.push(...commentsWithBlogInfo);
        } catch (error) {
          console.error('Error fetching comments for blog:', blog.id, error);
        }
      }
      
      // Sort by date (newest first)
      userComments.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      
      console.log('Final user comments count:', userComments.length);
      setComments(userComments);
    } catch (error) {
      console.error('Error fetching user comments:', error);
      setComments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBlogClick = (blogId) => {
    navigate(`/blog/${blogId}`);
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (authLoading || loading) {
    return (
      <div className="user-comments-container">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="user-comments-container" data-testid="user-comments-page">
      <div className="comments-header">
        <button className="back-button" onClick={() => navigate('/user/profile')} data-testid="back-button">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
          </svg>
          Back to Profile
        </button>
        <h1 className="comments-title">
          <svg className="title-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
          </svg>
          My Comments
        </h1>
        <p className="comments-subtitle">
          {comments.length} comment{comments.length !== 1 ? 's' : ''} across all blogs
        </p>
      </div>

      {comments.length === 0 ? (
        <div className="empty-state">
          <svg className="empty-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
          </svg>
          <h3>No Comments Yet</h3>
          <p>Start a conversation by commenting on blogs!</p>
          <button className="cta-button" onClick={() => navigate('/blog')} data-testid="browse-blogs-btn">
            Browse Blogs
          </button>
        </div>
      ) : (
        <div className="comments-list">
          {comments.map((comment) => (
            <div 
              key={comment.id} 
              className="comment-card"
              data-testid={`comment-card-${comment.id}`}
            >
              <div className="comment-header">
                <div className="comment-blog-info">
                  <span className="comment-label">Commented on:</span>
                  <button 
                    className="comment-blog-link"
                    onClick={() => handleBlogClick(comment.blogId)}
                    data-testid={`blog-link-${comment.blogId}`}
                  >
                    {comment.blogTitle}
                  </button>
                </div>
                <span className="comment-date">{formatDate(comment.createdAt)}</span>
              </div>
              
              <div className="comment-content">
                <p className="comment-text">{comment.text}</p>
                {comment.isEdited && (
                  <span className="edited-badge">Edited</span>
                )}
              </div>
              
              {comment.blogExcerpt && (
                <div className="comment-blog-excerpt">
                  <span className="excerpt-label">Blog excerpt:</span>
                  <p className="excerpt-text">{comment.blogExcerpt}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserComments;
