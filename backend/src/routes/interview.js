// backend/src/routes/interview.js
const express = require("express");
const auth = require("../middleware/auth");
const InterviewSession = require("../models/InterviewSession");
const { getQuestions } = require("../services/questionBank");

const router = express.Router();

// Start new interview
router.post("/start", auth, async (req, res) => {
  try {
    const { interviewType } = req.body;
    
    const questions = getQuestions(interviewType, 5);
    
    const session = new InterviewSession({
      userId: req.user.uid,
      interviewType,
      questions: questions.map(q => ({ questionText: q.text }))
    });
    
    await session.save();
    
    res.json({
      sessionId: session._id,
      questions: questions.map(q => ({ id: q.id, text: q.text }))
    });
  } catch (error) {
    res.status(500).json({ msg: "Failed to start interview" });
  }
});

// Submit response
router.post("/response", auth, async (req, res) => {
  try {
    const { sessionId, questionIndex, response, timeSpent } = req.body;
    
    const session = await InterviewSession.findById(sessionId);
    if (!session) return res.status(404).json({ msg: "Session not found" });
    
    session.questions[questionIndex].userResponse = response;
    session.questions[questionIndex].timeSpent = timeSpent;
    await session.save();
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ msg: "Failed to save response" });
  }
});

// Complete interview and get results
router.post("/complete", auth, async (req, res) => {
  try {
    const { sessionId } = req.body;
    
    const session = await InterviewSession.findById(sessionId);
    if (!session) return res.status(404).json({ msg: "Session not found" });
    
    // Simple scoring: 20 points per answered question
    const answeredQuestions = session.questions.filter(q => q.userResponse && q.userResponse.trim().length > 0);
    const score = (answeredQuestions.length / session.questions.length) * 100;
    
    // Basic feedback
    const feedback = [];
    if (score >= 80) feedback.push("Great job! You answered most questions thoroughly.");
    if (score < 80) feedback.push("Try to provide more detailed responses.");
    feedback.push("Keep practicing to improve your interview skills.");
    
    session.overallScore = score;
    session.feedback = feedback;
    session.status = 'completed';
    session.completedAt = new Date();
    await session.save();
    
    res.json({
      score,
      feedback,
      questionsAnswered: answeredQuestions.length,
      totalQuestions: session.questions.length
    });
  } catch (error) {
    res.status(500).json({ msg: "Failed to complete interview" });
  }
});

module.exports = router;