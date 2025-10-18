import React, { useState } from 'react';
import { useGoogleAuth } from '../contexts/GoogleAuthContext';
import GoogleLoginButton from './GoogleLoginButton';
import './ProtectedAction.css';

const ProtectedAction = ({ 
  children, 
  action, 
  requireAuth = true,
  showLoginPrompt = true,
  promptTitle = "Sign in required",
  promptMessage = "Please sign in to continue with this action.",
  className = ""
}) => {
  const { user, requireAuth: authRequire } = useGoogleAuth();
  const [showPrompt, setShowPrompt] = useState(false);

  const handleAction = (event) => {
    if (requireAuth && !user) {
      event.preventDefault();
      event.stopPropagation();
      
      if (showLoginPrompt) {
        setShowPrompt(true);
      } else {
        authRequire(action);
      }
    } else if (action) {
      action();
    }
  };

  const handleLogin = () => {
    setShowPrompt(false);
    authRequire(action);
  };

  const handleCancel = () => {
    setShowPrompt(false);
  };

  return (
    <>
      <div className={`protected-action ${className}`} onClick={handleAction}>
        {children}
      </div>

      {showPrompt && (
        <div className="auth-prompt-overlay">
          <div className="auth-prompt-modal">
            <div className="auth-prompt-header">
              <h3>{promptTitle}</h3>
              <button 
                className="auth-prompt-close"
                onClick={handleCancel}
                aria-label="Close"
              >
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
              </button>
            </div>
            
            <div className="auth-prompt-content">
              <p>{promptMessage}</p>
              
              <div className="auth-prompt-actions">
                <GoogleLoginButton 
                  text="Sign in to continue"
                  onSuccess={handleLogin}
                />
                <button 
                  className="auth-prompt-cancel"
                  onClick={handleCancel}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProtectedAction;