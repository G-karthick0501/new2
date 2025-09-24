# models/response_analyzer.py
from core import text_processor as tp, semantic_analyzer as sa, llm_enhancer as llm

class ResponseAnalyzer:
    def __init__(self):
        self.tp = tp.TextProcessor()
        self.sa = sa.SemanticAnalyzer()
        self.llm = llm.LLMEnhancer()  # Fixed class reference

    def analyze_batch(self, items: list) -> list:
        # Step 1: Compute metrics first
        processed_items = []
        for item in items:
            question = item.get("question_text", "")
            response = item.get("response_text", "")

            objective = {
                "word_count": self.tp.word_count(response),
                "sentence_count": self.tp.sentence_count(response),
                "avg_sentence_length": self.tp.avg_sentence_length(response),
                "lexical_diversity": self.tp.lexical_diversity(response),
                "pos_diversity": self.tp.pos_diversity(response),
                "syntactic_complexity": self.tp.syntactic_complexity(response),
            }

            semantic = {
                "relevance_score": self.sa.relevance_score(question, response),
                "topic_coherence": self.sa.topic_coherence(response),
            }

            processed_items.append({
                "question_text": question,   # keep same keys for LLM
                "response_text": response,
                "objective": objective,
                "semantic": semantic
            })

        # Step 2: Call LLM enhancer on processed items
        llm_feedback_list = self.llm.analyze_batch(processed_items)

        # Step 3: Merge LLM feedback back into processed items
        results = []
        for i, item in enumerate(processed_items):
            results.append({
                "question": item["question_text"],
                "response": item["response_text"],
                "objective": item["objective"],
                "semantic": item["semantic"],
                "llm_feedback": llm_feedback_list[i].get("llm_feedback", {}) if i < len(llm_feedback_list) else {"error": "Missing"}
            })

        return results
