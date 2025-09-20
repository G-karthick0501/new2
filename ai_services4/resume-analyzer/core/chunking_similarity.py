from sentence_transformers import SentenceTransformer, util
import numpy as np

model = SentenceTransformer("all-MiniLM-L6-v2")

def chunk_text(text: str, chunk_size: int = 150) -> list[str]:
    words = text.split()
    return [" ".join(words[i:i + chunk_size]) for i in range(0, len(words), chunk_size)]

def get_embeddings(chunks: list[str]) -> np.ndarray:
    return model.encode(chunks, convert_to_tensor=True)

def compute_similarity(resume_embeds, jd_embeds) -> np.ndarray:
    return util.cos_sim(resume_embeds, jd_embeds).cpu().numpy()

def compute_missing(similarity_matrix: np.ndarray, resume_chunks: list[str], jd_chunks: list[str], threshold: float = 0.6):
    missing_info = {"missing_chunks": []}
    for jd_idx, jd_chunk in enumerate(jd_chunks):
        sim_scores = similarity_matrix[:, jd_idx]
        if sim_scores.max() < threshold:
            missing_info["missing_chunks"].append(jd_chunk)
    return missing_info

def compute_after_metrics(optimized_resume_text: str, jd_chunks: list[str]):
    resume_chunks = chunk_text(optimized_resume_text)
    resume_embeds = get_embeddings(resume_chunks)
    jd_embeds = get_embeddings(jd_chunks)
    similarity_matrix = compute_similarity(resume_embeds, jd_embeds)
    return compute_missing(similarity_matrix, resume_chunks, jd_chunks)
