from fastapi import FastAPI, UploadFile, Form, HTTPException
from sentence_transformers import SentenceTransformer, util
from sklearn.metrics.pairwise import cosine_similarity
from pydantic import BaseModel
import PyPDF2, re, os
from dotenv import load_dotenv
import google.generativeai as genai

# Init
app = FastAPI()
load_dotenv()
GOOGLE_API_KEY = "AIzaSyDmhfCF0gzq_OeMa4lXlUsMCIyQ1PS7eN0"
genai.configure(api_key=GOOGLE_API_KEY)

embedder = SentenceTransformer('all-MiniLM-L6-v2')
model = genai.GenerativeModel(model_name="gemini-1.5-flash") # or models/gemini-1.5-flash

# Utils
def extract_text_from_pdf(file):
    text = ""
    reader = PyPDF2.PdfReader(file)
    for page in reader.pages:
        text += page.extract_text() or ""
    return text

def section_resume(text):
    sections = ['Education', 'Experience', 'Skills', 'Projects', 'Achievements', 'Personal Details']
    resume_json = {}
    lower_text = text.lower()
    for sec in sections:
        idx = lower_text.find(sec.lower())
        if idx != -1:
            next_indices = [lower_text.find(s.lower(), idx + 1) for s in sections if lower_text.find(s.lower(), idx + 1) != -1]
            next_idx = min(next_indices) if next_indices else len(text)
            resume_json[sec] = text[idx:next_idx].strip()
    if not resume_json:
        resume_json["FullResume"] = text
    return resume_json

def extract_job_keywords(job_text):
    keywords = set()
    lines = job_text.split('\n') if job_text else []
    for line in lines:
        if any(k in line.lower() for k in ['require', 'skill', 'responsib']):
            words = re.findall(r'\b\w+\b', line)
            for word in words:
                if word.isalpha() and len(word) > 2:
                    keywords.add(word.lower())
    return list(keywords)

def generate_section_with_llm(section_name, section_text, job_desc, job_keywords):
    prompt = f"""
You are a professional resume writer.
Rewrite the "{section_name}" section below:

{section_text}

Job description:
{job_desc}

Highlight these job keywords: {', '.join(job_keywords)}
"""
    response = model.generate_content(prompt)
    return response.text

# Endpoint
@app.post("/optimize_resume")
async def optimize_resume(resume: UploadFile, jobDescription: str = Form(...)):
    try:
        text = extract_text_from_pdf(resume.file)
        resume_json = section_resume(text)
        job_keywords = extract_job_keywords(jobDescription)

        tailored_resume = {}
        for sec, sec_text in resume_json.items():
            tailored_resume[sec] = generate_section_with_llm(sec, sec_text, jobDescription, job_keywords)

        return {
            "content": {
                "text": "\n\n".join([f"{s}\n{t}" for s, t in tailored_resume.items()]),
                "sections": tailored_resume
            },
            "metrics": {
                "jobAlignment": 0.85,  # placeholder until you port scoring functions
                "contentPreservation": 0.90
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
