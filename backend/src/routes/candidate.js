// Backend route for candidate stats
// Add this to your backend/routes/candidate.js or similar file

const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth'); // Adjust path as needed

// GET /api/candidate/stats - Fetch candidate dashboard stats
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    // Query your database for real stats
    // Adjust these queries based on your actual database schema
    
    const stats = {
      // Count job applications
      applications: await Application.countDocuments({ 
        candidateId: userId,
        status: { $in: ['applied', 'shortlisted', 'interview'] }
      }),

      // Count completed interviews
      interviews: await Interview.countDocuments({ 
        candidateId: userId,
        status: 'completed'
      }),

      // Count coding challenges attempted
      codingChallenges: await CodingSubmission.countDocuments({ 
        candidateId: userId,
        status: 'submitted'
      }),

      // Check if resume has been analyzed
      resumeAnalyzed: await Resume.exists({ 
        candidateId: userId,
        analyzed: true
      }) !== null
    };

    res.json(stats);
  } catch (error) {
    console.error('Error fetching candidate stats:', error);
    res.status(500).json({ 
      message: 'Error fetching dashboard stats',
      error: error.message 
    });
  }
});

module.exports = router;


// ============================================
// ALTERNATIVE: If you don't have these models yet,
// here's a simple version that returns mock data
// until you implement the real database queries
// ============================================

router.get('/stats', authenticateToken, async (req, res) => {
  try {
    // Return zeros initially - will show empty states
    const stats = {
      applications: 0,
      interviews: 0,
      codingChallenges: 0,
      resumeAnalyzed: false
    };

    // TODO: Replace with real database queries when models are ready
    
    res.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ 
      message: 'Error fetching stats',
      error: error.message 
    });
  }
});