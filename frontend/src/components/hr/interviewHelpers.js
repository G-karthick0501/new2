// frontend/src/components/hr/interviewHelpers.js

export const getScoreColor = (score) => {
  if (score >= 80) return '#28a745';
  if (score >= 60) return '#ffc107';
  return '#dc3545';
};

export const getScoreBadge = (score) => {
  if (score >= 80) return '🌟 Excellent';
  if (score >= 60) return '👍 Good';
  return '📈 Needs Improvement';
};

export const getScoreTier = (score) => {
  if (score >= 80) return 'excellent';
  if (score >= 60) return 'good';
  return 'needsImprovement';
};

export const filterInterviews = (interviews, filters) => {
  let filtered = [...interviews];

  // Status filter
  if (filters.status !== 'all') {
    filtered = filtered.filter(i => 
      filters.status === 'completed' ? i.status === 'completed' : i.status === 'ai_processing'
    );
  }

  // Type filter
  if (filters.type !== 'all') {
    filtered = filtered.filter(i => i.interviewType === filters.type);
  }

  // Performance tier filter
  if (filters.scoreTier !== 'all') {
    filtered = filtered.filter(i => {
      const score = i.overallScore || 0;
      if (filters.scoreTier === 'excellent') return score >= 80;
      if (filters.scoreTier === 'good') return score >= 60 && score < 80;
      if (filters.scoreTier === 'needsImprovement') return score < 60;
      return true;
    });
  }

  // Custom score range filter
  if (filters.minScore !== null || filters.maxScore !== null) {
    filtered = filtered.filter(i => {
      const score = i.overallScore || 0;
      const meetsMin = filters.minScore === null || score >= filters.minScore;
      const meetsMax = filters.maxScore === null || score <= filters.maxScore;
      return meetsMin && meetsMax;
    });
  }

  // Date filter
  if (filters.dateRange !== 'all') {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    filtered = filtered.filter(i => {
      const interviewDate = new Date(i.completedAt || i.createdAt);
      if (filters.dateRange === 'today') return interviewDate >= today;
      if (filters.dateRange === 'week') return interviewDate >= weekAgo;
      if (filters.dateRange === 'month') return interviewDate >= monthAgo;
      return true;
    });
  }

  // Search filter
  if (filters.searchQuery.trim()) {
    const query = filters.searchQuery.toLowerCase();
    filtered = filtered.filter(i => 
      i.userId?.name?.toLowerCase().includes(query) ||
      i.userId?.email?.toLowerCase().includes(query)
    );
  }

  return filtered;
};

export const sortInterviews = (interviews, sortBy) => {
  const sorted = [...interviews];
  
  sorted.sort((a, b) => {
    if (sortBy === 'date') {
      return new Date(b.completedAt || b.createdAt) - new Date(a.completedAt || a.createdAt);
    }
    if (sortBy === 'score') {
      return (b.overallScore || 0) - (a.overallScore || 0);
    }
    if (sortBy === 'name') {
      return (a.userId?.name || '').localeCompare(b.userId?.name || '');
    }
    return 0;
  });

  return sorted;
};

export const groupByPerformance = (interviews) => {
  return {
    excellent: interviews.filter(i => (i.overallScore || 0) >= 80),
    good: interviews.filter(i => (i.overallScore || 0) >= 60 && (i.overallScore || 0) < 80),
    needsImprovement: interviews.filter(i => (i.overallScore || 0) < 60)
  };
};