import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFirebaseAuth } from '../contexts/FirebaseAuthContext';
import { API_CONFIG } from '../config/api';
import './BlogCollections.css';

const SavedBlogs = () => {
  const { user, loading: authLoading } = useFirebaseAuth();
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Wait for auth to load
    if (authLoading) return;
    
    // If not authenticated, redirect
    if (!user) {
      navigate('/');
      return;
    }
    
    fetchSavedBlogs();
  }, [user, authLoading, navigate]);

  const fetchSavedBlogs = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('firebase_backend_token');
      const response = await fetch(API_CONFIG.getApiPath('/user/saved-blogs'), {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setBlogs(data.blogs || []);
      }
    } catch (error) {
      console.error('Error fetching saved blogs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBlogClick = (blogId) => {
    navigate(`/blog/${blogId}`);
  };

  if (loading) {
    return (
      <div className="blog-collections-container">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  return (
    <div className="blog-collections-container" data-testid="saved-blogs-page">
      <div className="collections-header">
        <button className="back-button" onClick={() => navigate('/user/profile')} data-testid="back-button">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
          </svg>
          Back to Profile
        </button>
        <h1 className="collections-title">
          <svg className="title-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2z"/>
          </svg>
          Saved Blogs
        </h1>
        <p className="collections-subtitle">
          {blogs.length} blog{blogs.length !== 1 ? 's' : ''} saved for later
        </p>
      </div>

      {blogs.length === 0 ? (
        <div className="empty-state">
          <svg className="empty-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2z"/>
          </svg>
          <h3>No Saved Blogs Yet</h3>
          <p>Save interesting blogs to read them later!</p>
          <button className="cta-button" onClick={() => navigate('/blog')} data-testid="browse-blogs-btn">
            Browse Blogs
          </button>
        </div>
      ) : (
        <div className="blogs-grid">
          {blogs.map((blog) => (
            <div 
              key={blog.id} 
              className="blog-card"
              onClick={() => handleBlogClick(blog.id)}
              data-testid={`blog-card-${blog.id}`}
            >
              <div className="blog-card-header">
                <span className="blog-category">{blog.category}</span>
                <span className="blog-read-time">{blog.read_time}</span>
              </div>
              <h3 className="blog-title">{blog.title}</h3>
              <p className="blog-excerpt">{blog.excerpt}</p>
              <div className="blog-card-footer">
                <span className="blog-author">By {blog.author}</span>
                <div className="blog-stats">
                  <span className="stat-item">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                    </svg>
                    {blog.views || 0}
                  </span>
                  <span className="stat-item">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    </svg>
                    {blog.likes || 0}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedBlogs;