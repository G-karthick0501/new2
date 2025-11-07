import { useState } from 'react';
import QuestionDisplay from './QuestionDisplay';
import ResponseInput from './ResponseInput';
import WebcamRecorder from './WebcamRecorder';

export default function InterviewSession({ interview, onComplete }) {
  const [isRecording, setIsRecording] = useState(true);
  
  // Store emotion data per question
  const [emotionDataPerQuestion, setEmotionDataPerQuestion] = useState({});

  const {
    currentQuestion,
    currentQuestionIndex,
    questions,
    responses,
    isLastQuestion,
    progress,
    isLoading,
    sessionId
  } = interview;

  // Handle emotion data from webcam
  const handleEmotionData = (emotionRecord) => {
    setEmotionDataPerQuestion(prev => ({
      ...prev,
      [currentQuestionIndex]: [
        ...(prev[currentQuestionIndex] || []),
        emotionRecord
      ]
    }));
  };

  // Calculate stats for a question
  const calculateQuestionStats = (emotionArray) => {
    if (!emotionArray || emotionArray.length === 0) {
      return null;
    }

    // Count emotions
    const emotionCounts = {};
    emotionArray.forEach(item => {
      emotionCounts[item.emotion] = (emotionCounts[item.emotion] || 0) + 1;
    });

    // Top 3 emotions
    const top3 = Object.entries(emotionCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([emotion, count]) => ({
        emotion,
        percentage: Math.round((count / emotionArray.length) * 100)
      }));

    // Mean confidence
    const meanConfidence = emotionArray.reduce((sum, item) => 
      sum + item.confidence, 0
    ) / emotionArray.length;

    // Median confidence
    const confidences = emotionArray.map(item => item.confidence).sort((a, b) => a - b);
    const median = confidences[Math.floor(confidences.length / 2)];

    // Mode emotion (most frequent)
    const mode = Object.entries(emotionCounts)
      .sort((a, b) => b[1] - a[1])[0][0];

    return {
      question_index: currentQuestionIndex,
      total_frames: emotionArray.length,
      dominant_emotion: top3[0].emotion,
      top_3_emotions: top3,
      stats: {
        mean_confidence: Math.round(meanConfidence * 10) / 10,
        median_confidence: Math.round(median * 10) / 10,
        mode_emotion: mode
      },
      emotion_distribution: emotionCounts
    };
  };

  // Save question emotion summary to backend
  const saveQuestionEmotionSummary = async (questionIndex, summary) => {
    if (!summary) return;

    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:5000/api/interview/${sessionId}/question/${questionIndex}/emotion-summary`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ summary })
      });
      console.log(`✅ Saved emotion summary for question ${questionIndex}`);
    } catch (err) {
      console.warn('Failed to save question emotion summary:', err);
    }
  };

  const handleResponseSubmit = async (response, timeSpent) => {
    // Calculate and save emotion stats for current question
    const currentQuestionEmotions = emotionDataPerQuestion[currentQuestionIndex] || [];
    const questionStats = calculateQuestionStats(currentQuestionEmotions);
    
    if (questionStats) {
      await saveQuestionEmotionSummary(currentQuestionIndex, questionStats);
    }

    // Submit the answer
    await interview.submitResponse(response, timeSpent);

    if (isLastQuestion) {
      setIsRecording(false);
      
      // Calculate overall summary
      await saveOverallEmotionSummary();
      
      onComplete();
    } else {
      interview.nextQuestion();
    }
  };

  // Calculate and save overall emotion summary
  const saveOverallEmotionSummary = async () => {
    try {
      // Flatten all emotion data
      const allEmotions = Object.values(emotionDataPerQuestion).flat();
      
      if (allEmotions.length === 0) return;

      // Overall emotion counts
      const emotionCounts = {};
      allEmotions.forEach(item => {
        emotionCounts[item.emotion] = (emotionCounts[item.emotion] || 0) + 1;
      });

      // Top 3 overall
      const top3 = Object.entries(emotionCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([emotion, count]) => ({
          emotion,
          percentage: Math.round((count / allEmotions.length) * 100)
        }));

      // Overall stats
      const confidences = allEmotions.map(item => item.confidence);
      const meanConfidence = confidences.reduce((a, b) => a + b, 0) / confidences.length;
      const sortedConfidences = [...confidences].sort((a, b) => a - b);
      const median = sortedConfidences[Math.floor(sortedConfidences.length / 2)];
      const mode = Object.entries(emotionCounts)
        .sort((a, b) => b[1] - a[1])[0][0];

      const overallSummary = {
        total_frames_captured: allEmotions.length,
        total_questions: questions.length,
        top_3_emotions: top3,
        stats: {
          mean_confidence: Math.round(meanConfidence * 10) / 10,
          median_confidence: Math.round(median * 10) / 10,
          mode_emotion: mode
        }
      };

      // Send to backend
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:5000/api/interview/${sessionId}/emotion-summary`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ overall_summary: overallSummary })
      });

      console.log('✅ Saved overall emotion summary');

    } catch (err) {
      console.warn('Failed to save overall summary:', err);
    }
  };

  if (!currentQuestion) {
    return <div>Loading question...</div>;
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: 20 }}>
      <WebcamRecorder 
        isRecording={isRecording}
        onEmotionData={handleEmotionData}
      />

      {/* Progress Bar */}
      <div style={{ marginBottom: 30 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 14, fontWeight: 'bold' }}>Interview Progress</span>
          <span style={{ fontSize: 14, color: '#666' }}>{Math.round(progress)}% Complete</span>
        </div>
        <div style={{ width: '100%', height: 8, backgroundColor: '#e9ecef', borderRadius: 4, overflow: 'hidden' }}>
          <div style={{ width: `${progress}%`, height: '100%', backgroundColor: '#007bff', transition: 'width 0.3s ease' }} />
        </div>
      </div>

      <QuestionDisplay
        question={currentQuestion}
        questionNumber={currentQuestionIndex + 1}
        totalQuestions={questions.length}
      />

      <ResponseInput
        currentResponse={responses[currentQuestionIndex] || ''}
        onResponseChange={() => {}}
        onSubmit={handleResponseSubmit}
        isLastQuestion={isLastQuestion}
        isLoading={isLoading}
        questionIndex={currentQuestionIndex}
      />

      {/* Show frame count for current question */}
      {emotionDataPerQuestion[currentQuestionIndex]?.length > 0 && (
        <div style={{
          marginTop: 15,
          padding: 10,
          backgroundColor: '#f8f9fa',
          borderRadius: 5,
          fontSize: 12,
          color: '#666',
          textAlign: 'center'
        }}>
          📊 Emotion frames captured: {emotionDataPerQuestion[currentQuestionIndex].length}
        </div>
      )}
    </div>
  );
}