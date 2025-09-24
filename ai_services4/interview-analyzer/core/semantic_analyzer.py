# core/semantic_analyzer.py
from sentence_transformers import SentenceTransformer, util

class SemanticAnalyzer:
    def __init__(self, model_name: str = "all-MiniLM-L6-v2"):
        self.model = SentenceTransformer(model_name)

    def relevance_score(self, question: str, response: str) -> float:
        q_emb = self.model.encode(question, convert_to_tensor=True)
        r_emb = self.model.encode(response, convert_to_tensor=True)
        return util.pytorch_cos_sim(q_emb, r_emb).item()  # 0-1 similarity

    def topic_coherence(self, response: str) -> float:
        # MVP: coherence = avg pairwise similarity of sentences in response
        sentences = response.split('.')
        embeddings = self.model.encode(sentences, convert_to_tensor=True)
        if len(embeddings) <= 1:
            return 1.0
        sim_matrix = util.pytorch_cos_sim(embeddings, embeddings)
        # exclude diagonal
        n = len(sentences)
        total = sim_matrix.sum() - n  # remove diagonal
        count = n * (n - 1)
        return (total / count).item()
