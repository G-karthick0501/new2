const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Application = require('../models/Application');
const InterviewSession = require('../models/InterviewSession');
const Submission = require('../models/Submission');

router.get('/stats', auth, async (req, res) => {
  try {
    const userId = req.user.uid;

    const stats = {
      applications: await Application.countDocuments({ candidateId: userId }),
      interviews: await InterviewSession.countDocuments({ userId, status: 'completed' }),
      codingChallenges: await Submission.countDocuments({ userId }),
      resumeAnalyzed: await Application.exists({ 
        candidateId: userId, 
        resumeFileBuffer: { $exists: true, $ne: '' } 
      }) !== null
    };

    res.json(stats);
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ 
      applications: 0, 
      interviews: 0, 
      codingChallenges: 0, 
      resumeAnalyzed: false 
    });
  }
});

module.exports = router;