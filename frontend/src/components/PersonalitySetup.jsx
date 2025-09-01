import React, { useState } from 'react';
import './PersonalitySetup.css';

const PersonalitySetup = ({ onComplete, onError, isLoading, setIsLoading }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState({});

  const steps = [
    {
      id: 'name',
      title: 'What should we call your AI reflection?',
      subtitle: 'Choose a name for your digital mirror',
      type: 'text',
      placeholder: 'My Better Self, Inner Wisdom, Future Me...',
      icon: '🎭'
    },
    {
      id: 'personality_traits',
      title: 'Which traits best describe you?',
      subtitle: 'Select all that resonate with who you are',
      type: 'multiple',
      icon: '✨',
      options: [
        'Thoughtful', 'Creative', 'Analytical', 'Empathetic', 
        'Optimistic', 'Practical', 'Adventurous', 'Calm',
        'Ambitious', 'Supportive', 'Independent', 'Intuitive'
      ]
    },
    {
      id: 'communication_style',
      title: 'How do you prefer to communicate?',
      subtitle: 'Your reflection will mirror your style',
      type: 'choice',
      icon: '💬',
      options: [
        'Direct and straightforward',
        'Warm and encouraging', 
        'Thoughtful and measured',
        'Detailed and expressive',
        'Casual and friendly'
      ]
    },
    {
      id: 'interests',
      title: 'What are you passionate about?',
      subtitle: 'Help your reflection understand what matters to you',
      type: 'text',
      placeholder: 'Personal growth, technology, creativity, relationships, fitness...',
      icon: '🎯'
    },
    {
      id: 'support_style',
      title: 'When you need support, you prefer:',
      subtitle: 'This shapes how your reflection will help you',
      type: 'choice',
      icon: '🤗',
      options: [
        'Empathetic listener who validates feelings',
        'Gentle guide who asks thoughtful questions',
        'Direct advisor who offers clear perspectives', 
        'Motivational coach who encourages action'
      ]
    },
    {
      id: 'goals',
      title: 'What are you working towards?',
      subtitle: 'Your reflection will help keep these in focus',
      type: 'text',
      placeholder: 'Build better habits, grow professionally, improve relationships...',
      icon: '🎪'
    },
    {
      id: 'writing_sample',
      title: 'Share something on your mind',
      subtitle: 'This helps your reflection learn your unique voice',
      type: 'textarea',
      placeholder: 'Write about your day, a challenge you\'re facing, or something you\'re excited about...',
      icon: '📝'
    }
  ];

  const currentStepData = steps[currentStep];

  const handleNext = async () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      await createProfile();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const createProfile = async () => {
    setIsLoading(true);
    
    try {
      console.log('🎭 Creating AI reflection profile...');
      
      // Process responses
      const profileData = {
        name: responses.name,
        personalityTraits: responses.personality_traits || [],
        communicationStyle: responses.communication_style,
        interests: responses.interests ? responses.interests.split(',').map(i => i.trim()) : [],
        supportStyle: responses.support_style,
        goals: responses.goals ? responses.goals.split(',').map(g => g.trim()) : [],
        writingSample: responses.writing_sample,
        responses: responses // Keep raw responses for analysis
      };

      console.log('📝 Sending profile data:', profileData);

      const response = await fetch('/api/ai-reflection/create-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData)
      });

      const result = await response.json();
      console.log('📋 Server response:', result);

      if (result.success) {
        console.log('✅ Profile creation successful');
        onComplete(result.profile);
      } else {
        throw new Error(result.error || 'Failed to create profile');
      }
    } catch (error) {
      console.error('❌ Profile creation error:', error);
      onError('Failed to create your AI reflection. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const isStepComplete = () => {
    const response = responses[currentStepData.id];
    if (currentStepData.type === 'multiple') {
      return response && response.length > 0;
    }
    return response && response.trim().length > 0;
  };

  const updateResponse = (value) => {
    setResponses({
      ...responses,
      [currentStepData.id]: value
    });
  };

  return (
    <div className="personality-setup">
      <div className="setup-container">
        <div className="progress-section">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
          <p className="progress-text">
            Step {currentStep + 1} of {steps.length}
          </p>
        </div>

        <div className="step-content">
          <div className="step-icon">{currentStepData.icon}</div>
          <h1 className="step-title">{currentStepData.title}</h1>
          <p className="step-subtitle">{currentStepData.subtitle}</p>

          <div className="input-section">
            {currentStepData.type === 'text' && (
              <input
                type="text"
                placeholder={currentStepData.placeholder}
                value={responses[currentStepData.id] || ''}
                onChange={(e) => updateResponse(e.target.value)}
                className="text-input"
                maxLength={100}
                autoFocus
              />
            )}

            {currentStepData.type === 'textarea' && (
              <textarea
                placeholder={currentStepData.placeholder}
                value={responses[currentStepData.id] || ''}
                onChange={(e) => updateResponse(e.target.value)}
                className="textarea-input"
                rows={4}
                maxLength={500}
                autoFocus
              />
            )}

            {currentStepData.type === 'choice' && (
              <div className="choice-grid">
                {currentStepData.options.map((option, index) => (
                  <button
                    key={index}
                    className={`choice-button ${responses[currentStepData.id] === option ? 'selected' : ''}`}
                    onClick={() => updateResponse(option)}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}

            {currentStepData.type === 'multiple' && (
              <div className="multiple-choice-grid">
                {currentStepData.options.map((option, index) => (
                  <label key={index} className="checkbox-item">
                    <input
                      type="checkbox"
                      checked={(responses[currentStepData.id] || []).includes(option)}
                      onChange={(e) => {
                        const current = responses[currentStepData.id] || [];
                        if (e.target.checked) {
                          updateResponse([...current, option]);
                        } else {
                          updateResponse(current.filter(item => item !== option));
                        }
                      }}
                    />
                    <span className="checkmark"></span>
                    <span className="option-text">{option}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="button-section">
            {currentStep > 0 && (
              <button 
                className="back-button"
                onClick={handlePrevious}
                disabled={isLoading}
              >
                ← Back
              </button>
            )}
            
            <button 
              className="next-button"
              onClick={handleNext}
              disabled={!isStepComplete() || isLoading}
            >
              {isLoading ? (
                <>
                  <div className="spinner"></div>
                  Creating Your Reflection...
                </>
              ) : currentStep === steps.length - 1 ? (
                <>
                  🎭 Create My Reflection
                </>
              ) : (
                <>
                  Continue →
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalitySetup;
