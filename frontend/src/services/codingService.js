const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const codingService = {
  async getProblems() {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_BASE}/api/coding-problems`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.json();
  },

  async getProblem(id) {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_BASE}/api/coding-problems/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.json();
  },

  // ✅ FIXED: Added problemId parameter
  async submitCode(sourceCode, languageId, stdin = "", problemId = null) {
    const token = localStorage.getItem('token');
    
    console.log('📤 Submitting code:', {
      codeLength: sourceCode.length,
      languageId,
      stdinLength: stdin?.length || 0,
      problemId
    });

    const res = await fetch(`${API_BASE}/api/coding/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        source_code: sourceCode,
        language_id: languageId,
        stdin: stdin,
        problem_id: problemId  // ✅ Include problemId
      })
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.msg || 'Submission failed');
    }

    return res.json();
  },

  async getSubmissionResults(token) {
    const authToken = localStorage.getItem('token');
    const res = await fetch(`${API_BASE}/api/coding/submission/${token}`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    return res.json();
  }
};