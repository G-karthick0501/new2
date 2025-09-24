// backend/src/services/questionBank.js
const QUESTION_BANK = {
  technical: [
    "Explain the difference between let, const, and var in JavaScript.",
    "What is the time complexity of binary search?", 
    "How would you implement a REST API for a todo application?",
    "Explain the concept of closure in programming.",
    "What are the advantages of using a database index?"
  ],
  behavioral: [
    "Tell me about a time you faced a challenging problem at work.",
    "Describe a situation where you had to work with a difficult team member.",
    "Give an example of a time you had to learn something new quickly.", 
    "Tell me about a time you made a mistake and how you handled it.",
    "Describe a project you're particularly proud of."
  ]
};

function getQuestions(type, count = 5) {
  const questions = QUESTION_BANK[type] || [];
  return questions.slice(0, count).map((q, index) => ({
    id: index + 1,
    text: q,
    category: type
  }));
}

module.exports = { getQuestions };