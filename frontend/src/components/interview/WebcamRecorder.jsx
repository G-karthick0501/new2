import { useRef, useState, useEffect } from 'react';

export default function WebcamRecorder({ isRecording, onEmotionData }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const intervalRef = useRef(null);
  
  const [currentEmotion, setCurrentEmotion] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [frameCount, setFrameCount] = useState(0);

  // Start/stop camera
  useEffect(() => {
    if (isRecording) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [isRecording]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480 } 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      startEmotionCapture();
    } catch (err) {
      console.warn('Camera access denied:', err);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const startEmotionCapture = () => {
    // Capture every 2 seconds (0.5 FPS)
    intervalRef.current = setInterval(() => {
      if (!isProcessing) {
        captureAndAnalyze();
      }
    }, 2000);
  };

  const captureAndAnalyze = async () => {
    if (!videoRef.current || !canvasRef.current || isProcessing) return;

    setIsProcessing(true);

    try {
      // Capture frame
      const canvas = canvasRef.current;
      const video = videoRef.current;
      
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0);

      // Convert to blob
      const blob = await new Promise(resolve => {
        canvas.toBlob(resolve, 'image/jpeg', 0.8);
      });

      if (!blob) {
        setIsProcessing(false);
        return;
      }

      // Send to backend
      const formData = new FormData();
      formData.append('file', blob, 'frame.jpg');

      const response = await fetch('http://localhost:8001/analyze-emotion', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) throw new Error('Analysis failed');

      const data = await response.json();

      if (data.success) {
        const emotionRecord = {
          timestamp: Date.now(),
          emotion: data.dominant_emotion,
          confidence: data.confidence,
          all_emotions: data.all_emotions
        };

        setCurrentEmotion(emotionRecord);
        setFrameCount(prev => prev + 1);

        // Send to parent
        if (onEmotionData) {
          onEmotionData(emotionRecord);
        }
      }

    } catch (err) {
      console.warn('Emotion analysis failed:', err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const getEmotionEmoji = (emotion) => {
    const map = {
      happy: '😊', sad: '😢', angry: '😠', surprise: '😲',
      fear: '😨', disgust: '🤢', neutral: '😐'
    };
    return map[emotion] || '😐';
  };

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      width: '240px',
      background: '#000',
      borderRadius: '8px',
      overflow: 'hidden',
      boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
      zIndex: 1000
    }}>
      <div style={{ position: 'relative' }}>
        <video 
          ref={videoRef} 
          autoPlay 
          muted 
          style={{ width: '100%', display: 'block' }}
        />
        <canvas ref={canvasRef} style={{ display: 'none' }} />

        {currentEmotion && (
          <div style={{
            position: 'absolute',
            top: '10px',
            left: '10px',
            background: 'rgba(0,0,0,0.7)',
            padding: '6px 10px',
            borderRadius: '6px',
            color: '#fff',
            fontSize: '12px'
          }}>
            <div style={{ fontSize: '20px', marginBottom: '2px' }}>
              {getEmotionEmoji(currentEmotion.emotion)}
            </div>
            <div style={{ textTransform: 'capitalize' }}>
              {currentEmotion.emotion}
            </div>
            <div style={{ fontSize: '10px', color: '#aaa' }}>
              {currentEmotion.confidence.toFixed(0)}%
            </div>
          </div>
        )}

        {isProcessing && (
          <div style={{
            position: 'absolute',
            bottom: '10px',
            right: '10px',
            background: 'rgba(255,193,7,0.9)',
            padding: '3px 6px',
            borderRadius: '4px',
            fontSize: '10px',
            color: '#000'
          }}>
            Analyzing...
          </div>
        )}
      </div>

      <div style={{
        padding: '6px 10px',
        background: '#1a1a1a',
        color: '#aaa',
        fontSize: '10px',
        textAlign: 'center'
      }}>
        Frames: {frameCount}
      </div>
    </div>
  );
}