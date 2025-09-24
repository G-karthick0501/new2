# core/llm_enhancer.py
import json
from utils.prompt_templates import generate_interview_feedback_prompt_batch as get_llm_prompt
from typing import List, Dict
from core.gemini_client import call_gemini_ai

class LLMEnhancer:
    def __init__(self):
        pass

    def analyze_batch(self, items: List[Dict]) -> List[Dict]:
        """
        items: List of dicts, each with 'question_text', 'response_text', 'objective', 'semantic'
        Returns: List of dicts, each with LLM feedback for the corresponding item
        """
        # Build batch prompt for Gemini
        prompt = get_llm_prompt(items)

        # Call Gemini
        raw_output = call_gemini_ai(prompt)

        # Try to clean and parse JSON safely
        parsed = []
        try:
            # Remove code blocks or backticks
            cleaned = raw_output.replace("```json", "").replace("```", "").strip()
            parsed = json.loads(cleaned)
            # Ensure we have one dict per item
            if not isinstance(parsed, list) or len(parsed) != len(items):
                raise ValueError("Parsed JSON is not a list matching input length")
        except Exception as e:
            print("LLM output parse error:", e)
            # Fallback: return a generic structure for each item
            parsed = [
                {"strengths": [], "weaknesses": ["Could not generate LLM feedback."], "improvement_tips": ["Fallback: review your answer manually."]}
                for _ in items
            ]

        # Map feedback to items
        feedback_list = []
        for idx, item in enumerate(items):
            feedback_list.append({
                "question": item["question_text"],
                "response": item["response_text"],
                "llm_feedback": parsed[idx] if idx < len(parsed) else {
                    "strengths": [], "weaknesses": ["Missing"], "improvement_tips": []
                }
            })

        return feedback_list
