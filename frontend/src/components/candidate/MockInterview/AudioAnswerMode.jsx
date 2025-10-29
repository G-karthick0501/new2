// components/candidate/MockInterview/AudioAnswerMode.jsx
import { useState } from 'react';
import { useAudioRecorder } from '../../../hooks/useAudioRecorder';

export default function AudioAnswerMode({ 
  question, 
  onSubmit, 
  isSubmitting 
}) {
  const {
    isRecording,
    audioBlob,
    audioURL,
    startRecording,
    stopRecording,
    resetRecording
  } = useAudioRecorder();

  const [recordingTime, setRecordingTime] = useState(0);

  // Timer
  useEffect(() => {
    let interval;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      setRecordingTime(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const handleSubmit = async () => {
    if (!audioBlob) return;
    await onSubmit(audioBlob, recordingTime);
    resetRecording();
  };

  return (
    <div style={{ padding: 20, border: '2px solid #007bff', borderRadius: 8 }}>
      <h3>🎤 Audio Answer Mode</h3>
      <p style={{ fontSize: 18, marginBottom: 20 }}>{question.text}</p>

      {/* Recording Controls */}
      <div style={{ marginBottom: 20 }}>
        {!isRecording && !audioBlob && (
          <button 
            onClick={startRecording}
            style={{
              padding: '15px 30px',
              fontSize: 18,
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: 50,
              cursor: 'pointer'
            }}
          >
            🔴 Start Recording
          </button>
        )}

        {isRecording && (
          <>
            <div style={{ fontSize: 32, marginBottom: 10 }}>
              🎤 Recording... {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}
            </div>
            <button 
              onClick={stopRecording}
              style={{
                padding: '15px 30px',
                fontSize: 18,
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: 8,
                cursor: 'pointer'
              }}
            >
              ⏹️ Stop Recording
            </button>
          </>
        )}

        {audioBlob && (
          <>
            <div style={{ marginBottom: 15 }}>
              <audio controls src={audioURL} style={{ width: '100%' }} />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button 
                onClick={handleSubmit}
                disabled={isSubmitting}
                style={{
                  padding: '12px 25px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: 8,
                  cursor: isSubmitting ? 'not-allowed' : 'pointer'
                }}
              >
                {isSubmitting ? '⏳ Submitting...' : '✅ Submit Answer'}
              </button>
              <button 
                onClick={resetRecording}
                style={{
                  padding: '12px 25px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: 8,
                  cursor: 'pointer'
                }}
              >
                🔄 Re-record
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
