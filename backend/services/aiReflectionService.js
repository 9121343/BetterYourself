const { v4: uuidv4 } = require('uuid');

class AIReflectionService {
  constructor() {
    // Initialize OpenRouter API configuration
    if (!process.env.GOOGLE_AI_KEY) {
      console.warn('⚠️  GOOGLE_AI_KEY not found in environment variables');
      console.warn('   Add your OpenRouter API key to .env file: GOOGLE_AI_KEY=your_key_here');
      console.warn('   Get your key at: https://openrouter.ai/keys');
    }
    
    this.apiKey = process.env.GOOGLE_AI_KEY;
    this.isOpenRouterKey = this.apiKey && this.apiKey.startsWith('sk-or-v1-');
    
    // OpenRouter API configuration
    this.openRouterConfig = {
      baseURL: 'https://openrouter.ai/api/v1',
      model: 'google/gemini-pro', // Using Google's Gemini Pro through OpenRouter
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://mybetterself.app',
        'X-Title': 'MyBetterSelf AI Reflection'
      }
    };
    
    // In-memory storage (development)
    this.userProfiles = new Map();
    this.conversations = new Map();
    
    // Safety configuration
    this.wellnessKeywords = {
      concerning: [
        'suicide', 'kill myself', 'end it all', 'not worth living', 'want to die',
        'self harm', 'hurt myself', 'cutting', 'overdose', 'hopeless'
      ],
      supportive: [
        'growth', 'learn', 'improve', 'better', 'progress', 'achieve',
        'goals', 'dreams', 'hope', 'future', 'positive', 'grateful'
      ],
      emotional: [
        'sad', 'angry', 'frustrated', 'worried', 'excited', 'happy',
        'anxious', 'depressed', 'overwhelmed', 'stressed', 'lonely'
      ]
    };

    console.log(`🎭 AIReflectionService initialized with ${this.isOpenRouterKey ? 'OpenRouter' : 'fallback'} API`);
  }

  async createReflectionProfile(userData) {
    try {
      console.log('🔨 Creating reflection profile...');
      
      const profileId = uuidv4();
      const profile = {
        id: profileId,
        name: userData.name || userData.responses?.name || 'Your Reflection',
        personalityTraits: this.extractTraits(userData),
        communicationStyle: this.analyzeCommunicationStyle(userData),
        interests: this.extractInterests(userData),
        supportStyle: userData.supportStyle || userData.responses?.support_style || 'empathetic listener',
        goals: this.extractGoals(userData),
        writingSample: userData.writingSample || userData.responses?.writing_sample || '',
        createdAt: new Date(),
        safetyFlags: {
          concerningMessages: 0,
          needsSupport: false
        },
        conversationCount: 0
      };
      
      // Store profile and initialize conversation history
      this.userProfiles.set(profileId, profile);
      this.conversations.set(profileId, []);
      
      console.log(`✅ Profile created: ${profile.name} (ID: ${profileId})`);
      return profile;
      
    } catch (error) {
      console.error('❌ Profile creation failed:', error);
      throw new Error('Failed to create reflection profile: ' + error.message);
    }
  }

  async generateReflectionResponse(profileId, userMessage) {
    try {
      const profile = this.userProfiles.get(profileId);
      if (!profile) {
        return { success: false, error: 'Profile not found' };
      }

      const conversations = this.conversations.get(profileId) || [];
      const mood = this.detectMood(userMessage);
      const safetyCheck = this.performSafetyCheck(userMessage, profile);

      // Handle safety concerns
      if (safetyCheck.needsIntervention) {
        return this.generateSupportResponse(profile, safetyCheck);
      }

      // Build AI prompt
      const reflectionPrompt = this.buildReflectionPrompt(profile, userMessage, mood, conversations);

      let response;
      try {
        if (!this.apiKey || !this.isOpenRouterKey) {
          // Fallback response when no API key or wrong format
          response = this.generateFallbackResponse(profile, userMessage, mood);
        } else {
          response = await this.callOpenRouterAPI(reflectionPrompt);
        }
      } catch (aiError) {
        console.error('AI generation error:', aiError);
        response = this.generateFallbackResponse(profile, userMessage, mood);
      }
      
      // Store conversation
      const conversationEntry = {
        user: userMessage,
        ai: response,
        timestamp: new Date(),
        mood: mood
      };
      conversations.push(conversationEntry);
      
      // Update profile stats
      profile.conversationCount = Math.floor(conversations.length / 2); // Divide by 2 since each exchange has user + ai
      
      return {
        success: true,
        response: response,
        profileName: profile.name,
        conversationCount: profile.conversationCount,
        mood: mood,
        suggestions: this.generateSuggestions(mood)
      };
      
    } catch (error) {
      console.error('❌ Response generation failed:', error);
      return {
        success: false,
        error: 'Could not generate reflection',
        fallbackResponse: this.getFallbackResponse(mood || 'neutral')
      };
    }
  }

  async callOpenRouterAPI(prompt) {
    try {
      const response = await fetch(`${this.openRouterConfig.baseURL}/chat/completions`, {
        method: 'POST',
        headers: this.openRouterConfig.headers,
        body: JSON.stringify({
          model: this.openRouterConfig.model,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 500,
          temperature: 0.7,
          top_p: 1,
          frequency_penalty: 0,
          presence_penalty: 0
        })
      });

      if (!response.ok) {
        throw new Error(`OpenRouter API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.choices && data.choices[0] && data.choices[0].message) {
        return data.choices[0].message.content.trim();
      } else {
        throw new Error('Invalid response format from OpenRouter API');
      }
    } catch (error) {
      console.error('OpenRouter API call failed:', error);
      throw error;
    }
  }

  buildReflectionPrompt(profile, message, mood, conversations) {
    const recentHistory = conversations.slice(-6).map(conv => 
      `User: ${conv.user}\nReflection: ${conv.ai}`
    ).join('\n\n');
    
    return `You are "${profile.name}" - an AI reflection and inner wisdom guide for this person.

PERSONALITY PROFILE:
- Traits: ${profile.personalityTraits.join(', ')}
- Communication Style: ${profile.communicationStyle}
- Interests: ${profile.interests.join(', ')}
- Support Style: ${profile.supportStyle}
- Goals: ${profile.goals.join(', ')}

CONTEXT:
- Current mood detected: ${mood}
- Writing sample: "${profile.writingSample.substring(0, 200)}..."

RECENT CONVERSATION:
${recentHistory}

CURRENT MESSAGE: "${message}"

INSTRUCTIONS:
Respond as their wise inner voice with 2-4 sentences. Be supportive, insightful, and personalized to their profile. Match their communication style while offering gentle guidance and reflection. Focus on their growth and wellbeing.

Response:`;
  }

  detectMood(message) {
    const msg = message.toLowerCase();
    const moodMap = {
      sad: ['sad', 'down', 'depressed', 'lonely', 'empty', 'blue'],
      frustrated: ['angry', 'frustrated', 'mad', 'annoyed', 'irritated', 'upset'],
      happy: ['happy', 'excited', 'great', 'amazing', 'wonderful', 'fantastic', 'joy'],
      anxious: ['worried', 'anxious', 'stress', 'nervous', 'scared', 'overwhelmed'],
      uncertain: ['confused', 'lost', 'unsure', "don't know", 'unclear', 'stuck'],
      grateful: ['grateful', 'thankful', 'blessed', 'appreciate', 'lucky'],
      motivated: ['motivated', 'inspired', 'determined', 'focused', 'driven']
    };

    for (const [mood, keywords] of Object.entries(moodMap)) {
      if (keywords.some(keyword => msg.includes(keyword))) {
        return mood;
      }
    }
    return 'neutral';
  }

  performSafetyCheck(message, profile) {
    const msg = message.toLowerCase();
    let needsIntervention = false;
    let concernLevel = 'low';

    // Check for concerning keywords
    for (const keyword of this.wellnessKeywords.concerning) {
      if (msg.includes(keyword)) {
        needsIntervention = true;
        concernLevel = 'high';
        profile.safetyFlags.concerningMessages++;
        profile.safetyFlags.needsSupport = true;
        break;
      }
    }

    return { needsIntervention, concernLevel };
  }

  generateSupportResponse(profile, safetyCheck) {
    const supportResponses = [
      "I'm really concerned about what you've shared. Your feelings matter, and you don't have to go through this alone. Please consider reaching out to a mental health professional or a crisis helpline.",
      "What you're going through sounds incredibly difficult. Please know that help is available, and things can get better. Consider calling the 988 Suicide & Crisis Lifeline (dial 988) or text 'HELLO' to 741741.",
      "I hear your pain, and I want you to know that you matter. This feeling doesn't have to be permanent. Please reach out to someone who can help - a counselor, trusted friend, or crisis support line."
    ];

    return {
      success: true,
      response: supportResponses[Math.floor(Math.random() * supportResponses.length)],
      mood: 'concerning',
      suggestions: [
        "Tell me about your support system",
        "What helps you feel safe?",
        "Can you reach out to someone today?"
      ],
      needsSupport: true
    };
  }

  generateSuggestions(mood) {
    const suggestions = {
      sad: ["Tell me more about that feeling", "What would bring you comfort?", "What's one small thing that might help?"],
      frustrated: ["What's the core of this frustration?", "How can we channel this energy?", "What would resolution look like?"],
      happy: ["What made this moment special?", "How can you create more joy?", "What are you most grateful for?"],
      anxious: ["What feels manageable right now?", "Let's break this down together", "What would help you feel grounded?"],
      uncertain: ["What do you know for sure?", "What's your intuition telling you?", "What's one small next step?"],
      grateful: ["What else brings you joy?", "How can you share this feeling?", "What are you looking forward to?"],
      motivated: ["What's driving this energy?", "How will you maintain this momentum?", "What's your next goal?"]
    };
    return suggestions[mood] || ["What's your inner wisdom telling you?", "Tell me more about that", "How are you feeling about this?"];
  }

  generateFallbackResponse(profile, message, mood) {
    const moodResponses = {
      sad: `I can sense the heaviness in your words. Remember, ${profile.name} believes in your strength, even when it's hard to see.`,
      frustrated: `That frustration sounds intense. Your ${profile.name} knows you have the wisdom to work through this challenge.`,
      happy: `I can feel the joy in your message! Your ${profile.name} celebrates these bright moments with you.`,
      anxious: `Those worries feel big right now. Let your ${profile.name} remind you that you've overcome difficulties before.`,
      neutral: `I hear you, and your ${profile.name} is here to listen and reflect with you on whatever you're experiencing.`
    };
    
    return moodResponses[mood] || moodResponses.neutral;
  }

  getFallbackResponse(mood) {
    const fallbacks = {
      sad: "I'm here with you in this difficult moment. Your feelings are valid, and you don't have to face this alone.",
      frustrated: "That frustration is real and understandable. Sometimes taking a breath can help us see new possibilities.",
      happy: "I love seeing this joy in you! These positive moments are treasures to hold onto.",
      anxious: "Those anxious feelings are tough to carry. Remember that you have inner strength, even when it doesn't feel that way.",
      neutral: "I'm here with you, ready to listen and reflect together on whatever is on your mind."
    };
    return fallbacks[mood] || fallbacks.neutral;
  }

  // Helper methods for profile extraction
  extractTraits(userData) {
    const traits = userData.personalityTraits || userData.responses?.personality_traits;
    if (Array.isArray(traits)) return traits;
    return ['thoughtful', 'growth-oriented'];
  }

  analyzeCommunicationStyle(userData) {
    const style = userData.communicationStyle || userData.responses?.communication_style;
    return style || 'warm and encouraging';
  }

  extractInterests(userData) {
    const interests = userData.interests || userData.responses?.interests;
    if (typeof interests === 'string') {
      return interests.split(',').map(i => i.trim()).filter(i => i.length > 0);
    }
    if (Array.isArray(interests)) return interests;
    return ['personal growth', 'wellbeing'];
  }

  extractGoals(userData) {
    const goals = userData.goals || userData.responses?.goals;
    if (typeof goals === 'string') {
      return goals.split(',').map(g => g.trim()).filter(g => g.length > 0);
    }
    if (Array.isArray(goals)) return goals;
    return ['continuous improvement'];
  }

  // Admin methods
  getUserProfile(profileId) {
    return this.userProfiles.get(profileId);
  }

  getAllProfiles() {
    return Array.from(this.userProfiles.values()).map(profile => ({
      id: profile.id,
      name: profile.name,
      createdAt: profile.createdAt,
      conversationCount: profile.conversationCount,
      traits: profile.personalityTraits
    }));
  }
}

module.exports = AIReflectionService;
