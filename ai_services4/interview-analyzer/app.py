# app.py
from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Dict, Any
from models.response_analyzer import ResponseAnalyzer
from core.nltk_setup import download_nltk_data

from fastapi import UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import cv2
import numpy as np
from deepface import DeepFace
import tempfile
import os

app = FastAPI()

# Add CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

analyzer = None

@app.on_event("startup")
async def startup_event():
    """Initialize NLTK data and models on startup"""
    print("🚀 Starting Interview Analyzer Service...")
    download_nltk_data()
    global analyzer
    analyzer = ResponseAnalyzer()
    print("✅ Service ready!")

# Request model
class QAItem(BaseModel):
    question_text: str
    response_text: str

class QARequest(BaseModel):
    items: List[QAItem]

@app.get("/")
async def root():
    return {"message": "Interview Analyzer API is running"}

@app.post("/analyze")
async def analyze(request: QARequest):
    try:
        items = [{"question_text": i.question_text, "response_text": i.response_text} for i in request.items]
        result = analyzer.analyze_batch(items)
        return {"analysis": result}
    except Exception as e:
        return {
            "detail": "Internal error during analysis",
            "error": str(e)
        }

def convert_numpy_types(obj):
    """Recursively convert numpy types to Python native types"""
    if isinstance(obj, dict):
        return {k: convert_numpy_types(v) for k, v in obj.items()}
    elif isinstance(obj, (list, tuple)):
        return [convert_numpy_types(item) for item in obj]
    elif isinstance(obj, (np.integer, np.int64, np.int32)):
        return int(obj)
    elif isinstance(obj, (np.floating, np.float64, np.float32)):
        return float(obj)
    elif isinstance(obj, np.ndarray):
        return obj.tolist()
    else:
        return obj
@app.post("/analyze-video-emotion")
async def analyze_video_emotion(file: UploadFile = File(...)):
    """
    Analyze emotion from a video frame (image)
    Returns dominant emotion and confidence scores
    """
    try:
        import time
        start_time = time.time()
        
        print(f"📸 Received frame: {file.filename}, Content-Type: {file.content_type}")
        
        image_bytes = await file.read()
        frame_size_kb = round(len(image_bytes) / 1024, 2)  # Calculate size
        
        nparr = np.frombuffer(image_bytes, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if frame is None:
            print("❌ Could not decode image")
            return {
                "success": False,
                "error": "Could not decode image",
                "dominant_emotion": "unknown",
                "confidence": 0,
                "all_emotions": {}
            }
        
        print(f"🖼️  Frame shape: {frame.shape}")
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        
        print("🔍 Running DeepFace analysis...")
        
        # Use MTCNN for better accuracy
        result = DeepFace.analyze(
            rgb_frame,
            actions=['emotion'],
            enforce_detection=False,
            detector_backend='mtcnn'
        )
        
        processing_time_ms = round((time.time() - start_time) * 1000)  # Calculate time
        
        print(f"✅ DeepFace result type: {type(result)}")
        
        if isinstance(result, list):
            emotions = result[0]['emotion']
            face_region = result[0].get('region', {})
            face_confidence = result[0].get('face_confidence', 0)
        else:
            emotions = result['emotion']
            face_region = result.get('region', {})
            face_confidence = result.get('face_confidence', 0)
        
        print(f"😊 Raw emotions: {emotions}")
        print(f"👤 Face detected at: {face_region}, confidence: {face_confidence}")
        
        # Convert ALL numpy types to Python native types
        emotions = {k: float(v) for k, v in emotions.items()}
        face_region = convert_numpy_types(face_region)
        face_confidence = float(face_confidence) if face_confidence else 0
        
        dominant_emotion = max(emotions, key=emotions.get)
        confidence = emotions[dominant_emotion]
        
        print(f"🎯 Dominant: {dominant_emotion} ({confidence:.2f}%)")
        print(f"⏱️  Processing time: {processing_time_ms}ms, Frame size: {frame_size_kb}KB")
        
        return {
            "success": True,
            "dominant_emotion": dominant_emotion,
            "confidence": round(confidence, 2),
            "all_emotions": {k: round(v, 2) for k, v in emotions.items()},
            "face_detected": bool(face_region),
            "face_region": face_region,
            "face_confidence": round(face_confidence, 2),
            "frame_size_kb": frame_size_kb,
            "processing_time_ms": processing_time_ms
        }
        
    except Exception as e:
        import traceback
        print(f"❌ Error: {str(e)}")
        print(f"📋 Traceback: {traceback.format_exc()}")
        return {
            "success": False,
            "error": str(e),
            "dominant_emotion": "unknown",
            "confidence": 0,
            "all_emotions": {}
        }
    """
    Analyze emotion from a video frame (image)
    Returns dominant emotion and confidence scores
    """
    try:
        print(f"📸 Received frame: {file.filename}, Content-Type: {file.content_type}")
        
        image_bytes = await file.read()
        nparr = np.frombuffer(image_bytes, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if frame is None:
            print("❌ Could not decode image")
            return {
                "success": False,
                "error": "Could not decode image",
                "dominant_emotion": "unknown",
                "confidence": 0,
                "all_emotions": {}
            }
        
        print(f"🖼️  Frame shape: {frame.shape}")
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        
        print("🔍 Running DeepFace analysis...")
        
        # Use MTCNN for better accuracy
        result = DeepFace.analyze(
            rgb_frame,
            actions=['emotion'],
            enforce_detection=False,
            detector_backend='mtcnn'
        )
        
        print(f"✅ DeepFace result type: {type(result)}")
        
        if isinstance(result, list):
            emotions = result[0]['emotion']
            face_region = result[0].get('region', {})
            face_confidence = result[0].get('face_confidence', 0)
        else:
            emotions = result['emotion']
            face_region = result.get('region', {})
            face_confidence = result.get('face_confidence', 0)
        
        print(f"😊 Raw emotions: {emotions}")
        print(f"👤 Face detected at: {face_region}, confidence: {face_confidence}")
        
        # Convert ALL numpy types to Python native types
        emotions = {k: float(v) for k, v in emotions.items()}
        face_region = convert_numpy_types(face_region)
        face_confidence = float(face_confidence) if face_confidence else 0
        
        dominant_emotion = max(emotions, key=emotions.get)
        confidence = emotions[dominant_emotion]
        
        print(f"🎯 Dominant: {dominant_emotion} ({confidence:.2f}%)")
        
        return {
            "success": True,
            "dominant_emotion": dominant_emotion,
            "confidence": round(confidence, 2),
            "all_emotions": {k: round(v, 2) for k, v in emotions.items()},
            "face_detected": bool(face_region),
            "face_region": face_region,
            "face_confidence": round(face_confidence, 2)
        }
        
    except Exception as e:
        import traceback
        print(f"❌ Error: {str(e)}")
        print(f"📋 Traceback: {traceback.format_exc()}")
        return {
            "success": False,
            "error": str(e),
            "dominant_emotion": "unknown",
            "confidence": 0,
            "all_emotions": {}
        }