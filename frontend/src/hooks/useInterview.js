import { useState } from 'react';

const API_BASE = "http://localhost:5000/api";

export function useInterview() {
  const [sessionId, setSessionId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState(null);
  // ✅ ADD: Track interview configuration
  const [interviewConfig, setInterviewConfig] = useState(null);

  // ✅ ENHANCED: startInterview with questionCount parameter
  const startInterview = async (interviewType, questionCount = 5) => {
    setIsLoading(true);
    try {
      console.log(`🎤 Starting ${interviewType} interview with ${questionCount} questions`);
      
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/interview/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        // ✅ ENHANCEMENT: Include questionCount in request
        body: JSON.stringify({ interviewType, questionCount })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || 'Failed to start interview');
      }
      
      const data = await response.json();
      
      // ✅ ENHANCEMENT: Store interview configuration
      setInterviewConfig({
        interviewType: data.interviewType,
        questionCount: data.questionCount,
        startTime: new Date()
      });
      
      setSessionId(data.sessionId);
      setQuestions(data.questions);
      setCurrentQuestionIndex(0);
      setResponses({});
      setResults(null);
      
      console.log(`✅ Interview started: ${data.questionCount} questions loaded`);
      
    } catch (error) {
      console.error('❌ Failed to start interview:', error);
      // ✅ ENHANCEMENT: Better error handling
      alert(`Failed to start interview: ${error.message}`);
    }
    setIsLoading(false);
  };

  // ✅ KEEP EXISTING: submitResponse function (no changes)
  const submitResponse = async (response, timeSpent) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_BASE}/interview/response`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          sessionId,
          questionIndex: currentQuestionIndex,
          response,
          timeSpent
        })
      });
      
      setResponses(prev => ({
        ...prev,
        [currentQuestionIndex]: response
      }));
    } catch (error) {
      console.error('Failed to submit response:', error);
    }
  };

  // ✅ KEEP EXISTING: nextQuestion function (no changes)
  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  // ✅ ENHANCED: completeInterview with better logging
  // In src/hooks/useInterview.js
  const completeInterview = async (emotionSummary = null) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/interview/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          sessionId,
          emotionSummary // ✅ Pass emotion data
        })
      });

      const data = await response.json();
      setResults(data);
      console.log('✅ Interview completed with results:', data);
    } catch (error) {
      console.error('❌ Complete interview error:', error);
      alert('Failed to complete interview');
    } finally {
      setIsLoading(false);
    }
  };
  

  // ✅ ENHANCEMENT: Add reset function
  const resetInterview = () => {
    setSessionId(null);
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setResponses({});
    setResults(null);
    setInterviewConfig(null);
    setIsLoading(false);
  };

  const [answerMode, setAnswerMode] = useState('text'); // 'text' or 'audio'


  // hooks/useInterview.js - ADD audio submission
  const submitAudioResponse = async (audioBlob, questionIndex, recordingTime) => {
    try {
      const token = localStorage.getItem('token');
      
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('audio', audioBlob, 'answer.webm');
      formData.append('sessionId', sessionId);
      formData.append('questionIndex', questionIndex);
      formData.append('recordingTime', recordingTime);

      console.log('🎤 Uploading audio...');

      const response = await fetch(`${API_BASE}/interview/audio-response`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
          // Don't set Content-Type - browser sets it with boundary
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Audio upload failed');
      }

      const data = await response.json();
      
      console.log('✅ Audio uploaded:', data);
      
      // Store transcription locally
      setResponses(prev => ({
        ...prev,
        [questionIndex]: data.transcription
      }));

      return data;

    } catch (error) {
      console.error('Audio submission failed:', error);
      throw error;
    }
  };

  return {
    // Existing state
    sessionId,
    questions,
    currentQuestionIndex,
    responses,
    results,
    isLoading,
    
    // ✅ NEW: Interview configuration
    interviewConfig,
    
    // Functions  
    startInterview,
    submitResponse,
    nextQuestion,
    completeInterview,
    
    // ✅ NEW: Reset function
    resetInterview,
    submitAudioResponse,
    
    // Answer mode state
    answerMode,
    setAnswerMode,
    
    // Computed values
    currentQuestion: questions[currentQuestionIndex],
    isLastQuestion: currentQuestionIndex === questions.length - 1,
    progress: questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0
  };
}