// backend/src/models/InterviewSession.js
const mongoose = require("mongoose");

const interviewSessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  interviewType: { type: String, enum: ['technical', 'behavioral'], required: true },
  questions: [{
    questionText: String,
    userResponse: String,
    timeSpent: Number // seconds
  }],
  overallScore: { type: Number, default: 0 },
  feedback: [String],
  status: { type: String, enum: ['in_progress', 'completed'], default: 'in_progress' },
  completedAt: Date
}, { timestamps: true });

module.exports = mongoose.model("InterviewSession", interviewSessionSchema);