from fastapi import FastAPI, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import logging
from services.pdf_utils import extract_text_from_pdf
from services.gemini_client import rewrite_resume
from services.embedding import embedding_similarity
from services.metrics import keyword_match, content_similarity, extract_keywords
from services.resume_export import save_resume_pdf

# Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Resume Optimizer", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/optimize")
async def optimize_resume(resume: UploadFile, jobDescription: str = Form(...)):
    try:
        if not resume.filename.lower().endswith(".pdf"):
            raise HTTPException(400, "Only PDF files are allowed")

        # Check file size without reading whole file into memory
        resume.file.seek(0, 2)  # move to end
        file_size = resume.file.tell()
        resume.file.seek(0)  # reset pointer
        if file_size > 10 * 1024 * 1024:
            raise HTTPException(400, "File too large (max 10MB)")

        logger.info(f"Processing resume: {resume.filename}")

        # Extract PDF text
        resume_text = extract_text_from_pdf(resume)

        # Extract job keywords
        job_keywords = extract_keywords(jobDescription)

        # AI Optimization
        logger.info("Generating optimized resume with AI...")
        optimized_text = rewrite_resume(resume_text, jobDescription, job_keywords)

        # Metrics
        kw_match = keyword_match(optimized_text, jobDescription)
        cont_sim = content_similarity(optimized_text, resume_text)
        emb_sim = embedding_similarity(optimized_text, resume_text)

        # Save optimized PDF
        pdf_path = save_resume_pdf(optimized_text)

        return {
            "optimized_text": optimized_text,
            "metrics": {
                "keyword_match": round(kw_match, 3),
                "content_similarity": round(cont_sim, 3),
                "embedding_similarity": round(emb_sim, 3)
            },
            "downloadable_pdf": pdf_path
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Resume optimization failed: {e}")
        raise HTTPException(500, f"Resume optimization failed: {e}")
