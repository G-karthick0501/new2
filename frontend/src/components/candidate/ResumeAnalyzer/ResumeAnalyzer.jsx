// frontend/src/components/candidate/ResumeAnalyzer/ResumeAnalyzer.jsx
import { useState, useEffect } from 'react';
import FileUpload from './FileUpload';
import SkillSelectionModal from './SkillSelectionModal';
import DiffViewer from './DiffViewer';
import { useResumeAnalysis } from '../../../hooks/useResumeAnalysis';

export default function ResumeAnalyzer() {
  const [resumeFile, setResumeFile] = useState(null);
  const [jdFile, setJdFile] = useState(null);

  useEffect(() => {
    // Increment counter when user accesses resume analyzer
    if (window.incrementFeatureCounter) {
      window.incrementFeatureCounter('resume');
    }
  }, []);

  const {
    analyzeResume,
    generateOptimized,
    generatePDF,
    toggleSkill,
    selectAllSkills,
    deselectAllSkills,
    handleCancelSkillSelection,
    currentStep,
    missingSkills,
    selectedSkills,
    improvementTips,
    optimizedResume,
    originalResume, // ✅ ADD THIS
    loading,
    error,
    uploadStatus,
    selectedSkillsCount
  } = useResumeAnalysis();

  const handleAnalyze = async () => {
    if (!resumeFile || !jdFile) {
      alert('Please upload both files');
      return;
    }
    await analyzeResume(resumeFile, jdFile);
  };

  const handleContinueWithSkills = async () => {
    await generateOptimized(resumeFile, jdFile);
  };

  const handleDownload = () => {
    if (!optimizedResume) return;
    
    const blob = new Blob([optimizedResume], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'optimized_resume.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handleTestConnection = async () => {
    try {
      const response = await fetch('http://localhost:8000/docs');
      if (response.ok) {
        alert('✅ Connection successful! AI service is running.');
      } else {
        alert('⚠️ AI service responded but with an error.');
      }
    } catch (err) {
      alert('❌ Cannot connect to AI service. Make sure it\'s running on port 8000.');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* Header */}
        <div style={styles.headerSection}>
          <div style={styles.iconCircle}>📄</div>
          <h2 style={styles.title}>AI Resume Analyzer & Optimizer</h2>
          <p style={styles.description}>
            Upload your resume and job description to get AI-powered optimization suggestions
          </p>
        </div>

        {/* STEP 1: FILE UPLOAD */}
        {currentStep === 'upload' && (
          <>
            <FileUpload
              resumeFile={resumeFile}
              jdFile={jdFile}
              onFilesSelected={(type, file) => {
                if (type === 'resume') setResumeFile(file);
                else if (type === 'jd') setJdFile(file);
              }}
            />

            {uploadStatus && (
              <div style={styles.statusBox}>
                <div style={styles.statusIcon}>✓</div>
                <p style={styles.statusText}>{uploadStatus}</p>
              </div>
            )}

            {error && (
              <div style={styles.errorBox}>
                <div style={styles.errorIcon}>⚠</div>
                <p style={styles.errorText}>{error}</p>
              </div>
            )}

            <div style={styles.buttonContainer}>
              <button
                onClick={handleTestConnection}
                style={{
                  ...styles.button,
                  ...styles.secondaryButton
                }}
                onMouseOver={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.3)';
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                }}
              >
                <span style={{ fontSize: 20 }}>🔌</span>
                Test Connection
              </button>

              <button
                onClick={handleAnalyze}
                disabled={!resumeFile || !jdFile || loading}
                style={{
                  ...styles.button,
                  ...styles.primaryButton,
                  opacity: (!resumeFile || !jdFile || loading) ? 0.6 : 1,
                  cursor: (!resumeFile || !jdFile || loading) ? 'not-allowed' : 'pointer'
                }}
                onMouseOver={(e) => {
                  if (!(!resumeFile || !jdFile || loading)) {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.4)';
                  }
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)';
                }}
              >
                {loading ? (
                  <>
                    <span style={styles.spinner}>⏳</span> Analyzing...
                  </>
                ) : (
                  <>
                    <span style={{ fontSize: 20 }}>🔍</span>
                    Analyze Resume
                  </>
                )}
              </button>
            </div>

            <div style={styles.instructions}>
              <h3 style={styles.instructionsTitle}>
                <span style={{ fontSize: 24, marginRight: 10 }}>💡</span>
                How it works:
              </h3>
              <div style={styles.instructionsList}>
                {[
                  { icon: '📤', text: 'Upload your current resume (PDF)' },
                  { icon: '📋', text: 'Upload the job description you\'re targeting (PDF)' },
                  { icon: '🔌', text: 'Test Connection (optional) - Verify backend connectivity' },
                  { icon: '🤖', text: 'Analyze Resume - AI identifies missing skills' },
                  { icon: '✔️', text: 'Select which skills you want to add' },
                  { icon: '🎉', text: 'Get your optimized resume instantly!' }
                ].map((step, idx) => (
                  <div key={idx} style={styles.instructionItem}>
                    <span style={styles.instructionIcon}>{step.icon}</span>
                    <span style={styles.instructionText}>{step.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* STEP 2: SKILL SELECTION */}
        {currentStep === 'skillSelection' && (
          <SkillSelectionModal
            missingSkills={missingSkills}
            selectedSkills={selectedSkills}
            onToggleSkill={toggleSkill}
            onSelectAll={selectAllSkills}
            onDeselectAll={deselectAllSkills}
            onContinue={handleContinueWithSkills}
            onCancel={handleCancelSkillSelection}
            loading={loading}
          />
        )}

        {/* STEP 3: RESULTS */}
        {currentStep === 'results' && (
          <div style={styles.resultsContainer}>
            <div style={styles.resultsHeader}>
              <div style={styles.successIcon}>✓</div>
              <h2 style={styles.resultsTitle}>Resume Optimized!</h2>
              <p style={styles.resultsSubtitle}>
                Successfully added <strong>{selectedSkillsCount}</strong> skill
                {selectedSkillsCount !== 1 ? 's' : ''} to your resume
              </p>
            </div>

            {/* ✅ ADD DIFF VIEWER */}
            {originalResume && optimizedResume && (
              <DiffViewer
                originalText={originalResume}
                optimizedText={optimizedResume}
                addedSkills={selectedSkills}
              />
            )}

            {improvementTips.length > 0 && (
              <div style={styles.tipsSection}>
                <h3 style={styles.sectionTitle}>
                  <span style={{ fontSize: 24, marginRight: 8 }}>💡</span>
                  Improvement Tips
                </h3>
                <div style={styles.tipsList}>
                  {improvementTips.map((tip, idx) => (
                    <div key={idx} style={styles.tipItem}>
                      <span style={styles.tipBullet}>→</span>
                      <span>{tip}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={styles.resumeSection}>
              <h3 style={styles.sectionTitle}>
                <span style={{ fontSize: 24, marginRight: 8 }}>📄</span>
                Optimized Resume
              </h3>
              <div style={styles.resumePreview}>
                <pre style={styles.resumeText}>{optimizedResume}</pre>
              </div>
            </div>

            <div style={styles.resultsActions}>
              <button
                onClick={handleDownload}
                style={{
                  ...styles.button,
                  ...styles.downloadButton
                }}
                onMouseOver={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 8px 25px rgba(40, 167, 69, 0.4)';
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 12px rgba(40, 167, 69, 0.3)';
                }}
              >
                <span style={{ fontSize: 20 }}>📥</span>
                Download Optimized Resume
              </button>

              <button
                onClick={async () => {
                  const success = await generatePDF();
                  if (success) {
                    alert('✅ PDF downloaded successfully!');
                  }
                }}
                disabled={loading}
                style={{
                  ...styles.button,
                  ...styles.pdfButton,
                  opacity: loading ? 0.6 : 1,
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
                onMouseOver={(e) => {
                  if (!loading) {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 6px 20px rgba(0, 123, 255, 0.3)';
                  }
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  if (!loading) {
                    e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                  }
                }}
              >
                {loading ? (
                  <>⏳ Generating PDF...</>
                ) : (
                  <>
                    <span style={{ fontSize: 20 }}>📄</span>
                    Download as PDF
                  </>
                )}
              </button>

              <button
                onClick={() => window.location.reload()}
                style={{
                  ...styles.button,
                  ...styles.resetButton
                }}
                onMouseOver={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 20px rgba(108, 117, 125, 0.3)';
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                }}
              >
                <span style={{ fontSize: 20 }}>🔄</span>
                Start Over
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: '40px 20px',
    maxWidth: 1200,
    margin: '0 auto'
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 50,
    boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
    border: '1px solid #e9ecef'
  },
  headerSection: {
    textAlign: 'center',
    marginBottom: 40
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 40,
    margin: '0 auto 20px',
    boxShadow: '0 6px 20px rgba(102, 126, 234, 0.3)'
  },
  title: {
    fontSize: 32,
    fontWeight: 700,
    color: '#333',
    margin: '0 0 12px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text'
  },
  description: {
    fontSize: 16,
    color: '#6c757d',
    margin: 0,
    lineHeight: 1.6
  },
  statusBox: {
    padding: 20,
    background: 'linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%)',
    borderRadius: 12,
    marginTop: 25,
    border: '2px solid #28a745',
    display: 'flex',
    alignItems: 'center',
    gap: 15,
    boxShadow: '0 2px 8px rgba(40, 167, 69, 0.2)'
  },
  statusIcon: {
    width: 36,
    height: 36,
    borderRadius: '50%',
    background: '#28a745',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    flexShrink: 0
  },
  statusText: {
    margin: 0,
    fontSize: 16,
    color: '#155724',
    fontWeight: 500
  },
  errorBox: {
    padding: 20,
    background: 'linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%)',
    borderRadius: 12,
    marginTop: 25,
    border: '2px solid #dc3545',
    display: 'flex',
    alignItems: 'center',
    gap: 15,
    boxShadow: '0 2px 8px rgba(220, 53, 69, 0.2)'
  },
  errorIcon: {
    width: 36,
    height: 36,
    borderRadius: '50%',
    background: '#dc3545',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    flexShrink: 0
  },
  errorText: {
    margin: 0,
    fontSize: 16,
    color: '#721c24',
    fontWeight: 500
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'center',
    gap: 15,
    flexWrap: 'wrap',
    marginTop: 35
  },
  button: {
    padding: '16px 36px',
    borderRadius: 12,
    fontSize: 16,
    fontWeight: 600,
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    gap: 10
  },
  primaryButton: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
  },
  secondaryButton: {
    background: 'white',
    color: '#667eea',
    border: '2px solid #667eea',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  downloadButton: {
    background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
    color: 'white',
    boxShadow: '0 4px 12px rgba(40, 167, 69, 0.3)'
  },
  pdfButton: {
    background: 'white',
    color: '#007bff',
    border: '2px solid #007bff',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  resetButton: {
    background: 'white',
    color: '#6c757d',
    border: '2px solid #dee2e6',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  spinner: {
    display: 'inline-block',
    animation: 'spin 1s linear infinite'
  },
  instructions: {
    marginTop: 50,
    padding: 35,
    background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
    borderRadius: 12,
    border: '2px solid #dee2e6'
  },
  instructionsTitle: {
    fontSize: 20,
    fontWeight: 700,
    marginBottom: 20,
    color: '#333',
    display: 'flex',
    alignItems: 'center'
  },
  instructionsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 15
  },
  instructionItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 15,
    padding: 15,
    background: 'white',
    borderRadius: 8,
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    transition: 'all 0.2s ease'
  },
  instructionIcon: {
    fontSize: 24,
    flexShrink: 0,
    width: 40,
    height: 40,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)',
    borderRadius: 8
  },
  instructionText: {
    fontSize: 15,
    color: '#495057',
    lineHeight: 1.6
  },
  resultsContainer: {
    marginTop: 20
  },
  resultsHeader: {
    textAlign: 'center',
    marginBottom: 40,
    padding: 40,
    background: 'linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%)',
    borderRadius: 16,
    border: '2px solid #28a745',
    position: 'relative',
    overflow: 'hidden'
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: '50%',
    background: '#28a745',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 48,
    fontWeight: 'bold',
    margin: '0 auto 20px',
    boxShadow: '0 6px 20px rgba(40, 167, 69, 0.3)'
  },
  resultsTitle: {
    fontSize: 36,
    fontWeight: 700,
    color: '#155724',
    margin: '0 0 12px'
  },
  resultsSubtitle: {
    fontSize: 18,
    color: '#155724',
    margin: 0
  },
  tipsSection: {
    marginBottom: 30,
    padding: 30,
    background: 'linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%)',
    borderRadius: 12,
    border: '2px solid #ffc107',
    boxShadow: '0 2px 8px rgba(255, 193, 7, 0.2)'
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 700,
    marginBottom: 20,
    color: '#333',
    display: 'flex',
    alignItems: 'center'
  },
  tipsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12
  },
  tipItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 12,
    padding: 15,
    background: 'white',
    borderRadius: 8,
    fontSize: 15,
    lineHeight: 1.6,
    color: '#495057',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
  },
  tipBullet: {
    color: '#ffc107',
    fontWeight: 'bold',
    fontSize: 18,
    flexShrink: 0
  },
  resumeSection: {
    marginBottom: 30
  },
  resumePreview: {
    backgroundColor: '#f8f9fa',
    border: '2px solid #dee2e6',
    borderRadius: 12,
    padding: 25,
    maxHeight: 500,
    overflowY: 'auto',
    boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.05)'
  },
  resumeText: {
    margin: 0,
    fontSize: 14,
    lineHeight: 1.8,
    color: '#333',
    fontFamily: 'monospace',
    whiteSpace: 'pre-wrap',
    wordWrap: 'break-word'
  },
  resultsActions: {
    display: 'flex',
    justifyContent: 'center',
    gap: 15,
    flexWrap: 'wrap'
  }
};