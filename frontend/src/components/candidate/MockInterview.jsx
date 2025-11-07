// frontend/src/components/candidate/MockInterview.jsx
import { useState, useEffect } from 'react';
import { useInterview } from '../../hooks/useInterview';
import { useAudioRecorder } from '../../hooks/useAudioRecorder';

// ===============================================
// InterviewResults Component
// ===============================================
function InterviewResults({ results }) {
  if (!results) return null;

  const getScoreColor = (score) => {
    if (score >= 80) return '#28a745';
    if (score >= 60) return '#ffc107';
    return '#dc3545';
  };

  const getScoreGrade = (score) => {
    if (score >= 90) return 'Outstanding! 🌟';
    if (score >= 80) return 'Excellent! 🎉';
    if (score >= 70) return 'Good Job! 👍';
    if (score >= 60) return 'Nice Try! 💪';
    return 'Keep Practicing! 📚';
  };

  return (
    <div style={{ padding: '40px 20px', maxWidth: 1000, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <h1 style={{ 
          fontSize: 42, 
          margin: 0, 
          marginBottom: 10,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          Interview Complete! 🎉
        </h1>
        <p style={{ fontSize: 16, color: '#666' }}>
          Here's your detailed performance analysis
        </p>
      </div>
      
      {/* Overall Score Card */}
      <div style={{
        padding: 40,
        background: `linear-gradient(135deg, ${getScoreColor(results.score)} 0%, ${getScoreColor(results.score)}dd 100%)`,
        color: 'white',
        borderRadius: 16,
        textAlign: 'center',
        marginBottom: 30,
        boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: 72, fontWeight: 'bold', marginBottom: 10 }}>
            {results.score}%
          </div>
          <div style={{ fontSize: 24, fontWeight: 500, opacity: 0.95 }}>
            {getScoreGrade(results.score)}
          </div>
        </div>
        {/* Background decoration */}
        <div style={{
          position: 'absolute',
          right: -20,
          bottom: -20,
          fontSize: 150,
          opacity: 0.15
        }}>
          🏆
        </div>
      </div>

      {/* Summary Stats Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: 20,
        marginBottom: 30
      }}>
        <div style={{
          padding: 25,
          background: 'white',
          borderRadius: 12,
          border: '2px solid #e9ecef',
          textAlign: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
        }}>
          <div style={{ fontSize: 36, marginBottom: 10 }}>📊</div>
          <div style={{ fontSize: 32, fontWeight: 'bold', color: '#007bff', marginBottom: 5 }}>
            {results.questionsAnswered}/{results.totalQuestions}
          </div>
          <div style={{ fontSize: 14, color: '#666' }}>Questions Answered</div>
        </div>

        <div style={{
          padding: 25,
          background: 'white',
          borderRadius: 12,
          border: '2px solid #e9ecef',
          textAlign: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
        }}>
          <div style={{ fontSize: 36, marginBottom: 10 }}>⏱️</div>
          <div style={{ fontSize: 32, fontWeight: 'bold', color: '#17a2b8', marginBottom: 5 }}>
            {Math.round(results.totalTime || 0)}s
          </div>
          <div style={{ fontSize: 14, color: '#666' }}>Average Time</div>
        </div>

        {results.hasAiAnalysis && (
          <div style={{
            padding: 25,
            background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
            borderRadius: 12,
            textAlign: 'center',
            color: 'white',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>🤖</div>
            <div style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 5 }}>
              AI Analysis
            </div>
            <div style={{ fontSize: 14, opacity: 0.9 }}>Complete ✓</div>
          </div>
        )}
      </div>

      {/* Overall Feedback */}
      {results.feedback && results.feedback.length > 0 && (
        <div style={{ 
          marginBottom: 30,
          padding: 25,
          background: 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)',
          borderRadius: 12,
          border: '2px solid #667eea30'
        }}>
          <h3 style={{ 
            fontSize: 20, 
            marginBottom: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 10
          }}>
            <span style={{ fontSize: 28 }}>💡</span>
            Overall Feedback
          </h3>
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            {results.feedback.map((item, idx) => (
              <li key={idx} style={{ 
                marginBottom: 12, 
                fontSize: 15, 
                lineHeight: 1.6,
                color: '#333'
              }}>
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Detailed Analysis per Question */}
      {results.detailedAnalysis && results.detailedAnalysis.length > 0 && (
        <div>
          <h3 style={{ 
            fontSize: 22, 
            marginBottom: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 10
          }}>
            <span style={{ fontSize: 28 }}>📝</span>
            Detailed Question Analysis
          </h3>
          {results.detailedAnalysis.map((qa, idx) => (
            <details 
              key={idx}
              style={{
                padding: 20,
                marginBottom: 20,
                backgroundColor: 'white',
                border: '2px solid #e9ecef',
                borderRadius: 12,
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.1)';
                e.currentTarget.style.borderColor = '#007bff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)';
                e.currentTarget.style.borderColor = '#e9ecef';
              }}
            >
              <summary style={{ 
                cursor: 'pointer', 
                fontWeight: 600,
                fontSize: 16,
                color: '#333',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: 5
              }}>
                <span style={{ 
                  background: '#007bff',
                  color: 'white',
                  borderRadius: '50%',
                  width: 32,
                  height: 32,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 14,
                  fontWeight: 'bold'
                }}>
                  {idx + 1}
                </span>
                <span>{qa.questionText?.substring(0, 80)}...</span>
              </summary>
              
              <div style={{ marginTop: 20 }}>
                {/* User's Answer */}
                <div style={{ marginBottom: 20 }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 8, 
                    marginBottom: 10,
                    fontWeight: 600,
                    color: '#495057'
                  }}>
                    <span style={{ fontSize: 20 }}>💬</span>
                    Your Answer:
                  </div>
                  <p style={{ 
                    padding: 15, 
                    backgroundColor: '#f8f9fa', 
                    borderRadius: 8,
                    marginTop: 0,
                    marginBottom: 0,
                    borderLeft: '4px solid #007bff',
                    lineHeight: 1.6,
                    fontSize: 15
                  }}>
                    {qa.userResponse}
                  </p>
                </div>

                {/* Strengths */}
                {qa.llmFeedback?.strengths?.length > 0 && (
                  <div style={{ 
                    marginBottom: 20,
                    padding: 15,
                    background: '#d4edda',
                    borderRadius: 8,
                    borderLeft: '4px solid #28a745'
                  }}>
                    <strong style={{ 
                      color: '#155724',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      marginBottom: 10,
                      fontSize: 16
                    }}>
                      <span style={{ fontSize: 20 }}>✅</span>
                      Strengths:
                    </strong>
                    <ul style={{ margin: 0, paddingLeft: 25 }}>
                      {qa.llmFeedback.strengths.map((s, i) => (
                        <li key={i} style={{ 
                          marginBottom: 6, 
                          color: '#155724',
                          lineHeight: 1.5 
                        }}>
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Improvement Tips */}
                {qa.llmFeedback?.improvement_tips?.length > 0 && (
                  <div style={{ 
                    marginBottom: 20,
                    padding: 15,
                    background: '#d1ecf1',
                    borderRadius: 8,
                    borderLeft: '4px solid #17a2b8'
                  }}>
                    <strong style={{ 
                      color: '#0c5460',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      marginBottom: 10,
                      fontSize: 16
                    }}>
                      <span style={{ fontSize: 20 }}>💡</span>
                      Improvement Tips:
                    </strong>
                    <ul style={{ margin: 0, paddingLeft: 25 }}>
                      {qa.llmFeedback.improvement_tips.map((t, i) => (
                        <li key={i} style={{ 
                          marginBottom: 6, 
                          color: '#0c5460',
                          lineHeight: 1.5 
                        }}>
                          {t}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Metrics */}
                {qa.objective && (
                  <details style={{ marginTop: 10 }}>
                    <summary style={{ 
                      cursor: 'pointer', 
                      fontSize: 14, 
                      color: '#666',
                      fontWeight: 600,
                      padding: 10,
                      background: '#f8f9fa',
                      borderRadius: 6
                    }}>
                      📊 View Detailed Metrics
                    </summary>
                    <div style={{ 
                      fontSize: 14, 
                      color: '#495057',
                      marginTop: 10,
                      padding: 15,
                      backgroundColor: '#fff',
                      borderRadius: 8,
                      border: '1px solid #dee2e6'
                    }}>
                      <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
                        gap: 15 
                      }}>
                        <div>
                          <div style={{ fontSize: 12, color: '#6c757d', marginBottom: 5 }}>Word Count</div>
                          <div style={{ fontSize: 20, fontWeight: 'bold', color: '#007bff' }}>
                            {qa.objective.word_count}
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: 12, color: '#6c757d', marginBottom: 5 }}>Sentences</div>
                          <div style={{ fontSize: 20, fontWeight: 'bold', color: '#28a745' }}>
                            {qa.objective.sentence_count}
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: 12, color: '#6c757d', marginBottom: 5 }}>Relevance</div>
                          <div style={{ fontSize: 20, fontWeight: 'bold', color: '#ffc107' }}>
                            {(qa.semantic?.relevance_score * 100).toFixed(1)}%
                          </div>
                        </div>
                      </div>
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
        marginTop: 40,
        flexWrap: 'wrap'
      }}>
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: '15px 35px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            borderRadius: 10,
            fontSize: 16,
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            gap: 10
          }}
          onMouseOver={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.5)';
          }}
          onMouseOut={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
          }}
        >
          <span style={{ fontSize: 20 }}>🔄</span>
          Practice Again
        </button>
        <button
          onClick={() => window.location.href = '/candidate-dashboard'}
          style={{
            padding: '15px 35px',
            background: 'white',
            color: '#333',
            border: '2px solid #dee2e6',
            borderRadius: 10,
            fontSize: 16,
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            gap: 10
          }}
          onMouseOver={(e) => {
            e.target.style.borderColor = '#007bff';
            e.target.style.color = '#007bff';
            e.target.style.transform = 'translateY(-2px)';
          }}
          onMouseOut={(e) => {
            e.target.style.borderColor = '#dee2e6';
            e.target.style.color = '#333';
            e.target.style.transform = 'translateY(0)';
          }}
        >
          <span style={{ fontSize: 20 }}>🏠</span>
          Back to Dashboard
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

  // Increment counter when user starts using interview feature
  useEffect(() => {
    if (sessionId && window.incrementFeatureCounter) {
      window.incrementFeatureCounter('interview');
    }
  }, [sessionId]);

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
      <div style={{ padding: '40px 20px', maxWidth: 700, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontSize: 64, marginBottom: 15 }}>🎤</div>
          <h1 style={{ 
            fontSize: 36, 
            margin: 0, 
            marginBottom: 10,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Mock Interview Practice
          </h1>
          <p style={{ fontSize: 16, color: '#666', lineHeight: 1.6 }}>
            Choose your interview type and number of questions to get started.<br/>
            Get AI-powered feedback on your responses!
          </p>
        </div>
        
        {/* Interview Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Technical Interviews Section */}
          <div>
            <h3 style={{ 
              fontSize: 18, 
              marginBottom: 15,
              color: '#495057',
              display: 'flex',
              alignItems: 'center',
              gap: 10
            }}>
              <span style={{ fontSize: 24 }}>💻</span>
              Technical Interviews
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <button 
                onClick={() => handleStart('technical', 3)}
                style={{
                  padding: '20px 30px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 12,
                  fontSize: 16,
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                  transition: 'all 0.3s ease',
                  textAlign: 'left',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
                onMouseOver={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)';
                }}
              >
                <div>
                  <div style={{ fontSize: 16, marginBottom: 5 }}>Quick Practice</div>
                  <div style={{ fontSize: 13, opacity: 0.9 }}>3 Technical Questions • ~10 mins</div>
                </div>
                <span style={{ fontSize: 24 }}>→</span>
              </button>
              
              <button 
                onClick={() => handleStart('technical', 5)}
                style={{
                  padding: '20px 30px',
                  background: 'linear-gradient(135deg, #4a5568 0%, #2d3748 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 12,
                  fontSize: 16,
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(74, 85, 104, 0.3)',
                  transition: 'all 0.3s ease',
                  textAlign: 'left',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
                onMouseOver={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 20px rgba(74, 85, 104, 0.4)';
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 12px rgba(74, 85, 104, 0.3)';
                }}
              >
                <div>
                  <div style={{ fontSize: 16, marginBottom: 5 }}>Full Practice</div>
                  <div style={{ fontSize: 13, opacity: 0.9 }}>5 Technical Questions • ~20 mins</div>
                </div>
                <span style={{ fontSize: 24 }}>→</span>
              </button>
            </div>
          </div>

          {/* Behavioral Interviews Section */}
          <div>
            <h3 style={{ 
              fontSize: 18, 
              marginBottom: 15,
              color: '#495057',
              display: 'flex',
              alignItems: 'center',
              gap: 10
            }}>
              <span style={{ fontSize: 24 }}>🗣️</span>
              Behavioral Interviews
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <button 
                onClick={() => handleStart('behavioral', 3)}
                style={{
                  padding: '20px 30px',
                  background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 12,
                  fontSize: 16,
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(40, 167, 69, 0.3)',
                  transition: 'all 0.3s ease',
                  textAlign: 'left',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
                onMouseOver={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 20px rgba(40, 167, 69, 0.4)';
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 12px rgba(40, 167, 69, 0.3)';
                }}
              >
                <div>
                  <div style={{ fontSize: 16, marginBottom: 5 }}>Quick Practice</div>
                  <div style={{ fontSize: 13, opacity: 0.9 }}>3 Behavioral Questions • ~10 mins</div>
                </div>
                <span style={{ fontSize: 24 }}>→</span>
              </button>
              
              <button 
                onClick={() => handleStart('behavioral', 5)}
                style={{
                  padding: '20px 30px',
                  background: 'linear-gradient(135deg, #1e7e34 0%, #155724 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 12,
                  fontSize: 16,
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(30, 126, 52, 0.3)',
                  transition: 'all 0.3s ease',
                  textAlign: 'left',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
                onMouseOver={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 20px rgba(30, 126, 52, 0.4)';
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 12px rgba(30, 126, 52, 0.3)';
                }}
              >
                <div>
                  <div style={{ fontSize: 16, marginBottom: 5 }}>Full Practice</div>
                  <div style={{ fontSize: 13, opacity: 0.9 }}>5 Behavioral Questions • ~20 mins</div>
                </div>
                <span style={{ fontSize: 24 }}>→</span>
              </button>
            </div>
          </div>
        </div>

        {/* Features Info */}
        <div style={{ 
          marginTop: 40,
          padding: 25,
          background: '#f8f9fa',
          borderRadius: 12,
          border: '2px solid #e9ecef'
        }}>
          <h4 style={{ marginTop: 0, marginBottom: 15, fontSize: 16, color: '#495057' }}>
            ✨ What You'll Get:
          </h4>
          <ul style={{ margin: 0, paddingLeft: 20, lineHeight: 2 }}>
            <li>🤖 AI-powered response analysis</li>
            <li>📊 Detailed performance metrics</li>
            <li>💡 Personalized improvement tips</li>
            <li>🎯 Instant feedback on your answers</li>
          </ul>
        </div>
      </div>
    );
  }

  // Main interview UI
  return (
    <div style={{ padding: '40px 20px', maxWidth: 1000, margin: '0 auto' }}>
      {/* Progress bar */}
      <div style={{ marginBottom: 30 }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: 10
        }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: '#495057' }}>
            Question {currentQuestionIndex + 1} of {questions.length}
          </span>
          <span style={{ 
            fontSize: 14, 
            fontWeight: 600, 
            color: '#667eea',
            background: '#667eea20',
            padding: '4px 12px',
            borderRadius: 20
          }}>
            {progress.toFixed(0)}% Complete
          </span>
        </div>
        <div style={{ 
          backgroundColor: '#e9ecef', 
          borderRadius: 10, 
          height: 12,
          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)',
          overflow: 'hidden'
        }}>
          <div style={{ 
            background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
            width: `${progress}%`, 
            height: '100%', 
            borderRadius: 10,
            transition: 'width 0.5s ease',
            boxShadow: '0 2px 4px rgba(102, 126, 234, 0.4)'
          }} />
        </div>
      </div>

      {/* Question Card */}
      <div style={{ 
        padding: 30, 
        background: 'white',
        borderRadius: 16,
        marginBottom: 30,
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        border: '2px solid #e9ecef',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Question number badge */}
        <div style={{
          position: 'absolute',
          top: 15,
          right: 15,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          padding: '8px 16px',
          borderRadius: 20,
          fontSize: 14,
          fontWeight: 'bold',
          boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)'
        }}>
          Q{currentQuestionIndex + 1}
        </div>

        <div style={{ fontSize: 42, marginBottom: 15 }}>
          {currentQuestion?.type === 'technical' ? '💻' : '🗣️'}
        </div>
        <p style={{ 
          fontSize: 20, 
          lineHeight: 1.7,
          color: '#333',
          margin: 0,
          paddingRight: 80
        }}>
          {currentQuestion?.text}
        </p>
      </div>

      {/* MODE TOGGLE */}
      <div style={{ 
        display: 'flex', 
        gap: 12, 
        marginBottom: 25,
        justifyContent: 'center',
        padding: 6,
        background: '#f8f9fa',
        borderRadius: 12,
        width: 'fit-content',
        margin: '0 auto 25px'
      }}>
        <button
          onClick={() => setAnswerMode('text')}
          style={{
            padding: '12px 28px',
            background: answerMode === 'text' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'transparent',
            color: answerMode === 'text' ? 'white' : '#495057',
            border: 'none',
            borderRadius: 8,
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: 15,
            transition: 'all 0.3s ease',
            boxShadow: answerMode === 'text' ? '0 4px 12px rgba(102, 126, 234, 0.3)' : 'none'
          }}
        >
          ⌨️ Type Answer
        </button>
        <button
          onClick={() => setAnswerMode('audio')}
          style={{
            padding: '12px 28px',
            background: answerMode === 'audio' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'transparent',
            color: answerMode === 'audio' ? 'white' : '#495057',
            border: 'none',
            borderRadius: 8,
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: 15,
            transition: 'all 0.3s ease',
            boxShadow: answerMode === 'audio' ? '0 4px 12px rgba(102, 126, 234, 0.3)' : 'none'
          }}
        >
          🎤 Record Answer
        </button>
      </div>

      {/* TEXT MODE */}
      {answerMode === 'text' && (
        <div style={{
          background: 'white',
          padding: 25,
          borderRadius: 16,
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          border: '2px solid #e9ecef'
        }}>
          <label style={{ 
            display: 'block', 
            marginBottom: 12,
            fontSize: 16,
            fontWeight: 600,
            color: '#495057'
          }}>
            ✍️ Your Answer
          </label>
          <textarea
            value={textAnswer}
            onChange={(e) => setTextAnswer(e.target.value)}
            placeholder="Type your detailed answer here... Be specific and provide examples."
            style={{
              width: '100%',
              minHeight: 200,
              padding: 18,
              fontSize: 16,
              borderRadius: 10,
              border: '2px solid #dee2e6',
              marginBottom: 20,
              fontFamily: 'inherit',
              lineHeight: 1.6,
              resize: 'vertical',
              transition: 'border-color 0.3s ease'
            }}
            onFocus={(e) => e.target.style.borderColor = '#667eea'}
            onBlur={(e) => e.target.style.borderColor = '#dee2e6'}
          />
          <button
            onClick={handleSubmitText}
            disabled={!textAnswer.trim() || isSubmitting}
            style={{
              padding: '16px 40px',
              background: (!textAnswer.trim() || isSubmitting) 
                ? '#dee2e6' 
                : 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
              color: 'white',
              border: 'none',
              borderRadius: 10,
              fontSize: 17,
              fontWeight: 600,
              cursor: (!textAnswer.trim() || isSubmitting) ? 'not-allowed' : 'pointer',
              boxShadow: (!textAnswer.trim() || isSubmitting) 
                ? 'none' 
                : '0 4px 12px rgba(40, 167, 69, 0.3)',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: 10
            }}
            onMouseOver={(e) => {
              if (!isSubmitting && textAnswer.trim()) {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 20px rgba(40, 167, 69, 0.4)';
              }
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'translateY(0)';
              if (!isSubmitting && textAnswer.trim()) {
                e.target.style.boxShadow = '0 4px 12px rgba(40, 167, 69, 0.3)';
              }
            }}
          >
            {isSubmitting ? (
              <>⏳ Submitting...</>
            ) : isLastQuestion ? (
              <>✅ Submit Final Answer</>
            ) : (
              <>➡️ Next Question</>
            )}
          </button>
        </div>
      )}

      {/* AUDIO MODE */}
      {answerMode === 'audio' && (
        <div style={{ 
          padding: 30, 
          border: '3px solid #667eea', 
          borderRadius: 16,
          background: 'linear-gradient(135deg, #667eea08 0%, #764ba208 100%)',
          boxShadow: '0 4px 20px rgba(102, 126, 234, 0.15)'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 10, 
            marginBottom: 25,
            fontSize: 20,
            fontWeight: 600,
            color: '#495057'
          }}>
            <span style={{ fontSize: 32 }}>🎤</span>
            Audio Answer
          </div>

          {!isRecording && !audioBlob && (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <div style={{ 
                fontSize: 80, 
                marginBottom: 20,
                filter: 'grayscale(50%)',
                opacity: 0.8
              }}>
                🎙️
              </div>
              <p style={{ 
                marginBottom: 30, 
                color: '#6c757d',
                fontSize: 16,
                lineHeight: 1.6
              }}>
                Click the button below to start recording your answer.<br/>
                Speak clearly and take your time!
              </p>
              <button
                onClick={startRecording}
                style={{
                  padding: '24px 48px',
                  fontSize: 18,
                  fontWeight: 600,
                  background: 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 50,
                  cursor: 'pointer',
                  boxShadow: '0 6px 20px rgba(220, 53, 69, 0.4)',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  margin: '0 auto'
                }}
                onMouseOver={(e) => {
                  e.target.style.transform = 'scale(1.05)';
                  e.target.style.boxShadow = '0 8px 25px rgba(220, 53, 69, 0.5)';
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = 'scale(1)';
                  e.target.style.boxShadow = '0 6px 20px rgba(220, 53, 69, 0.4)';
                }}
              >
                <span style={{ fontSize: 24 }}>🔴</span>
                Start Recording
              </button>
            </div>
          )}

          {isRecording && (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <div style={{ 
                fontSize: 100, 
                marginBottom: 20,
                animation: 'pulse 1.5s infinite'
              }}>
                🎤
              </div>
              <div style={{ 
                fontSize: 48, 
                marginBottom: 20, 
                fontWeight: 'bold',
                color: '#dc3545',
                fontFamily: 'monospace',
                letterSpacing: 2
              }}>
                {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}
              </div>
              <p style={{ 
                color: '#495057', 
                marginBottom: 30,
                fontSize: 16,
                fontWeight: 500
              }}>
                <span style={{ 
                  display: 'inline-block',
                  width: 12,
                  height: 12,
                  background: '#dc3545',
                  borderRadius: '50%',
                  marginRight: 8,
                  animation: 'blink 1s infinite'
                }}></span>
                Recording in progress...
              </p>
              <button
                onClick={stopRecording}
                style={{
                  padding: '18px 42px',
                  fontSize: 18,
                  fontWeight: 600,
                  background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 12,
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(40, 167, 69, 0.4)',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  margin: '0 auto'
                }}
                onMouseOver={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 20px rgba(40, 167, 69, 0.5)';
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 12px rgba(40, 167, 69, 0.4)';
                }}
              >
                <span style={{ fontSize: 24 }}>⏹️</span>
                Stop Recording
              </button>
            </div>
          )}

          {audioBlob && (
            <div>
              <div style={{ 
                backgroundColor: 'white', 
                padding: 20, 
                borderRadius: 12,
                marginBottom: 20,
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
              }}>
                <div style={{ 
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  marginBottom: 15
                }}>
                  <span style={{ fontSize: 28 }}>✅</span>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 16, color: '#28a745' }}>
                      Recording Complete!
                    </div>
                    <div style={{ fontSize: 14, color: '#6c757d' }}>
                      Duration: {recordingTime}s
                    </div>
                  </div>
                </div>
                <audio 
                  controls 
                  src={audioURL} 
                  style={{ 
                    width: '100%',
                    height: 48,
                    borderRadius: 8
                  }} 
                />
              </div>
              
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                <button
                  onClick={handleSubmitAudio}
                  disabled={isSubmitting}
                  style={{
                    padding: '16px 32px',
                    background: isSubmitting 
                      ? '#dee2e6' 
                      : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: 10,
                    fontSize: 16,
                    fontWeight: 600,
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    boxShadow: isSubmitting 
                      ? 'none' 
                      : '0 4px 12px rgba(102, 126, 234, 0.4)',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10
                  }}
                  onMouseOver={(e) => {
                    if (!isSubmitting) {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.5)';
                    }
                  }}
                  onMouseOut={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    if (!isSubmitting) {
                      e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
                    }
                  }}
                >
                  {isSubmitting ? (
                    <>⏳ Processing...</>
                  ) : (
                    <>📤 Submit Audio Answer</>
                  )}
                </button>
                <button
                  onClick={resetRecording}
                  disabled={isSubmitting}
                  style={{
                    padding: '16px 32px',
                    background: 'white',
                    color: '#495057',
                    border: '2px solid #dee2e6',
                    borderRadius: 10,
                    fontSize: 16,
                    fontWeight: 600,
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    opacity: isSubmitting ? 0.5 : 1
                  }}
                  onMouseOver={(e) => {
                    if (!isSubmitting) {
                      e.target.style.borderColor = '#dc3545';
                      e.target.style.color = '#dc3545';
                    }
                  }}
                  onMouseOut={(e) => {
                    e.target.style.borderColor = '#dee2e6';
                    e.target.style.color = '#495057';
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
        <div style={{ 
          marginTop: 30, 
          textAlign: 'center',
          padding: 25,
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          borderRadius: 16,
          boxShadow: '0 6px 20px rgba(240, 147, 251, 0.3)'
        }}>
          <div style={{ fontSize: 48, marginBottom: 10 }}>🏁</div>
          <p style={{ color: 'white', marginBottom: 20, fontSize: 16 }}>
            This is the final question. Click below to complete your interview!
          </p>
          <button
            onClick={completeInterview}
            disabled={isLoading}
            style={{
              marginTop: 0,
              padding: '18px 45px',
              background: 'white',
              color: '#f5576c',
              border: 'none',
              borderRadius: 10,
              fontSize: 18,
              fontWeight: 700,
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.7 : 1,
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              transition: 'all 0.3s ease',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 12
            }}
            onMouseOver={(e) => {
              if (!isLoading) {
                e.target.style.transform = 'scale(1.05)';
                e.target.style.boxShadow = '0 6px 20px rgba(0,0,0,0.2)';
              }
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'scale(1)';
              e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
            }}
          >
            {isLoading ? (
              <>⏳ Analyzing Your Responses...</>
            ) : (
              <>🏁 Complete Interview</>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

// Add animations for recording indicator
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes pulse {
      0%, 100% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.15); opacity: 0.8; }
    }
    @keyframes blink {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.3; }
    }
  `;
  if (!document.querySelector('style[data-animation="interview-animations"]')) {
    style.setAttribute('data-animation', 'interview-animations');
    document.head.appendChild(style);
  }
}