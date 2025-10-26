# ai_services4/interview-analyzer/routes/analyze.py
# ✅ UPDATED: Include emotion analysis in AI analysis

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from core.llm_enhancer import LLMEnhancer
from core.objective_analyzer import ObjectiveAnalyzer
from core.semantic_analyzer import SemanticAnalyzer

router = APIRouter()
llm_enhancer = LLMEnhancer()
objective_analyzer = ObjectiveAnalyzer()
semantic_analyzer = SemanticAnalyzer()

class QuestionAnalysisRequest(BaseModel):
    """Request model for analyzing interview questions"""
    question_text: str
    response_text: str
    emotion_analysis: Optional[Dict[str, Any]] = None  # ✅ NEW: Accept emotion data

class BatchAnalysisRequest(BaseModel):
    """Request model for batch analysis"""
    items: List[QuestionAnalysisRequest]

@router.post("/analyze-batch")
async def analyze_batch(request: BatchAnalysisRequest):
    """
    ✅ UPDATED: Analyze multiple interview Q&A pairs with emotion data
    
    This endpoint now accepts emotion analysis for each question and
    passes it to Gemini for richer, multi-modal feedback.
    """
    try:
        if not request.items:
            raise HTTPException(status_code=400, detail="No items provided for analysis")
        
        print(f"📊 Analyzing {len(request.items)} questions (with emotion data: {any(item.emotion_analysis for item in request.items)})")
        
        # Prepare items for analysis
        analysis_items = []
        for item in request.items:
            # Objective analysis (text metrics)
            objective_metrics = objective_analyzer.analyze(item.response_text)
            
            # Semantic analysis (relevance)
            semantic_metrics = semantic_analyzer.analyze(
                item.question_text, 
                item.response_text
            )
            
            # ✅ NEW: Include emotion analysis
            analysis_item = {
                "question_text": item.question_text,
                "response_text": item.response_text,
                "objective": objective_metrics,
                "semantic": semantic_metrics,
                "emotion_analysis": item.emotion_analysis  # ✅ Pass emotion data to Gemini
            }
            
            analysis_items.append(analysis_item)
        
        # Get LLM feedback (now with emotion data!)
        print("🤖 Calling Gemini with multi-modal data (text + emotion)...")
        llm_results = llm_enhancer.analyze_batch_with_context(analysis_items)
        
        # Combine all results
        combined_results = []
        for idx, item in enumerate(analysis_items):
            result = {
                "question": item["question_text"],
                "response": item["response_text"],
                "objective": item["objective"],
                "semantic": item["semantic"],
                "emotion_analysis": item["emotion_analysis"],  # ✅ Include in response
                "llm_feedback": llm_results[idx]["llm_feedback"] if idx < len(llm_results) else {}
            }
            combined_results.append(result)
        
        print(f"✅ Analysis complete for {len(combined_results)} questions")
        
        return {
            "success": True,
            "results": combined_results,
            "total_analyzed": len(combined_results)
        }
        
    except Exception as e:
        print(f"❌ Error in batch analysis: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


@router.post("/analyze-single")
async def analyze_single(request: QuestionAnalysisRequest):
    """
    ✅ UPDATED: Analyze a single interview Q&A with emotion data
    """
    try:
        print(f"📊 Analyzing single question (emotion data: {request.emotion_analysis is not None})")
        
        # Analyze with batch endpoint (reuse logic)
        batch_request = BatchAnalysisRequest(items=[request])
        result = await analyze_batch(batch_request)
        
        if result["success"] and result["results"]:
            return {
                "success": True,
                "analysis": result["results"][0]
            }
        else:
            raise HTTPException(status_code=500, detail="Analysis failed")
            
    except Exception as e:
        print(f"❌ Error in single analysis: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


@router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "interview-analyzer",
        "version": "2.0.0",
        "features": ["text_analysis", "emotion_analysis", "multi_modal_feedback"]
    }