// backend/src/models/InterviewSession.js

const mongoose = require("mongoose");

const interviewSessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  interviewType: { type: String, enum: ['technical', 'behavioral'], required: true },
  questionCount: { type: Number, default: 5 },
  
  questions: [{
    questionText: String,
    questionId: Number,
    category: String,
    userResponse: String,
    timeSpent: Number, // seconds
    
    // ✅ NEW: Store AGGREGATED emotion analysis instead of raw data
    emotionAnalysis: {
      // Core metrics
      dominantEmotions: [String],  // Top 3 emotions
      emotionDistribution: {
        happy: Number,
        sad: Number,
        angry: Number,
        fear: Number,
        neutral: Number,
        surprise: Number,
        disgust: Number
      },
      averageConfidence: Number,
      
      // Stability metrics
      emotionalStability: Number,  // 0-1, higher = more stable
      emotionVariance: {
        happy: Number,
        sad: Number,
        angry: Number,
        fear: Number,
        neutral: Number,
        surprise: Number,
        disgust: Number
      },
      
      // Stress & engagement
      stressIndicators: {
        fearPercentage: Number,
        angryPercentage: Number,
        nervousnessScore: Number,
        isHighStress: Boolean
      },
      engagementScore: Number,  // 0-10
      positiveNegativeRatio: Number,
      
      // Time-based patterns
      temporalPatterns: {
        beginning: {
          dominantEmotion: String,
          confidence: Number
        },
        middle: {
          dominantEmotion: String,
          confidence: Number
        },
        end: {
          dominantEmotion: String,
          confidence: Number
        },
        trend: String  // 'improving', 'declining', 'stable'
      },
      
      // Summary
      totalFrames: Number,
      duration: Number,  // seconds
      summaryText: String,
      
      // Peak moments
      peakMoments: {
        highestConfidence: {
          timestamp: Number,
          emotion: String,
          confidence: Number
        },
        highestStress: {
          timestamp: Number,
          emotion: String,
          stressLevel: Number
        }
      }
    },
    
    // AI analysis from Gemini (includes emotion-aware feedback)
    analysis: {
      objective: {
        word_count: Number,
        sentence_count: Number,
        avg_sentence_length: Number,
        lexical_diversity: Number,
        pos_diversity: Number,
        syntactic_complexity: Number
      },
      semantic: {
        relevance_score: Number,
        topic_coherence: Number
      },
      llm_feedback: {
        strengths: [String],
        weaknesses: [String], 
        improvement_tips: [String],
        emotion_insights: String  // NEW: Emotion-aware feedback
      }
    }
  }],
  
  overallScore: { type: Number, default: 0 },
  feedback: [String],
  
  // AI-powered overall analysis
  overallAnalysis: {
    strengths: [String],
    weaknesses: [String],
    improvement_tips: [String],
    interview_coherence: Number,
    recommendation: String,
    
    // ✅ NEW: Overall emotion summary
    emotionalSummary: {
      overallStressLevel: String,  // 'low', 'moderate', 'high'
      consistencyScore: Number,  // 0-10
      confidenceProgression: String,  // 'improving', 'declining', 'stable'
      keyEmotionalInsights: [String]
    }
  },
  
  // AI service metadata
  aiAnalysis: {
    processed: { type: Boolean, default: false },
    processingTime: Number,
    aiServiceVersion: String,
    processedAt: Date,
    errorMessage: String
  },
  
  status: { 
    type: String, 
    enum: ['in_progress', 'completed', 'ai_processing'], 
    default: 'in_progress' 
  },
  completedAt: Date
}, { timestamps: true });

// Helper methods
interviewSessionSchema.methods.hasAIAnalysis = function() {
  return this.aiAnalysis && this.aiAnalysis.processed;
};

interviewSessionSchema.methods.getQuestionsWithAnalysis = function() {
  return this.questions.filter(q => q.analysis && Object.keys(q.analysis).length > 0);
};

interviewSessionSchema.methods.hasEmotionAnalysis = function() {
  return this.questions.some(q => q.emotionAnalysis && q.emotionAnalysis.totalFrames > 0);
};

interviewSessionSchema.methods.getAnalysisSummary = function() {
  const totalQuestions = this.questions.length;
  const answeredQuestions = this.questions.filter(q => q.userResponse && q.userResponse.trim().length > 0).length;
  const analyzedQuestions = this.getQuestionsWithAnalysis().length;
  const emotionTrackedQuestions = this.questions.filter(q => q.emotionAnalysis && q.emotionAnalysis.totalFrames > 0).length;
  
  return {
    totalQuestions,
    answeredQuestions, 
    analyzedQuestions,
    emotionTrackedQuestions,
    completionRate: totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0,
    analysisRate: totalQuestions > 0 ? (analyzedQuestions / totalQuestions) * 100 : 0,
    emotionTrackingRate: totalQuestions > 0 ? (emotionTrackedQuestions / totalQuestions) * 100 : 0,
    hasOverallAnalysis: !!(this.overallAnalysis && Object.keys(this.overallAnalysis).length > 0)
  };
};

module.exports = mongoose.model("InterviewSession", interviewSessionSchema);