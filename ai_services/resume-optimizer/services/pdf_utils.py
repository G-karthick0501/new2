import io
from typing import List
from fastapi import UploadFile
import pdfplumber

def extract_text_from_pdf(file: UploadFile) -> str:
    """
    Extract text from a PDF safely.
    Accepts FastAPI UploadFile object (sync read).
    Ensures UTF-8 encoding and replaces unrecognized characters.
    """
    try:
        # Read bytes from UploadFile (sync)
        pdf_bytes = file.file.read()
        file.file.seek(0)  # reset pointer so FastAPI can read again if needed

        pdf_stream = io.BytesIO(pdf_bytes)
        text_parts: List[str] = []

        with pdfplumber.open(pdf_stream) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    page_text = page_text.encode("utf-8", errors="replace").decode("utf-8")
                    text_parts.append(page_text)

        return "\n".join(text_parts)

    except Exception as e:
        raise RuntimeError(f"PDF extraction failed: {str(e)}")
