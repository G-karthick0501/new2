def generate_interview_feedback_prompt_batch(items: list) -> str:
    """
    Creates a structured prompt for multiple Q&A items at once.
    Each item is a dict with:
    - question_text: str
    - response_text: str
    - objective: dict
    - semantic: dict
    """
    prompt = "You are an interview coach. Evaluate the following candidate responses.\n\n"
    
    for idx, item in enumerate(items, start=1):
        prompt += f"Q{idx}: {item['question_text']}\n"
        prompt += f"Response: {item['response_text']}\n"
        prompt += f"Objective metrics: {item['objective']}\n"
        prompt += f"Semantic metrics: {item['semantic']}\n\n"
    
    prompt += (
        "Provide structured feedback in JSON format for each question with the following fields:\n"
        "- strengths: list\n"
        "- weaknesses: list\n"
        "- improvement_tips: list\n\n"
        "Output should be a JSON array with one object per Q&A in the same order."
    )
    
    return prompt
