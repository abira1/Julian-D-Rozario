import React, { useState } from 'react';
import { useFirebaseAuth } from '../contexts/FirebaseAuthContext';
import FirebaseLoginButton from './FirebaseLoginButton';
import './FirebaseProtectedAction.css';

const FirebaseProtectedAction = ({ 
  children, 
  action, 
  requireAuth = true,
  showLoginPrompt = true,
  promptTitle = "Sign in required",
  promptMessage = "Please sign in to continue with this action.",
  className = ""
}) => {
  const { user, requireAuth: authRequire } = useFirebaseAuth();
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
      <div className={`firebase-protected-action ${className}`} onClick={handleAction}>
        {children}
      </div>

      {showPrompt && (
        <div className="firebase-auth-prompt-overlay">
          <div className="firebase-auth-prompt-modal">
            <div className="firebase-auth-prompt-header">
              <h3>{promptTitle}</h3>
              <button 
                className="firebase-auth-prompt-close"
                onClick={handleCancel}
                aria-label="Close"
              >
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
              </button>
            </div>
            
            <div className="firebase-auth-prompt-content">
              <div className="firebase-auth-prompt-icon">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm3.5 6L12 10.5 8.5 8 12 5.5 15.5 8zM12 13.5L8.5 16 12 18.5 15.5 16 12 13.5z"/>
                </svg>
              </div>
              <p>{promptMessage}</p>
              
              <div className="firebase-auth-prompt-actions">
                <FirebaseLoginButton 
                  text="Sign in with Google"
                  theme="filled"
                  onSuccess={handleLogin}
                />
                <button 
                  className="firebase-auth-prompt-cancel"
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

export default FirebaseProtectedAction;