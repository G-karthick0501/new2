const mongoose = require("mongoose");

const codingProblemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'easy' },
  testCases: [{
    input: { type: String, required: true },
    expectedOutput: { type: String, required: true },
    description: { type: String }
  }],
  starterCode: {
    python: { type: String },
    javascript: { type: String },
    java: { type: String },
    cpp: { type: String }
  },
  // NEW: Hidden driver code that wraps user function
  driverCode: {
    python: { type: String },
    javascript: { type: String },
    java: { type: String },
    cpp: { type: String }
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model("CodingProblem", codingProblemSchema);