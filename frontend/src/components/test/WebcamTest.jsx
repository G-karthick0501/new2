// frontend/src/components/test/WebcamTest.jsx
import { useRef, useState, useEffect } from 'react';

export default function WebcamTest() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  
  // Camera states
  const [status, setStatus] = useState('Not started');
  const [hasPermission, setHasPermission] = useState(null);
  const [error, setError] = useState(null);
  
  // Current step (for visual workflow)
  const [currentStep, setCurrentStep] = useState(0);
  
  // Capture states
  const [capturedImage, setCapturedImage] = useState(null);
  const [frameSize, setFrameSize] = useState(0);
  
  // Video emotion states
  const [isSendingVideo, setIsSendingVideo] = useState(false);
  const [videoResponse, setVideoResponse] = useState(null);

  // Audio states
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [isSendingAudio, setIsSendingAudio] = useState(false);
  const [audioResponse, setAudioResponse] = useState(null);

  const startCamera = async () => {
    setStatus('Requesting camera + microphone permission...');
    setError(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480 },
        audio: true
      });
      
      setStatus('✅ Camera + Microphone ready!');
      setHasPermission(true);
      setCurrentStep(1);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      setStatus('❌ Permission denied');
      setHasPermission(false);
      setError(err.message);
      console.error('Camera error:', err);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setStatus('Camera stopped');
      setHasPermission(null);
      setCurrentStep(0);
      setCapturedImage(null);
      setVideoResponse(null);
      setAudioResponse(null);
      setAudioBlob(null);
      if (isRecording) {
        setIsRecording(false);
      }
    }
  };

  // Capture and analyze video in one step
  const analyzeVideo = async () => {
    if (!videoRef.current || !canvasRef.current) {
      setError('Video not ready');
      return;
    }

    setIsSendingVideo(true);
    setVideoResponse(null);
    setStatus('📹 Analyzing video emotion...');

    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(async (blob) => {
        if (!blob) {
          setError('Failed to create image');
          setIsSendingVideo(false);
          return;
        }

        // Save captured image for display
        const imageUrl = URL.createObjectURL(blob);
        setCapturedImage(imageUrl);
        setFrameSize(Math.round(blob.size / 1024));

        console.log('📤 Sending video frame...', {
          size: `${Math.round(blob.size / 1024)}KB`
        });

        const startTime = Date.now();

        try {
          const formData = new FormData();
          formData.append('file', blob, 'frame.jpg');

          const response = await fetch('http://localhost:8001/analyze-video-emotion', {
            method: 'POST',
            body: formData
          });

          const endTime = Date.now();
          const data = await response.json();

          if (data.success) {
            console.log('✅ Video response:', data);
            setVideoResponse({
              ...data,
              network_time_ms: endTime - startTime
            });
            setStatus('✅ Video emotion analyzed!');
            setCurrentStep(2);
            setError(null);
          } else {
            setError(`Video error: ${data.error}`);
          }
        } catch (err) {
          console.error('❌ Video error:', err);
          setError(`Video error: ${err.message}`);
        } finally {
          setIsSendingVideo(false);
        }
      }, 'image/jpeg', 0.95);

    } catch (err) {
      setError(`Analysis failed: ${err.message}`);
      setIsSendingVideo(false);
    }
  };

  // Start audio recording
  const startRecording = async () => {
    if (!videoRef.current || !videoRef.current.srcObject) {
      setError('Camera not started');
      return;
    }

    try {
      const stream = videoRef.current.srcObject;
      const audioStream = new MediaStream(stream.getAudioTracks());

      const mediaRecorder = new MediaRecorder(audioStream, {
        mimeType: 'audio/webm'
      });

      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(audioBlob);
        setStatus(`⏹️ Recording stopped (${recordingDuration}s)`);
        setCurrentStep(3);
        console.log('🎤 Audio recorded:', {
          size: `${Math.round(audioBlob.size / 1024)}KB`,
          duration: `${recordingDuration}s`
        });
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingDuration(0);
      setAudioResponse(null);
      setAudioBlob(null);
      setStatus('🔴 Recording audio... Speak clearly!');
      console.log('🎤 Recording started...');

    } catch (err) {
      setError(`Recording failed: ${err.message}`);
      console.error('Recording error:', err);
    }
  };

  // Stop audio recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Analyze audio
  const analyzeAudio = async () => {
    if (!audioBlob) {
      setError('No audio recorded');
      return;
    }

    setIsSendingAudio(true);
    setAudioResponse(null);
    setStatus('🎤 Analyzing audio emotion...');

    try {
      console.log('📤 Sending audio...', {
        size: `${Math.round(audioBlob.size / 1024)}KB`,
        duration: `${recordingDuration}s`
      });

      const startTime = Date.now();

      const formData = new FormData();
      formData.append('file', audioBlob, 'audio.webm');

      const response = await fetch('http://localhost:8002/analyze-audio-complete?remove_silence=true', {
        method: 'POST',
        body: formData
      });

      const endTime = Date.now();

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();

      console.log('✅ Audio response (RAW):', data);
      
      // Add network time
      data.network_time_ms = endTime - startTime;
      
      setAudioResponse(data);
      setStatus('✅ Audio emotion analyzed!');
      setCurrentStep(4);
      setError(null);

    } catch (err) {
      console.error('❌ Audio error:', err);
      setError(`Audio error: ${err.message}`);
    } finally {
      setIsSendingAudio(false);
    }
  };

  // Timer for recording duration
  useEffect(() => {
    let interval;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Helper to safely get nested values
  const safeGet = (obj, path, defaultValue = 'N/A') => {
    const value = path.split('.').reduce((acc, part) => acc?.[part], obj);
    return value !== undefined && value !== null && !isNaN(value) ? value : defaultValue;
  };

  return (
    <div style={{ padding: 40, maxWidth: 1400, margin: '0 auto' }}>
      <h2>🎥🎤 Multi-Modal Emotion Test</h2>
      
      {/* Step Indicator */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        marginBottom: 30,
        padding: 20,
        backgroundColor: '#f8f9fa',
        borderRadius: 8
      }}>
        {[
          { num: 0, label: 'Start', icon: '🎬' },
          { num: 1, label: 'Camera Ready', icon: '📹' },
          { num: 2, label: 'Video Analyzed', icon: '✅' },
          { num: 3, label: 'Audio Recorded', icon: '🎤' },
          { num: 4, label: 'Audio Analyzed', icon: '✨' }
        ].map(step => (
          <div key={step.num} style={{
            textAlign: 'center',
            opacity: currentStep >= step.num ? 1 : 0.3,
            transition: 'opacity 0.3s'
          }}>
            <div style={{
              fontSize: 32,
              marginBottom: 5
            }}>
              {step.icon}
            </div>
            <div style={{
              fontSize: 12,
              fontWeight: currentStep === step.num ? 'bold' : 'normal',
              color: currentStep === step.num ? '#007bff' : '#666'
            }}>
              {step.label}
            </div>
          </div>
        ))}
      </div>

      {/* Status Display */}
      <div style={{ 
        padding: 15, 
        marginBottom: 20,
        backgroundColor: hasPermission === true ? '#d4edda' : 
                         hasPermission === false ? '#f8d7da' : '#e7f3ff',
        borderRadius: 5,
        border: `2px solid ${hasPermission === true ? '#c3e6cb' : 
                              hasPermission === false ? '#f5c6cb' : '#b8daff'}`
      }}>
        <strong>Status:</strong> {status}
        {error && (
          <div style={{ marginTop: 10, color: '#721c24', fontWeight: 'bold' }}>
            ⚠️ {error}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: 20, marginBottom: 20 }}>
        {/* Live Video */}
        <div style={{ flex: 1 }}>
          <h3>Live Video</h3>
          <div style={{ 
            border: '3px solid #007bff',
            borderRadius: 8,
            overflow: 'hidden',
            backgroundColor: '#000'
          }}>
            <video 
              ref={videoRef} 
              autoPlay 
              muted
              playsInline
              style={{ 
                width: '100%',
                display: 'block'
              }} 
            />
          </div>
        </div>

        {/* Captured Frame */}
        <div style={{ flex: 1 }}>
          <h3>Captured Frame</h3>
          <div style={{ 
            border: '3px solid #28a745',
            borderRadius: 8,
            overflow: 'hidden',
            backgroundColor: '#000',
            minHeight: 360
          }}>
            {capturedImage ? (
              <img 
                src={capturedImage} 
                alt="Captured frame"
                style={{ width: '100%', display: 'block' }}
              />
            ) : (
              <div style={{ 
                color: '#666', 
                textAlign: 'center', 
                padding: 80,
                fontSize: 14
              }}>
                No frame captured yet
              </div>
            )}
          </div>
          {frameSize > 0 && (
            <div style={{ marginTop: 10, fontSize: 14, color: '#666', textAlign: 'center' }}>
              📦 Frame size: {frameSize}KB
            </div>
          )}
        </div>
      </div>

      {/* Hidden canvas */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Main Action Buttons */}
      <div style={{ 
        display: 'flex', 
        gap: 15, 
        justifyContent: 'center', 
        marginBottom: 30,
        padding: 20,
        backgroundColor: '#fff',
        borderRadius: 8,
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        {/* Step 0: Start Camera */}
        {currentStep === 0 && (
          <button
            onClick={startCamera}
            style={{
              padding: '15px 30px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
              fontSize: 16,
              fontWeight: 'bold',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}
          >
            🎬 Step 1: Start Camera + Mic
          </button>
        )}

        {/* Step 1: Analyze Video */}
        {currentStep === 1 && (
          <button
            onClick={analyzeVideo}
            disabled={isSendingVideo}
            style={{
              padding: '15px 30px',
              backgroundColor: isSendingVideo ? '#ffc107' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: 8,
              cursor: isSendingVideo ? 'not-allowed' : 'pointer',
              fontSize: 16,
              fontWeight: 'bold',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}
          >
            {isSendingVideo ? '⏳ Analyzing Video...' : '📹 Step 2: Analyze Video Emotion'}
          </button>
        )}

        {/* Step 2: Record Audio */}
        {currentStep === 2 && (
          <button
            onClick={isRecording ? stopRecording : startRecording}
            style={{
              padding: '15px 30px',
              backgroundColor: isRecording ? '#dc3545' : '#6f42c1',
              color: 'white',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
              fontSize: 16,
              fontWeight: 'bold',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              animation: isRecording ? 'pulse 1s infinite' : 'none'
            }}
          >
            {isRecording ? `⏹️ Stop Recording (${recordingDuration}s)` : '🎤 Step 3: Record Audio (3-5s)'}
          </button>
        )}

        {/* Step 3: Analyze Audio */}
        {currentStep === 3 && audioBlob && (
          <button
            onClick={analyzeAudio}
            disabled={isSendingAudio}
            style={{
              padding: '15px 30px',
              backgroundColor: isSendingAudio ? '#ffc107' : '#fd7e14',
              color: 'white',
              border: 'none',
              borderRadius: 8,
              cursor: isSendingAudio ? 'not-allowed' : 'pointer',
              fontSize: 16,
              fontWeight: 'bold',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}
          >
            {isSendingAudio ? '⏳ Analyzing Audio...' : '🔊 Step 4: Analyze Audio Emotion'}
          </button>
        )}

        {/* Step 4: Reset */}
        {currentStep === 4 && (
          <button
            onClick={() => {
              setCurrentStep(1);
              setVideoResponse(null);
              setAudioResponse(null);
              setAudioBlob(null);
              setCapturedImage(null);
              setStatus('✅ Ready for next test');
            }}
            style={{
              padding: '15px 30px',
              backgroundColor: '#17a2b8',
              color: 'white',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
              fontSize: 16,
              fontWeight: 'bold',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}
          >
            🔄 Test Again
          </button>
        )}

        {/* Stop button - always available when camera is on */}
        {hasPermission && (
          <button
            onClick={stopCamera}
            style={{
              padding: '15px 30px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
              fontSize: 16,
              fontWeight: 'bold'
            }}
          >
            ⏹️ Stop All
          </button>
        )}
      </div>

      {/* Results */}
      {(videoResponse || audioResponse) && (
        <div style={{ display: 'flex', gap: 20, marginBottom: 20 }}>
          {/* Video Results */}
          {videoResponse && (
            <div style={{ flex: 1 }}>
              <h3>🎥 Video Emotion Results</h3>
              <div style={{ 
                padding: 20,
                backgroundColor: '#d4edda',
                border: '2px solid #c3e6cb',
                borderRadius: 8,
                fontSize: 14
              }}>
                <div style={{ 
                  fontSize: 24, 
                  fontWeight: 'bold', 
                  marginBottom: 15,
                  textAlign: 'center',
                  color: '#155724'
                }}>
                  🎭 {videoResponse.dominant_emotion.toUpperCase()} ({videoResponse.confidence}%)
                </div>
                <ul style={{ marginTop: 10, marginBottom: 0 }}>
                  <li><strong>All Emotions:</strong> 
                    <div style={{ fontSize: 12, marginTop: 5, padding: 8, backgroundColor: '#fff', borderRadius: 4 }}>
                      {Object.entries(videoResponse.all_emotions)
                        .sort((a, b) => b[1] - a[1])
                        .map(([emotion, score]) => (
                          <div key={emotion} style={{ marginBottom: 3 }}>
                            {emotion}: <strong>{score}%</strong>
                          </div>
                        ))
                      }
                    </div>
                  </li>
                  <li><strong>👤 Face:</strong> {videoResponse.face_detected ? `✅ Detected (${videoResponse.face_confidence}% confidence)` : '❌ Not detected'}</li>
                  <li><strong>⏱️ Processing:</strong> {videoResponse.processing_time_ms}ms</li>
                  <li><strong>🌐 Network:</strong> {videoResponse.network_time_ms}ms</li>
                  <li><strong>📦 Frame Size:</strong> {videoResponse.frame_size_kb}KB</li>
                </ul>
              </div>
            </div>
          )}

          {/* Audio Results */}
          {audioResponse && (
            <div style={{ flex: 1 }}>
              <h3>🎤 Audio Emotion Results</h3>
              <div style={{ 
                padding: 20,
                backgroundColor: '#d1ecf1',
                border: '2px solid #bee5eb',
                borderRadius: 8,
                fontSize: 14
              }}>
                <div style={{ 
                  fontSize: 24, 
                  fontWeight: 'bold', 
                  marginBottom: 15,
                  textAlign: 'center',
                  color: '#0c5460'
                }}>
                  🎭 {(audioResponse.emotion || 'UNKNOWN').toUpperCase()} 
                  ({audioResponse.confidence != null ? audioResponse.confidence.toFixed(2) : 'N/A'}%)
                </div>
                <ul style={{ marginTop: 10, marginBottom: 0 }}>
                  <li><strong>All Scores:</strong> 
                    <div style={{ fontSize: 12, marginTop: 5, padding: 8, backgroundColor: '#fff', borderRadius: 4 }}>
                      {audioResponse.all_scores ? 
                        Object.entries(audioResponse.all_scores)
                          .sort((a, b) => b[1] - a[1])
                          .map(([emotion, score]) => (
                            <div key={emotion} style={{ marginBottom: 3 }}>
                              {emotion}: <strong>{typeof score === 'number' ? score.toFixed(2) : score}</strong>
                            </div>
                          ))
                        : 'No scores available'
                      }
                    </div>
                  </li>
                  <li><strong>⏱️ Duration:</strong> {audioResponse.audio_duration != null ? `${audioResponse.audio_duration.toFixed(2)}s` : 'N/A'}</li>
                  
                  {audioResponse.audio_metrics && (
                    <>
                      <li style={{ marginTop: 10, fontWeight: 'bold', color: '#0c5460' }}>📊 Audio Quality:</li>
                      <li><strong>🎵 Pitch:</strong> {audioResponse.audio_metrics.pitch != null ? `${Math.round(audioResponse.audio_metrics.pitch)}Hz` : 'N/A'}</li>
                      <li><strong>🔊 Energy:</strong> {audioResponse.audio_metrics.energy != null ? audioResponse.audio_metrics.energy.toFixed(2) : 'N/A'}</li>
                      <li><strong>🗣️ Speaking Rate:</strong> {audioResponse.audio_metrics.speaking_rate != null ? `${audioResponse.audio_metrics.speaking_rate.toFixed(1)} syl/s` : 'N/A'}</li>
                      <li><strong>⏸️ Silence:</strong> {audioResponse.audio_metrics.silence_ratio != null ? `${(audioResponse.audio_metrics.silence_ratio * 100).toFixed(1)}%` : 'N/A'}</li>
                    </>
                  )}
                  
                  {audioResponse.interpretation && (
                    <>
                      <li style={{ marginTop: 10, fontWeight: 'bold', color: '#0c5460' }}>💡 Analysis:</li>
                      <li><strong>💬 Confidence:</strong> {audioResponse.interpretation.confidence_level || 'N/A'}</li>
                      <li><strong>⚡ Engagement:</strong> {audioResponse.interpretation.engagement_indicators || 'N/A'}</li>
                    </>
                  )}
                  
                  <li style={{ marginTop: 10 }}><strong>⏱️ Processing:</strong> {audioResponse.processing_time || 'N/A'}s</li>
                  <li><strong>🌐 Network:</strong> {audioResponse.network_time_ms || 'N/A'}ms</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Instructions */}
      <div style={{ 
        marginTop: 20,
        padding: 20,
        backgroundColor: '#e7f3ff',
        borderRadius: 8,
        fontSize: 14,
        border: '2px solid #b8daff'
      }}>
        <strong>📋 How to Use:</strong>
        <ol style={{ marginTop: 10, paddingLeft: 20, marginBottom: 5 }}>
          <li><strong>Click the current step button</strong> - Follow the step indicator at the top</li>
          <li><strong>Wait for each analysis</strong> - Don't click multiple times</li>
          <li><strong>For audio recording:</strong> Speak clearly for 3-5 seconds, then click Stop</li>
          <li><strong>Check console (F12)</strong> - See detailed response data</li>
          <li><strong>Test Again</strong> - Click "Test Again" after Step 4 completes</li>
        </ol>
        <div style={{ marginTop: 15, padding: 10, backgroundColor: '#fff', borderRadius: 5 }}>
          <strong>🎯 What to Expect:</strong>
          <ul style={{ marginTop: 5, marginBottom: 0 }}>
            <li>✅ Video: ~2-3 seconds per analysis</li>
            <li>✅ Audio: ~3-6 seconds per analysis (includes metrics)</li>
            <li>✅ Both modalities show emotion confidence scores</li>
            <li>✅ Audio includes pitch, energy, speaking rate, and interpretation</li>
          </ul>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
      `}</style>
    </div>
  );
}