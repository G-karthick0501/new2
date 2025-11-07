// frontend/src/components/hr/PerformanceTiers.jsx
import { getScoreColor } from './interviewHelpers';

export default function PerformanceTiers({ tiers, filters }) {
  const TierCard = ({ interview }) => (
    <div style={{ 
      padding: 15, 
      backgroundColor: 'white', 
      borderRadius: 5,
      border: `1px solid ${getScoreColor(interview.overallScore || 0)}`
    }}>
      <p style={{ margin: '0 0 5px 0', fontWeight: 'bold' }}>
        {interview.userId?.name}
      </p>
      <p style={{ margin: '0 0 5px 0', fontSize: 14, color: '#666' }}>
        {interview.userId?.email}
      </p>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 24, fontWeight: 'bold', color: getScoreColor(interview.overallScore || 0) }}>
          {interview.overallScore}%
        </span>
        <span style={{ fontSize: 12, color: '#666' }}>
          {interview.interviewType === 'technical' ? '💻' : '🗣️'}
        </span>
      </div>
    </div>
  );

  const renderTier = (tierData, title, color, bgColor) => (
    <div style={{ 
      padding: 20, 
      backgroundColor: bgColor, 
      border: `2px solid ${color}`, 
      borderRadius: 8 
    }}>
      <h3 style={{ margin: '0 0 15px 0', color }}>
        {title} ({tierData.length})
      </h3>
      {tierData.length === 0 ? (
        <p style={{ color: '#666', margin: 0 }}>
          No candidates in this tier
          {(filters.minScore !== null || filters.maxScore !== null) && 
            ` (Score range: ${filters.minScore || 0}%-${filters.maxScore || 100}%)`}
        </p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 10 }}>
          {tierData.map(interview => (
            <TierCard key={interview._id} interview={interview} />
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div style={{ display: 'grid', gap: 20, marginBottom: 30 }}>
      {renderTier(tiers.excellent, '🌟 Excellent Performers', '#155724', '#d4edda')}
      {renderTier(tiers.good, '👍 Good Performers', '#856404', '#fff3cd')}
      {renderTier(tiers.needsImprovement, '📈 Needs Improvement', '#721c24', '#f8d7da')}
    </div>
  );
}