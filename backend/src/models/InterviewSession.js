const mongoose = require("mongoose");

const interviewSessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  interviewType: { type: String, enum: ['technical', 'behavioral'], required: true },
  questionCount: { type: Number, default: 5 },

  questions: [
    {
      questionText: String,
      questionId: Number,
      category: String,

      userResponse: String,
      timeSpent: Number,

      audioFile: String,
      recordingDuration: Number,

      audioEmotion: {
        dominant: String,
        confidence: Number,
        allScores: {
          happy: Number,
          sad: Number,
          angry: Number,
          fear: Number,
          neutral: Number,
        },
        chunks: Array,
        audioMetrics: Object,
        interpretation: String
      },

      // ✅ ADD THIS: Video emotion tracking per question
      emotionSummary: {
        question_index: Number,
        total_frames: Number,
        dominant_emotion: String,
        top_3_emotions: [
          {
            emotion: String,
            percentage: Number
          }
        ],
        stats: {
          mean_confidence: Number,
          median_confidence: Number,
          mode_emotion: String
        },
        emotion_distribution: Object
      },

      analysis: {
        objective: {
          word_count: Number,
          sentence_count: Number,
          avg_sentence_length: Number,
          lexical_diversity: Number,
          pos_diversity: Number,
          syntactic_complexity: Number,
        },
        semantic: {
          relevance_score: Number,
          topic_coherence: Number,
        },
        llm_feedback: {
          strengths: [String],
          weaknesses: [String],
          improvement_tips: [String],
        },
      },
    },
  ],

  overallScore: { type: Number, default: 0 },
  feedback: [String],

  overallAnalysis: {
    strengths: [String],
    weaknesses: [String],
    improvement_tips: [String],
    interview_coherence: Number,
    recommendation: String,
  },

  // ✅ ADD THIS: Overall emotion summary
  emotionSummary: {
    total_frames: Number,
    total_questions: Number,
    top_3_emotions: [
      {
        emotion: String,
        percentage: Number
      }
    ],
    stats: {
      mean_confidence: Number,
      median_confidence: Number,
      mode_emotion: String
    },
    emotions_by_question: Object
  },

  aiAnalysis: {
    processed: { type: Boolean, default: false },
    processingTime: Number,
    aiServiceVersion: String,
    processedAt: Date,
    errorMessage: String,
  },

  status: {
    type: String,
    enum: ['in_progress', 'completed', 'ai_processing'],
    default: 'in_progress',
  },

  completedAt: Date,
}, { timestamps: true });

interviewSessionSchema.methods.hasAIAnalysis = function () {
  return this.aiAnalysis && this.aiAnalysis.processed;
};

interviewSessionSchema.methods.getQuestionsWithAnalysis = function () {
  return this.questions.filter(
    (q) => q.analysis && Object.keys(q.analysis).length > 0
  );
};

interviewSessionSchema.methods.getAnalysisSummary = function () {
  const totalQuestions = this.questions.length;
  const answeredQuestions = this.questions.filter(
    (q) => q.userResponse && q.userResponse.trim().length > 0
  ).length;
  const analyzedQuestions = this.getQuestionsWithAnalysis().length;

  return {
    totalQuestions,
    answeredQuestions,
    analyzedQuestions,
    completionRate:
      totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0,
    analysisRate:
      totalQuestions > 0 ? (analyzedQuestions / totalQuestions) * 100 : 0,
    hasOverallAnalysis:
      !!(this.overallAnalysis && Object.keys(this.overallAnalysis).length > 0),
  };
};

module.exports = mongoose.model("InterviewSession", interviewSessionSchema);