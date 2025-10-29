const express = require("express");
const axios = require("axios");
const auth = require("../middleware/auth");
const CodingProblem = require("../models/CodingProblem");
const router = express.Router();

const JUDGE0_API_KEY = process.env.JUDGE0_API_KEY;
const JUDGE0_URL = "https://judge0-ce.p.rapidapi.com/submissions";

// Language ID to language name mapping
const LANG_MAP = {
  71: 'python',
  54: 'cpp',
  63: 'javascript',
  62: 'java'
};

// Submit code
router.post("/submit", auth, async (req, res) => {
  try {
    const { source_code, language_id, stdin, problem_id } = req.body;

    console.log("📝 Code submission received:");
    console.log("- Problem ID:", problem_id);
    console.log("- Language ID:", language_id);
    console.log("- Code length:", source_code?.length);

    if (!source_code || !language_id) {
      return res.status(400).json({ msg: "source_code and language_id required" });
    }

    let finalCode = source_code;

    // If problem_id provided, wrap with driver code
    if (problem_id) {
      try {
        const problem = await CodingProblem.findById(problem_id);
        
        if (problem && problem.driverCode) {
          const langName = LANG_MAP[parseInt(language_id)];
          const driverCode = problem.driverCode[langName];
          
          if (driverCode) {
            // Replace placeholder with user code
            finalCode = driverCode.replace('// USER_CODE_HERE', source_code)
                                  .replace('# USER_CODE_HERE', source_code);
            
            console.log("✅ Wrapped user code with driver code");
            console.log("Final code length:", finalCode.length);
          }
        }
      } catch (error) {
        console.error("⚠️ Error loading problem:", error.message);
        // Continue without wrapping
      }
    }

    // Submit to Judge0
    const response = await axios.post(
      `${JUDGE0_URL}?base64_encoded=false&wait=false`,
      {
        source_code: finalCode,
        language_id: parseInt(language_id),
        stdin: stdin || ""
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-RapidAPI-Key': JUDGE0_API_KEY,
          'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
        }
      }
    );

    console.log("✅ Judge0 submission successful, token:", response.data.token);
    res.json({ token: response.data.token });

  } catch (error) {
    console.error("❌ Submit error:", error.response?.data || error.message);
    res.status(500).json({ 
      msg: "Submission failed",
      error: error.response?.data || error.message 
    });
  }
});

// Get results
router.get("/submission/:token", auth, async (req, res) => {
  try {
    const response = await axios.get(
      `${JUDGE0_URL}/${req.params.token}?base64_encoded=false`,
      {
        headers: {
          'X-RapidAPI-Key': JUDGE0_API_KEY,
          'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
        }
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error("❌ Get results error:", error.message);
    res.status(500).json({ msg: "Failed to get results" });
  }
});

module.exports = router;