from sentence_transformers import SentenceTransformer, util

# Load once
MODEL = SentenceTransformer("all-MiniLM-L6-v2")

def get_embedding(text: str):
    return MODEL.encode(text, convert_to_tensor=True)

def embedding_similarity(text1: str, text2: str) -> float:
    emb1 = get_embedding(text1)
    emb2 = get_embedding(text2)
    return float(util.cos_sim(emb1, emb2).item())
