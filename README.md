# MyBetterSelf - AI-Powered Personal Development Platform

Welcome to **MyBetterSelf**, a sophisticated AI-powered personal development platform that creates personalized AI reflections - digital mirrors that understand your unique personality and provide tailored support, guidance, and meaningful conversations.

## 🎯 Project Overview

MyBetterSelf is designed to be your digital companion for personal growth. Through a 7-step personality profiling process, the platform creates an AI reflection that:

- Understands your unique communication style and personality traits
- Provides personalized support based on your preferences
- Offers mood-aware conversations and suggestions
- Includes built-in safety monitoring and wellness features
- Adapts its responses to your goals and interests

## 🏗️ Architecture

### Tech Stack
- **Frontend**: React 18 + Vite
- **Backend**: Node.js + Express
- **AI Engine**: Google Generative AI (Gemini) via OpenRouter
- **Styling**: Modern CSS with design system
- **Storage**: In-memory Maps (development) + LocalStorage (frontend)

### Project Structure
```
MyBetterSelf/
├── backend/
│   ├── server.js                 # Express server entry point
│   ├── services/
│   │   └── aiReflectionService.js # AI reflection logic
│   ├── env.template              # Environment template
│   ├── package.json
│   └── uploads/                  # File uploads (auto-created)
└── frontend/
    ├── src/
    │   ├── main.jsx              # React entry point
    │   ├── App.jsx               # Main app component
    │   ├── App.css               # Global styles
    │   ├── index.css             # Base styles
    │   └── components/
    │       ├── PersonalitySetup.jsx
    │       ├── PersonalitySetup.css
    │       ├── AIReflectionChat.jsx
    │       └── AIReflectionChat.css
    ├── public/
    ├── package.json
    └── vite.config.js
```

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ installed
- OpenRouter API key (supports Google AI models)

### Installation

1. **Install Backend Dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Install Frontend Dependencies**
   ```bash
   cd frontend
   npm install
   ```

3. **Set Up Environment Variables**
   ```bash
   cd backend
   cp env.template .env
   ```
   
   Edit `.env` and add your OpenRouter API key:
   ```
   GOOGLE_AI_KEY=sk-or-v1-your_openrouter_api_key_here
   ```

4. **Start the Development Servers**
   
   Backend (Terminal 1):
   ```bash
   cd backend
   npm run dev
   ```
   
   Frontend (Terminal 2):
   ```bash
   cd frontend
   npm run dev
   ```

5. **Open Your Browser**
   Navigate to `http://localhost:5173` to see the application!

## 🎭 Core Features

### 1. Personality Profiling (7 Steps)
- **Name**: Choose your AI reflection's name
- **Traits**: Select personality characteristics
- **Communication Style**: Pick your preferred interaction method
- **Interests**: Share what matters to you
- **Support Style**: Define how you prefer help
- **Goals**: Set your development objectives
- **Writing Sample**: Help AI learn your voice

### 2. AI Reflection Chat
- Real-time messaging with typing indicators
- Mood detection and visualization
- Personalized conversation suggestions
- Safety monitoring and crisis intervention
- Conversation history and pattern analysis

### 3. Safety & Wellness
- Automatic detection of concerning messages
- Crisis intervention responses
- Mental health resource suggestions
- Supportive fallback responses

## 📋 API Endpoints

### Health Check
```
GET /api/health
```

### AI Reflection
```
POST /api/ai-reflection/create-profile
POST /api/ai-reflection/chat
GET /api/ai-reflection/profile/:profileId
```

## 🎨 Design System

### Color Palette
- **Primary**: `#667eea` to `#764ba2` (gradient)
- **Success**: `#10b981`
- **Warning**: `#f59e0b`
- **Error**: `#dc2626`
- **Text**: `#1a202c` (dark), `#6b7280` (medium)

### Typography
- **Font Family**: 'Inter', system fonts
- **Weights**: 400 (normal), 500 (medium), 600 (semibold), 700 (bold)

## 🛡️ Security Features

- Environment variable protection for API keys
- Input sanitization and validation
- CORS configuration for secure API access
- Rate limiting (configurable)
- Crisis detection and intervention

## 🔧 Configuration

### Environment Variables
Copy `backend/env.template` to `backend/.env` and configure:

- `GOOGLE_AI_KEY`: Your OpenRouter API key (required)
- `PORT`: Backend server port (default: 4000)
- `NODE_ENV`: Environment (development/production)

### Vite Configuration
The frontend includes proxy configuration for API calls to the backend.

## 🧪 Testing the System

1. **Create a Profile**: Go through the 7-step personality setup
2. **Start Chatting**: Engage with your AI reflection
3. **Test Moods**: Try messages with different emotional tones
4. **Safety Features**: The system monitors for concerning content

## 🚧 Development

### Adding New Features
1. Backend: Add routes in `server.js` and logic in services
2. Frontend: Create components in `src/components/`
3. Styling: Use the CSS variables defined in `index.css`

### Code Style
- Use modern JavaScript/React patterns
- Follow the existing component structure
- Maintain consistent styling with design system
- Add proper error handling

## 🌟 Future Enhancements

### Phase 2
- Database integration (PostgreSQL)
- User authentication system
- Advanced analytics and insights
- Voice integration (speech-to-text)

### Phase 3
- Mobile app (React Native)
- Multi-language support
- Advanced AI models (GPT-4, Claude)
- Social features and community

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

## 🆘 Troubleshooting

### Common Issues

**Backend won't start**
- Check that you have a `.env` file with `GOOGLE_AI_KEY`
- Ensure Node.js 16+ is installed
- Run `npm install` in the backend directory

**Frontend connection errors**
- Make sure backend is running on port 4000
- Check that frontend is running on port 5173
- Verify CORS settings in backend

**AI responses not working**
- Verify your OpenRouter API key is valid
- Check the console for error messages
- Ensure you have internet connectivity

### Getting Help
- Check the console for error messages
- Review the server logs in the backend terminal
- Ensure all dependencies are installed

## 🎉 Success!

If everything is set up correctly, you should see:
- Backend: "🎭 AI Reflection System: Ready" in terminal
- Frontend: Beautiful homepage at `http://localhost:5173`
- Ability to create your AI reflection and start chatting

The system now supports OpenRouter API for accessing Google's Gemini Pro model with enhanced reliability and performance.

Enjoy your journey with MyBetterSelf! 🌟
