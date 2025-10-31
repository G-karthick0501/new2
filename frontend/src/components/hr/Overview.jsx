// src/components/hr/Overview.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function Overview() {
  const [stats, setStats] = useState({
    activeJobs: 0,
    totalApplications: 0,
    pendingReview: 0,
    shortlisted: 0,
    loading: true
  });

  useEffect(() => {
    fetchHRStats();
  }, []);

  const fetchHRStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/hr/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setStats({
        ...response.data,
        loading: false
      });
    } catch (error) {
      console.error('Error fetching HR stats:', error);
      setStats(prev => ({ ...prev, loading: false }));
    }
  };

  const handleNavigation = (tab) => {

    window.dispatchEvent(new CustomEvent('changeTab', { detail: tab }));
  };

  if (stats.loading) {
    return (
      <div style={{ textAlign: 'center', padding: 40 }}>
        <div style={{ fontSize: 18, color: '#666' }}>Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div>
      {/* Welcome Header */}
      <div style={{ marginBottom: 30 }}>
        <h2 style={{ marginBottom: 10 }}>📊 Recruitment Pipeline Overview</h2>
        <p style={{ color: '#666', fontSize: 15 }}>
          Manage your hiring process and track candidate progress
        </p>
      </div>

      {/* Stats Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: 20,
        marginBottom: 30
      }}>
        <StatCard
          icon="💼"
          title="Active Job Posts"
          count={stats.activeJobs}
          color="#007bff"
          emptyText="No active jobs"
          emptyAction="Create your first job posting"
        />

        <StatCard
          icon="📝"
          title="Total Applications"
          count={stats.totalApplications}
          color="#28a745"
          emptyText="No applications yet"
          emptyAction="Applications will appear here"
        />

        <StatCard
          icon="⏳"
          title="Pending Review"
          count={stats.pendingReview}
          color="#ffc107"
          emptyText="All caught up!"
          emptyAction="No pending applications"
          highlight={stats.pendingReview > 0}
        />

        <StatCard
          icon="⭐"
          title="Shortlisted"
          count={stats.shortlisted}
          color="#17a2b8"
          emptyText="No candidates shortlisted"
          emptyAction="Review applications to shortlist"
        />
      </div>

      {/* Quick Actions */}
      <div style={{ 
        padding: 20, 
        backgroundColor: '#f8f9fa', 
        borderRadius: 8,
        border: '2px solid #e9ecef'
      }}>
        <h3 style={{ marginBottom: 15, fontSize: 18 }}>⚡ Quick Actions</h3>
        <div style={{ display: 'flex', gap: 15, flexWrap: 'wrap' }}>
          <ActionButton 
            text="Manage Job Posts" 
            icon="💼"
            color="#007bff"
            onClick={() => handleNavigation('jobs')}
          />
          <ActionButton 
            text="Review Applications" 
            icon="📋"
            color="#28a745"
            badge={stats.pendingReview > 0 ? stats.pendingReview : null}
            onClick={() => handleNavigation('candidates')}
          />
          
        </div>
      </div>

      {/* Summary Message */}
      {stats.pendingReview > 0 && (
        <div style={{
          marginTop: 20,
          padding: 15,
          backgroundColor: '#fff3cd',
          border: '2px solid #ffc107',
          borderRadius: 8,
          color: '#856404'
        }}>
          <strong>⚠️ Action Required:</strong> You have {stats.pendingReview} application{stats.pendingReview > 1 ? 's' : ''} waiting for review.
        </div>
      )}
    </div>
  );
}

// Stat Card Component
function StatCard({ icon, title, count, color, emptyText, emptyAction, highlight }) {
  const hasData = count > 0;

  return (
    <div 
      style={{ 
        padding: 20, 
        border: `2px solid ${hasData ? color : '#dee2e6'}`, 
        borderRadius: 8,
        backgroundColor: hasData ? `${color}10` : 'white',
        position: 'relative',
        boxShadow: highlight ? `0 0 15px ${color}40` : 'none',
        animation: highlight ? 'pulse 2s infinite' : 'none'
      }}
    >
      <div style={{ fontSize: 32, marginBottom: 10 }}>{icon}</div>
      <h3 style={{ fontSize: 16, marginBottom: 10, color: '#333' }}>{title}</h3>
      
      {hasData ? (
        <>
          <p style={{ fontSize: 32, margin: 0, color: color, fontWeight: 'bold' }}>
            {count}
          </p>
          <small style={{ color: '#666' }}>
            {count === 1 ? 'item' : 'items'}
          </small>
        </>
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

      {highlight && (
        <div style={{
          position: 'absolute',
          top: 10,
          right: 10,
          backgroundColor: '#dc3545',
          color: 'white',
          padding: '4px 8px',
          borderRadius: 12,
          fontSize: 11,
          fontWeight: 'bold'
        }}>
          NEW
        </div>
      )}
    </div>
  );
}

// Action Button Component

function ActionButton({ text, icon, color, badge, onClick }) {
  return (
    <button
    onClick={onClick} 
      style={{
        padding: '12px 20px',
        backgroundColor: color,
        color: 'white',
        border: 'none',
        borderRadius: 6,
        cursor: 'pointer',
        fontSize: 14,
        fontWeight: 500,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        position: 'relative',
        transition: 'all 0.2s ease'
      }}
      onMouseOver={(e) => e.target.style.opacity = '0.9'}
      onMouseOut={(e) => e.target.style.opacity = '1'}
    >
      <span>{icon}</span>
      <span>{text}</span>
      {badge && (
        <span style={{
          position: 'absolute',
          top: -8,
          right: -8,
          backgroundColor: '#dc3545',
          color: 'white',
          borderRadius: '50%',
          width: 24,
          height: 24,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 12,
          fontWeight: 'bold'
        }}>
          {badge}
        </span>
      )}
    </button>
  );
}