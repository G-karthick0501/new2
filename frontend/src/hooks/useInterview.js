// frontend/src/hooks/useInterview.js
import { useState } from 'react';

const API_BASE = "http://localhost:5000/api";

export function useInterview() {
  const [sessionId, setSessionId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState(null);

  const startInterview = async (interviewType) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/interview/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ interviewType })
      });
      
      const data = await response.json();
      setSessionId(data.sessionId);
      setQuestions(data.questions);
      setCurrentQuestionIndex(0);
      setResponses({});
      setResults(null);
    } catch (error) {
      console.error('Failed to start interview:', error);
    }
    setIsLoading(false);
  };

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

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const completeInterview = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/interview/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ sessionId })
      });
      
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error('Failed to complete interview:', error);
    }
    setIsLoading(false);
  };

  return {
    sessionId,
    questions,
    currentQuestionIndex,
    responses,
    results,
    isLoading,
    startInterview,
    submitResponse,
    nextQuestion,
    completeInterview,
    currentQuestion: questions[currentQuestionIndex],
    isLastQuestion: currentQuestionIndex === questions.length - 1,
    progress: questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0
  };
}