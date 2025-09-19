import re
import PyPDF2
from io import BytesIO
from typing import List, Dict
import nltk
from datetime import datetime
import os

# Download required NLTK data (run once)
try:
    nltk.data.find('corpora/stopwords')
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('stopwords', quiet=True)
    nltk.download('punkt', quiet=True)

from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from collections import Counter

class ResumeProcessor:
    def __init__(self):
        # Initialize basic NLP tools
        self.stop_words = set(stopwords.words('english'))
    
    def extract_pdf_text(self, pdf_bytes: bytes) -> str:
        """Extract text from PDF bytes"""
        try:
            reader = PyPDF2.PdfReader(BytesIO(pdf_bytes))
            text_parts = []
            
            for page in reader.pages:
                page_text = page.extract_text()
                if page_text:
                    text_parts.append(page_text)
            
            return '\n'.join(text_parts).strip()
        except Exception as e:
            raise ValueError(f"PDF extraction failed: {e}")
    
    def extract_keywords(self, text: str, max_keywords: int = 20) -> List[str]:
        """Extract meaningful keywords using NLTK"""
        if not text:
            return []
        
        # Tokenize and clean
        tokens = word_tokenize(text.lower())
        keywords = [
            word for word in tokens 
            if (word.isalpha() and 
                len(word) > 2 and 
                word not in self.stop_words)
        ]
        
        # Get most frequent keywords
        keyword_freq = Counter(keywords)
        return [word for word, _ in keyword_freq.most_common(max_keywords)]
    
    def calculate_simple_similarity(self, text1: str, text2: str) -> float:
        """Calculate simple keyword-based similarity"""
        if not text1 or not text2:
            return 0.0
        
        words1 = set(self.extract_keywords(text1))
        words2 = set(self.extract_keywords(text2))
        
        if not words1 or not words2:
            return 0.0
        
        intersection = words1.intersection(words2)
        union = words1.union(words2)
        
        return len(intersection) / len(union) if union else 0.0
    
    def calculate_keyword_match(self, resume_text: str, job_text: str) -> float:
        """Calculate keyword overlap percentage"""
        resume_keywords = set(self.extract_keywords(resume_text))
        job_keywords = set(self.extract_keywords(job_text))
        
        if not job_keywords:
            return 0.0
        
        matches = resume_keywords.intersection(job_keywords)
        return len(matches) / len(job_keywords)
    
    def create_optimization_prompt(self, resume: str, job_desc: str, keywords: List[str]) -> str:
        """Create AI optimization prompt"""
        keywords_str = ', '.join(keywords[:15])
        
        return f"""Optimize this resume for the job description. Focus on incorporating relevant keywords and improving alignment.

RESUME:
{resume}

JOB DESCRIPTION:
{job_desc}

KEY SKILLS TO HIGHLIGHT: {keywords_str}

Instructions:
- Tailor content to match job requirements
- Include relevant keywords naturally
- Improve bullet points and quantify achievements
- Keep all information truthful
- Maintain professional formatting
- Return only the optimized resume text

OPTIMIZED RESUME:"""

class ResponseUtils:
    @staticmethod
    def format_success(data: Dict, message: str = "Success") -> Dict:
        """Format successful response"""
        return {
            "success": True,
            "message": message,
            "data": data,
            "timestamp": datetime.now().isoformat()
        }
    
    @staticmethod
    def format_error(error: str, details: str = None) -> Dict:
        """Format error response"""
        return {
            "success": False,
            "error": error,
            "details": details,
            "timestamp": datetime.now().isoformat()
        }

class ValidationUtils:
    @staticmethod
    def is_pdf(filename: str) -> bool:
        """Check if file is PDF"""
        return filename.lower().endswith('.pdf')
    
    @staticmethod
    def is_valid_size(size: int, max_mb: int = 10) -> bool:
        """Check file size"""
        return size <= (max_mb * 1024 * 1024)
    
    @staticmethod
    def has_min_length(text: str, min_length: int = 50) -> bool:
        """Check minimum text length"""
        return len(text.strip()) >= min_length