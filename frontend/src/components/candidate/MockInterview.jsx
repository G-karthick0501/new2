// frontend/src/components/candidate/MockInterview.jsx
import { useState } from 'react';
import { useInterview } from '../../hooks/useInterview';
import { useAudioRecorder } from '../../hooks/useAudioRecorder';
import WebcamTest from '../test/WebcamTest';
import WebcamRecorder from '../interview/WebcamRecorder'; 
// ===============================================
// InterviewResults Component
// ===============================================
// ===============================================
// InterviewResults Component - WITH EMOTION SUPPORT
// ===============================================
function InterviewResults({ results }) {
  if (!results) return null;

  console.log('📊 Rendering results with emotion data:', results.emotionSummary); // Debug

  return (
    <div style={{ padding: 20, maxWidth: 900, margin: '0 auto' }}>
      <h2>🎉 Interview Complete!</h2>
      
      {/* Overall Score */}
      <div style={{
        padding: 30,
        backgroundColor: '#28a745',
        color: 'white',
        borderRadius: 10,
        textAlign: 'center',
        marginBottom: 30
      }}>
        <h1 style={{ fontSize: 48, margin: 0 }}>{results.score}%</h1>
        <p style={{ fontSize: 20, margin: '10px 0 0 0' }}>
          {results.score >= 80 ? 'Excellent!' : results.score >= 60 ? 'Good Job!' : 'Keep Practicing!'}
        </p>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'flex', gap: 15, marginBottom: 30 }}>
        {/* Questions Summary */}
        <div style={{
          flex: 1,
          padding: 20,
          backgroundColor: '#e7f3ff',
          borderRadius: 8,
          border: '2px solid #007bff'
        }}>
          <h4 style={{ marginTop: 0 }}>📊 Questions</h4>
          <p style={{ fontSize: 24, fontWeight: 'bold', margin: '10px 0' }}>
            {results.questionsAnswered} / {results.totalQuestions}
          </p>
          <p style={{ fontSize: 14, color: '#666', margin: 0 }}>Answered</p>
        </div>

        {/* ✅ EMOTION SUMMARY CARD */}
        {results.emotionSummary && results.emotionSummary.top_3_emotions && (
          <div style={{
            flex: 1,
            padding: 20,
            backgroundColor: '#fff3cd',
            borderRadius: 8,
            border: '2px solid #ffc107'
          }}>
            <h4 style={{ marginTop: 0 }}>🎭 Emotion Analysis</h4>
            <p style={{ fontSize: 24, fontWeight: 'bold', margin: '10px 0', textTransform: 'capitalize' }}>
              {results.emotionSummary.top_3_emotions[0]?.emotion || 'neutral'}
            </p>
            <p style={{ fontSize: 14, color: '#666', margin: 0 }}>
              {results.emotionSummary.total_frames || 0} frames captured
            </p>
          </div>
        )}

        {/* AI Analysis Status */}
        <div style={{
          flex: 1,
          padding: 20,
          backgroundColor: results.hasAiAnalysis ? '#d4edda' : '#f8d7da',
          borderRadius: 8,
          border: `2px solid ${results.hasAiAnalysis ? '#28a745' : '#dc3545'}`
        }}>
          <h4 style={{ marginTop: 0 }}>🤖 AI Analysis</h4>
          <p style={{ fontSize: 24, fontWeight: 'bold', margin: '10px 0' }}>
            {results.hasAiAnalysis ? '✅' : '❌'}
          </p>
          <p style={{ fontSize: 14, color: '#666', margin: 0 }}>
            {results.hasAiAnalysis ? 'Complete' : 'Unavailable'}
          </p>
        </div>
      </div>

      {/* ✅ DETAILED EMOTION BREAKDOWN */}
      {results.emotionSummary?.top_3_emotions && results.emotionSummary.top_3_emotions.length > 0 && (
        <div style={{
          padding: 20,
          backgroundColor: '#f8f9fa',
          borderRadius: 8,
          marginBottom: 20
        }}>
          <h3>🎭 Emotion Breakdown</h3>
          <div style={{ display: 'flex', gap: 15 }}>
            {results.emotionSummary.top_3_emotions.map((item, idx) => (
              <div key={idx} style={{
                flex: 1,
                padding: 15,
                backgroundColor: '#fff',
                borderRadius: 5,
                textAlign: 'center',
                border: '1px solid #ddd'
              }}>
                <div style={{ fontSize: 32, marginBottom: 10 }}>
                  {getEmotionEmoji(item.emotion)}
                </div>
                <div style={{ fontWeight: 'bold', textTransform: 'capitalize', marginBottom: 5 }}>
                  {item.emotion}
                </div>
                <div style={{ fontSize: 20, color: '#007bff', fontWeight: 'bold' }}>
                  {item.percentage}%
                </div>
              </div>
            ))}
          </div>
          <p style={{ marginTop: 15, fontSize: 13, color: '#666', textAlign: 'center' }}>
            Analysis based on {results.emotionSummary.total_frames} video frames
          </p>
        </div>
      )}

      {/* Overall Feedback */}
      {results.feedback && results.feedback.length > 0 && (
        <div style={{ marginBottom: 30 }}>
          <h3>💡 Overall Feedback</h3>
          <ul>
            {results.feedback.map((item, idx) => (
              <li key={idx} style={{ marginBottom: 10 }}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Detailed Analysis per Question */}
      {results.detailedAnalysis && results.detailedAnalysis.length > 0 && (
        <div>
          <h3>📝 Detailed Question Analysis</h3>
          {results.detailedAnalysis.map((qa, idx) => (
            <details 
              key={idx}
              style={{
                padding: 15,
                marginBottom: 15,
                backgroundColor: '#fff',
                border: '1px solid #ddd',
                borderRadius: 8
              }}
            >
              <summary style={{ 
                cursor: 'pointer', 
                fontWeight: 'bold',
                fontSize: 16
              }}>
                Question {idx + 1}: {qa.questionText?.substring(0, 60)}...
              </summary>
              
              <div style={{ marginTop: 15 }}>
                {/* User's Answer */}
                <div style={{ marginBottom: 15 }}>
                  <strong>Your Answer:</strong>
                  <p style={{ 
                    padding: 10, 
                    backgroundColor: '#f8f9fa', 
                    borderRadius: 5,
                    marginTop: 5
                  }}>
                    {qa.userResponse}
                  </p>
                </div>

                {/* Strengths */}
                {qa.llmFeedback?.strengths?.length > 0 && (
                  <div style={{ marginBottom: 15 }}>
                    <strong style={{ color: '#28a745' }}>✅ Strengths:</strong>
                    <ul>
                      {qa.llmFeedback.strengths.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Improvement Tips */}
                {qa.llmFeedback?.improvement_tips?.length > 0 && (
                  <div>
                    <strong style={{ color: '#007bff' }}>💡 Tips:</strong>
                    <ul>
                      {qa.llmFeedback.improvement_tips.map((t, i) => (
                        <li key={i}>{t}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Metrics */}
                {qa.objective && (
                  <details style={{ marginTop: 10 }}>
                    <summary style={{ cursor: 'pointer', fontSize: 14, color: '#666' }}>
                      📊 View Metrics
                    </summary>
                    <div style={{ 
                      fontSize: 13, 
                      color: '#666',
                      marginTop: 10,
                      padding: 10,
                      backgroundColor: '#f8f9fa',
                      borderRadius: 5
                    }}>
                      <p>Word Count: {qa.objective.word_count}</p>
                      <p>Sentences: {qa.objective.sentence_count}</p>
                      <p>Relevance Score: {(qa.semantic?.relevance_score * 100).toFixed(1)}%</p>
                    </div>
                  </details>
                )}
              </div>
            </details>
          ))}
        </div>
      )}

      {/* Action Buttons */}
      <div style={{ 
        display: 'flex', 
        gap: 15, 
        justifyContent: 'center',
        marginTop: 30 
      }}>
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: '12px 30px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            fontSize: 16,
            cursor: 'pointer'
          }}
        >
          🔄 Practice Again
        </button>
        <button
          onClick={() => window.location.href = '/candidate-dashboard'}
          style={{
            padding: '12px 30px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            fontSize: 16,
            cursor: 'pointer'
          }}
        >
          🏠 Back to Dashboard
        </button>
      </div>
    </div>
  );
}

// ✅ Helper function for emotion emojis
function getEmotionEmoji(emotion) {
  const map = {
    happy: '😊',
    sad: '😢',
    angry: '😠',
    surprise: '😲',
    fear: '😨',
    disgust: '🤢',
    neutral: '😐'
  };
  return map[emotion?.toLowerCase()] || '😐';
}

// ===============================================
// Main MockInterview Component
// ===============================================
export default function MockInterview() {
  

  const {
    sessionId,
    questions,
    currentQuestion,
    currentQuestionIndex,
    isLastQuestion,
    progress,
    results,
    isLoading,
    answerMode,
    setAnswerMode,
    startInterview,
    submitResponse,
    submitAudioResponse,
    nextQuestion,
    completeInterview
  } = useInterview();

  const {
    isRecording,
    audioBlob,
    audioURL,
    recordingTime,
    startRecording,
    stopRecording,
    resetRecording
  } = useAudioRecorder();

  const [textAnswer, setTextAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emotionDataPerQuestion, setEmotionDataPerQuestion] = useState({});
  const [isWebcamActive, setIsWebcamActive] = useState(false);

  const handleEmotionData = (emotionRecord) => {
    setEmotionDataPerQuestion(prev => ({
      ...prev,
      [currentQuestionIndex]: [
        ...(prev[currentQuestionIndex] || []),
        emotionRecord
      ]
    }));
  };

  // Start interview
  const handleStart = async (type, count) => {
    await startInterview(type, count);
    setIsWebcamActive(true);
  };

 // Submit text answer
const handleSubmitText = async () => {
  if (!textAnswer.trim()) return;
  setIsSubmitting(true);
  await submitResponse(textAnswer, 60);
  setTextAnswer('');
  setIsSubmitting(false);
  
  if (!isLastQuestion) {
    nextQuestion();
  } else {
    await handleCompleteInterview();
  }
};

// Submit audio answer
const handleSubmitAudio = async () => {
  if (!audioBlob) return;
  setIsSubmitting(true);
  
  try {
    await submitAudioResponse(audioBlob, currentQuestionIndex, recordingTime);
    resetRecording();
    
    if (!isLastQuestion) {
      nextQuestion();
    } else {
      await handleCompleteInterview();
    }
  } catch (error) {
    alert('Failed to submit audio. Please try again.');
  }
  
  setIsSubmitting(false);
};

// Complete interview handler with emotion data
// Complete interview handler with emotion data
const handleCompleteInterview = async () => {
  console.log('🏁 Completing interview with emotion data...');
  setIsWebcamActive(false);
  
  // ✅ Calculate emotion summary
  const emotionSummary = await calculateEmotionSummary();
  
  // ✅ Pass emotion data directly to completeInterview
  await completeInterview(emotionSummary);
};

// ✅ NEW: Calculate and return emotion summary (don't save yet)
const calculateEmotionSummary = async () => {
  try {
    console.log('📊 Calculating emotion summary...', emotionDataPerQuestion);
    
    const allEmotions = Object.values(emotionDataPerQuestion).flat();
    
    if (allEmotions.length === 0) {
      console.log('⚠️ No emotion data captured');
      return null;
    }

    const emotionCounts = {};
    allEmotions.forEach(item => {
      emotionCounts[item.emotion] = (emotionCounts[item.emotion] || 0) + 1;
    });

    const top3 = Object.entries(emotionCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([emotion, count]) => ({
        emotion,
        percentage: Math.round((count / allEmotions.length) * 100)
      }));

    const confidences = allEmotions.map(item => item.confidence);
    const meanConfidence = confidences.reduce((a, b) => a + b, 0) / confidences.length;
    const sortedConfidences = [...confidences].sort((a, b) => a - b);
    const median = sortedConfidences[Math.floor(sortedConfidences.length / 2)];

    const summary = {
      total_frames: allEmotions.length,
      total_questions: questions.length,
      top_3_emotions: top3,
      stats: {
        mean_confidence: Math.round(meanConfidence * 10) / 10,
        median_confidence: Math.round(median * 10) / 10,
        mode_emotion: top3[0].emotion
      },
      emotions_by_question: emotionDataPerQuestion
    };

    console.log('✅ Emotion summary calculated:', summary);
    return summary;
  } catch (err) {
    console.error('❌ Error calculating emotion summary:', err);
    return null;
  }
};

// ✅ REMOVE: saveEmotionData function (no longer needed)



// Show results if interview complete
if (results) {
  return <InterviewResults results={results} />;
}

// Show start screen if no session
if (!sessionId) {
  return (
    <div style={{ padding: 20, maxWidth: 600, margin: '0 auto' }}>
      <h2>🎤 Mock Interview</h2>
      <p>Choose interview type and number of questions:</p>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: 15, marginTop: 20 }}>
        <button 
          onClick={() => handleStart('technical', 3)}
          style={{
            padding: '15px 25px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            fontSize: 16,
            cursor: 'pointer'
          }}
        >
          💻 Technical Interview (3 Questions)
        </button>
        <button 
          onClick={() => handleStart('technical', 5)}
          style={{
            padding: '15px 25px',
            backgroundColor: '#0056b3',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            fontSize: 16,
            cursor: 'pointer'
          }}
        >
          💻 Technical Interview (5 Questions)
        </button>
        <button 
          onClick={() => handleStart('behavioral', 3)}
          style={{
            padding: '15px 25px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            fontSize: 16,
            cursor: 'pointer'
          }}
        >
          🗣️ Behavioral Interview (3 Questions)
        </button>
        <button 
          onClick={() => handleStart('behavioral', 5)}
          style={{
            padding: '15px 25px',
            backgroundColor: '#218838',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            fontSize: 16,
            cursor: 'pointer'
          }}
        >
          🗣️ Behavioral Interview (5 Questions)
        </button>
      </div>
    </div>
  );
}

// Main interview UI
return (
  <div style={{ padding: 20, maxWidth: 900, margin: '0 auto' }}>
    {isWebcamActive && (
      <WebcamRecorder 
        isRecording={isWebcamActive}
        onEmotionData={handleEmotionData}
      />
    )}

    {/* Progress bar */}
    <div style={{ marginBottom: 20 }}>
      <div style={{ 
        backgroundColor: '#e0e0e0', 
        borderRadius: 10, 
        height: 10 
      }}>
        <div style={{ 
          backgroundColor: '#007bff', 
          width: `${progress}%`, 
          height: '100%', 
          borderRadius: 10,
          transition: 'width 0.3s'
        }} />
      </div>
      <p style={{ textAlign: 'center', marginTop: 10 }}>
        Question {currentQuestionIndex + 1} of {questions.length}
      </p>
    </div>

    {/* Question */}
    <div style={{ 
      padding: 20, 
      backgroundColor: '#f8f9fa', 
      borderRadius: 8,
      marginBottom: 20 
    }}>
      <h3 style={{ marginBottom: 15 }}>
        Question {currentQuestionIndex + 1}
      </h3>
      <p style={{ fontSize: 18, lineHeight: 1.6 }}>
        {currentQuestion?.text}
      </p>
    </div>

    {/* Show emotion frame count */}
    {emotionDataPerQuestion[currentQuestionIndex]?.length > 0 && (
      <div style={{
        marginBottom: 15,
        padding: 10,
        backgroundColor: '#e7f3ff',
        borderRadius: 5,
        fontSize: 12,
        color: '#0066cc',
        textAlign: 'center'
      }}>
        📊 Emotion frames captured: {emotionDataPerQuestion[currentQuestionIndex].length}
      </div>
    )}

    {/* MODE TOGGLE */}
    <div style={{ 
      display: 'flex', 
      gap: 10, 
      marginBottom: 20,
      justifyContent: 'center' 
    }}>
      <button
        onClick={() => setAnswerMode('text')}
        style={{
          padding: '10px 20px',
          backgroundColor: answerMode === 'text' ? '#007bff' : '#e0e0e0',
          color: answerMode === 'text' ? 'white' : '#333',
          border: 'none',
          borderRadius: 8,
          cursor: 'pointer',
          fontWeight: answerMode === 'text' ? 'bold' : 'normal'
        }}
      >
        ⌨️ Type Answer
      </button>
      <button
        onClick={() => setAnswerMode('audio')}
        style={{
          padding: '10px 20px',
          backgroundColor: answerMode === 'audio' ? '#007bff' : '#e0e0e0',
          color: answerMode === 'audio' ? 'white' : '#333',
          border: 'none',
          borderRadius: 8,
          cursor: 'pointer',
          fontWeight: answerMode === 'audio' ? 'bold' : 'normal'
        }}
      >
        🎤 Record Answer
      </button>
    </div>

    {/* TEXT MODE */}
    {answerMode === 'text' && (
      <div>
        <textarea
          value={textAnswer}
          onChange={(e) => setTextAnswer(e.target.value)}
          placeholder="Type your answer here..."
          style={{
            width: '100%',
            minHeight: 200,
            padding: 15,
            fontSize: 16,
            borderRadius: 8,
            border: '2px solid #ddd',
            marginBottom: 15
          }}
        />
        <button
          onClick={handleSubmitText}
          disabled={!textAnswer.trim() || isSubmitting}
          style={{
            padding: '12px 30px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            fontSize: 16,
            cursor: !textAnswer.trim() || isSubmitting ? 'not-allowed' : 'pointer',
            opacity: !textAnswer.trim() || isSubmitting ? 0.6 : 1
          }}
        >
          {isSubmitting ? '⏳ Submitting...' : isLastQuestion ? '✅ Submit & Complete' : '➡️ Next Question'}
        </button>
      </div>
    )}

    {/* AUDIO MODE */}
    {answerMode === 'audio' && (
      <div style={{ 
        padding: 20, 
        border: '2px solid #007bff', 
        borderRadius: 8,
        backgroundColor: '#f0f8ff'
      }}>
        <h4 style={{ marginBottom: 15 }}>🎤 Audio Answer</h4>

        {!isRecording && !audioBlob && (
          <div style={{ textAlign: 'center' }}>
            <p style={{ marginBottom: 15, color: '#666' }}>
              Click the button below to start recording your answer
            </p>
            <button
              onClick={startRecording}
              style={{
                padding: '20px 40px',
                fontSize: 20,
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: 50,
                cursor: 'pointer',
                boxShadow: '0 4px 6px rgba(0,0,0,0.2)'
              }}
            >
              🔴 Start Recording
            </button>
          </div>
        )}

        {isRecording && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              fontSize: 48, 
              marginBottom: 20,
              animation: 'pulse 1.5s infinite'
            }}>
              🎤
            </div>
            <div style={{ fontSize: 32, marginBottom: 15, fontWeight: 'bold' }}>
              {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}
            </div>
            <p style={{ color: '#666', marginBottom: 20 }}>Recording in progress...</p>
            <button
              onClick={stopRecording}
              style={{
                padding: '15px 35px',
                fontSize: 18,
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: 8,
                cursor: 'pointer'
              }}
            >
              ⏹️ Stop Recording
            </button>
          </div>
        )}

        {audioBlob && (
          <div>
            <div style={{ 
              backgroundColor: 'white', 
              padding: 15, 
              borderRadius: 8,
              marginBottom: 15 
            }}>
              <p style={{ marginBottom: 10, fontWeight: 'bold' }}>
                ✅ Recording Complete ({recordingTime}s)
              </p>
              <audio controls src={audioURL} style={{ width: '100%' }} />
            </div>
            
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button
                onClick={handleSubmitAudio}
                disabled={isSubmitting}
                style={{
                  padding: '12px 25px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: 8,
                  fontSize: 16,
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  opacity: isSubmitting ? 0.6 : 1
                }}
              >
                {isSubmitting ? '⏳ Processing...' : isLastQuestion ? '✅ Submit & Complete' : '📤 Submit & Next'}
              </button>
              <button
                onClick={resetRecording}
                disabled={isSubmitting}
                style={{
                  padding: '12px 25px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: 8,
                  fontSize: 16,
                  cursor: isSubmitting ? 'not-allowed' : 'pointer'
                }}
              >
                🔄 Re-record
              </button>
            </div>
          </div>
        )}
      </div>
    )}

    {/* ❌ REMOVED: Separate complete button - now auto-completes after last answer */}
  </div>
  );
}