// frontend/src/components/interview/InterviewResults.jsx
export default function InterviewResults({ results, onRestart }) {
  if (!results) return null;

  const { score, feedback, questionsAnswered, totalQuestions } = results;

  const getScoreColor = (score) => {
    if (score >= 80) return '#28a745';
    if (score >= 60) return '#ffc107'; 
    return '#dc3545';
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    return 'Needs Improvement';
  };

  return (
    <div style={{ 
      maxWidth: 600, 
      margin: '0 auto', 
      padding: 20,
      textAlign: 'center' 
    }}>
      <h2>Interview Complete! 🎉</h2>
      
      {/* Score Display */}
      <div style={{ 
        padding: 30,
        border: '2px solid #e9ecef',
        borderRadius: 10,
        marginBottom: 30,
        backgroundColor: '#f8f9fa' 
      }}>
        <div style={{ 
          fontSize: 48,
          fontWeight: 'bold',
          color: getScoreColor(score),
          marginBottom: 10 
        }}>
          {Math.round(score)}%
        </div>
        
        <div style={{ 
          fontSize: 18,
          color: getScoreColor(score),
          fontWeight: 'bold',
          marginBottom: 15 
        }}>
          {getScoreLabel(score)}
        </div>
        
        <div style={{ fontSize: 14, color: '#666' }}>
          You answered {questionsAnswered} out of {totalQuestions} questions
        </div>
      </div>

      {/* Feedback */}
      <div style={{ 
        textAlign: 'left',
        marginBottom: 30 
      }}>
        <h3>Feedback & Suggestions:</h3>
        <ul style={{ lineHeight: 1.6 }}>
          {feedback.map((item, index) => (
            <li key={index} style={{ marginBottom: 10 }}>
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* Actions */}
      <div style={{ 
        display: 'flex', 
        gap: 15,
        justifyContent: 'center' 
      }}>
        <button
          onClick={onRestart}
          style={{
            padding: '12px 24px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: 5,
            cursor: 'pointer',
            fontSize: 16
          }}
        >
          Practice Again
        </button>
        
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: '12px 24px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: 5,
            cursor: 'pointer',
            fontSize: 16
          }}
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}