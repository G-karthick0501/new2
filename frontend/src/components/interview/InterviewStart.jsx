// frontend/src/components/interview/InterviewStart.jsx
import { useState } from 'react';

export default function InterviewStart({ onStart, isLoading }) {
  const [selectedType, setSelectedType] = useState('technical');

  return (
    <div style={{ 
      padding: 40, 
      maxWidth: 600, 
      margin: '0 auto',
      textAlign: 'center' 
    }}>
      <h2>Mock Interview Practice</h2>
      <p>Choose your interview type and start practicing!</p>
      
      <div style={{ margin: '30px 0' }}>
        <div style={{ marginBottom: 15 }}>
          <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
            <input
              type="radio"
              value="technical"
              checked={selectedType === 'technical'}
              onChange={(e) => setSelectedType(e.target.value)}
            />
            <strong>Technical Interview</strong>
            <span style={{ color: '#666' }}>- Programming and system design questions</span>
          </label>
        </div>
        
        <div>
          <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
            <input
              type="radio"
              value="behavioral"
              checked={selectedType === 'behavioral'}
              onChange={(e) => setSelectedType(e.target.value)}
            />
            <strong>Behavioral Interview</strong>
            <span style={{ color: '#666' }}>- Experience and situation-based questions</span>
          </label>
        </div>
      </div>
      
      <button
        onClick={() => onStart(selectedType)}
        disabled={isLoading}
        style={{
          padding: '15px 30px',
          fontSize: 18,
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: 5,
          cursor: isLoading ? 'not-allowed' : 'pointer',
          opacity: isLoading ? 0.6 : 1
        }}
      >
        {isLoading ? 'Starting Interview...' : 'Start Interview'}
      </button>
      
      <div style={{ 
        marginTop: 30, 
        padding: 20, 
        backgroundColor: '#f8f9fa', 
        borderRadius: 5,
        fontSize: 14
      }}>
        <strong>What to expect:</strong>
        <ul style={{ textAlign: 'left', margin: '10px 0' }}>
          <li>5 questions related to your chosen interview type</li>
          <li>Type your responses in the text area</li>
          <li>Take your time - there's no strict time limit</li>
          <li>Get feedback on your performance at the end</li>
        </ul>
      </div>
    </div>
  );
}