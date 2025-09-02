// MyBetterSelf Server v2.0 - AI Reflection System
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const AIReflectionService = require('./services/aiReflectionService');

const app = express();
const PORT = process.env.PORT || 4000;

// Initialize AI Reflection Service
const aiReflection = new AIReflectionService();

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Ensure uploads directory exists
const uploadsDir = './uploads';
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// ======================
// AI REFLECTION ROUTES 🎭
// ======================

// Create AI reflection profile
app.post('/api/ai-reflection/create-profile', async (req, res) => {
  try {
    console.log('🎭 Creating AI reflection profile...');
    console.log('📝 Received data:', JSON.stringify(req.body, null, 2));
    
    const userData = req.body;
    
    // Validate required data
    if (!userData.name && !userData.responses?.name) {
      return res.status(400).json({
        success: false,
        error: 'Name is required'
      });
    }

    const profile = await aiReflection.createReflectionProfile(userData);
    
    res.json({
      success: true,
      message: `🎭 Your AI reflection "${profile.name}" is ready to chat!`,
      profile: {
        id: profile.id,
        name: profile.name,
        traits: profile.personalityTraits,
        style: profile.communicationStyle,
        interests: profile.interests,
        createdAt: profile.createdAt
      }
    });

  } catch (error) {
    console.error('❌ Profile creation error:', error);
    res.status(500).json({
      success: false,
      error: 'Could not create AI reflection profile: ' + error.message
    });
  }
});

// Chat with AI reflection
app.post('/api/ai-reflection/chat', async (req, res) => {
  try {
    const { profileId, message } = req.body;
    
    console.log(`💭 Chat request for profile: ${profileId}`);
    console.log(`📝 Message: "${message}"`);
    
    if (!message?.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      });
    }

    if (!profileId) {
      return res.status(400).json({
        success: false,
        error: 'Profile ID is required'
      });
    }

    const result = await aiReflection.generateReflectionResponse(profileId, message.trim());
    
    if (result.success) {
      res.json({
        success: true,
        response: result.response,
        profileName: result.profileName,
        conversationCount: result.conversationCount,
        mood: result.mood,
        suggestions: result.suggestions,
        timestamp: new Date().toISOString()
      });
    } else {
      res.json({
        success: false,
        error: result.error,
        fallbackResponse: result.fallbackResponse
      });
    }

  } catch (error) {
    console.error('❌ Chat error:', error);
    res.status(500).json({
      success: false,
      error: 'Could not process your message: ' + error.message,
      fallbackResponse: "I'm here with you, even when words are hard to find. What's on your heart?"
    });
  }
});

// Get user profile and stats
app.get('/api/ai-reflection/profile/:profileId', (req, res) => {
  try {
    const { profileId } = req.params;
    const profile = aiReflection.getUserProfile(profileId);
    
    if (!profile) {
      return res.status(404).json({
        success: false,
        error: 'Profile not found'
      });
    }

    res.json({
      success: true,
      profile: profile
    });

  } catch (error) {
    console.error('❌ Profile fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Could not fetch profile: ' + error.message
    });
  }
});

// Debug: Get all profiles
app.get('/api/ai-reflection/debug/profiles', (req, res) => {
  try {
    const profiles = aiReflection.getAllProfiles();
    res.json({
      success: true,
      profiles: profiles,
      count: profiles.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ======================
// HEALTH & INFO ROUTES
// ======================

app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    server: 'MyBetterSelf API v2.0',
    features: {
      aiReflection: '🎭 Active',
      googleAI: process.env.GOOGLE_AI_KEY ? '🤖 Connected' : '❌ Not configured'
    },
    message: 'Your AI reflection system is ready!'
  });
});

app.get('/', (req, res) => {
  res.json({
    message: '🎭 Welcome to MyBetterSelf API v2.0',
    features: [
      '🎭 AI Reflection Companion', 
      '💭 Personalized Conversations',
      '📊 Mood Detection & Analysis',
      '🛡️ Safety & Wellness Monitoring'
    ],
    endpoints: {
      health: '/api/health',
      createProfile: 'POST /api/ai-reflection/create-profile',
      chat: 'POST /api/ai-reflection/chat',
      getProfile: 'GET /api/ai-reflection/profile/:id'
    }
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('💥 Server Error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error: ' + error.message
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    availableRoutes: ['/api/health', '/api/ai-reflection/create-profile', '/api/ai-reflection/chat']
  });
});

// Start server
app.listen(PORT, () => {
  console.log('🎉 ===== MyBetterSelf Server v2.0 =====');
  console.log(`🚀 Server: http://localhost:${PORT}`);
  console.log('🎭 AI Reflection System: Ready');
  console.log('💭 Your digital mirror awaits...');
  console.log('');
  console.log('📋 Available Features:');
  console.log('   🎭 AI Reflection Companion');
  console.log('   💬 Personalized Conversations');
  console.log('   📊 Mood Detection & Analysis');
  console.log('   🛡️ Safety & Wellness Monitoring');
  console.log('');
  
  // Test AI connection
  if (process.env.GOOGLE_AI_KEY) {
    console.log('🤖 Google AI: Connected ✅');
  } else {
    console.log('⚠️  Google AI: Add GOOGLE_AI_KEY to .env file');
    console.log('   Get your key at: https://makersuite.google.com/app/apikey');
  }
  
  console.log('🔗 Test endpoints:');
  console.log(`   Health: http://localhost:${PORT}/api/health`);
  console.log(`   Create Profile: POST http://localhost:${PORT}/api/ai-reflection/create-profile`);
  console.log(`   Chat: POST http://localhost:${PORT}/api/ai-reflection/chat`);
});

module.exports = app;
