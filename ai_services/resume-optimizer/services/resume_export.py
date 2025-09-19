from fpdf import FPDF
import os
import re

def save_resume_pdf(text: str, output_path: str = "optimized_resume.pdf") -> str:
    """
    Save a resume as a PDF using a UTF-8-safe TTF font.
    Handles em-dashes, en-dashes, bullets, smart quotes, and other Unicode characters.
    """

    pdf = FPDF(format='A4')
    pdf.add_page()
    pdf.set_auto_page_break(auto=True, margin=15)

    # Use LiberationSans TTF (UTF-8 safe)
    font_path = os.path.join(
        os.path.dirname(__file__), "fonts", "liberation_sans", "LiberationSans-Regular.ttf"
    )
    pdf.add_font("LiberationSans", "", font_path, uni=True)
    pdf.set_font("LiberationSans", size=12)

    # Replace problematic characters
    replacements = {
        "\u2014": "-",  # em-dash
        "\u2013": "-",  # en-dash
        "\u2022": "*",  # bullet
        "\u201c": '"',  # left double quote
        "\u201d": '"',  # right double quote
        "\u2018": "'",  # left single quote
        "\u2019": "'",  # right single quote
        "\u00a0": " ",  # non-breaking space
    }

    def safe_text(t: str) -> str:
        for k, v in replacements.items():
            t = t.replace(k, v)
        # Remove other non-printable/control characters
        t = re.sub(r"[\x00-\x1F\x7F]", "", t)
        return t

    # Split text into paragraphs
    for paragraph in text.split("\n"):
        paragraph = safe_text(paragraph)
        # Split long lines into chunks that fit page width
        lines = pdf.multi_cell(0, 8, paragraph, align='L', split_only=True)
        for line in lines:
            pdf.cell(0, 8, line, ln=1)

    pdf.output(output_path)
    return output_path
