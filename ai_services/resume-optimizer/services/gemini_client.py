import os
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv() 

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
if not GOOGLE_API_KEY:
    raise RuntimeError("GOOGLE_API_KEY is required in .env")

genai.configure(api_key=GOOGLE_API_KEY)
MODEL = genai.GenerativeModel("gemini-1.5-flash")

def rewrite_resume(resume_text: str, job_description: str, keywords: list) -> str:
    """Generate optimized resume using Gemini AI"""
    prompt = f"""
Optimize this resume for the job description. Highlight relevant keywords naturally.

RESUME:
{resume_text}

JOB DESCRIPTION:
{job_description}

KEYWORDS TO HIGHLIGHT: {', '.join(keywords[:15])}

Return only optimized resume text.
"""
    try:
        response = MODEL.generate_content(prompt)
        return response.text
    except Exception as e:
        raise RuntimeError(f"AI generation failed: {e}")
