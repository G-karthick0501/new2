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

        {/* ✅ NEW: Emotion Summary */}
        {results.emotionSummary && (
          <div style={{
            flex: 1,
            padding: 20,
            backgroundColor: '#fff3cd',
            borderRadius: 8,
            border: '2px solid #ffc107'
          }}>
            <h4 style={{ marginTop: 0 }}>🎭 Emotion Analysis</h4>
            <p style={{ fontSize: 24, fontWeight: 'bold', margin: '10px 0' }}>
              {results.emotionSummary.top_3_emotions?.[0]?.emotion || 'neutral'}
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

      {/* ✅ NEW: Detailed Emotion Breakdown */}
      {results.emotionSummary?.top_3_emotions && (
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
                textAlign: 'center'
              }}>
                <div style={{ fontSize: 32, marginBottom: 10 }}>
                  {getEmotionEmoji(item.emotion)}
                </div>
                <div style={{ fontWeight: 'bold', textTransform: 'capitalize' }}>
                  {item.emotion}
                </div>
                <div style={{ fontSize: 20, color: '#007bff', fontWeight: 'bold' }}>
                  {item.percentage}%
                </div>
              </div>
            ))}
          </div>
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
    happy: '😊', sad: '😢', angry: '😠', surprise: '😲',
    fear: '😨', disgust: '🤢', neutral: '😐'
  };
  return map[emotion] || '😐';
}