// backend/src/routes/interview.js - SEQUENTIAL PROCESSING
const express = require("express");
const auth = require("../middleware/auth");
const InterviewSession = require("../models/InterviewSession");
const { getQuestions, validateQuestionRequest } = require("../services/questionBank");
const multer = require('multer');
const axios = require('axios');

const router = express.Router();

// Configuration
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8001';
const AUDIO_EMOTION_URL = process.env.AUDIO_EMOTION_URL || 'http://localhost:8002';
const WHISPER_URL = process.env.WHISPER_URL || 'http://localhost:8003';
const AI_SERVICE_TIMEOUT = 180000;

// Feature flags
const ENABLE_EMOTION_ANALYSIS = process.env.ENABLE_EMOTION_ANALYSIS !== 'false'; // Default: enabled

// Multer configuration
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }
});

// ===============================================
// ROUTE: Start Interview
// ===============================================
router.post("/start", auth, async (req, res) => {
  try {
    const { interviewType, questionCount = 5 } = req.body;
    
    console.log(`🎤 Starting ${interviewType} interview with ${questionCount} questions`);
    
    const validation = validateQuestionRequest(interviewType, questionCount);
    if (!validation.valid) {
      return res.status(400).json({ 
        msg: "Invalid interview parameters", 
        errors: validation.errors 
      });
    }
    
    const questions = getQuestions(interviewType, questionCount);
    
    if (!questions || questions.length === 0) {
      return res.status(400).json({ 
        msg: `No questions available for interview type: ${interviewType}` 
      });
    }
    
    const session = new InterviewSession({
      userId: req.user.uid,
      interviewType,
      questionCount: questions.length,
      questions: questions.map(q => ({ 
        questionText: q.text,
        questionId: q.id,
        category: q.category
      }))
    });
    
    await session.save();
    
    console.log(`✅ Interview session created: ${session._id}`);
    
    res.json({
      sessionId: session._id,
      interviewType,
      questionCount: questions.length,
      questions: questions.map(q => ({ 
        id: q.id, 
        text: q.text, 
        category: q.category 
      }))
    });
    
  } catch (error) {
    console.error("❌ Failed to start interview:", error);
    res.status(500).json({ msg: "Failed to start interview" });
  }
});

// ===============================================
// ROUTE: Submit Text Response
// ===============================================
router.post("/response", auth, async (req, res) => {
  try {
    const { sessionId, questionIndex, response, timeSpent } = req.body;
    
    const session = await InterviewSession.findById(sessionId);
    if (!session) return res.status(404).json({ msg: "Session not found" });
    
    if (questionIndex >= session.questions.length) {
      return res.status(400).json({ msg: "Invalid question index" });
    }
    
    session.questions[questionIndex].userResponse = response;
    session.questions[questionIndex].timeSpent = timeSpent;
    
    await session.save();
    
    res.json({ 
      success: true,
      message: "Response saved successfully"
    });
    
  } catch (error) {
    console.error("❌ Failed to save response:", error);
    res.status(500).json({ msg: "Failed to save response" });
  }
});

// ===============================================
// ROUTE: Submit Audio Response - SEQUENTIAL PROCESSING
// ===============================================
router.post("/audio-response", auth, upload.single('audio'), async (req, res) => {
  try {
    const { sessionId, questionIndex, recordingTime } = req.body;
    const audioFile = req.file;

    if (!audioFile) {
      return res.status(400).json({ msg: "Audio file required" });
    }

    console.log(`🎤 Processing audio for session ${sessionId}, Q${questionIndex}`);
    console.log(`📊 Audio size: ${audioFile.size} bytes, Duration: ${recordingTime}s`);

    const session = await InterviewSession.findById(sessionId);
    if (!session) {
      return res.status(404).json({ msg: "Session not found" });
    }

    // ✅ STEP 1: Transcription (REQUIRED - do this first)
    console.log('📝 Step 1: Transcribing audio...');
    const transcriptionResult = await transcribeAudio(audioFile.buffer);
    console.log(`✅ Transcription: ${transcriptionResult.text.substring(0, 100)}...`);

    // ✅ STEP 2: Emotion Analysis (OPTIONAL - do only if enabled)
    let emotionResult = {
      emotion: 'not_analyzed',
      confidence: 0,
      all_scores: {},
      audio_metrics: {},
      chunks: []
    };

    if (ENABLE_EMOTION_ANALYSIS) {
      console.log('😊 Step 2: Analyzing emotion...');
      try {
        emotionResult = await analyzeAudioEmotion(audioFile.buffer);
        console.log(`✅ Emotion: ${emotionResult.emotion} (${(emotionResult.confidence * 100).toFixed(0)}%)`);
      } catch (emotionError) {
        console.log(`⚠️  Emotion analysis skipped: ${emotionError.message}`);
        // Don't fail - emotion is optional
      }
    } else {
      console.log('⏭️  Step 2: Emotion analysis disabled');
    }

    // ✅ STEP 3: Save results
    console.log('💾 Step 3: Saving results...');
    session.questions[questionIndex].userResponse = transcriptionResult.text;
    session.questions[questionIndex].timeSpent = recordingTime;
    session.questions[questionIndex].audioEmotion = {
      dominant: emotionResult.emotion,
      confidence: emotionResult.confidence,
      allScores: emotionResult.all_scores || {},
      chunks: emotionResult.chunks || [],
      audioMetrics: emotionResult.audio_metrics || {},
      interpretation: emotionResult.interpretation || ''
    };

    await session.save();

    console.log('✅ Audio processing complete');

    res.json({
      success: true,
      transcription: transcriptionResult.text,
      emotion: emotionResult.emotion,
      emotionConfidence: emotionResult.confidence,
      audioMetrics: emotionResult.audio_metrics,
      emotionByChunk: emotionResult.chunks
    });

  } catch (error) {
    console.error('❌ Audio processing error:', error);
    res.status(500).json({ 
      msg: "Audio processing failed",
      error: error.message 
    });
  }
});

// ===============================================
// HELPER: Transcribe Audio (REQUIRED)
// ===============================================
async function transcribeAudio(audioBuffer) {
  try {
    const FormData = require('form-data');
    const form = new FormData();
    
    form.append('file', audioBuffer, {
      filename: 'audio.webm',
      contentType: 'audio/webm'
    });

    const response = await axios.post(
      `${WHISPER_URL}/transcribe`,
      form,
      {
        headers: form.getHeaders(),
        timeout: 60000
      }
    );

    return response.data;
    
  } catch (error) {
    console.error('❌ Transcription failed:', error.message);
    throw new Error('Transcription service unavailable');
  }
}

// ===============================================
// HELPER: Analyze Emotion (OPTIONAL)
// ===============================================
async function analyzeAudioEmotion(audioBuffer) {
  try {
    const FormData = require('form-data');
    const form = new FormData();
    
    form.append('file', audioBuffer, {
      filename: 'audio.webm',
      contentType: 'audio/webm'
    });

    // Try complete analysis first
    try {
      const response = await axios.post(
        `${AUDIO_EMOTION_URL}/analyze-audio-complete`,
        form,
        {
          headers: form.getHeaders(),
          timeout: 30000, // Shorter timeout
          params: { remove_silence: true }
        }
      );
      return response.data;
    } catch (completeError) {
      console.log('⚠️  Complete analysis failed, trying basic...');
      
      // Fallback to basic analysis
      const response = await axios.post(
        `${AUDIO_EMOTION_URL}/analyze-audio`,
        form,
        {
          headers: form.getHeaders(),
          timeout: 20000
        }
      );
      return response.data;
    }
    
  } catch (error) {
    console.error('❌ Emotion analysis failed:', error.message);
    // Don't throw - emotion is optional
    return {
      emotion: 'error',
      confidence: 0,
      all_scores: {},
      error: error.message
    };
  }
}

// ===============================================
// HELPER: AI Service Analysis
// ===============================================
async function analyzeInterviewWithAI(answeredQuestions) {
  try {
    console.log('🤖 Calling AI service for analysis');
    
    const aiRequest = {
      items: answeredQuestions.map(q => ({
        question_text: q.questionText,
        response_text: q.userResponse
      }))
    };
    
    const response = await axios.post(
      `${AI_SERVICE_URL}/analyze`, 
      aiRequest, 
      {
        timeout: AI_SERVICE_TIMEOUT,
        headers: { 'Content-Type': 'application/json' }
      }
    );
    
    return response.data;
    
  } catch (error) {
    console.error('❌ AI service error:', error.message);
    throw error;
  }
}

// ===============================================
// HELPER: Process AI Results
// ===============================================
function processAIResults(aiResponse) {
  try {
    const analysisResults = aiResponse.analysis || [];
    
    const processedQuestions = [];
    const overallStrengths = [];
    const overallWeaknesses = [];
    const overallTips = [];
    
    analysisResults.forEach((result) => {
      const questionAnalysis = {
        objective: result.objective || {},
        semantic: result.semantic || {},
        llm_feedback: result.llm_feedback || {
          strengths: [],
          weaknesses: [],
          improvement_tips: []
        }
      };
      
      processedQuestions.push(questionAnalysis);
      
      if (result.llm_feedback) {
        overallStrengths.push(...(result.llm_feedback.strengths || []));
        overallWeaknesses.push(...(result.llm_feedback.weaknesses || []));
        overallTips.push(...(result.llm_feedback.improvement_tips || []));
      }
    });
    
    const overallAnalysis = {
      strengths: [...new Set(overallStrengths)].slice(0, 5),
      weaknesses: [...new Set(overallWeaknesses)].slice(0, 5),  
      improvement_tips: [...new Set(overallTips)].slice(0, 7),
      interview_coherence: 0.8,
      recommendation: generateOverallRecommendation(overallStrengths, overallWeaknesses)
    };
    
    return {
      questionsAnalysis: processedQuestions,
      overallAnalysis
    };
    
  } catch (error) {
    console.error('❌ Error processing AI results:', error);
    throw error;
  }
}

function generateOverallRecommendation(strengths, weaknesses) {
  const strengthCount = strengths.length;
  const weaknessCount = weaknesses.length;
  
  if (strengthCount > weaknessCount * 2) {
    return "Strong interview performance with clear communication. Ready for similar roles.";
  } else if (strengthCount > weaknessCount) {
    return "Good interview performance with some areas for improvement.";
  } else {
    return "Interview shows potential but needs focused improvement on communication.";
  }
}

// ===============================================
// ROUTE: Complete Interview
// ===============================================
router.post("/complete", auth, async (req, res) => {
  try {
    const { sessionId } = req.body;
    console.log(`🏁 Completing interview session: ${sessionId}`);
    
    const session = await InterviewSession.findById(sessionId);
    if (!session) {
      return res.status(404).json({ msg: "Session not found" });
    }
    
    const answeredQuestions = session.questions.filter(
      q => q.userResponse && q.userResponse.trim().length > 0
    );
    
    if (answeredQuestions.length === 0) {
      return res.status(400).json({ msg: "No responses found to analyze" });
    }
    
    console.log(`📊 Analyzing ${answeredQuestions.length} questions`);
    
    session.status = 'ai_processing';
    await session.save();
    
    let aiAnalysisResults = null;
    const startTime = Date.now();
    
    try {
      console.log('🤖 Starting AI analysis...');
      const aiResponse = await analyzeInterviewWithAI(answeredQuestions);
      const processingTime = Date.now() - startTime;
      
      aiAnalysisResults = processAIResults(aiResponse);
      console.log(`✅ AI analysis completed in ${processingTime}ms`);
      
      session.questions.forEach((question, index) => {
        if (question.userResponse && aiAnalysisResults.questionsAnalysis[index]) {
          question.analysis = aiAnalysisResults.questionsAnalysis[index];
        }
      });
      
      session.overallAnalysis = aiAnalysisResults.overallAnalysis;
      session.aiAnalysis = {
        processed: true,
        processingTime,
        aiServiceVersion: '1.0.0',
        processedAt: new Date()
      };
      
    } catch (aiError) {
      console.error('❌ AI analysis failed:', aiError.message);
      
      const score = (answeredQuestions.length / session.questions.length) * 100;
      const basicFeedback = [];
      
      if (score >= 80) basicFeedback.push("Great job! You answered most questions.");
      if (score < 80) basicFeedback.push("Try to provide more detailed responses.");
      basicFeedback.push("Keep practicing to improve your skills.");
      
      session.feedback = basicFeedback;
      session.overallScore = score;
      session.aiAnalysis = {
        processed: false,
        processingTime: Date.now() - startTime,
        errorMessage: aiError.message,
        processedAt: new Date()
      };
    }
    
    session.status = 'completed';
    session.completedAt = new Date();
    await session.save();
    
    console.log('✅ Interview completed');
    
    if (aiAnalysisResults) {
      const detailedAnalysis = answeredQuestions.map((q, index) => ({
        questionText: q.questionText,
        userResponse: q.userResponse,
        timeSpent: q.timeSpent,
        audioEmotion: q.audioEmotion || null,
        objective: aiAnalysisResults.questionsAnalysis[index]?.objective || {},
        semantic: aiAnalysisResults.questionsAnalysis[index]?.semantic || {},
        llmFeedback: aiAnalysisResults.questionsAnalysis[index]?.llm_feedback || {
          strengths: [],
          weaknesses: [],
          improvement_tips: []
        }
      }));

      const aiScore = Math.min(100, Math.max(60, 
        (aiAnalysisResults.overallAnalysis.strengths.length * 15) + 
        (answeredQuestions.length / session.questions.length * 40)
      ));

      res.json({
        score: Math.round(aiScore),
        feedback: aiAnalysisResults.overallAnalysis.improvement_tips.slice(0, 3),
        questionsAnswered: answeredQuestions.length,
        totalQuestions: session.questions.length,
        detailedAnalysis: detailedAnalysis,
        hasAiAnalysis: true,
        analysisType: 'ai_powered',
        overallAnalysis: aiAnalysisResults.overallAnalysis,
        completedAt: session.completedAt
      });
      
    } else {
      res.json({
        success: true,
        analysisType: 'basic_fallback',
        score: session.overallScore || 0,
        feedback: session.feedback || ["Analysis failed - please try again"],
        questionsAnswered: answeredQuestions.length,
        totalQuestions: session.questions.length,
        hasAiAnalysis: false,
        detailedAnalysis: [],
        error: session.aiAnalysis?.errorMessage
      });
    }
    
  } catch (error) {
    console.error("❌ Failed to complete interview:", error);
    res.status(500).json({ msg: "Failed to complete interview" });
  }
});


// ===============================================
// NEW ROUTES FOR HR DASHBOARD - ADD BEFORE module.exports
// ===============================================

// GET /api/interview/results/all - Fetch all completed interviews (HR ONLY)
router.get("/results/all", auth, async (req, res) => {
  try {
    // Only HR and Admin can access
    if (req.user.role !== 'hr' && req.user.role !== 'admin') {
      return res.status(403).json({ msg: "Access denied. HR only." });
    }

    console.log('📊 HR fetching all interview results');

    // Fetch all completed interviews with candidate details
    const interviews = await InterviewSession.find({
      status: { $in: ['completed', 'ai_processing'] }
    })
      .populate('userId', 'name email') // Get candidate name and email
      .sort({ completedAt: -1 }) // Most recent first
      .lean(); // Convert to plain JS objects for better performance

    // Calculate summary statistics
    const stats = {
      total: interviews.length,
      completed: interviews.filter(i => i.status === 'completed').length,
      aiProcessed: interviews.filter(i => i.aiAnalysis?.processed).length,
      avgScore: interviews.length > 0 
        ? Math.round(interviews.reduce((sum, i) => sum + (i.overallScore || 0), 0) / interviews.length)
        : 0
    };

    console.log(`✅ Returning ${interviews.length} interview sessions`);

    res.json({
      success: true,
      interviews: interviews,
      stats: stats
    });

  } catch (error) {
    console.error('❌ Failed to fetch interview results:', error);
    res.status(500).json({ msg: "Failed to fetch interview results" });
  }
});


// GET /api/interview/results/:sessionId - Fetch single interview details
router.get("/results/:sessionId", auth, async (req, res) => {
  try {
    const session = await InterviewSession.findById(req.params.sessionId)
      .populate('userId', 'name email');

    if (!session) {
      return res.status(404).json({ msg: "Interview session not found" });
    }

    // Authorization: HR/Admin or the candidate who took the interview
    const isHR = req.user.role === 'hr' || req.user.role === 'admin';
    const isOwner = session.userId._id.toString() === req.user.uid.toString();

    if (!isHR && !isOwner) {
      return res.status(403).json({ msg: "Access denied" });
    }

    res.json({
      success: true,
      session: session
    });

  } catch (error) {
    console.error('❌ Failed to fetch interview session:', error);
    res.status(500).json({ msg: "Failed to fetch interview session" });
  }
});

// ===============================================
// END OF NEW ROUTES
// Keep existing: module.exports = router;
// ===============================================

module.exports = router;