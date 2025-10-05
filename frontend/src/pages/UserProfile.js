import React, { useState, useEffect } from 'react';
import { useFirebaseAuth } from '../contexts/FirebaseAuthContext';
import { useNavigate } from 'react-router-dom';
import { API_CONFIG } from '../config/api';
import './UserProfile.css';

const UserProfile = () => {
  const { user, userEmail, userName, userPhoto } = useFirebaseAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);
  const [likedCount, setLikedCount] = useState(0);
  const [savedCount, setSavedCount] = useState(0);
  const [commentsCount, setCommentsCount] = useState(0);

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
    
    fetchProfileData();
  }, [user, navigate]);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      
      // Fetch user profile
      const token = localStorage.getItem('firebase_backend_token');
      const headers = { 'Authorization': `Bearer ${token}` };
      
      const profileResponse = await fetch(API_CONFIG.getApiPath('/user/profile'), { headers });
      if (profileResponse.ok) {
        const profile = await profileResponse.json();
        setProfileData(profile);
      }
      
      // Fetch liked blogs count
      const likedResponse = await fetch(API_CONFIG.getApiPath('/user/liked-blogs'), { headers });
      if (likedResponse.ok) {
        const likedData = await likedResponse.json();
        setLikedCount(likedData.blogs?.length || 0);
      }
      
      // Fetch saved blogs count
      const savedResponse = await fetch(API_CONFIG.getApiPath('/user/saved-blogs'), { headers });
      if (savedResponse.ok) {
        const savedData = await savedResponse.json();
        setSavedCount(savedData.blogs?.length || 0);
      }
      
      // Fetch comments count
      const commentsResponse = await fetch(API_CONFIG.getApiPath('/user/comments'), { headers });
      if (commentsResponse.ok) {
        const commentsData = await commentsResponse.json();
        setCommentsCount(commentsData.comments?.length || 0);
      }
      
    } catch (error) {
      console.error('Error fetching profile data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="user-profile-container">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  return (
    <div className="user-profile-container" data-testid="user-profile-page">
      <div className="profile-header-section">
        <div className="profile-cover"></div>
        <div className="profile-info-section">
          <div className="profile-avatar-container">
            <img 
              src={userPhoto || '/default-avatar.png'} 
              alt={userName || userEmail}
              className="profile-avatar-large"
              data-testid="profile-avatar"
            />
          </div>
          <div className="profile-details">
            <h1 className="profile-name" data-testid="profile-name">
              {userName || userEmail?.split('@')[0] || 'User'}
            </h1>
            <p className="profile-email" data-testid="profile-email">{userEmail}</p>
            {profileData?.bio && (
              <p className="profile-bio" data-testid="profile-bio">{profileData.bio}</p>
            )}
            <div className="profile-meta">
              <span className="meta-item">
                Member since {new Date(profileData?.created_at || Date.now()).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="profile-stats-section">
        <div className="stats-grid">
          <div className="stat-card" onClick={() => navigate('/user/liked-blogs')} data-testid="liked-blogs-stat">
            <div className="stat-icon">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            </div>
            <div className="stat-content">
              <div className="stat-value">{likedCount}</div>
              <div className="stat-label">Liked Blogs</div>
            </div>
          </div>

          <div className="stat-card" onClick={() => navigate('/user/saved-blogs')} data-testid="saved-blogs-stat">
            <div className="stat-icon">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2z"/>
              </svg>
            </div>
            <div className="stat-content">
              <div className="stat-value">{savedCount}</div>
              <div className="stat-label">Saved Blogs</div>
            </div>
          </div>

          <div className="stat-card" onClick={() => navigate('/user/comments')} data-testid="comments-stat">
            <div className="stat-icon">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
              </svg>
            </div>
            <div className="stat-content">
              <div className="stat-value">{commentsCount}</div>
              <div className="stat-label">Comments</div>
            </div>
          </div>
        </div>
      </div>

      <div className="profile-actions-section">
        <h2 className="section-title">Quick Actions</h2>
        <div className="actions-grid">
          <button 
            className="action-button"
            onClick={() => navigate('/user/liked-blogs')}
            data-testid="view-liked-blogs-btn"
          >
            <svg className="action-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
            View Liked Blogs
          </button>
          
          <button 
            className="action-button"
            onClick={() => navigate('/user/saved-blogs')}
            data-testid="view-saved-blogs-btn"
          >
            <svg className="action-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2z"/>
            </svg>
            View Saved Blogs
          </button>
          
          <button 
            className="action-button"
            onClick={() => navigate('/user/comments')}
            data-testid="view-comments-btn"
          >
            <svg className="action-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
            </svg>
            View My Comments
          </button>
          
          <button 
            className="action-button"
            onClick={() => navigate('/blog')}
            data-testid="browse-blogs-btn"
          >
            <svg className="action-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
            </svg>
            Browse Blogs
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;