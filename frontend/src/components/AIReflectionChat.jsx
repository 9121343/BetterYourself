import React, { useState, useRef, useEffect } from 'react';
import './AIReflectionChat.css';

const AIReflectionChat = ({ profile, onBack, onError }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('connected');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Welcome message when component mounts
    setMessages([{
      type: 'ai',
      content: `Hello! I'm ${profile.name}, your AI reflection. I understand your unique personality and I'm here to listen, reflect, and support you. What's on your mind today?`,
      timestamp: new Date(),
      mood: 'welcoming'
    }]);
  }, [profile]);

  const sendMessage = async () => {
    if (!inputMessage.trim() || isTyping) return;

    const userMsg = {
      type: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    const messageToSend = inputMessage.trim();
    setInputMessage('');
    setIsTyping(true);

    try {
      console.log('💬 Sending message to AI reflection...');
      
      const response = await fetch('/api/ai-reflection/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          profileId: profile.id,
          message: messageToSend
        })
      });

      const result = await response.json();
      console.log('📋 Chat response:', result);

      if (result.success) {
        const aiMsg = {
          type: 'ai',
          content: result.response,
          timestamp: new Date(),
          mood: result.mood,
          suggestions: result.suggestions
        };
        setMessages(prev => [...prev, aiMsg]);
        setConnectionStatus('connected');
      } else {
        throw new Error(result.error || 'Failed to get response');
      }
    } catch (error) {
      console.error('💥 Chat error:', error);
      
      // Add fallback message
      const errorMsg = {
        type: 'ai',
        content: "I'm having trouble connecting right now, but I'm still here with you. Your thoughts and feelings matter. Please try again in a moment, or feel free to continue sharing - sometimes just expressing ourselves helps.",
        timestamp: new Date(),
        isError: true,
        suggestions: ["How are you feeling right now?", "What's been on your mind lately?", "Tell me about your day"]
      };
      setMessages(prev => [...prev, errorMsg]);
      setConnectionStatus('error');
      
      if (onError) {
        onError('Connection issue - but your reflection is still listening');
      }
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setInputMessage(suggestion);
  };

  const getMoodColor = (mood) => {
    const colors = {
      happy: '#10b981',
      sad: '#6366f1',
      frustrated: '#f59e0b',
      anxious: '#8b5cf6',
      neutral: '#6b7280',
      welcoming: '#ec4899',
      grateful: '#10b981',
      motivated: '#f59e0b',
      uncertain: '#6b7280'
    };
    return colors[mood] || colors.neutral;
  };

  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="ai-reflection-chat">
      <div className="chat-header">
        <button onClick={onBack} className="back-button">
          ← Back
        </button>
        <div className="profile-info">
          <div className="profile-avatar">🎭</div>
          <div className="profile-details">
            <h2>{profile.name}</h2>
            <p className={`status ${connectionStatus}`}>
              {connectionStatus === 'connected' ? 'Your reflection is listening' : 'Reconnecting...'}
            </p>
          </div>
        </div>
        <div className="profile-stats">
          <span className="stat">
            {Math.floor(messages.filter(m => m.type === 'user').length)} exchanges
          </span>
        </div>
      </div>

      <div className="messages-container">
        <div className="messages-list">
          {messages.map((message, index) => (
            <div key={index} className={`message-wrapper ${message.type}`}>
              <div className={`message ${message.type} ${message.isError ? 'error' : ''}`}>
                <div className="message-content">
                  {message.content}
                  {message.mood && message.type === 'ai' && !message.isError && (
                    <div 
                      className="mood-indicator"
                      style={{ backgroundColor: getMoodColor(message.mood) }}
                      title={`Detected mood: ${message.mood}`}
                    >
                      {message.mood}
                    </div>
                  )}
                </div>
                <div className="message-time">
                  {formatTime(message.timestamp)}
                </div>
              </div>
              
              {message.suggestions && message.suggestions.length > 0 && (
                <div className="suggestions">
                  <p className="suggestions-label">💡 You might explore:</p>
                  <div className="suggestion-chips">
                    {message.suggestions.map((suggestion, i) => (
                      <button
                        key={i}
                        className="suggestion-chip"
                        onClick={() => handleSuggestionClick(suggestion)}
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="message-wrapper ai">
              <div className="message ai typing">
                <div className="typing-indicator">
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                </div>
                <span className="typing-text">{profile.name} is reflecting...</span>
              </div>
            </div>
          )}
        </div>
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input">
        <div className="input-container">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Share what's on your mind..."
            className="message-input"
            rows={1}
            maxLength={2000}
            disabled={isTyping}
          />
          <button 
            onClick={sendMessage}
            disabled={!inputMessage.trim() || isTyping}
            className="send-button"
            title="Send message"
          >
            {isTyping ? '⏳' : '💭'}
          </button>
        </div>
        <div className="input-footer">
          <span className="char-count">
            {inputMessage.length}/2000
          </span>
          <span className="input-hint">
            Press Enter to send, Shift+Enter for new line
          </span>
        </div>
      </div>
    </div>
  );
};

export default AIReflectionChat;
