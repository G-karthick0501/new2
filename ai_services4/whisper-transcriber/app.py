# ai_services4/whisper-transcriber/app.py
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from faster_whisper import WhisperModel
import tempfile
import os
import shutil
import time
from typing import Optional

app = FastAPI(
    title="faster-whisper Transcription Service",
    description="Fast, accurate speech-to-text with NO ffmpeg required"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global model
model: Optional[WhisperModel] = None

@app.on_event("startup")
async def startup_event():
    """Load faster-whisper model on startup"""
    global model
    print("📥 Loading faster-whisper model...")
    
    try:
        # Model options: tiny, base, small, medium, large-v2, large-v3
        # device: "cpu", "cuda", "auto"
        # compute_type: "int8", "int8_float16", "int16", "float16", "float32"
        
        model = WhisperModel(
            "base",  # or "small" for better accuracy, "tiny" for faster
            device="cpu",  # Change to "cuda" if you have GPU
            compute_type="int8",  # Faster inference with minimal quality loss
            download_root="./models"  # Cache models locally
        )
        
        print("✅ faster-whisper model loaded successfully!")
        print(f"   Model: base")
        print(f"   Device: cpu")
        print(f"   Compute type: int8")
        
    except Exception as e:
        print(f"❌ Failed to load model: {e}")
        model = None

@app.get("/")
async def root():
    return {
        "service": "faster-whisper Transcription",
        "model": "base",
        "status": "running",
        "features": [
            "4x faster than OpenAI Whisper",
            "No ffmpeg required",
            "Lower memory usage",
            "Same accuracy"
        ]
    }

@app.get("/health")
async def health():
    """Health check endpoint"""
    return {
        "status": "healthy" if model else "unhealthy",
        "model_loaded": model is not None,
        "model_type": "faster-whisper base",
        "requires_ffmpeg": False
    }

@app.post("/transcribe")
async def transcribe_audio(file: UploadFile = File(...)):
    """
    Transcribe audio file to text using faster-whisper
    
    Supported formats: mp3, mp4, wav, webm, m4a, ogg, flac
    Max file size: 10MB
    """
    
    if model is None:
        raise HTTPException(
            status_code=503,
            detail="Transcription service not ready. Model not loaded."
        )
    
    # Validate file size (10MB limit)
    max_size = 10 * 1024 * 1024
    file_size = 0
    
    temp_dir = tempfile.mkdtemp()
    
    try:
        # Get file extension
        file_ext = os.path.splitext(file.filename)[1] or '.webm'
        temp_path = os.path.join(temp_dir, f"audio{file_ext}")
        
        print(f"🎤 Transcribing: {file.filename}")
        
        # Save uploaded file
        with open(temp_path, 'wb') as buffer:
            content = await file.read()
            file_size = len(content)
            
            if file_size > max_size:
                raise HTTPException(
                    status_code=413,
                    detail=f"File too large. Max size: {max_size/1024/1024}MB"
                )
            
            buffer.write(content)
        
        print(f"   File size: {file_size / 1024:.1f} KB")
        
        # Verify file saved
        if not os.path.exists(temp_path):
            raise Exception("Failed to save uploaded file")
        
        # Start transcription
        start_time = time.time()
        print(f"   Starting transcription...")
        
        # Transcribe with faster-whisper
        segments, info = model.transcribe(
            temp_path,
            language="en",  # Set to None for auto-detection
            task="transcribe",  # or "translate" for translation to English
            beam_size=5,  # Higher = more accurate but slower (1-10)
            vad_filter=True,  # Voice Activity Detection (removes silence)
            vad_parameters=dict(
                min_silence_duration_ms=500  # Minimum silence duration
            )
        )
        
        # Collect segments
        transcription_segments = []
        full_text = ""
        
        for segment in segments:
            transcription_segments.append({
                "start": round(segment.start, 2),
                "end": round(segment.end, 2),
                "text": segment.text.strip()
            })
            full_text += segment.text.strip() + " "
        
        full_text = full_text.strip()
        elapsed_time = time.time() - start_time
        
        print(f"✅ Transcription complete!")
        print(f"   Duration: {info.duration:.1f}s")
        print(f"   Processing time: {elapsed_time:.2f}s")
        print(f"   Speed: {info.duration/elapsed_time:.1f}x realtime")
        print(f"   Text length: {len(full_text)} chars")
        print(f"   Preview: {full_text[:100]}...")
        
        return {
            "text": full_text,
            "language": info.language,
            "language_probability": round(info.language_probability, 3),
            "duration": round(info.duration, 2),
            "processing_time": round(elapsed_time, 2),
            "segments": transcription_segments,
            "word_count": len(full_text.split()),
            "model": "faster-whisper base"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        error_msg = str(e)
        print(f"❌ Transcription error: {error_msg}")
        raise HTTPException(
            status_code=500,
            detail=f"Transcription failed: {error_msg}"
        )
    finally:
        # Cleanup temp directory
        try:
            shutil.rmtree(temp_dir)
        except Exception as e:
            print(f"⚠️  Failed to cleanup temp dir: {e}")

@app.post("/transcribe-with-timestamps")
async def transcribe_with_word_timestamps(file: UploadFile = File(...)):
    """
    Transcribe with word-level timestamps
    Useful for subtitle generation or precise analysis
    """
    
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    temp_dir = tempfile.mkdtemp()
    
    try:
        file_ext = os.path.splitext(file.filename)[1] or '.webm'
        temp_path = os.path.join(temp_dir, f"audio{file_ext}")
        
        with open(temp_path, 'wb') as buffer:
            content = await file.read()
            buffer.write(content)
        
        print(f"🎤 Transcribing with word timestamps: {file.filename}")
        
        # Transcribe with word timestamps
        segments, info = model.transcribe(
            temp_path,
            language="en",
            word_timestamps=True  # Enable word-level timestamps
        )
        
        result_segments = []
        full_text = ""
        
        for segment in segments:
            words = []
            for word in segment.words:
                words.append({
                    "word": word.word,
                    "start": round(word.start, 2),
                    "end": round(word.end, 2),
                    "probability": round(word.probability, 3)
                })
            
            result_segments.append({
                "start": round(segment.start, 2),
                "end": round(segment.end, 2),
                "text": segment.text.strip(),
                "words": words
            })
            
            full_text += segment.text.strip() + " "
        
        return {
            "text": full_text.strip(),
            "language": info.language,
            "segments": result_segments,
            "model": "faster-whisper base"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        try:
            shutil.rmtree(temp_dir)
        except:
            pass

@app.get("/models")
async def list_available_models():
    """List available model sizes"""
    return {
        "available_models": [
            {
                "name": "tiny",
                "size": "~75MB",
                "speed": "Very fast",
                "accuracy": "Basic"
            },
            {
                "name": "base",
                "size": "~150MB",
                "speed": "Fast",
                "accuracy": "Good",
                "recommended": True
            },
            {
                "name": "small",
                "size": "~500MB",
                "speed": "Medium",
                "accuracy": "Better"
            },
            {
                "name": "medium",
                "size": "~1.5GB",
                "speed": "Slower",
                "accuracy": "Very good"
            },
            {
                "name": "large-v2",
                "size": "~3GB",
                "speed": "Slow",
                "accuracy": "Best"
            }
        ],
        "current_model": "base",
        "note": "Change model in startup_event() and restart service"
    }