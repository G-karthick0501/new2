const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const JobPost = require('../models/JobPost');
const Application = require('../models/Application');

router.get('/stats', auth, async (req, res) => {
  try {
    const hrId = req.user.uid;
    
    // Get HR's job IDs
    const hrJobs = await JobPost.find({ hrId });
    const jobIds = hrJobs.map(j => j._id);

    const stats = {
      activeJobs: await JobPost.countDocuments({ hrId, status: 'active' }),
      totalApplications: await Application.countDocuments({ jobId: { $in: jobIds } }),
      pendingReview: await Application.countDocuments({ jobId: { $in: jobIds }, status: 'pending' }),
      shortlisted: await Application.countDocuments({ jobId: { $in: jobIds }, status: 'shortlisted' })
    };

    res.json(stats);
  } catch (error) {
    console.error('HR stats error:', error);
    res.status(500).json({ activeJobs: 0, totalApplications: 0, pendingReview: 0, shortlisted: 0 });
  }
});

// ===============================================
// NEW ROUTE: Get All Interview Results for HR
// Add this to backend/src/routes/interview.js
// ===============================================

// GET /api/interview/results/all - Fetch all completed interview sessions
router.get("/results/all", auth, async (req, res) => {
  try {
    // Only HR can access this endpoint
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
      .lean(); // Convert to plain JavaScript objects for better performance

    // Calculate summary statistics
    const stats = {
      total: interviews.length,
      completed: interviews.filter(i => i.status === 'completed').length,
      aiProcessed: interviews.filter(i => i.aiAnalysis?.processed).length,
      avgScore: interviews.length > 0 
        ? Math.round(interviews.reduce((sum, i) => sum + (i.overallScore || 0), 0) / interviews.length)
        : 0
    };

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
    // Only HR and the candidate who took the interview can access
    const session = await InterviewSession.findById(req.params.sessionId)
      .populate('userId', 'name email');

    if (!session) {
      return res.status(404).json({ msg: "Interview session not found" });
    }

    // Authorization check
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

module.exports = router;