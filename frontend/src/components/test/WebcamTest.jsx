// frontend/src/components/test/WebcamTest.jsx
import { useRef, useState, useEffect } from 'react';

export default function WebcamTest() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  
  // Camera states
  const [status, setStatus] = useState('Not started');
  const [hasPermission, setHasPermission] = useState(null);
  const [error, setError] = useState(null);
  
  // Capture states
  const [capturedImage, setCapturedImage] = useState(null);
  const [frameSize, setFrameSize] = useState(0);
  const [captureCount, setCaptureCount] = useState(0);
  const [isAutoCapture, setIsAutoCapture] = useState(false);
  
  // Backend states
  const [isSending, setIsSending] = useState(false);
  const [backendResponse, setBackendResponse] = useState(null);
  const [sendCount, setSendCount] = useState(0);
  const [lastSendTime, setLastSendTime] = useState(null);

  const startCamera = async () => {
    setStatus('Requesting camera permission...');
    setError(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480 },
        audio: false 
      });
      
      setStatus('✅ Camera access granted!');
      setHasPermission(true);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      setStatus('❌ Camera access failed');
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
      setCapturedImage(null);
      setBackendResponse(null);
    }
  };

  // Capture a single frame
  const captureFrame = () => {
    if (!videoRef.current || !canvasRef.current) {
      setError('Video or canvas not ready');
      return;
    }

    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      // Set canvas size to match video
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;

      // Draw current video frame to canvas
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convert to blob
      canvas.toBlob((blob) => {
        if (blob) {
          const imageUrl = URL.createObjectURL(blob);
          setCapturedImage(imageUrl);
          setFrameSize(Math.round(blob.size / 1024)); // KB
          setCaptureCount(prev => prev + 1);
          setStatus(`✅ Frame captured! (#${captureCount + 1})`);
          console.log('✅ Frame captured:', {
            size: `${Math.round(blob.size / 1024)}KB`,
            type: blob.type,
            dimensions: `${canvas.width}x${canvas.height}`
          });
        }
      }, 'image/jpeg', 0.8);

    } catch (err) {
      setError(`Capture failed: ${err.message}`);
      console.error('Capture error:', err);
    }
  };

  // Send frame to backend
  const sendFrameToBackend = async () => {
    if (!videoRef.current || !canvasRef.current) {
      setError('Video or canvas not ready');
      return;
    }

    setIsSending(true);
    setBackendResponse(null);

    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convert to blob
      canvas.toBlob(async (blob) => {
        if (!blob) {
          setError('Failed to create blob');
          setIsSending(false);
          return;
        }

        console.log('📤 Sending frame to backend...', {
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
            console.log('✅ Backend response:', data);
            setBackendResponse({
              ...data,
              network_time_ms: endTime - startTime
            });
            setSendCount(prev => prev + 1);
            setLastSendTime(new Date().toLocaleTimeString());
            setStatus(`✅ Frame sent to backend! (#${sendCount + 1})`);
            setError(null);
          } else {
            setError(`Backend error: ${data.error}`);
          }
        } catch (err) {
          console.error('❌ Network error:', err);
          setError(`Network error: ${err.message}`);
        } finally {
          setIsSending(false);
        }
      }, 'image/jpeg', 0.95);

    } catch (err) {
      setError(`Send failed: ${err.message}`);
      setIsSending(false);
    }
  };

  // Auto-capture every 2 seconds
  useEffect(() => {
    let interval;
    if (isAutoCapture && hasPermission) {
      interval = setInterval(() => {
        captureFrame();
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isAutoCapture, hasPermission, captureCount]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div style={{ padding: 40, maxWidth: 1000, margin: '0 auto' }}>
      <h2>🎥 Webcam Backend Communication Test</h2>
      
      {/* Status Display */}
      <div style={{ 
        padding: 15, 
        marginBottom: 20,
        backgroundColor: hasPermission === true ? '#d4edda' : 
                         hasPermission === false ? '#f8d7da' : '#e7f3ff',
        borderRadius: 5
      }}>
        <strong>Status:</strong> {status}
        {error && (
          <div style={{ marginTop: 10, color: '#721c24' }}>
            <strong>Error:</strong> {error}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: 20, marginBottom: 20 }}>
        {/* Live Video */}
        <div style={{ flex: 1 }}>
          <h3>Live Video</h3>
          <div style={{ 
            border: '2px solid #ddd',
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
          <h3>Captured Frame {captureCount > 0 && `(#${captureCount})`}</h3>
          <div style={{ 
            border: '2px solid #28a745',
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
            <div style={{ marginTop: 10, fontSize: 14, color: '#666' }}>
              Frame size: {frameSize}KB
            </div>
          )}
        </div>
      </div>

      {/* Hidden canvas for frame capture */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Controls */}
      <div style={{ display: 'flex', gap: 15, justifyContent: 'center', marginBottom: 20, flexWrap: 'wrap' }}>
        <button
          onClick={startCamera}
          disabled={hasPermission === true}
          style={{
            padding: '12px 24px',
            backgroundColor: hasPermission === true ? '#6c757d' : '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: 5,
            cursor: hasPermission === true ? 'not-allowed' : 'pointer',
            opacity: hasPermission === true ? 0.6 : 1
          }}
        >
          Start Camera
        </button>

        <button
          onClick={captureFrame}
          disabled={hasPermission !== true}
          style={{
            padding: '12px 24px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: 5,
            cursor: hasPermission !== true ? 'not-allowed' : 'pointer',
            opacity: hasPermission !== true ? 0.6 : 1
          }}
        >
          📸 Capture Frame
        </button>

        <button
          onClick={sendFrameToBackend}
          disabled={hasPermission !== true || isSending}
          style={{
            padding: '12px 24px',
            backgroundColor: isSending ? '#ffc107' : '#17a2b8',
            color: isSending ? '#000' : 'white',
            border: 'none',
            borderRadius: 5,
            cursor: (hasPermission !== true || isSending) ? 'not-allowed' : 'pointer',
            opacity: (hasPermission !== true || isSending) ? 0.6 : 1,
            fontWeight: 'bold'
          }}
        >
          {isSending ? '⏳ Sending...' : '📤 Send to Backend'}
        </button>

        <button
          onClick={() => setIsAutoCapture(!isAutoCapture)}
          disabled={hasPermission !== true}
          style={{
            padding: '12px 24px',
            backgroundColor: isAutoCapture ? '#ffc107' : '#6c757d',
            color: isAutoCapture ? '#000' : 'white',
            border: 'none',
            borderRadius: 5,
            cursor: hasPermission !== true ? 'not-allowed' : 'pointer',
            opacity: hasPermission !== true ? 0.6 : 1
          }}
        >
          {isAutoCapture ? '⏸️ Stop Auto' : '▶️ Auto-Capture'}
        </button>

        <button
          onClick={stopCamera}
          disabled={hasPermission !== true}
          style={{
            padding: '12px 24px',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: 5,
            cursor: hasPermission !== true ? 'not-allowed' : 'pointer',
            opacity: hasPermission !== true ? 0.6 : 1
          }}
        >
          Stop Camera
        </button>
      </div>

      {/* Backend Response */}
      {backendResponse && (
        <div style={{ 
          marginTop: 20,
          padding: 15,
          backgroundColor: '#d4edda',
          border: '1px solid #c3e6cb',
          borderRadius: 5,
          fontSize: 14
        }}>
          <strong>✅ Backend Response:</strong>
          <ul style={{ marginTop: 10 }}>
            <li>Dominant Emotion: <strong>{backendResponse.dominant_emotion}</strong> ({backendResponse.confidence}%)</li>
            <li>All Emotions: {JSON.stringify(backendResponse.all_emotions)}</li>
            <li>Frame Size: {backendResponse.frame_size_kb}KB</li>
            <li>Processing Time: {backendResponse.processing_time_ms}ms</li>
            <li>Network Time: {backendResponse.network_time_ms}ms</li>
            <li>Total Time: {backendResponse.processing_time_ms + backendResponse.network_time_ms}ms</li>
          </ul>
        </div>
      )}

      {/* Stats */}
      <div style={{ 
        marginTop: 20,
        padding: 15,
        backgroundColor: '#f8f9fa',
        borderRadius: 5,
        fontSize: 14
      }}>
        <strong>Test Stats:</strong>
        <ul style={{ marginTop: 10 }}>
          <li>Frames captured: {captureCount}</li>
          <li>Frames sent to backend: {sendCount}</li>
          <li>Last send time: {lastSendTime || 'N/A'}</li>
          <li>Auto-capture: {isAutoCapture ? '✅ Active' : '❌ Inactive'}</li>
          <li>Backend status: {isSending ? '⏳ Sending...' : sendCount > 0 ? '✅ Connected' : '⚠️ Not tested'}</li>
        </ul>
      </div>

      {/* Instructions */}
      <div style={{ 
        marginTop: 20,
        padding: 15,
        backgroundColor: '#fff3cd',
        borderRadius: 5,
        fontSize: 14
      }}>
        <strong>💡 Test Steps:</strong>
        <ol style={{ marginTop: 10, paddingLeft: 20 }}>
          <li><strong>Start Camera</strong> - Allow permission when prompted</li>
          <li><strong>Capture Frame</strong> - Click once to test manual capture</li>
          <li><strong>Send to Backend</strong> - Test backend communication</li>
          <li><strong>Auto-Capture</strong> - Enable to test continuous capture</li>
          <li><strong>Check console</strong> - Should see frame details and backend responses</li>
        </ol>
        <div style={{ marginTop: 15, padding: 10, backgroundColor: '#fff', borderRadius: 5 }}>
          <strong>Expected Results:</strong>
          <ul style={{ marginTop: 5 }}>
            <li>✅ Backend response appears with emotion data</li>
            <li>✅ Total time: ~500-800ms per frame</li>
            <li>✅ Frame size: ~20-40KB</li>
            <li>✅ No CORS errors</li>
          </ul>
        </div>
      </div>
    </div>
  );
}