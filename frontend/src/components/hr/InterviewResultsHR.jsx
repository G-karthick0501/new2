// frontend/src/components/hr/InterviewResultsHR.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import FilterPanel from './FilterPanel';
import InterviewCard from './InterviewCard';
import PerformanceTiers from './PerformanceTiers';
import { filterInterviews, sortInterviews, groupByPerformance } from './interviewHelpers';

export default function InterviewResultsHR() {
  const [interviews, setInterviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeView, setActiveView] = useState('list');

  const [filters, setFilters] = useState({
    status: 'all',
    type: 'all',
    dateRange: 'all',
    scoreTier: 'all',
    minScore: null,
    maxScore: null,
    searchQuery: '',
    sortBy: 'date'
  });

  useEffect(() => {
    fetchInterviewResults();
  }, []);

  const fetchInterviewResults = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Not logged in. Please login first.');
        setLoading(false);
        return;
      }
      
      const response = await axios.get('http://localhost:5000/api/interview/results/all', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      setInterviews(response.data.interviews);
      setStats(response.data.stats);
      setError('');
    } catch (err) {
      console.error('Error fetching interviews:', err);
      if (err.response?.status === 401) {
        setError('Unauthorized. Please login as HR.');
      } else if (err.response?.status === 403) {
        setError('Access denied. HR role required.');
      } else {
        setError(err.response?.data?.msg || 'Failed to load interview results');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleClearFilters = () => {
    setFilters({
      status: 'all',
      type: 'all',
      dateRange: 'all',
      scoreTier: 'all',
      minScore: null,
      maxScore: null,
      searchQuery: '',
      sortBy: 'date'
    });
  };

  // Apply filters and sorting
  const filteredInterviews = sortInterviews(
    filterInterviews(interviews, filters),
    filters.sortBy
  );

  const performanceTiers = groupByPerformance(filteredInterviews);

  if (loading) {
    return (
      <div style={{ padding: 20, textAlign: 'center' }}>
        <p>Loading interview results...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 20, color: '#dc3545' }}>
        <h3>Error</h3>
        <p>{error}</p>
        <button onClick={fetchInterviewResults} style={{ marginTop: 10, padding: '8px 16px' }}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2>📊 Interview Results Dashboard</h2>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => setActiveView('list')}
            style={{
              padding: '8px 16px',
              backgroundColor: activeView === 'list' ? '#007bff' : '#f8f9fa',
              color: activeView === 'list' ? 'white' : '#333',
              border: '1px solid #ddd',
              borderRadius: 5,
              cursor: 'pointer'
            }}
          >
            📋 List View
          </button>
          <button
            onClick={() => setActiveView('tiers')}
            style={{
              padding: '8px 16px',
              backgroundColor: activeView === 'tiers' ? '#007bff' : '#f8f9fa',
              color: activeView === 'tiers' ? 'white' : '#333',
              border: '1px solid #ddd',
              borderRadius: 5,
              cursor: 'pointer'
            }}
          >
            🎯 Performance Tiers
          </button>
          <button 
            onClick={fetchInterviewResults}
            style={{ 
              padding: '8px 16px', 
              backgroundColor: '#28a745', 
              color: 'white', 
              border: 'none', 
              borderRadius: 5,
              cursor: 'pointer'
            }}
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      {stats && (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: 15, 
          marginBottom: 30 
        }}>
          <div style={{ padding: 20, border: '1px solid #ddd', borderRadius: 8, backgroundColor: '#f8f9fa' }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#666' }}>Total Interviews</h4>
            <p style={{ fontSize: 32, fontWeight: 'bold', margin: 0, color: '#007bff' }}>{stats.total}</p>
          </div>
          <div style={{ padding: 20, border: '1px solid #ddd', borderRadius: 8, backgroundColor: '#f8f9fa' }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#666' }}>Completed</h4>
            <p style={{ fontSize: 32, fontWeight: 'bold', margin: 0, color: '#28a745' }}>{stats.completed}</p>
          </div>
          <div style={{ padding: 20, border: '1px solid #ddd', borderRadius: 8, backgroundColor: '#f8f9fa' }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#666' }}>AI Processed</h4>
            <p style={{ fontSize: 32, fontWeight: 'bold', margin: 0, color: '#17a2b8' }}>{stats.aiProcessed}</p>
          </div>
          <div style={{ padding: 20, border: '1px solid #ddd', borderRadius: 8, backgroundColor: '#f8f9fa' }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#666' }}>Avg Score</h4>
            <p style={{ fontSize: 32, fontWeight: 'bold', margin: 0, color: '#ffc107' }}>{stats.avgScore}%</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <FilterPanel
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
        totalCount={interviews.length}
        filteredCount={filteredInterviews.length}
      />

      {/* Content based on view */}
      {activeView === 'tiers' ? (
        <PerformanceTiers tiers={performanceTiers} filters={filters} />
      ) : (
        <>
          {filteredInterviews.length === 0 ? (
            <div style={{ 
              padding: 40, 
              textAlign: 'center', 
              border: '2px dashed #ddd', 
              borderRadius: 8,
              color: '#666'
            }}>
              <p style={{ fontSize: 18 }}>No interviews match your filters</p>
              <p>Try adjusting your filters or clearing them</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 15 }}>
              {filteredInterviews.map(interview => (
                <InterviewCard key={interview._id} interview={interview} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}