import { useState, useEffect } from 'react';
import CodeEditor from '../coding/CodeEditor';
import { codingService } from '../../services/codingService';

export default function CodingPractice() {
  const [problems, setProblems] = useState([]);
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [output, setOutput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState([]);
  const [initialCode, setInitialCode] = useState({}); // ✅ MOVED INSIDE COMPONENT
  const [loadingProblems, setLoadingProblems] = useState(true);
  const [error, setError] = useState(null);

  // Timer states
  const [timerMinutes, setTimerMinutes] = useState(30);
  const [timeLeft, setTimeLeft] = useState(null); // null means timer not started
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerInterval, setTimerInterval] = useState(null);

  useEffect(() => {
    // Increment counter when user accesses coding practice
    if (window.incrementFeatureCounter) {
      window.incrementFeatureCounter('coding');
    }
    
    loadProblems();

    // Cleanup timer on unmount
    return () => {
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    };
  }, []);

  // Timer effect
  useEffect(() => {
    if (isTimerRunning && timeLeft !== null && timeLeft > 0) {
      const interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            setIsTimerRunning(false);
            setTimerInterval(null);
            alert('⏰ Time\'s up! Your timer has ended.');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      setTimerInterval(interval);
      
      return () => clearInterval(interval);
    }
  }, [isTimerRunning]);

  const startTimer = () => {
    setTimeLeft(timerMinutes * 60);
    setIsTimerRunning(true);
  };

  const pauseTimer = () => {
    setIsTimerRunning(false);
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
  };

  const resumeTimer = () => {
    if (timeLeft > 0) {
      setIsTimerRunning(true);
    }
  };

  const resetTimer = () => {
    setIsTimerRunning(false);
    setTimeLeft(null);
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
  };

  const formatTime = (seconds) => {
    if (seconds === null) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const loadProblems = async () => {
    try {
      setLoadingProblems(true);
      setError(null);
      const data = await codingService.getProblems();
      console.log('Fetched problems:', data);
      
      if (Array.isArray(data)) {
        setProblems(data);
        if (data.length > 0) {
          loadProblem(data[0]._id);
        }
      } else {
        setError('Failed to load problems. Please try logging in again.');
      }
    } catch (error) {
      console.error('Failed to load problems:', error);
      setError('Failed to load problems: ' + error.message);
    } finally {
      setLoadingProblems(false);
    }
  };

  const loadProblem = async (id) => {
    try {
      const problem = await codingService.getProblem(id);
      setSelectedProblem(problem);
      setTestResults([]);
      setOutput('');
      setInitialCode(problem.starterCode || {}); // ✅ Set starter code
    } catch (error) {
      console.error('Failed to load problem:', error);
    }
  };

  const handleRunCode = async (sourceCode, languageId, problemId) => { // ✅ Added problemId param
    if (!selectedProblem || !selectedProblem.testCases) {
      setOutput('No test cases found');
      return;
    }

    try {
      setIsLoading(true);
      setOutput('Running tests...');
      setTestResults([]);

      const results = [];

      for (let i = 0; i < selectedProblem.testCases.length; i++) {
        const testCase = selectedProblem.testCases[i];

        const submitResponse = await codingService.submitCode(
          sourceCode,
          languageId,
          testCase.input,
          problemId // ✅ Pass problemId
        );

        if (!submitResponse.token) {
          results.push({
            ...testCase,
            status: 'error',
            got: 'Submission failed'
          });
          continue;
        }

        let attempts = 0;
        const maxAttempts = 10;
        let completed = false;

        while (attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 1000));

          const execResult = await codingService.getSubmissionResults(submitResponse.token);

          if (execResult.status && execResult.status.id > 2) {
            const got = (execResult.stdout || '').trim();
            const expected = testCase.expectedOutput.trim();
            const passed = got === expected;

            results.push({
              ...testCase,
              status: passed ? 'pass' : 'fail',
              got: got || execResult.stderr || 'No output'
            });

            completed = true;
            break;
          }

          attempts++;
        }

        if (!completed) {
          results.push({
            ...testCase,
            status: 'timeout',
            got: 'Execution timeout'
          });
        }
      }

      setTestResults(results);

      const passedCount = results.filter(r => r.status === 'pass').length;
      const totalCount = selectedProblem.testCases.length;
      setOutput(`Passed ${passedCount}/${totalCount} tests`);

    } catch (error) {
      setOutput('Error: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* Header Section */}
      <div style={styles.header}>
        <div style={styles.iconCircle}>💻</div>
        <h1 style={styles.title}>Coding Practice</h1>
        <p style={styles.subtitle}>Solve challenges and improve your coding skills</p>
      </div>

      {/* Loading State */}
      {loadingProblems && (
        <div style={styles.loadingContainer}>
          <div style={styles.spinner}>⏳</div>
          <p style={styles.loadingText}>Loading coding problems...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div style={styles.errorContainer}>
          <span style={{ fontSize: 32 }}>⚠️</span>
          <p style={styles.errorText}>{error}</p>
          <button onClick={loadProblems} style={styles.retryButton}>
            🔄 Retry
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loadingProblems && !error && problems.length === 0 && (
        <div style={styles.emptyContainer}>
          <span style={{ fontSize: 48 }}>📝</span>
          <p style={styles.emptyText}>No coding problems available yet.</p>
          <p style={styles.emptySubtext}>Please contact your administrator to add problems.</p>
        </div>
      )}

      {/* Problem Selector - Only show if problems exist */}
      {!loadingProblems && !error && problems.length > 0 && (
        <>
          <div style={styles.selectorCard}>
            <label style={styles.selectorLabel}>
              <span style={{ fontSize: 20, marginRight: 8 }}>🎯</span>
              Select Problem:
            </label>
            <select 
              onChange={(e) => loadProblem(e.target.value)}
              value={selectedProblem?._id || ''}
              style={styles.select}
            >
              {problems.map(p => (
                <option key={p._id} value={p._id}>
                  {p.title} • {p.difficulty}
                </option>
              ))}
            </select>
          </div>

          {/* Timer Section */}
          <div style={styles.timerCard}>
            <div style={styles.timerHeader}>
              <span style={{ fontSize: 24, marginRight: 8 }}>⏱️</span>
              <h3 style={styles.timerTitle}>Practice Timer</h3>
            </div>
            
            <div style={styles.timerContent}>
              {timeLeft === null ? (
                // Timer setup
                <div style={styles.timerSetup}>
                  <label style={styles.timerLabel}>Set Duration (minutes):</label>
                  <div style={styles.timerInputGroup}>
                    <input
                      type="number"
                      min="1"
                      max="180"
                      value={timerMinutes}
                      onChange={(e) => setTimerMinutes(Math.max(1, parseInt(e.target.value) || 1))}
                      style={styles.timerInput}
                    />
                    <button onClick={startTimer} style={styles.startButton}>
                      ▶️ Start Timer
                    </button>
                  </div>
                  <div style={styles.presetButtons}>
                    <button onClick={() => setTimerMinutes(15)} style={styles.presetButton}>15 min</button>
                    <button onClick={() => setTimerMinutes(30)} style={styles.presetButton}>30 min</button>
                    <button onClick={() => setTimerMinutes(45)} style={styles.presetButton}>45 min</button>
                    <button onClick={() => setTimerMinutes(60)} style={styles.presetButton}>60 min</button>
                  </div>
                </div>
              ) : (
                // Timer display and controls
                <div style={styles.timerDisplay}>
                  <div style={{
                    ...styles.timeDisplay,
                    color: timeLeft < 60 ? '#dc3545' : timeLeft < 300 ? '#ffc107' : '#667eea'
                  }}>
                    {formatTime(timeLeft)}
                  </div>
                  <div style={styles.timerControls}>
                    {isTimerRunning ? (
                      <button onClick={pauseTimer} style={styles.pauseButton}>
                        ⏸️ Pause
                      </button>
                    ) : (
                      <button onClick={resumeTimer} style={styles.resumeButton} disabled={timeLeft === 0}>
                        ▶️ Resume
                      </button>
                    )}
                    <button onClick={resetTimer} style={styles.resetButton}>
                      🔄 Reset
                    </button>
                  </div>
                  {timeLeft < 60 && timeLeft > 0 && (
                    <div style={styles.warningText}>
                      ⚠️ Less than 1 minute remaining!
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* All Problems Grid View */}
          <div style={styles.allProblemsSection}>
            <h2 style={styles.allProblemsTitle}>
              <span style={{ fontSize: 24, marginRight: 10 }}>📚</span>
              All Available Problems ({problems.length})
            </h2>
            <div style={styles.problemsGrid}>
              {problems.map((problem) => (
                <div
                  key={problem._id}
                  style={{
                    ...styles.problemGridCard,
                    border: selectedProblem?._id === problem._id ? '3px solid #667eea' : '2px solid #e2e8f0'
                  }}
                  onClick={() => loadProblem(problem._id)}
                  onMouseOver={(e) => {
                    if (selectedProblem?._id !== problem._id) {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = '0 8px 20px rgba(102, 126, 234, 0.2)';
                    }
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
                  }}
                >
                  <div style={styles.problemGridHeader}>
                    <h3 style={styles.problemGridTitle}>{problem.title}</h3>
                    <span style={{
                      ...styles.difficultyTag,
                      background: 
                        problem.difficulty === 'easy' ? 'linear-gradient(135deg, #28a745 0%, #20c997 100%)' : 
                        problem.difficulty === 'medium' ? 'linear-gradient(135deg, #ffc107 0%, #ff9800 100%)' : 
                        'linear-gradient(135deg, #dc3545 0%, #c82333 100%)'
                    }}>
                      {problem.difficulty.toUpperCase()}
                    </span>
                  </div>
                  <p style={styles.problemGridDesc}>
                    {problem.description?.substring(0, 120)}...
                  </p>
                  <div style={styles.problemGridFooter}>
                    <span style={styles.testCaseCount}>
                      🧪 {problem.testCases?.length || 0} Test Cases
                    </span>
                    {selectedProblem?._id === problem._id && (
                      <span style={styles.activeIndicator}>
                        ✓ Active
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Main Grid - Only show if a problem is selected */}
      {!loadingProblems && !error && selectedProblem && (
        <div style={styles.mainGrid}>
        {/* Left Panel - Problem & Editor */}
        <div style={styles.leftPanel}>
          {/* Problem Description */}
          <div style={styles.problemCard}>
            <div style={styles.problemHeader}>
              <h2 style={styles.problemTitle}>{selectedProblem?.title}</h2>
              <span style={{
                ...styles.difficultyBadge,
                backgroundColor: 
                  selectedProblem?.difficulty === 'easy' ? '#d4edda' : 
                  selectedProblem?.difficulty === 'medium' ? '#fff3cd' : '#f8d7da',
                color: 
                  selectedProblem?.difficulty === 'easy' ? '#155724' : 
                  selectedProblem?.difficulty === 'medium' ? '#856404' : '#721c24'
              }}>
                {selectedProblem?.difficulty?.toUpperCase()}
              </span>
            </div>
            <p style={styles.problemDescription}>
              {selectedProblem?.description}
            </p>
          </div>

          {/* Code Editor Section */}
          <div style={styles.editorSection}>
            <div style={styles.editorHeader}>
              <span style={{ fontSize: 20, marginRight: 8 }}>⌨️</span>
              <h3 style={styles.editorTitle}>Code Editor</h3>
            </div>
            <CodeEditor 
              onRunCode={handleRunCode}
              initialCode={initialCode}
              problemId={selectedProblem?._id}
            />
          </div>
        </div>

        {/* Right Panel - Output & Results */}
        <div style={styles.rightPanel}>
          {/* Output Section */}
          <div style={styles.outputSection}>
            <div style={styles.outputHeader}>
              <span style={{ fontSize: 20, marginRight: 8 }}>📤</span>
              <h3 style={styles.outputTitle}>Output</h3>
            </div>
            <div style={styles.outputBox}>
              {isLoading ? (
                <div style={styles.loadingState}>
                  <span style={styles.spinner}>⏳</span>
                  <span>Executing your code...</span>
                </div>
              ) : (
                <pre style={styles.outputText}>{output || 'Run your code to see output'}</pre>
              )}
            </div>
          </div>

          {/* Test Results Section */}
          {testResults.length > 0 && (
            <div style={styles.resultsSection}>
              <div style={styles.resultsHeader}>
                <span style={{ fontSize: 20, marginRight: 8 }}>📊</span>
                <h3 style={styles.resultsTitle}>Test Results</h3>
                <span style={styles.resultsSummary}>
                  {testResults.filter(r => r.status === 'pass').length}/{testResults.length} Passed
                </span>
              </div>
              <div style={styles.testsList}>
                {testResults.map((test, idx) => (
                  <div 
                    key={idx} 
                    style={{
                      ...styles.testCard,
                      borderLeft: test.status === 'pass' 
                        ? '4px solid #28a745' 
                        : '4px solid #dc3545'
                    }}
                  >
                    <div style={styles.testHeader}>
                      <span style={styles.testNumber}>Test {idx + 1}</span>
                      <span style={{
                        ...styles.testStatus,
                        background: test.status === 'pass' 
                          ? 'linear-gradient(135deg, #28a745 0%, #20c997 100%)' 
                          : 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)'
                      }}>
                        {test.status === 'pass' ? '✓ Passed' : '✗ Failed'}
                      </span>
                    </div>
                    {test.description && (
                      <div style={styles.testDescription}>{test.description}</div>
                    )}
                    <div style={styles.testDetails}>
                      <div style={styles.testDetailRow}>
                        <span style={styles.testLabel}>Expected:</span>
                        <code style={styles.testValue}>{test.expectedOutput}</code>
                      </div>
                      <div style={styles.testDetailRow}>
                        <span style={styles.testLabel}>Got:</span>
                        <code style={{
                          ...styles.testValue,
                          color: test.status === 'pass' ? '#28a745' : '#dc3545'
                        }}>
                          {test.got}
                        </code>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: '40px 20px',
    maxWidth: 1600,
    margin: '0 auto',
    minHeight: '100vh',
    background: '#f8f9fa'
  },
  header: {
    textAlign: 'center',
    marginBottom: 35
  },
  iconCircle: {
    width: 70,
    height: 70,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 36,
    margin: '0 auto 15px',
    boxShadow: '0 6px 20px rgba(102, 126, 234, 0.3)'
  },
  title: {
    fontSize: 36,
    fontWeight: 700,
    margin: '0 0 10px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text'
  },
  subtitle: {
    fontSize: 16,
    color: '#6c757d',
    margin: 0
  },
  loadingContainer: {
    background: 'white',
    borderRadius: 16,
    padding: 60,
    textAlign: 'center',
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
    marginBottom: 25
  },
  loadingText: {
    fontSize: 18,
    color: '#667eea',
    fontWeight: 600,
    margin: '15px 0 0 0'
  },
  errorContainer: {
    background: 'linear-gradient(135deg, #fee 0%, #fdd 100%)',
    borderRadius: 16,
    padding: 40,
    textAlign: 'center',
    border: '2px solid #f5c6cb',
    marginBottom: 25
  },
  errorText: {
    fontSize: 16,
    color: '#721c24',
    margin: '15px 0',
    fontWeight: 500
  },
  retryButton: {
    padding: '12px 24px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: 8,
    fontSize: 16,
    fontWeight: 600,
    cursor: 'pointer',
    marginTop: 10
  },
  emptyContainer: {
    background: 'white',
    borderRadius: 16,
    padding: 60,
    textAlign: 'center',
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
    marginBottom: 25
  },
  emptyText: {
    fontSize: 20,
    color: '#2d3748',
    fontWeight: 600,
    margin: '20px 0 10px 0'
  },
  emptySubtext: {
    fontSize: 16,
    color: '#718096',
    margin: 0
  },
  selectorCard: {
    background: 'white',
    padding: 25,
    borderRadius: 12,
    marginBottom: 25,
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    display: 'flex',
    alignItems: 'center',
    gap: 15,
    border: '2px solid #e9ecef'
  },
  selectorLabel: {
    fontSize: 16,
    fontWeight: 600,
    color: '#495057',
    display: 'flex',
    alignItems: 'center',
    flexShrink: 0
  },
  select: {
    padding: '12px 20px',
    borderRadius: 8,
    border: '2px solid #dee2e6',
    fontSize: 15,
    fontWeight: 500,
    flex: 1,
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    outline: 'none',
    background: 'white'
  },
  allProblemsSection: {
    marginBottom: 30
  },
  allProblemsTitle: {
    fontSize: 24,
    fontWeight: 700,
    color: '#2d3748',
    marginBottom: 20,
    display: 'flex',
    alignItems: 'center'
  },
  problemsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: 20,
    marginBottom: 30
  },
  problemGridCard: {
    background: 'white',
    borderRadius: 12,
    padding: 20,
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    border: '2px solid #e2e8f0'
  },
  problemGridHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 10
  },
  problemGridTitle: {
    fontSize: 18,
    fontWeight: 700,
    color: '#2d3748',
    margin: 0,
    flex: 1
  },
  difficultyTag: {
    padding: '4px 12px',
    borderRadius: 16,
    fontSize: 11,
    fontWeight: 700,
    color: 'white',
    whiteSpace: 'nowrap',
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.15)'
  },
  problemGridDesc: {
    fontSize: 14,
    color: '#4a5568',
    lineHeight: 1.6,
    marginBottom: 15,
    minHeight: 60
  },
  problemGridFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTop: '1px solid #e2e8f0'
  },
  testCaseCount: {
    fontSize: 13,
    color: '#718096',
    fontWeight: 500
  },
  activeIndicator: {
    fontSize: 12,
    fontWeight: 700,
    color: '#667eea',
    display: 'flex',
    alignItems: 'center',
    gap: 4
  },
  mainGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 25
  },
  leftPanel: {
    display: 'flex',
    flexDirection: 'column',
    gap: 20
  },
  rightPanel: {
    display: 'flex',
    flexDirection: 'column',
    gap: 20
  },
  problemCard: {
    background: 'white',
    borderRadius: 12,
    padding: 30,
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
    border: '2px solid #e9ecef'
  },
  problemHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20
  },
  problemTitle: {
    fontSize: 24,
    fontWeight: 700,
    color: '#333',
    margin: 0
  },
  difficultyBadge: {
    padding: '6px 14px',
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: '0.5px'
  },
  problemDescription: {
    whiteSpace: 'pre-wrap',
    lineHeight: 1.8,
    fontSize: 15,
    color: '#495057',
    margin: 0
  },
  editorSection: {
    background: 'white',
    borderRadius: 12,
    padding: 25,
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
    border: '2px solid #e9ecef'
  },
  editorHeader: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 15,
    borderBottom: '2px solid #e9ecef'
  },
  editorTitle: {
    fontSize: 18,
    fontWeight: 600,
    color: '#333',
    margin: 0
  },
  outputSection: {
    background: 'white',
    borderRadius: 12,
    padding: 25,
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
    border: '2px solid #e9ecef'
  },
  outputHeader: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 15,
    borderBottom: '2px solid #e9ecef'
  },
  outputTitle: {
    fontSize: 18,
    fontWeight: 600,
    color: '#333',
    margin: 0
  },
  outputBox: {
    background: '#f8f9fa',
    borderRadius: 8,
    padding: 20,
    minHeight: 120,
    fontFamily: 'monospace',
    fontSize: 14,
    border: '2px solid #dee2e6'
  },
  loadingState: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    justifyContent: 'center',
    color: '#667eea',
    fontWeight: 600
  },
  spinner: {
    fontSize: 24,
    animation: 'spin 1s linear infinite'
  },
  outputText: {
    margin: 0,
    color: '#333',
    lineHeight: 1.6,
    whiteSpace: 'pre-wrap',
    wordWrap: 'break-word'
  },
  resultsSection: {
    background: 'white',
    borderRadius: 12,
    padding: 25,
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
    border: '2px solid #e9ecef'
  },
  resultsHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottom: '2px solid #e9ecef'
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: 600,
    color: '#333',
    margin: 0,
    display: 'flex',
    alignItems: 'center',
    flex: 1
  },
  resultsSummary: {
    padding: '6px 14px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    borderRadius: 20,
    fontSize: 13,
    fontWeight: 700
  },
  testsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 15
  },
  testCard: {
    background: '#f8f9fa',
    borderRadius: 10,
    padding: 18,
    transition: 'all 0.3s ease'
  },
  testHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  testNumber: {
    fontSize: 15,
    fontWeight: 700,
    color: '#495057'
  },
  testStatus: {
    padding: '5px 12px',
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 700,
    color: 'white'
  },
  testDescription: {
    fontSize: 13,
    color: '#6c757d',
    marginBottom: 12,
    fontStyle: 'italic'
  },
  testDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10
  },
  testDetailRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 10
  },
  testLabel: {
    fontSize: 13,
    fontWeight: 600,
    color: '#495057',
    minWidth: 80,
    flexShrink: 0
  },
  testValue: {
    padding: '6px 12px',
    background: 'white',
    borderRadius: 6,
    fontSize: 13,
    fontFamily: 'monospace',
    border: '1px solid #dee2e6',
    flex: 1,
    wordBreak: 'break-all'
  },
  timerCard: {
    background: 'white',
    borderRadius: 16,
    padding: 30,
    marginBottom: 30,
    boxShadow: '0 8px 24px rgba(102, 126, 234, 0.15)',
    border: '2px solid #e9ecef',
    transition: 'all 0.3s ease'
  },
  timerHeader: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottom: '2px solid #e9ecef'
  },
  timerTitle: {
    fontSize: 20,
    fontWeight: 700,
    color: '#333',
    margin: 0
  },
  timerContent: {
    minHeight: 120
  },
  timerSetup: {
    display: 'flex',
    flexDirection: 'column',
    gap: 15
  },
  timerLabel: {
    fontSize: 15,
    fontWeight: 600,
    color: '#495057',
    marginBottom: 5
  },
  timerInputGroup: {
    display: 'flex',
    gap: 15,
    alignItems: 'center'
  },
  timerInput: {
    flex: 1,
    maxWidth: 150,
    padding: '12px 16px',
    fontSize: 16,
    border: '2px solid #dee2e6',
    borderRadius: 10,
    outline: 'none',
    transition: 'all 0.3s ease',
    fontWeight: 600
  },
  startButton: {
    flex: 1,
    padding: '12px 24px',
    background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
    color: 'white',
    border: 'none',
    borderRadius: 10,
    fontSize: 16,
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 12px rgba(40, 167, 69, 0.3)'
  },
  presetButtons: {
    display: 'flex',
    gap: 10,
    flexWrap: 'wrap'
  },
  presetButton: {
    flex: 1,
    padding: '10px 20px',
    background: 'white',
    color: '#667eea',
    border: '2px solid #667eea',
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  },
  timerDisplay: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 20
  },
  timeDisplay: {
    fontSize: 56,
    fontWeight: 800,
    fontFamily: 'monospace',
    letterSpacing: '4px',
    textShadow: '2px 2px 4px rgba(0, 0, 0, 0.1)',
    padding: '15px 30px',
    borderRadius: 12,
    background: 'rgba(102, 126, 234, 0.05)',
    border: '2px solid rgba(102, 126, 234, 0.2)'
  },
  timerControls: {
    display: 'flex',
    gap: 15,
    width: '100%',
    maxWidth: 400
  },
  pauseButton: {
    flex: 1,
    padding: '12px 24px',
    background: 'linear-gradient(135deg, #ffc107 0%, #ff9800 100%)',
    color: 'white',
    border: 'none',
    borderRadius: 10,
    fontSize: 16,
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 12px rgba(255, 193, 7, 0.3)'
  },
  resumeButton: {
    flex: 1,
    padding: '12px 24px',
    background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
    color: 'white',
    border: 'none',
    borderRadius: 10,
    fontSize: 16,
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 12px rgba(40, 167, 69, 0.3)'
  },
  resetButton: {
    flex: 1,
    padding: '12px 24px',
    background: 'linear-gradient(135deg, #6c757d 0%, #495057 100%)',
    color: 'white',
    border: 'none',
    borderRadius: 10,
    fontSize: 16,
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 12px rgba(108, 117, 125, 0.3)'
  },
  warningText: {
    color: '#dc3545',
    fontSize: 14,
    fontWeight: 700,
    padding: '8px 16px',
    background: 'rgba(220, 53, 69, 0.1)',
    borderRadius: 8,
    border: '1px solid rgba(220, 53, 69, 0.3)'
  }
};
