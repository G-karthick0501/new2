const express = require("express");
const auth = require("../middleware/auth");
const Application = require("../models/Application");
const JobPost = require("../models/JobPost");
const { createNotification } = require("../services/notificationService");
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();

// Apply to job with resume upload
router.post("/:jobId/apply", auth, upload.single('resume'), async (req, res) => {
  try {
    console.log('📝 Application submission started');
    console.log('User:', req.user.uid, 'Role:', req.user.role);
    console.log('Job ID:', req.params.jobId);
    console.log('Has resume file:', !!req.file);
    
    if (req.user.role !== 'candidate') {
      console.log('❌ User is not a candidate');
      return res.status(403).json({ msg: "Only candidates can apply" });
    }

    const existing = await Application.findOne({
      candidateId: req.user.uid,
      jobId: req.params.jobId
    });
    
    if (existing) {
      console.log('❌ Already applied to this job');
      return res.status(400).json({ msg: "Already applied to this job" });
    }

    const appData = {
      candidateId: req.user.uid,
      jobId: req.params.jobId,
      coverLetter: req.body.coverLetter
    };

    // Save resume file
    if (req.file) {
      appData.resumeFileName = req.file.originalname;
      appData.resumeFileBuffer = req.file.buffer.toString('base64');
      appData.resumeFile = req.file.originalname;
      console.log('✅ Resume file saved:', req.file.originalname);
    }

    console.log('💾 Creating application with data:', {
      candidateId: appData.candidateId,
      jobId: appData.jobId,
      hasResume: !!appData.resumeFileName
    });

    const application = await Application.create(appData);
    console.log('✅ Application created successfully:', application._id);

    await createNotification(req.user.uid, {
      type: 'success',
      title: 'Application Submitted',
      message: 'Your application has been submitted successfully!',
      link: `/candidate-dashboard?tab=jobs`
    });

    res.status(201).json(application);
  } catch (error) {
    console.error('❌ Apply error:', error);
    res.status(500).json({ msg: "Failed to apply", error: error.message });
  }
});
// Download resume
// Download resume
router.get("/download-resume/:id", auth, async (req, res) => {
  console.log('📥 Download route hit!');
  console.log('ID:', req.params.id);
  console.log('User:', req.user.uid);
  
  try {
    const application = await Application.findById(req.params.id);
    console.log('Application found:', !!application);
    console.log('Has buffer:', !!application?.resumeFileBuffer);
    
    if (!application || !application.resumeFileBuffer) {
      console.log('❌ File not found');
      return res.status(404).json({ msg: "File not found" });
    }
    
    console.log('✅ Sending file:', application.resumeFileName);
    const buffer = Buffer.from(application.resumeFileBuffer, 'base64');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${application.resumeFileName}"`);
    res.send(buffer);
  } catch (error) {
    console.error('❌ Download error:', error);
    res.status(500).json({ msg: "Download failed" });
  }
});

// Get applications (role-based)
router.get("/", auth, async (req, res) => {
  try {
    console.log('📋 Fetching applications for user:', req.user.uid, 'Role:', req.user.role);
    
    let filter = {};
    
    if (req.user.role === 'candidate') {
      filter.candidateId = req.user.uid;
    } else if (req.user.role === 'hr') {
      // Get applications for HR's jobs
      const hrJobs = await JobPost.find({ hrId: req.user.uid });
      console.log('📊 HR has', hrJobs.length, 'jobs');
      const jobIds = hrJobs.map(j => j._id);
      filter.jobId = { $in: jobIds };
    }

    console.log('🔍 Filter:', JSON.stringify(filter));

    const applications = await Application.find(filter)
      .populate('candidateId', 'name email')
      .populate('jobId', 'title')
      .sort({ createdAt: -1 });

    console.log('✅ Found', applications.length, 'applications');
    console.log('📄 Applications:', applications.map(a => ({
      id: a._id,
      candidate: a.candidateId?.name,
      job: a.jobId?.title,
      status: a.status
    })));

    res.json(applications);
  } catch (error) {
    console.error('❌ Failed to fetch applications:', error);
    res.status(500).json({ msg: "Failed to fetch applications", error: error.message });
  }
});

// Get candidate's own applications
router.get("/my-applications", auth, async (req, res) => {
  try {
    console.log('📋 Fetching my applications for candidate:', req.user.uid);
    
    const applications = await Application.find({ candidateId: req.user.uid })
      .populate('jobId', 'title company location')
      .sort({ createdAt: -1 });
    
    console.log('✅ Found', applications.length, 'applications for candidate');
    res.json(applications);
  } catch (error) {
    console.error('❌ Failed to fetch my applications:', error);
    res.status(500).json({ msg: "Failed to fetch applications", error: error.message });
  }
});

// Debug endpoint - Get all applications (for debugging)
router.get("/debug/all", auth, async (req, res) => {
  try {
    if (req.user.role !== 'hr') {
      return res.status(403).json({ msg: "HR only" });
    }
    
    const allApps = await Application.find()
      .populate('candidateId', 'name email')
      .populate('jobId', 'title hrId')
      .sort({ createdAt: -1 });
    
    const hrJobs = await JobPost.find({ hrId: req.user.uid });
    
    res.json({
      totalApplications: allApps.length,
      yourJobs: hrJobs.length,
      yourJobIds: hrJobs.map(j => j._id.toString()),
      allApplications: allApps.map(a => ({
        id: a._id,
        candidate: a.candidateId?.name,
        job: a.jobId?.title,
        jobId: a.jobId?._id?.toString(),
        jobHrId: a.jobId?.hrId?.toString(),
        isYourJob: hrJobs.some(j => j._id.toString() === a.jobId?._id?.toString())
      }))
    });
  } catch (error) {
    console.error('Debug failed:', error);
    res.status(500).json({ msg: "Debug failed" });
  }
});

// Update application status (HR only)
router.patch("/:id/status", auth, async (req, res) => {
  try {
    if (req.user.role !== 'hr') {
      return res.status(403).json({ msg: "Only HR can update status" });
    }

    const { status } = req.body;
    const application = await Application.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!application) {
      return res.status(404).json({ msg: "Application not found" });
    }

    res.json(application);
  } catch (error) {
    res.status(500).json({ msg: "Failed to update status" });
  }
});


// Delete application (Candidate can delete own, HR can delete for their jobs)
router.delete("/:id", auth, async (req, res) => {
  try {
    const application = await Application.findById(req.params.id).populate('jobId');
    
    if (!application) {
      return res.status(404).json({ msg: "Application not found" });
    }

    // Check permissions
    const isOwner = application.candidateId.toString() === req.user.uid.toString();
    const isHR = req.user.role === 'hr' && application.jobId.hrId.toString() === req.user.uid.toString();
    
    if (!isOwner && !isHR) {
      return res.status(403).json({ msg: "Not authorized" });
    }

    await Application.findByIdAndDelete(req.params.id);
    res.json({ success: true, msg: "Application deleted" });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ msg: "Failed to delete" });
  }
});

module.exports = router;