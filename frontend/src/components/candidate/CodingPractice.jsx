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

  useEffect(() => {
    loadProblems();
  }, []);

  const loadProblems = async () => {
    try {
      const data = await codingService.getProblems();
      setProblems(data);
      if (data.length > 0) {
        loadProblem(data[0]._id);
      }
    } catch (error) {
      console.error('Failed to load problems:', error);
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
    <div style={{ padding: 20 }}>
      <h2>Coding Practice</h2>

      <div style={{ marginBottom: 20 }}>
        <label style={{ marginRight: 10, fontWeight: 'bold' }}>Select Problem:</label>
        <select 
          onChange={(e) => loadProblem(e.target.value)}
          value={selectedProblem?._id || ''}
          style={{ padding: '8px 12px', borderRadius: 4, border: '1px solid #ddd' }}
        >
          {problems.map(p => (
            <option key={p._id} value={p._id}>
              {p.title} ({p.difficulty})
            </option>
          ))}
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div>
          <div style={{ 
            border: '1px solid #ddd', 
            borderRadius: 8, 
            padding: 20,
            backgroundColor: '#fff',
            marginBottom: 20,
            minHeight: 200
          }}>
            <h3>{selectedProblem?.title}</h3>
            <span style={{ 
              display: 'inline-block',
              padding: '4px 8px',
              borderRadius: 4,
              fontSize: 12,
              fontWeight: 'bold',
              backgroundColor: selectedProblem?.difficulty === 'easy' ? '#d4edda' : 
                             selectedProblem?.difficulty === 'medium' ? '#fff3cd' : '#f8d7da',
              color: selectedProblem?.difficulty === 'easy' ? '#155724' : 
                     selectedProblem?.difficulty === 'medium' ? '#856404' : '#721c24',
              marginBottom: 10
            }}>
              {selectedProblem?.difficulty?.toUpperCase()}
            </span>
            <p style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
              {selectedProblem?.description}
            </p>
          </div>

          <h3>Code Editor</h3>
          <CodeEditor 
            onRunCode={handleRunCode}
            initialCode={initialCode}  // ✅ Pass initialCode
            problemId={selectedProblem?._id}  // ✅ Pass problemId
          />
        </div>

        <div>
          <h3>Output</h3>
          <div style={{
            border: '1px solid #ddd',
            borderRadius: 8,
            padding: 15,
            minHeight: 100,
            backgroundColor: '#f8f9fa',
            fontFamily: 'monospace',
            marginBottom: 20
          }}>
            {isLoading ? 'Executing...' : output || 'Run your code to see output'}
          </div>

          {testResults.length > 0 && (
            <div>
              <h4>Test Results</h4>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: 13
              }}>
                <thead>
                  <tr style={{ backgroundColor: '#e9ecef' }}>
                    <th style={{ padding: 8, border: '1px solid #ddd', textAlign: 'left' }}>Test</th>
                    <th style={{ padding: 8, border: '1px solid #ddd', textAlign: 'left' }}>Expected</th>
                    <th style={{ padding: 8, border: '1px solid #ddd', textAlign: 'left' }}>Got</th>
                    <th style={{ padding: 8, border: '1px solid #ddd', textAlign: 'center' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {testResults.map((test, idx) => (
                    <tr key={idx} style={{
                      backgroundColor: test.status === 'pass' ? '#d4edda' : '#f8d7da'
                    }}>
                      <td style={{ padding: 8, border: '1px solid #ddd' }}>
                        {test.description || `Test ${idx + 1}`}
                      </td>
                      <td style={{ padding: 8, border: '1px solid #ddd' }}>{test.expectedOutput}</td>
                      <td style={{ padding: 8, border: '1px solid #ddd' }}>{test.got}</td>
                      <td style={{ padding: 8, border: '1px solid #ddd', textAlign: 'center' }}>
                        {test.status === 'pass' ? '✅' : '❌'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}