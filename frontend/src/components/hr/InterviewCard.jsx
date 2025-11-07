// frontend/src/components/hr/InterviewCard.jsx
import { useState } from 'react';
import { getScoreColor, getScoreBadge } from './interviewHelpers';

export default function InterviewCard({ interview }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div style={{ 
      border: '1px solid #ddd', 
      borderRadius: 8, 
      padding: 20,
      backgroundColor: 'white'
    }}>
      {/* Header Row */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'start',
        marginBottom: 15
      }}>
        <div>
          <h3 style={{ margin: '0 0 8px 0' }}>
            {interview.userId?.name || 'Unknown Candidate'}
          </h3>
          <p style={{ margin: '4px 0', color: '#666', fontSize: 14 }}>
            📧 {interview.userId?.email || 'N/A'}
          </p>
          <p style={{ margin: '4px 0', color: '#666', fontSize: 14 }}>
            📅 {new Date(interview.completedAt || interview.createdAt).toLocaleString()}
          </p>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ 
            fontSize: 36, 
            fontWeight: 'bold', 
            color: getScoreColor(interview.overallScore || 0) 
          }}>
            {interview.overallScore || 0}%
          </div>
          <div style={{ 
            fontSize: 14, 
            color: getScoreColor(interview.overallScore || 0),
            fontWeight: 'bold'
          }}>
            {getScoreBadge(interview.overallScore || 0)}
          </div>
        </div>
      </div>

      {/* Info Row */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
        gap: 10,
        padding: '15px 0',
        borderTop: '1px solid #eee',
        borderBottom: '1px solid #eee',
        marginBottom: 15
      }}>
        <div>
          <small style={{ color: '#666' }}>Interview Type</small>
          <p style={{ margin: '4px 0', fontWeight: 'bold' }}>
            {interview.interviewType === 'technical' ? '💻 Technical' : '🗣️ Behavioral'}
          </p>
        </div>
        <div>
          <small style={{ color: '#666' }}>Questions</small>
          <p style={{ margin: '4px 0', fontWeight: 'bold' }}>
            {interview.questions?.filter(q => q.userResponse).length || 0} / {interview.questionCount || 0}
          </p>
        </div>
        <div>
          <small style={{ color: '#666' }}>AI Analysis</small>
          <p style={{ margin: '4px 0', fontWeight: 'bold' }}>
            {interview.aiAnalysis?.processed ? '✅ Yes' : '❌ No'}
          </p>
        </div>
        <div>
          <small style={{ color: '#666' }}>Status</small>
          <p style={{ margin: '4px 0', fontWeight: 'bold' }}>
            {interview.status === 'completed' ? '✅ Completed' : '⏳ Processing'}
          </p>
        </div>
      </div>

      {/* Expand/Collapse Button */}
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          width: '100%',
          padding: '10px',
          backgroundColor: '#f8f9fa',
          border: '1px solid #ddd',
          borderRadius: 5,
          cursor: 'pointer',
          fontWeight: 'bold'
        }}
      >
        {expanded ? '▲ Hide Details' : '▼ View Details'}
      </button>

      {/* Expanded Details */}
      {expanded && (
        <div style={{ marginTop: 15, padding: 15, backgroundColor: '#f8f9fa', borderRadius: 5 }}>
          
          {/* Feedback */}
          {interview.feedback && interview.feedback.length > 0 && (
            <div style={{ marginBottom: 15 }}>
              <h4>💡 Feedback</h4>
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                {interview.feedback.map((fb, idx) => (
                  <li key={idx} style={{ marginBottom: 8 }}>{fb}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Overall Analysis */}
          {interview.overallAnalysis && (
            <div style={{ marginBottom: 15 }}>
              <h4>🎯 Overall Analysis</h4>
              
              {interview.overallAnalysis.strengths?.length > 0 && (
                <div style={{ marginBottom: 10 }}>
                  <strong style={{ color: '#28a745' }}>✅ Strengths:</strong>
                  <ul style={{ margin: '5px 0', paddingLeft: 20 }}>
                    {interview.overallAnalysis.strengths.map((s, idx) => (
                      <li key={idx}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}

              {interview.overallAnalysis.weaknesses?.length > 0 && (
                <div style={{ marginBottom: 10 }}>
                  <strong style={{ color: '#dc3545' }}>⚠️ Weaknesses:</strong>
                  <ul style={{ margin: '5px 0', paddingLeft: 20 }}>
                    {interview.overallAnalysis.weaknesses.map((w, idx) => (
                      <li key={idx}>{w}</li>
                    ))}
                  </ul>
                </div>
              )}

              {interview.overallAnalysis.recommendation && (
                <div>
                  <strong>📋 Recommendation:</strong>
                  <p style={{ margin: '5px 0' }}>{interview.overallAnalysis.recommendation}</p>
                </div>
              )}
            </div>
          )}

          {/* Questions Summary */}
          <div>
            <h4>📝 Questions ({interview.questions?.length || 0})</h4>
            {interview.questions?.slice(0, 3).map((q, idx) => (
              <div key={idx} style={{ 
                padding: 10, 
                marginBottom: 10, 
                backgroundColor: 'white',
                borderRadius: 5,
                border: '1px solid #ddd'
              }}>
                <p style={{ margin: '0 0 8px 0', fontWeight: 'bold' }}>
                  Q{idx + 1}: {q.questionText}
                </p>
                <p style={{ margin: '0 0 8px 0', color: '#666', fontSize: 14 }}>
                  <strong>Answer:</strong> {q.userResponse || 'No response'}
                </p>
                {q.timeSpent && (
                  <small style={{ color: '#999' }}>⏱️ Time: {q.timeSpent}s</small>
                )}
              </div>
            ))}
            {interview.questions?.length > 3 && (
              <p style={{ color: '#666', fontSize: 14 }}>
                ...and {interview.questions.length - 3} more questions
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}