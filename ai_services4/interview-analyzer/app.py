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
analyzer = ResponseAnalyzer()
@app.on_event("startup")
async def startup_event():
    """Initialize NLTK data and models on startup"""
    print("🚀 Starting Interview Analyzer Service...")
    
    # Download NLTK data if missing
    download_nltk_data()
    
    # Initialize analyzer (this will also trigger any model downloads)
    global analyzer
    analyzer = ResponseAnalyzer()
    
    print("✅ Service ready!")

# Initialize analyzer globally
analyzer = None

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
        # Convert Pydantic models to dicts
        items = [{"question_text": i.question_text, "response_text": i.response_text} for i in request.items]
        
        # Call analyzer
        result = analyzer.analyze_batch(items)
        
        return {"analysis": result}
    
    except Exception as e:
        # Catch all exceptions and return a safe JSON response
        return {
            "detail": "Internal error during analysis",
            "error": str(e)
        }
