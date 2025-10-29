import { useState, useEffect } from 'react'; // ✅ Added useEffect import
import Editor from '@monaco-editor/react';

export default function CodeEditor({ onRunCode, initialCode, problemId }) { // ✅ Added missing props
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('python'); // ✅ Changed to string
  const [isRunning, setIsRunning] = useState(false);

  // ✅ Map language string to Judge0 ID
  const LANG_MAP = {
    python: 71,
    javascript: 63,
    java: 62,
    cpp: 54
  };

  // ✅ Map language string to Monaco editor language
  const MONACO_LANG_MAP = {
    python: 'python',
    javascript: 'javascript',
    java: 'java',
    cpp: 'cpp'
  };

  // ✅ Load starter code when problem or language changes
  useEffect(() => {
    if (initialCode && initialCode[language]) {
      setCode(initialCode[language]);
    }
  }, [initialCode, language]);

  const handleRunCode = async () => {
    setIsRunning(true);
    await onRunCode(code, LANG_MAP[language], problemId); // ✅ Fixed syntax
    setIsRunning(false);
  };

  return (
    <div style={{ border: '1px solid #ddd', borderRadius: 8 }}>
      <div style={{ 
        padding: 10, 
        borderBottom: '1px solid #ddd', 
        display: 'flex', 
        justifyContent: 'space-between',
        backgroundColor: '#f8f9fa'
      }}>
        <select 
          value={language} 
          onChange={(e) => setLanguage(e.target.value)} // ✅ Changed to string value
          style={{ padding: '5px 10px', borderRadius: 4, border: '1px solid #ddd' }}
        >
          <option value="python">Python 3</option>
          <option value="java">Java</option>
          <option value="javascript">JavaScript</option>
          <option value="cpp">C++</option>
        </select>
        
        <button 
          onClick={handleRunCode}
          disabled={isRunning}
          style={{ 
            padding: '8px 16px', 
            backgroundColor: isRunning ? '#6c757d' : '#28a745',
            color: 'white', 
            border: 'none', 
            borderRadius: 4,
            cursor: isRunning ? 'not-allowed' : 'pointer',
            fontWeight: 'bold'
          }}
        >
          {isRunning ? 'Running...' : 'Run Code'}
        </button>
      </div>
      
      <Editor
        height="400px"
        language={MONACO_LANG_MAP[language]} // ✅ Use correct Monaco language
        value={code}
        onChange={(value) => setCode(value || '')}
        theme="vs-dark"
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          wordWrap: 'on',
          scrollBeyondLastLine: false
        }}
      />
    </div>
  );
}