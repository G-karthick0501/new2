# utils/prompt_templates.py
from typing import List, Dict

def generate_interview_feedback_prompt_batch(items: list) -> str:
    """
    Generate prompt for batch analysis of interview Q&A with EMOTION DATA
    
    Args:
        items: List of dicts with keys:
            - question_text
            - response_text
            - objective (metrics)
            - semantic (metrics)
            - emotion_analysis (NEW!)
    
    Returns:
        Formatted prompt string
    """
    prompt = """You are an expert interview coach analyzing candidate responses with MULTI-MODAL data including TEXT and EMOTION analysis.

For each question-answer pair below, provide comprehensive feedback considering:
1. Response quality (content, clarity, structure)
2. Objective metrics (word count, complexity, etc.)
3. Semantic relevance
4. **EMOTION ANALYSIS** (facial expressions, stress levels, confidence, engagement)

Questions and Responses:
"""

    for idx, item in enumerate(items, start=1):
        prompt += f"\n{'='*60}\n"
        prompt += f"Question {idx}:\n{item['question_text']}\n\n"
        prompt += f"Candidate Response:\n{item['response_text']}\n\n"
        
        # Objective metrics
        if 'objective' in item and item['objective']:
            obj = item['objective']
            prompt += f"Objective Metrics:\n"
            prompt += f"  - Word count: {obj.get('word_count', 'N/A')}\n"
            prompt += f"  - Sentence count: {obj.get('sentence_count', 'N/A')}\n"
            prompt += f"  - Lexical diversity: {obj.get('lexical_diversity', 'N/A')}\n\n"
        
        # Semantic metrics
        if 'semantic' in item and item['semantic']:
            sem = item['semantic']
            prompt += f"Semantic Metrics:\n"
            prompt += f"  - Relevance score: {sem.get('relevance_score', 'N/A')}\n"
            prompt += f"  - Topic coherence: {sem.get('topic_coherence', 'N/A')}\n\n"
        
        # ✅ NEW: Emotion analysis
        if 'emotion_analysis' in item and item['emotion_analysis']:
            emo = item['emotion_analysis']
            prompt += f"EMOTION ANALYSIS (Video/Facial Recognition):\n"
            prompt += f"  - Dominant emotions: {', '.join(emo.get('dominantEmotions', []))}\n"
            prompt += f"  - Emotional stability: {emo.get('emotionalStability', 'N/A')} (0-1, higher = more stable)\n"
            prompt += f"  - Average confidence: {emo.get('averageConfidence', 'N/A')}%\n"
            prompt += f"  - Nervousness score: {emo.get('stressIndicators', {}).get('nervousnessScore', 'N/A')}/10\n"
            prompt += f"  - Engagement score: {emo.get('engagementScore', 'N/A')}/10\n"
            prompt += f"  - High stress detected: {emo.get('stressIndicators', {}).get('isHighStress', False)}\n"
            
            # Temporal patterns
            if 'temporalPatterns' in emo and emo['temporalPatterns']:
                temp = emo['temporalPatterns']
                prompt += f"  - Emotion at start: {temp.get('beginning', {}).get('dominantEmotion', 'N/A')}\n"
                prompt += f"  - Emotion at end: {temp.get('end', {}).get('dominantEmotion', 'N/A')}\n"
                prompt += f"  - Emotional trend: {temp.get('trend', 'N/A')}\n"
            
            # Emotion distribution
            if 'emotionDistribution' in emo:
                dist = emo['emotionDistribution']
                top_emotions = sorted(dist.items(), key=lambda x: x[1], reverse=True)[:3]
                prompt += f"  - Top emotion percentages: "
                prompt += ", ".join([f"{e}: {round(p, 1)}%" for e, p in top_emotions])
                prompt += "\n"
            
            prompt += "\n"

    prompt += f"\n{'='*60}\n\n"
    prompt += """
INSTRUCTIONS:
Analyze each response holistically using ALL available data (text + emotion).

For EACH question, provide structured feedback in this JSON format:
{
  "strengths": [
    "Specific strength 1",
    "Specific strength 2"
  ],
  "weaknesses": [
    "Specific area for improvement 1",
    "Specific area for improvement 2"
  ],
  "improvement_tips": [
    "Actionable tip 1",
    "Actionable tip 2"
  ],
  "emotion_insights": "Brief insight about how their emotional state affected their response (e.g., 'High nervousness may have impacted clarity' or 'Confident demeanor supported strong answer')"
}

**IMPORTANT GUIDELINES:**
1. **Integrate emotion data naturally** - Don't just list metrics. Explain how emotions affected the response quality.
   - Good: "The candidate's response was clear, though high stress levels (nervousness: 7.2/10) may have caused some hesitation in delivery."
   - Bad: "Nervousness score: 7.2/10"

2. **Consider emotion-text alignment** - Do emotions match response quality?
   - If answer is good but emotions show high stress → mention anxiety management
   - If answer is weak but emotions are confident → mention overconfidence
   - If answer is good and emotions are confident → praise composure

3. **Temporal patterns matter** - Note if confidence improved/declined
   - "Started nervously but gained confidence" = positive
   - "Started confident but became stressed" = concerning

4. **Be specific and actionable** - Link emotions to concrete improvements
   - Good: "Practice relaxation techniques before technical questions to reduce anxiety and improve articulation"
   - Bad: "Reduce stress"

5. **Balance positive and constructive** - Always find strengths even in weak responses

Return ONLY a valid JSON array with one object per question, in the same order.
No additional text outside the JSON array.
"""
    
    return prompt


def generate_context_aware_prompt(items: list) -> str:
    """
    Context-aware prompt that considers the interview as a whole conversation,
    including emotion progression across questions.
    
    Enhanced with emotion analysis for multi-modal assessment.
    """
    if not items:
        return ""
    
    prompt = """You are an expert interview coach analyzing a complete interview with MULTI-MODAL data.

INTERVIEW CONTEXT:
"""
    prompt += f"- Total questions: {len(items)}\n"
    prompt += f"- Interview type: {items[0].get('interview_type', 'technical')}\n"
    
    # Overall emotion summary
    if any('emotion_analysis' in item for item in items):
        prompt += "\nOVERALL EMOTIONAL PROGRESSION:\n"
        for idx, item in enumerate(items, start=1):
            if 'emotion_analysis' in item and item['emotion_analysis']:
                emo = item['emotion_analysis']
                prompt += f"Question {idx}: {', '.join(emo.get('dominantEmotions', [])[:2])} "
                prompt += f"(stress: {emo.get('stressIndicators', {}).get('nervousnessScore', 'N/A')}/10)\n"
    
    prompt += "\n" + "="*60 + "\n"
    prompt += "DETAILED RESPONSES:\n\n"

    for idx, item in enumerate(items, start=1):
        prompt += f"\nQuestion {idx} of {len(items)}:\n"
        prompt += f"Q: {item['question_text']}\n"
        prompt += f"A: {item['response_text']}\n\n"
        
        # Include all metrics (objective, semantic, emotion)
        if 'objective' in item and item['objective']:
            prompt += f"Objective: {item['objective']}\n"
        if 'semantic' in item and item['semantic']:
            prompt += f"Semantic: {item['semantic']}\n"
        if 'emotion_analysis' in item and item['emotion_analysis']:
            emo = item['emotion_analysis']
            prompt += f"Emotion: {emo.get('dominantEmotions', [])} | "
            prompt += f"Stability: {emo.get('emotionalStability', 'N/A')} | "
            prompt += f"Engagement: {emo.get('engagementScore', 'N/A')}/10\n"
        prompt += "\n"

    prompt += "="*60 + "\n\n"
    prompt += """
INSTRUCTIONS:
Evaluate each response while considering:
1. Individual response quality (content, structure, clarity)
2. Consistency with previous answers (narrative development)
3. Interview flow and progression
4. **EMOTIONAL CONSISTENCY** - Did stress levels change? Did confidence build?
5. **EMOTION-PERFORMANCE CORRELATION** - How did emotional state impact response quality?

Provide structured feedback in JSON format for each question:
{
  "strengths": [...],
  "weaknesses": [...],
  "improvement_tips": [...],
  "emotion_insights": "How emotions affected this specific response",
  "consistency_notes": "Observations about consistency with other responses (if applicable)"
}

**EMOTION-SPECIFIC GUIDANCE:**
- If stress INCREASED across questions → suggest stress management strategies
- If confidence IMPROVED → praise composure development
- If high stress but good answers → acknowledge resilience under pressure
- If low stress but poor answers → may indicate lack of preparation or engagement

Return ONLY a valid JSON array with one object per question in the same order.
"""
    
    return prompt


def generate_overall_emotion_summary(sessions_data: list) -> str:
    """
    Generate a prompt for creating an overall emotional summary of the interview.
    Used for the overallAnalysis.emotionalSummary field.
    """
    prompt = """Analyze the candidate's overall emotional state throughout the interview.

EMOTIONAL DATA ACROSS ALL QUESTIONS:
"""
    
    for idx, item in enumerate(sessions_data, start=1):
        if 'emotion_analysis' in item and item['emotion_analysis']:
            emo = item['emotion_analysis']
            prompt += f"\nQuestion {idx}:\n"
            prompt += f"  - Dominant: {', '.join(emo.get('dominantEmotions', []))}\n"
            prompt += f"  - Nervousness: {emo.get('stressIndicators', {}).get('nervousnessScore', 0)}/10\n"
            prompt += f"  - Engagement: {emo.get('engagementScore', 0)}/10\n"
            prompt += f"  - Stability: {emo.get('emotionalStability', 0)}\n"
    
    prompt += """

Provide a JSON summary:
{
  "overallStressLevel": "low" | "moderate" | "high",
  "consistencyScore": 0-10 (how consistent emotions were),
  "confidenceProgression": "improving" | "declining" | "stable",
  "keyEmotionalInsights": [
    "Insight 1",
    "Insight 2",
    "Insight 3"
  ]
}

Return ONLY valid JSON.
"""
    
    return prompt


def generate_context_aware_prompt(items: List[Dict]) -> str:
    """
    Creates a context-aware prompt that considers the entire interview flow.
    Each item includes previous Q&A context for better analysis.
    """
    prompt = """You are an experienced interview coach analyzing a complete interview session. 
Consider the flow, consistency, and development of responses across questions.

Interview Session Analysis:
"""
    
    for idx, item in enumerate(items, start=1):
        prompt += f"\n--- Question {idx}/{item.get('total_questions', len(items))} ---\n"
        prompt += f"Question: {item['question_text']}\n"
        prompt += f"Response: {item['response_text']}\n"
        prompt += f"Objective metrics: {item['objective']}\n"
        prompt += f"Semantic metrics: {item['semantic']}\n"
        
        # Add context from previous questions if available
        if item.get('previous_qa'):
            prompt += "\nPrevious Q&A Context:\n"
            for prev_idx, prev_qa in enumerate(item['previous_qa'], start=1):
                prompt += f"  Q{prev_idx}: {prev_qa['question']}\n"
                prompt += f"  A{prev_idx}: {prev_qa['response']}\n"
        
        prompt += "\n"
    
    prompt += """
Analyze each response considering:
1. Individual response quality
2. Consistency with previous answers
3. Interview flow and narrative development
4. Areas where responses build upon or contradict each other

Provide structured feedback in JSON format for each question:
- strengths: list of specific strengths
- weaknesses: list of areas for improvement  
- improvement_tips: list of actionable advice
- consistency_notes: observations about consistency with other responses (if applicable)

Output should be a JSON array with one object per question in the same order.
"""
    
    return prompt

def generate_single_question_prompt(question: str, response: str, objective: Dict, semantic: Dict) -> str:
    """
    Generate a focused prompt for analyzing a single Q&A pair.
    Useful for real-time feedback or detailed individual analysis.
    """
    prompt = f"""You are an interview coach. Provide detailed feedback on this candidate response.

Question: {question}
Response: {response}

Analysis Data:
Objective metrics: {objective}
Semantic metrics: {semantic}

Provide comprehensive feedback in JSON format with:
- strengths: list of specific positive aspects
- weaknesses: list of areas needing improvement
- improvement_tips: list of actionable advice
- overall_assessment: brief overall evaluation
- suggested_improvements: specific ways to enhance the response

Return only valid JSON.
"""
    return prompt

def generate_comparison_prompt(questions_responses: List[Dict]) -> str:
    """
    Generate a prompt for comparing multiple candidate responses to the same question.
    Useful for ranking or comparative analysis.
    """
    if not questions_responses:
        return ""
    
    question = questions_responses[0].get('question_text', '')
    
    prompt = f"""You are evaluating multiple candidate responses to the same interview question.

Question: {question}

Candidate Responses:
"""
    
    for idx, item in enumerate(questions_responses, start=1):
        prompt += f"\nCandidate {idx}:\n"
        prompt += f"Response: {item['response_text']}\n"
        prompt += f"Objective metrics: {item['objective']}\n"
        prompt += f"Semantic metrics: {item['semantic']}\n"
    
    prompt += """
Analyze and compare the responses. Provide feedback in JSON format:
- individual_feedback: array of feedback objects for each candidate (strengths, weaknesses, improvement_tips)
- comparative_ranking: ranking from best to worst with justification
- key_differences: main differentiators between responses
- best_practices: examples of effective elements across all responses

Return only valid JSON.
"""
    return prompt

def generate_summary_prompt(all_responses: List[Dict]) -> str:
    """
    Generate a prompt for creating an overall interview summary.
    """
    prompt = """You are creating a comprehensive interview evaluation summary.

Complete Interview Session:
"""
    
    for idx, item in enumerate(all_responses, start=1):
        prompt += f"\nQ{idx}: {item.get('question_text', '')}\n"
        prompt += f"A{idx}: {item.get('response_text', '')}\n"
        prompt += f"Objective: {item.get('objective', {})}\n"
        prompt += f"Semantic: {item.get('semantic', {})}\n"
    
    prompt += """
Provide an overall interview assessment in JSON format:
- overall_performance: summary of candidate's performance
- key_strengths: main strengths demonstrated across the interview
- key_weaknesses: main areas for improvement
- consistency_analysis: how consistent were the responses
- recommendation: overall hiring recommendation with justification
- development_areas: specific areas for candidate growth

Return only valid JSON.
"""
    return prompt