// frontend/src/components/hr/FilterPanel.jsx
export default function FilterPanel({ 
  filters, 
  onFilterChange, 
  onClearFilters, 
  totalCount, 
  filteredCount 
}) {
  const activeFiltersCount = [
    filters.status !== 'all',
    filters.type !== 'all',
    filters.dateRange !== 'all',
    filters.scoreTier !== 'all',
    filters.searchQuery.trim() !== '',
    filters.minScore !== null,
    filters.maxScore !== null
  ].filter(Boolean).length;

  return (
    <div style={{ 
      padding: 20, 
      backgroundColor: '#f8f9fa', 
      borderRadius: 8, 
      marginBottom: 20,
      border: '1px solid #ddd'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
        <h3 style={{ margin: 0 }}>
          🔍 Filters {activeFiltersCount > 0 && `(${activeFiltersCount} active)`}
        </h3>
        {activeFiltersCount > 0 && (
          <button
            onClick={onClearFilters}
            style={{
              padding: '6px 12px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: 5,
              cursor: 'pointer',
              fontSize: 14
            }}
          >
            Clear All
          </button>
        )}
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: 15 
      }}>
        {/* Search */}
        <div>
          <label style={{ display: 'block', marginBottom: 5, fontWeight: 'bold', fontSize: 14 }}>
            Search Candidate
          </label>
          <input
            type="text"
            placeholder="Name or email..."
            value={filters.searchQuery}
            onChange={(e) => onFilterChange('searchQuery', e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: 5,
              border: '1px solid #ddd',
              fontSize: 14
            }}
          />
        </div>

        {/* Status */}
        <div>
          <label style={{ display: 'block', marginBottom: 5, fontWeight: 'bold', fontSize: 14 }}>
            Status
          </label>
          <select 
            value={filters.status} 
            onChange={(e) => onFilterChange('status', e.target.value)}
            style={{ width: '100%', padding: '8px 12px', borderRadius: 5, border: '1px solid #ddd' }}
          >
            <option value="all">All Status</option>
            <option value="completed">✅ Completed</option>
            <option value="processing">⏳ Processing</option>
          </select>
        </div>

        {/* Interview Type */}
        <div>
          <label style={{ display: 'block', marginBottom: 5, fontWeight: 'bold', fontSize: 14 }}>
            Interview Type
          </label>
          <select 
            value={filters.type} 
            onChange={(e) => onFilterChange('type', e.target.value)}
            style={{ width: '100%', padding: '8px 12px', borderRadius: 5, border: '1px solid #ddd' }}
          >
            <option value="all">All Types</option>
            <option value="technical">💻 Technical</option>
            <option value="behavioral">🗣️ Behavioral</option>
          </select>
        </div>

        {/* Performance Tier */}
        <div>
          <label style={{ display: 'block', marginBottom: 5, fontWeight: 'bold', fontSize: 14 }}>
            Performance Tier
          </label>
          <select 
            value={filters.scoreTier} 
            onChange={(e) => onFilterChange('scoreTier', e.target.value)}
            style={{ width: '100%', padding: '8px 12px', borderRadius: 5, border: '1px solid #ddd' }}
          >
            <option value="all">All Tiers</option>
            <option value="excellent">🌟 Excellent (80-100%)</option>
            <option value="good">👍 Good (60-79%)</option>
            <option value="needsImprovement">📈 Needs Improvement (&lt;60%)</option>
          </select>
        </div>

        {/* Min Score */}
        <div>
          <label style={{ display: 'block', marginBottom: 5, fontWeight: 'bold', fontSize: 14 }}>
            Min Score (%)
          </label>
          <input
            type="number"
            min="0"
            max="100"
            placeholder="e.g., 70"
            value={filters.minScore || ''}
            onChange={(e) => onFilterChange('minScore', e.target.value ? parseInt(e.target.value) : null)}
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: 5,
              border: '1px solid #ddd',
              fontSize: 14
            }}
          />
        </div>

        {/* Max Score */}
        <div>
          <label style={{ display: 'block', marginBottom: 5, fontWeight: 'bold', fontSize: 14 }}>
            Max Score (%)
          </label>
          <input
            type="number"
            min="0"
            max="100"
            placeholder="e.g., 85"
            value={filters.maxScore || ''}
            onChange={(e) => onFilterChange('maxScore', e.target.value ? parseInt(e.target.value) : null)}
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: 5,
              border: '1px solid #ddd',
              fontSize: 14
            }}
          />
        </div>

        {/* Date Range */}
        <div>
          <label style={{ display: 'block', marginBottom: 5, fontWeight: 'bold', fontSize: 14 }}>
            Date Range
          </label>
          <select 
            value={filters.dateRange} 
            onChange={(e) => onFilterChange('dateRange', e.target.value)}
            style={{ width: '100%', padding: '8px 12px', borderRadius: 5, border: '1px solid #ddd' }}
          >
            <option value="all">All Time</option>
            <option value="today">📅 Today</option>
            <option value="week">📆 This Week</option>
            <option value="month">🗓️ This Month</option>
          </select>
        </div>

        {/* Sort */}
        <div>
          <label style={{ display: 'block', marginBottom: 5, fontWeight: 'bold', fontSize: 14 }}>
            Sort By
          </label>
          <select 
            value={filters.sortBy} 
            onChange={(e) => onFilterChange('sortBy', e.target.value)}
            style={{ width: '100%', padding: '8px 12px', borderRadius: 5, border: '1px solid #ddd' }}
          >
            <option value="date">📅 Date (Newest)</option>
            <option value="score">📊 Score (Highest)</option>
            <option value="name">👤 Name (A-Z)</option>
          </select>
        </div>
      </div>

      <div style={{ marginTop: 15, display: 'flex', gap: 10, alignItems: 'center', fontSize: 14, color: '#666' }}>
        <span>
          Showing <strong>{filteredCount}</strong> of <strong>{totalCount}</strong> interviews
        </span>
        {(filters.minScore !== null || filters.maxScore !== null) && (
          <span style={{ 
            padding: '4px 8px', 
            backgroundColor: '#007bff', 
            color: 'white', 
            borderRadius: 4,
            fontSize: 12
          }}>
            Score Range: {filters.minScore || 0}% - {filters.maxScore || 100}%
          </span>
        )}
      </div>
    </div>
  );
}