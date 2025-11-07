// frontend/src/components/candidate/MockInterview.jsx
import { useState } from 'react';
import { useInterview } from '../../hooks/useInterview';
import { useAudioRecorder } from '../../hooks/useAudioRecorder';
import WebcamTest from '../test/WebcamTest';
// ===============================================
// InterviewResults Component
// ===============================================
function InterviewResults({ results }) {
  if (!results) return null;

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

      {/* Summary */}
      <div style={{
        padding: 20,
        backgroundColor: '#f8f9fa',
        borderRadius: 8,
        marginBottom: 20
      }}>
        <p style={{ fontSize: 18, margin: 0 }}>
          📊 You answered <strong>{results.questionsAnswered}</strong> out of <strong>{results.totalQuestions}</strong> questions
        </p>
        {results.hasAiAnalysis && (
          <p style={{ color: '#28a745', marginTop: 10, fontWeight: 'bold' }}>
            ✅ AI Analysis Complete
          </p>
        )}
      </div>

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

  // Start interview
  const handleStart = async (type, count) => {
    await startInterview(type, count);
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
      }
    } catch (error) {
      alert('Failed to submit audio. Please try again.');
    }
    
    setIsSubmitting(false);
  };

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
            {isSubmitting ? '⏳ Submitting...' : isLastQuestion ? '✅ Submit Final Answer' : '➡️ Next Question'}
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
                  {isSubmitting ? '⏳ Processing...' : '📤 Submit Audio Answer'}
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

      {/* Complete Interview Button */}
      {isLastQuestion && (
        <button
          onClick={completeInterview}
          disabled={isLoading}
          style={{
            marginTop: 20,
            padding: '15px 40px',
            backgroundColor: '#6f42c1',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            fontSize: 18,
            cursor: isLoading ? 'not-allowed' : 'pointer',
            opacity: isLoading ? 0.6 : 1
          }}
        >
          {isLoading ? '⏳ Analyzing...' : '🏁 Complete Interview'}
        </button>
      )}
    </div>
  );
}

// Add pulse animation for recording indicator
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.1); }
    }
  `;
  if (!document.querySelector('style[data-animation="pulse"]')) {
    style.setAttribute('data-animation', 'pulse');
    document.head.appendChild(style);
  }
}