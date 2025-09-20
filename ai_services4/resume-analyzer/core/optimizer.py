import re
import json
from core.gemini_client import call_gemini_ai

def optimize_resume(resume_text: str, jd_text: str, before_metrics: dict) -> dict:
    prompt = f"""
You are an expert career coach. Optimize the following resume for the given job description.

Resume:
{resume_text}

Job Description:
{jd_text}

Current analysis:
{before_metrics}

Please provide a JSON object with the following fields:
- "optimized_resume_text": rewritten resume, keep bullet points and formatting
- "missing_skills": list of skills, tools, or experience in JD not in resume
- "improvement_tips": concise tips to improve resume relevance

Return **ONLY** the JSON object.
"""
    response_text = call_gemini_ai(prompt)

    # --- NEW robust parsing ---
    try:
        # Try to extract JSON with regex
        match = re.search(r"\{.*\}", response_text, re.DOTALL)
        if match:
            return json.loads(match.group(0))
        else:
            return {
                "optimized_resume_text": response_text.strip(),
                "missing_skills": [],
                "improvement_tips": []
            }
    except Exception as e:
        print("Error parsing Gemini response:", e)
        return {
            "optimized_resume_text": response_text.strip(),
            "missing_skills": [],
            "improvement_tips": []
        }
