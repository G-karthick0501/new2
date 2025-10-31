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

module.exports = router;