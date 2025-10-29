// frontend/src/hooks/useAudioRecorder.js
import { useState, useRef, useCallback } from 'react';

export function useAudioRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioURL, setAudioURL] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const audioContextRef = useRef(null);
  const streamRef = useRef(null);

  // Start recording
  const startRecording = useCallback(async () => {
    try {
      // Get microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          channelCount: 1,  // Mono
          sampleRate: 16000, // 16kHz
          echoCancellation: true,
          noiseSuppression: true
        }
      });
      
      streamRef.current = stream;

      // ✅ SOLUTION 1: Use WAV format if supported (Chrome/Edge)
      let mimeType = 'audio/wav';
      let options = { mimeType };
      
      // Check if WAV is supported, fallback to WebM
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        console.log('WAV not supported, trying webm...');
        mimeType = 'audio/webm';
        options = { mimeType };
        
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          console.log('WebM not supported, using default...');
          options = {}; // Use browser default
        }
      }

      console.log(`🎤 Recording with format: ${options.mimeType || 'default'}`);

      // Create MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      // Collect audio data
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      // When recording stops
      mediaRecorder.onstop = async () => {
        // Create blob from chunks
        let blob = new Blob(chunksRef.current, { type: options.mimeType || 'audio/webm' });
        
        // ✅ SOLUTION 2: Convert WebM to WAV in browser if needed
        if (blob.type.includes('webm')) {
          console.log('🔄 Converting WebM to WAV in browser...');
          blob = await convertWebMToWAV(blob, stream);
        }

        const url = URL.createObjectURL(blob);
        setAudioBlob(blob);
        setAudioURL(url);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      // Start recording
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error('Failed to start recording:', error);
      alert('Could not access microphone. Please check permissions.');
    }
  }, []);

  // Stop recording
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  }, [isRecording]);

  // Reset recording
  const resetRecording = useCallback(() => {
    setAudioBlob(null);
    setAudioURL(null);
    setRecordingTime(0);
    chunksRef.current = [];
    
    if (audioURL) {
      URL.revokeObjectURL(audioURL);
    }
  }, [audioURL]);

  return {
    isRecording,
    audioBlob,
    audioURL,
    recordingTime,
    startRecording,
    stopRecording,
    resetRecording
  };
}

// ✅ Helper function: Convert WebM to WAV using Web Audio API
async function convertWebMToWAV(webmBlob, stream) {
  try {
    // Create audio context
    const audioContext = new (window.AudioContext || window.webkitAudioContext)({
      sampleRate: 16000 // Match model's expected sample rate
    });

    // Decode WebM to audio buffer
    const arrayBuffer = await webmBlob.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

    // Convert to WAV
    const wavBlob = audioBufferToWav(audioBuffer);
    
    console.log('✅ Converted to WAV:', wavBlob.size, 'bytes');
    return wavBlob;

  } catch (error) {
    console.error('Conversion failed, using original:', error);
    return webmBlob; // Return original if conversion fails
  }
}

// ✅ Convert AudioBuffer to WAV Blob
function audioBufferToWav(audioBuffer) {
  const numberOfChannels = 1; // Mono
  const sampleRate = audioBuffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;

  // Get audio data (convert to mono if stereo)
  let audioData;
  if (audioBuffer.numberOfChannels === 1) {
    audioData = audioBuffer.getChannelData(0);
  } else {
    // Mix to mono
    const left = audioBuffer.getChannelData(0);
    const right = audioBuffer.getChannelData(1);
    audioData = new Float32Array(left.length);
    for (let i = 0; i < left.length; i++) {
      audioData[i] = (left[i] + right[i]) / 2;
    }
  }

  // Convert float32 to int16
  const samples = new Int16Array(audioData.length);
  for (let i = 0; i < audioData.length; i++) {
    const s = Math.max(-1, Math.min(1, audioData[i]));
    samples[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
  }

  // Create WAV file
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  // Write WAV header
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + samples.length * 2, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // PCM
  view.setUint16(20, format, true);
  view.setUint16(22, numberOfChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numberOfChannels * bitDepth / 8, true);
  view.setUint16(32, numberOfChannels * bitDepth / 8, true);
  view.setUint16(34, bitDepth, true);
  writeString(view, 36, 'data');
  view.setUint32(40, samples.length * 2, true);

  // Write audio data
  const offset = 44;
  for (let i = 0; i < samples.length; i++) {
    view.setInt16(offset + i * 2, samples[i], true);
  }

  return new Blob([buffer], { type: 'audio/wav' });
}

function writeString(view, offset, string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}