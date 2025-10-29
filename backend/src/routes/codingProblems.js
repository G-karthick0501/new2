const express = require("express");
const auth = require("../middleware/auth");
const CodingProblem = require("../models/CodingProblem");
const router = express.Router();

// Get all problems
router.get("/", auth, async (req, res) => {
  try {
    const problems = await CodingProblem.find()
      .select('-driverCode') // Don't send driver code to frontend
      .sort({ difficulty: 1, title: 1 });
    res.json(problems);
  } catch (error) {
    console.error("Get problems error:", error);
    res.status(500).json({ msg: "Failed to load problems" });
  }
});

// Get single problem
router.get("/:id", auth, async (req, res) => {
  try {
    const problem = await CodingProblem.findById(req.params.id)
      .select('-driverCode'); // Don't send driver code
    
    if (!problem) {
      return res.status(404).json({ msg: "Problem not found" });
    }
    
    res.json(problem);
  } catch (error) {
    console.error("Get problem error:", error);
    res.status(500).json({ msg: "Failed to load problem" });
  }
});

router.post("/", auth, async (req, res) => {
  try {
    if (req.user.role !== 'hr' && req.user.role !== 'admin') {
      return res.status(403).json({ msg: "Access denied" });
    }

    const problem = new CodingProblem({
      ...req.body,
      createdBy: req.user.id
    });

    await problem.save();
    res.status(201).json(problem);
  } catch (error) {
    res.status(500).json({ msg: "Failed to create problem" });
  }
});

module.exports = router;


// Create problem (HR only)
