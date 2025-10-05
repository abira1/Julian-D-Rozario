import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFirebaseAuth } from '../contexts/FirebaseAuthContext';
import { API_CONFIG } from '../config/api';
import './UserComments.css';

const UserComments = () => {
  const { user } = useFirebaseAuth();
  const navigate = useNavigate();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
    
    fetchUserComments();
  }, [user, navigate]);

  const fetchUserComments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('firebase_backend_token');
      const response = await fetch(API_CONFIG.getApiPath('/user/comments'), {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setComments(data.comments || []);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBlogClick = (blogId) => {
    navigate(`/blog/${blogId}`);
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
      <div className="user-comments-container">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
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
                    onClick={() => handleBlogClick(comment.blog_id)}
                    data-testid={`blog-link-${comment.blog_id}`}
                  >
                    {comment.blog_title}
                  </button>
                </div>
                <span className="comment-date">{formatDate(comment.created_at)}</span>
              </div>
              
              <div className="comment-content">
                <p className="comment-text">{comment.comment_text}</p>
                {comment.is_edited && (
                  <span className="edited-badge">Edited</span>
                )}
              </div>
              
              {comment.blog_excerpt && (
                <div className="comment-blog-excerpt">
                  <span className="excerpt-label">Blog excerpt:</span>
                  <p className="excerpt-text">{comment.blog_excerpt}</p>
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
