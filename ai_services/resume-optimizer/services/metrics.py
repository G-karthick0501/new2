from collections import Counter
import re

def extract_keywords(text: str, max_keywords: int = 20) -> list:
    """Simple regex-based keyword extraction"""
    words = re.findall(r'\b[A-Za-z]{4,}\b', text.lower())
    filtered = [w for w in words if w not in {'this','that','with','have','will','from','they','been','were','said','each','which'}]
    counter = Counter(filtered)
    return [word for word, _ in counter.most_common(max_keywords)]

def keyword_match(resume_text: str, job_text: str) -> float:
    """Fraction of job keywords present in resume"""
    resume_kw = set(extract_keywords(resume_text))
    job_kw = set(extract_keywords(job_text))
    if not job_kw:
        return 0.0
    return len(resume_kw.intersection(job_kw)) / len(job_kw)

def content_similarity(text1: str, text2: str) -> float:
    """Simple token overlap similarity"""
    tokens1 = set(re.findall(r'\b\w+\b', text1.lower()))
    tokens2 = set(re.findall(r'\b\w+\b', text2.lower()))
    union = tokens1.union(tokens2)
    if not union:
        return 0.0
    return len(tokens1.intersection(tokens2)) / len(union)
