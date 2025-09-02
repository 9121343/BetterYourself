import React, { useState, useEffect } from 'react';
import PersonalitySetup from './components/PersonalitySetup';
import AIReflectionChat from './components/AIReflectionChat';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState('home');
  const [userProfile, setUserProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load saved profile from localStorage on mount
  useEffect(() => {
    try {
      const savedProfile = localStorage.getItem('aiReflectionProfile');
      if (savedProfile) {
        const profile = JSON.parse(savedProfile);
        setUserProfile(profile);
        // Don't auto-navigate to chat, let user choose
      }
    } catch (error) {
      console.error('Error loading saved profile:', error);
      localStorage.removeItem('aiReflectionProfile');
    }
  }, []);

  // Handle profile creation
  const handleProfileCreated = (profile) => {
    console.log('✅ Profile created successfully:', profile);
    setUserProfile(profile);
    localStorage.setItem('aiReflectionProfile', JSON.stringify(profile));
    setCurrentView('chat');
    setError(null);
  };

  // Merge updates into profile and persist
  const handleProfileUpdate = (partial) => {
    setUserProfile(prev => {
      const updated = { ...(prev || {}), ...(partial || {}) };
      try { localStorage.setItem('aiReflectionProfile', JSON.stringify(updated)); } catch {}
      return updated;
    });
  };

  // Reset profile and return to home
  const resetProfile = () => {
    setUserProfile(null);
    localStorage.removeItem('aiReflectionProfile');
    setCurrentView('home');
    setError(null);
    console.log('🔄 Profile reset');
  };

  // Handle errors
  const handleError = (errorMessage) => {
    setError(errorMessage);
    setIsLoading(false);
    console.error('❌ Application error:', errorMessage);
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  return (
    <div className="app">
      {/* Header */}
      <header className="app-header">
        <div className="header-container">
          <div className="logo">
            <h1>MyBetterSelf</h1>
            <span className="version">v2.0</span>
          </div>

          <nav className="nav-menu">
            <button
              className={`nav-item ${currentView === 'home' ? 'active' : ''}`}
              onClick={() => setCurrentView('home')}
            >
              🏠 Home
            </button>
            <button
              className={`nav-item ${currentView === 'reflection' ? 'active' : ''}`}
              onClick={() => setCurrentView('reflection')}
            >
              🎭 AI Reflection
            </button>
            {userProfile && (
              <button
                className={`nav-item ${currentView === 'chat' ? 'active' : ''}`}
                onClick={() => setCurrentView('chat')}
              >
                💬 Chat
              </button>
            )}
          </nav>

          {userProfile && (
            <div className="user-info">
              <span className="profile-name">
                🎭 {userProfile.name}
              </span>
              <button onClick={resetProfile} className="reset-button" title="Reset Profile">
                🔄
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Error Banner */}
      {error && (
        <div className="error-banner">
          <div className="error-content">
            <span className="error-icon">⚠️</span>
            <span className="error-message">{error}</span>
            <button 
              className="error-dismiss" 
              onClick={clearError}
              title="Dismiss error"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <p>Setting up your AI reflection...</p>
        </div>
      )}

      {/* Main Content */}
      <main className="app-main">
        {/* Home View */}
        {currentView === 'home' && (
          <div className="home-view">
            <div className="hero-section">
              <h1 className="hero-title">
                Welcome to <span className="gradient-text">MyBetterSelf</span>
              </h1>
              <p className="hero-subtitle">
                Create a personalized AI reflection that understands your unique personality 
                and provides meaningful conversations, guidance, and support for your personal growth journey.
              </p>
              
              <div className="feature-cards">
                <div className="feature-card">
                  <div className="feature-icon">🎭</div>
                  <h3>AI Reflection</h3>
                  <p>
                    Create your digital mirror - an AI that learns your personality, 
                    communication style, and goals to provide personalized support and insights.
                  </p>
                  <button
                    onClick={() => setCurrentView('reflection')}
                    className="feature-button"
                    disabled={isLoading}
                  >
                    {userProfile ? '✨ Continue Reflection' : '🚀 Create Your Reflection'}
                  </button>
                </div>
                
                <div className="feature-card">
                  <div className="feature-icon">💭</div>
                  <h3>Personal Growth</h3>
                  <p>
                    Engage in meaningful conversations about your goals, challenges, and aspirations. 
                    Get personalized guidance that adapts to your unique needs.
                  </p>
                  <button
                    onClick={() => setCurrentView(userProfile ? 'chat' : 'reflection')}
                    className="feature-button"
                    disabled={isLoading}
                  >
                    {userProfile ? '💬 Start Conversation' : '🌱 Begin Journey'}
                  </button>
                </div>
              </div>

              {/* Status Indicator */}
              <div className="status-section">
                {userProfile ? (
                  <div className="status-card success">
                    <span className="status-icon">✅</span>
                    <div className="status-info">
                      <h4>Your Reflection is Ready</h4>
                      <p>"{userProfile.name}" is waiting to chat with you</p>
                    </div>
                  </div>
                ) : (
                  <div className="status-card info">
                    <span className="status-icon">🎯</span>
                    <div className="status-info">
                      <h4>Ready to Get Started?</h4>
                      <p>Create your personalized AI reflection in just a few minutes</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Personality Setup View */}
        {currentView === 'reflection' && !userProfile && (
          <PersonalitySetup 
            onComplete={handleProfileCreated}
            onError={handleError}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
          />
        )}

        {/* AI Chat View */}
        {(currentView === 'chat' || (currentView === 'reflection' && userProfile)) && userProfile && (
          <AIReflectionChat
            profile={userProfile}
            onBack={() => setCurrentView('home')}
            onError={handleError}
            onProfileUpdate={handleProfileUpdate}
          />
        )}

        {/* Fallback for reflection view with existing profile */}
        {currentView === 'reflection' && userProfile && (
          <div className="existing-profile-view">
            <div className="profile-card">
              <h2>🎭 Your AI Reflection: {userProfile.name}</h2>
              <p>Your reflection is already set up and ready to chat!</p>
              <div className="profile-actions">
                <button 
                  onClick={() => setCurrentView('chat')}
                  className="primary-button"
                >
                  💬 Start Chatting
                </button>
                <button 
                  onClick={resetProfile}
                  className="secondary-button"
                >
                  🔄 Create New Reflection
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
