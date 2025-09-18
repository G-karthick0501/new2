import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";

export default function CandidateDashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  const candidateFeatures = [
    { id: 'overview', label: '📊 Overview', description: 'Your application status and progress' },
    { id: 'resume', label: '📄 Resume Optimizer', description: 'AI-powered resume analysis and improvement' },
    { id: 'interview', label: '🎤 Mock Interview', description: 'Practice interviews with AI feedback' },
    { id: 'coding', label: '💻 Coding Practice', description: 'Technical challenges and assessments' },
    { id: 'jobs', label: '🔍 Job Applications', description: 'Browse and apply for positions' }
  ];

  return (
    <div style={{ padding: 20, maxWidth: 1200, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: 30,
        borderBottom: '2px solid #e0e0e0',
        paddingBottom: 15
      }}>
        <div>
          <h1>Candidate Dashboard</h1>
          <p>Welcome back, <strong>{user?.name}</strong>! 👋</p>
        </div>
        <button onClick={logout} style={{ 
          padding: '10px 20px', 
          backgroundColor: '#dc3545', 
          color: 'white', 
          border: 'none', 
          borderRadius: '5px',
          cursor: 'pointer'
        }}>
          Logout
        </button>
      </div>

      {/* Navigation Tabs */}
      <div style={{ 
        display: 'flex', 
        marginBottom: 30,
        borderBottom: '1px solid #ddd'
      }}>
        {candidateFeatures.map(feature => (
          <button
            key={feature.id}
            onClick={() => setActiveTab(feature.id)}
            style={{
              padding: '12px 20px',
              border: 'none',
              backgroundColor: activeTab === feature.id ? '#007bff' : 'transparent',
              color: activeTab === feature.id ? 'white' : '#333',
              cursor: 'pointer',
              borderRadius: '5px 5px 0 0',
              marginRight: '5px'
            }}
          >
            {feature.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div style={{ minHeight: 400 }}>
        {activeTab === 'overview' && <CandidateOverview />}
        {activeTab === 'resume' && <ResumeOptimizer />}
        {activeTab === 'interview' && <MockInterview />}
        {activeTab === 'coding' && <CodingPractice />}
        {activeTab === 'jobs' && <JobApplications />}
      </div>
    </div>
  );
}

function CandidateOverview() {
  return (
    <div>
      <h2>📊 Your Progress Overview</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 20 }}>
        <div style={{ padding: 20, border: '1px solid #ddd', borderRadius: 8 }}>
          <h3>Applications</h3>
          <p style={{ fontSize: 24, margin: 0 }}>12 Active</p>
          <small>3 interviews pending</small>
        </div>
        <div style={{ padding: 20, border: '1px solid #ddd', borderRadius: 8 }}>
          <h3>Resume Score</h3>
          <p style={{ fontSize: 24, margin: 0, color: '#28a745' }}>85/100</p>
          <small>Good match for target roles</small>
        </div>
        <div style={{ padding: 20, border: '1px solid #ddd', borderRadius: 8 }}>
          <h3>Interview Practice</h3>
          <p style={{ fontSize: 24, margin: 0 }}>7 Sessions</p>
          <small>Average score: 78%</small>
        </div>
        <div style={{ padding: 20, border: '1px solid #ddd', borderRadius: 8 }}>
          <h3>Coding Challenges</h3>
          <p style={{ fontSize: 24, margin: 0 }}>15 Completed</p>
          <small>8 medium, 7 easy</small>
        </div>
      </div>
    </div>
  );
}

function ResumeOptimizer() {
  return (
    <div>
      <h2>📄 Resume Optimizer</h2>
      <div style={{ border: '2px dashed #ccc', padding: 40, textAlign: 'center', marginBottom: 20 }}>
        <p>Upload your resume for AI-powered analysis</p>
        <button style={{ padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: 5 }}>
          Upload Resume
        </button>
      </div>
      <div>
        <h3>Recent Analysis</h3>
        <p style={{ color: '#6c757d' }}>No resume uploaded yet. Upload your resume to get started!</p>
      </div>
    </div>
  );
}

function MockInterview() {
  return (
    <div>
      <h2>🎤 Mock Interview Practice</h2>
      <div style={{ marginBottom: 20 }}>
        <h3>Choose Interview Type:</h3>
        <div style={{ display: 'flex', gap: 15, marginBottom: 20 }}>
          <button style={{ padding: '15px 30px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: 5 }}>
            Technical Interview
          </button>
          <button style={{ padding: '15px 30px', backgroundColor: '#17a2b8', color: 'white', border: 'none', borderRadius: 5 }}>
            Behavioral Interview
          </button>
          <button style={{ padding: '15px 30px', backgroundColor: '#ffc107', color: 'black', border: 'none', borderRadius: 5 }}>
            HR Round
          </button>
        </div>
      </div>
      <div>
        <h3>Recent Sessions</h3>
        <p style={{ color: '#6c757d' }}>No interview sessions yet. Start your first practice session!</p>
      </div>
    </div>
  );
}

function CodingPractice() {
  return (
    <div>
      <h2>💻 Coding Practice Arena</h2>
      <div style={{ marginBottom: 20 }}>
        <h3>Recommended Challenges</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 15 }}>
          <div style={{ padding: 15, border: '1px solid #ddd', borderRadius: 8 }}>
            <h4>Two Sum Problem</h4>
            <span style={{ backgroundColor: '#28a745', color: 'white', padding: '2px 8px', borderRadius: 3, fontSize: 12 }}>EASY</span>
            <p>Find two numbers that add up to target</p>
          </div>
          <div style={{ padding: 15, border: '1px solid #ddd', borderRadius: 8 }}>
            <h4>Binary Tree Traversal</h4>
            <span style={{ backgroundColor: '#ffc107', color: 'black', padding: '2px 8px', borderRadius: 3, fontSize: 12 }}>MEDIUM</span>
            <p>Implement tree traversal algorithms</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function JobApplications() {
  return (
    <div>
      <h2>🔍 Job Applications</h2>
      <div style={{ marginBottom: 20 }}>
        <input 
          type="text" 
          placeholder="Search jobs by title, company, or keyword..."
          style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: 5 }}
        />
      </div>
      <div>
        <h3>Your Applications</h3>
        <p style={{ color: '#6c757d' }}>No applications yet. Start applying to jobs that match your profile!</p>
      </div>
    </div>
  );
}