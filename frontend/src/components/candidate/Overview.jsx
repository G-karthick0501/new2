// src/components/candidate/Overview.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function Overview() {
  const [stats, setStats] = useState({
    applications: 0,
    interviews: 0,
    codingChallenges: 0,
    resumeAnalyzed: false,
    loading: true
  });

  const [checklist, setChecklist] = useState({
    resumeUploaded: false,
    interviewCompleted: false,
    codingAttempted: false,
    jobApplied: false
  });

  // Progress counter: tracks individual feature usage
  const [progressCounts, setProgressCounts] = useState({
    jobs: 0,
    resume: 0,
    interview: 0,
    coding: 0
  });

  useEffect(() => {
    fetchUserStats();
    
    // Load progress counts from localStorage
    try {
      const stored = localStorage.getItem('featureProgressCounts');
      if (stored) {
        setProgressCounts(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Error loading progress:', e);
    }

    // Expose global helper for other components to increment counters
    window.incrementFeatureCounter = (feature) => {
      setProgressCounts(prev => {
        const updated = { ...prev, [feature]: (prev[feature] || 0) + 1 };
        try {
          localStorage.setItem('featureProgressCounts', JSON.stringify(updated));
        } catch (e) {
          console.error('Error saving progress:', e);
        }
        return updated;
      });
    };

    return () => {
      delete window.incrementFeatureCounter;
    };
  }, []);

  const fetchUserStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/candidate/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const data = response.data;
      setStats({
        applications: data.applications || 0,
        interviews: data.interviews || 0,
        codingChallenges: data.codingChallenges || 0,
        resumeAnalyzed: data.resumeAnalyzed || false,
        loading: false
      });

      // Update checklist
      setChecklist({
        resumeUploaded: data.resumeAnalyzed || false,
        interviewCompleted: (data.interviews || 0) > 0,
        codingAttempted: (data.codingChallenges || 0) > 0,
        jobApplied: (data.applications || 0) > 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      // If API fails, just show empty state
      setStats({ ...stats, loading: false });
    }
  };

  const handleNavigation = (tab) => {
    // Increment the feature counter
    if (window.incrementFeatureCounter) {
      window.incrementFeatureCounter(tab);
    }
    
    // Trigger parent component's tab change
    window.dispatchEvent(new CustomEvent('changeTab', { detail: tab }));
  };

  const resetProgress = () => {
    setProgressCounts({
      jobs: 0,
      resume: 0,
      interview: 0,
      coding: 0
    });
    try {
      localStorage.removeItem('featureProgressCounts');
    } catch (e) {
      console.error('Error resetting progress:', e);
    }
  };

  const getTotalProgress = () => {
    return Object.values(progressCounts).reduce((sum, count) => sum + count, 0);
  };

  if (stats.loading) {
    return (
      <div style={{ textAlign: 'center', padding: 40 }}>
        <div style={{ fontSize: 18, color: '#666' }}>Loading your dashboard...</div>
      </div>
    );
  }

  return (
    <div>
      {/* Welcome Header */}
      <div style={{ marginBottom: 30 }}>
        <h2 style={{ marginBottom: 10 }}>Welcome to Your Dashboard 👋</h2>
        <p style={{ color: '#666', fontSize: 15 }}>
          Get started with our AI-powered tools to prepare for your next interview
        </p>
      </div>

      {/* Getting Started Checklist */}
      <div style={{ 
        padding: 20, 
        backgroundColor: '#f8f9fa', 
        borderRadius: 8, 
        marginBottom: 30,
        border: '2px solid #e9ecef'
      }}>
        <h3 style={{ marginBottom: 15, fontSize: 18 }}>🎯 Getting Started Checklist</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <ChecklistItem 
            completed={checklist.resumeUploaded} 
            text="Upload and optimize your resume"
          />
          <ChecklistItem 
            completed={checklist.interviewCompleted} 
            text="Complete a mock interview"
          />
          <ChecklistItem 
            completed={checklist.codingAttempted} 
            text="Solve coding challenges"
          />
          <ChecklistItem 
            completed={checklist.jobApplied} 
            text="Apply to your first job"
          />
        </div>
      </div>

      {/* Stats Cards - Show real data or empty state */}
      <div style={{ marginBottom: 30 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
          <h3 style={{ fontSize: 18, margin: 0 }}>📊 Your Progress</h3>
          <button 
            onClick={resetProgress}
            style={{
              padding: '8px 16px',
              fontSize: 13,
              borderRadius: 6,
              border: '1px solid #dee2e6',
              background: 'white',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              fontWeight: 500
            }}
            onMouseOver={(e) => {
              e.target.style.background = '#f8f9fa';
              e.target.style.borderColor = '#adb5bd';
            }}
            onMouseOut={(e) => {
              e.target.style.background = 'white';
              e.target.style.borderColor = '#dee2e6';
            }}
          >
            Reset Progress
          </button>
        </div>

        {/* Total Progress Card */}
        <div style={{
          padding: 25,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: 12,
          marginBottom: 20,
          color: 'white',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 14, opacity: 0.9, marginBottom: 5 }}>Total Feature Uses</div>
              <div style={{ fontSize: 48, fontWeight: 'bold' }}>{getTotalProgress()}</div>
            </div>
            <div style={{ fontSize: 60, opacity: 0.3 }}>🚀</div>
          </div>
        </div>

        {/* Individual Feature Counters Grid */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: 20
        }}>
          <ProgressCard
            icon="💼"
            title="Job Applications"
            count={progressCounts.jobs}
            color="#007bff"
            description="Times you've browsed or applied"
          />
          
          <ProgressCard
            icon="📄"
            title="Resume Optimizer"
            count={progressCounts.resume}
            color="#28a745"
            description="Resume optimization sessions"
          />
          
          <ProgressCard
            icon="🎤"
            title="Mock Interviews"
            count={progressCounts.interview}
            color="#17a2b8"
            description="Interview practice sessions"
          />
          
          <ProgressCard
            icon="💻"
            title="Coding Practice"
            count={progressCounts.coding}
            color="#ffc107"
            description="Coding challenges attempted"
          />
        </div>
      </div>

      {/* Your Activity Stats */}
      <h3 style={{ marginBottom: 15, fontSize: 18 }}>📈 Your Activity</h3>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: 20,
        marginBottom: 30
      }}>
        
        {/* Applications Card */}
        <StatCard
          icon="💼"
          title="Job Applications"
          count={stats.applications}
          emptyText="No applications yet"
          emptyAction="Browse available jobs and start applying"
          color="#007bff"
          onClick={() => handleNavigation('jobs')}
        />

        {/* Resume Card */}
        <StatCard
          icon="📄"
          title="Resume Optimizer"
          count={stats.resumeAnalyzed ? 1 : 0}
          emptyText="Resume not analyzed"
          emptyAction="Upload your resume for AI-powered optimization"
          color="#28a745"
          showCount={false}
          customContent={stats.resumeAnalyzed ? "✅ Resume optimized" : null}
          onClick={() => handleNavigation('resume')}
        />

        {/* Interview Card */}
        <StatCard
          icon="🎤"
          title="Mock Interviews"
          count={stats.interviews}
          emptyText="No interviews yet"
          emptyAction="Practice with AI-driven interview sessions"
          color="#17a2b8"
          onClick={() => handleNavigation('interview')}
        />

        {/* Coding Card */}
        <StatCard
          icon="💻"
          title="Coding Practice"
          count={stats.codingChallenges}
          emptyText="No challenges solved"
          emptyAction="Solve coding problems to improve your skills"
          color="#ffc107"
          onClick={() => handleNavigation('coding')}
        />
      </div>

      {/* Feature Guide Cards */}
      <h3 style={{ marginBottom: 15, fontSize: 18 }}>🚀 Available Tools</h3>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: 20 
      }}>
        <FeatureCard
          icon="📄"
          title="Resume Optimizer"
          description="Get AI-powered suggestions to improve your resume and match job requirements"
          buttonText="Optimize Resume"
          color="#007bff"
          onClick={() => handleNavigation('resume')}
        />

        <FeatureCard
          icon="🎤"
          title="Mock Interview"
          description="Practice interviews with AI, get real-time feedback on your responses and emotions"
          buttonText="Start Interview"
          color="#28a745"
          onClick={() => handleNavigation('interview')}
        />

        <FeatureCard
          icon="💻"
          title="Coding Practice"
          description="Solve coding challenges with multiple difficulty levels and instant evaluation"
          buttonText="Start Coding"
          color="#ffc107"
          onClick={() => handleNavigation('coding')}
        />

        <FeatureCard
          icon="💼"
          title="Job Applications"
          description="Browse available positions and track your application status in one place"
          buttonText="View Jobs"
          color="#dc3545"
          onClick={() => handleNavigation('jobs')}
        />
      </div>
    </div>
  );
}

// Checklist Item Component
function ChecklistItem({ completed, text }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={{ 
        fontSize: 20,
        color: completed ? '#28a745' : '#dee2e6'
      }}>
        {completed ? '✅' : '⬜'}
      </span>
      <span style={{ 
        fontSize: 15,
        color: completed ? '#333' : '#6c757d',
        textDecoration: completed ? 'line-through' : 'none'
      }}>
        {text}
      </span>
    </div>
  );
}

// Stat Card Component
function StatCard({ 
  icon, 
  title, 
  count, 
  emptyText, 
  emptyAction, 
  color, 
  onClick,
  showCount = true,
  customContent = null
}) {
  const hasData = count > 0 || customContent;

  return (
    <div 
      style={{ 
        padding: 20, 
        border: `2px solid ${hasData ? color : '#dee2e6'}`, 
        borderRadius: 8,
        backgroundColor: hasData ? `${color}10` : 'white',
        cursor: 'pointer',
        transition: 'all 0.3s ease'
      }}
      onClick={onClick}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div style={{ fontSize: 32, marginBottom: 10 }}>{icon}</div>
      <h3 style={{ fontSize: 16, marginBottom: 10, color: '#333' }}>{title}</h3>
      
      {hasData ? (
        <div>
          {customContent || (
            <>
              <p style={{ fontSize: 28, margin: 0, color: color, fontWeight: 'bold' }}>
                {count}
              </p>
              <small style={{ color: '#666' }}>
                {count === 1 ? 'completed' : 'completed'}
              </small>
            </>
          )}
        </div>
      ) : (
        <div>
          <p style={{ fontSize: 16, margin: '10px 0', color: '#6c757d', fontWeight: 500 }}>
            {emptyText}
          </p>
          <small style={{ color: '#999', fontSize: 13 }}>
            {emptyAction}
          </small>
        </div>
      )}
    </div>
  );
}

// Feature Card Component
function FeatureCard({ icon, title, description, buttonText, color, onClick }) {
  return (
    <div style={{ 
      padding: 20, 
      border: '1px solid #e9ecef', 
      borderRadius: 8,
      backgroundColor: 'white',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between'
    }}>
      <div>
        <div style={{ fontSize: 40, marginBottom: 10 }}>{icon}</div>
        <h3 style={{ fontSize: 16, marginBottom: 10, color: '#333' }}>{title}</h3>
        <p style={{ fontSize: 14, color: '#666', lineHeight: 1.5, marginBottom: 15 }}>
          {description}
        </p>
      </div>
      <button
        onClick={onClick}
        style={{
          padding: '10px 20px',
          backgroundColor: color,
          color: 'white',
          border: 'none',
          borderRadius: 6,
          cursor: 'pointer',
          fontSize: 14,
          fontWeight: 500,
          transition: 'all 0.2s ease'
        }}
        onMouseOver={(e) => e.target.style.opacity = '0.9'}
        onMouseOut={(e) => e.target.style.opacity = '1'}
      >
        {buttonText} →
      </button>
    </div>
  );
}

// Progress Card Component - for tracking feature usage
function ProgressCard({ icon, title, count, color, description }) {
  return (
    <div style={{
      padding: 20,
      border: `2px solid ${color}20`,
      borderRadius: 10,
      background: `linear-gradient(135deg, ${color}08 0%, ${color}15 100%)`,
      position: 'relative',
      overflow: 'hidden',
      transition: 'all 0.3s ease'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-4px)';
      e.currentTarget.style.boxShadow = `0 8px 20px ${color}30`;
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = 'none';
    }}
    >
      {/* Background Icon */}
      <div style={{
        position: 'absolute',
        right: -10,
        bottom: -10,
        fontSize: 80,
        opacity: 0.1
      }}>
        {icon}
      </div>

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ fontSize: 32, marginBottom: 8 }}>{icon}</div>
        <h4 style={{ fontSize: 15, marginBottom: 8, color: '#333', fontWeight: 600 }}>
          {title}
        </h4>
        
        {/* Counter with animation */}
        <div style={{
          fontSize: 36,
          fontWeight: 'bold',
          color: color,
          marginBottom: 5,
          display: 'flex',
          alignItems: 'baseline',
          gap: 5
        }}>
          {count}
          <span style={{ fontSize: 16, color: '#666', fontWeight: 'normal' }}>uses</span>
        </div>
        
        <p style={{ fontSize: 13, color: '#6c757d', margin: 0 }}>
          {description}
        </p>

        {/* Progress Bar */}
        <div style={{
          marginTop: 12,
          height: 4,
          background: '#e9ecef',
          borderRadius: 2,
          overflow: 'hidden'
        }}>
          <div style={{
            height: '100%',
            width: `${Math.min(count * 10, 100)}%`,
            background: color,
            transition: 'width 0.5s ease'
          }} />
        </div>
      </div>
    </div>
  );
}