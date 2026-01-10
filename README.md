# DevCruite - AI-Powered Recruitment Platform

<p align="center">
  <img src="https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react" alt="React"/>
  <img src="https://img.shields.io/badge/Node.js-18.x-339933?style=for-the-badge&logo=node.js" alt="Node.js"/>
  <img src="https://img.shields.io/badge/FastAPI-0.104-009688?style=for-the-badge&logo=fastapi" alt="FastAPI"/>
  <img src="https://img.shields.io/badge/MongoDB-6.x-47A248?style=for-the-badge&logo=mongodb" alt="MongoDB"/>
  <img src="https://img.shields.io/badge/Google%20Gemini-AI-4285F4?style=for-the-badge&logo=google" alt="Gemini"/>
</p>

An end-to-end AI-powered recruitment platform featuring **voice-based mock interviews**, **resume optimization**, **coding assessments**, and **HR management** — built with React, Node.js, FastAPI, and Google Gemini AI.

---

## 🎯 Key Features

### For Candidates
| Feature | Description |
|---------|-------------|
| 🎤 **AI Mock Interviews** | Voice-based interview simulation with real-time speech-to-text transcription and AI-powered feedback |
| 📄 **Resume Optimizer** | Upload resume + job description → Get AI suggestions for missing skills → Generate optimized PDF |
| 💻 **Coding Practice** | Solve coding challenges with live code execution via Judge0 API |
| 💼 **Job Applications** | Browse jobs, apply with resume upload, track application status |
| 😊 **Emotion Analysis** | Real-time emotion detection during interviews (confidence, nervousness, etc.) |

### For HR Managers
| Feature | Description |
|---------|-------------|
| 📊 **Analytics Dashboard** | View all candidate interviews, scores, and performance metrics |
| 👥 **Candidate Management** | Review applications, shortlist candidates, update status |
| 📝 **Job Management** | Create, edit, and manage job postings |
| 📈 **Interview Results** | Detailed AI analysis of each candidate's interview performance |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND                                   │
│                     React + Vite + TailwindCSS                          │
│    ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│    │ Candidate│  │    HR    │  │  Resume  │  │  Coding  │              │
│    │Dashboard │  │Dashboard │  │ Analyzer │  │ Practice │              │
│    └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘              │
└─────────┼──────────────┼────────────┼─────────────┼─────────────────────┘
          │              │            │             │
          ▼              ▼            ▼             ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         BACKEND (Node.js + Express)                     │
│         /api/auth  /api/interview  /api/resume  /api/coding             │
│         /api/jobs  /api/applications  /api/hr  /api/notifications       │
│                              MongoDB                                    │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
     ┌───────────────────────────┼───────────────────────────┐
     │                           │                           │
     ▼                           ▼                           ▼
┌──────────────┐    ┌──────────────────┐    ┌─────────────────────┐
│   Resume     │    │    Interview     │    │      Whisper        │
│  Analyzer    │    │    Analyzer      │    │    Transcriber      │
│  (Port 8000) │    │   (Port 8001)    │    │    (Port 8003)      │
│  ──────────  │    │  ──────────────  │    │  ─────────────────  │
│  • Skill Gap │    │  • Semantic NLP  │    │  • Speech-to-Text   │
│  • PDF Gen   │    │  • LLM Feedback  │    │  • faster-whisper   │
│  • LaTeX     │    │  • Gemini AI     │    │  • Real-time        │
└──────────────┘    └──────────────────┘    └─────────────────────┘
                                 │
                                 ▼
                    ┌─────────────────────┐
                    │    Audio Emotion    │
                    │    (Port 8002)      │
                    │  ─────────────────  │
                    │  • Emotion Detection│
                    │  • Speech Metrics   │
                    │  • Confidence Score │
                    └─────────────────────┘
```

---

## 🔌 API Reference

### Authentication (`/api/auth`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/register` | Register with email/password + role |
| `POST` | `/login` | Login with credentials |
| `POST` | `/google` | Google OAuth authentication |
| `GET` | `/me` | Get current user profile |

### Interview (`/api/interview`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/start` | Start new interview session | ✅ |
| `POST` | `/respond` | Submit text/audio response | ✅ |
| `POST` | `/complete` | Complete interview & get AI analysis | ✅ |
| `GET` | `/results/all` | Get all interviews (HR only) | ✅ HR |
| `GET` | `/results/:sessionId` | Get specific interview details | ✅ |

### Resume (`/api/resume`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/analyze-initial` | Analyze resume vs job description | ✅ |
| `POST` | `/generate-optimized` | Generate optimized resume with selected skills | ✅ |
| `POST` | `/generate-pdf` | Generate PDF resume via LaTeX | ✅ |

### Jobs (`/api/jobs`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/` | List all active jobs | ✅ |
| `POST` | `/` | Create new job posting | ✅ HR |
| `GET` | `/:id` | Get job details | ✅ |
| `PUT` | `/:id` | Update job posting | ✅ HR |
| `DELETE` | `/:id` | Delete job posting | ✅ HR |

### Applications (`/api/applications`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/:jobId/apply` | Apply to job with resume | ✅ Candidate |
| `GET` | `/` | List applications (role-filtered) | ✅ |
| `PATCH` | `/:id/status` | Update application status | ✅ HR |
| `GET` | `/download-resume/:id` | Download applicant's resume | ✅ |
| `DELETE` | `/:id` | Delete application | ✅ |

### Coding (`/api/coding`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/submit` | Submit code for execution | ✅ |
| `GET` | `/result/:token` | Get execution result | ✅ |

### HR (`/api/hr`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/stats` | Get HR dashboard statistics | ✅ HR |

---

## 🤖 AI Microservices

### 1. Resume Analyzer (Port 8000)

**Technology:** FastAPI + Google Gemini + Sentence Transformers + Tectonic LaTeX

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/analyze-skills` | POST | Compare resume with JD, extract missing skills |
| `/optimize-with-skills` | POST | Optimize resume text with selected skills |
| `/generate-pdf` | POST | Generate professional PDF via Gemini → LaTeX |
| `/health` | GET | Health check |

**Core Capabilities:**
- Semantic similarity matching using embeddings
- Skill gap analysis with improvement suggestions
- LaTeX resume generation with Tectonic compiler
- ATS-friendly formatting

---

### 2. Interview Analyzer (Port 8001)

**Technology:** FastAPI + Google Gemini + NLTK + Sentence Transformers

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/analyze` | POST | Batch analyze Q&A pairs with AI feedback |
| `/health` | GET | Health check |

**Analysis Pipeline:**
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Text      │ →  │  Objective  │ →  │  Semantic   │ →  │  LLM        │
│ Processing  │    │  Metrics    │    │  Analysis   │    │  Feedback   │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
     NLTK            word_count        relevance_score     Gemini AI
   tokenization     sentence_count    topic_coherence     strengths
   lemmatization    lexical_diversity                     weaknesses
                    pos_diversity                         improvement_tips
```

---

### 3. Whisper Transcriber (Port 8003)

**Technology:** FastAPI + faster-whisper (4x faster than OpenAI Whisper)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/transcribe` | POST | Transcribe audio to text |
| `/transcribe-with-timestamps` | POST | Transcribe with word-level timestamps |
| `/health` | GET | Health check |

**Features:**
- Supports: MP3, MP4, WAV, WebM, M4A, OGG, FLAC
- Voice Activity Detection (VAD) for silence removal
- No FFmpeg required
- 10MB file size limit

---

### 4. Audio Emotion Analyzer (Port 8002)

**Technology:** FastAPI + Librosa + Speech Emotion Recognition

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/analyze-audio` | POST | Analyze emotion from short audio |
| `/analyze-audio-long` | POST | Chunked analysis for long audio |
| `/health` | GET | Health check |

**Detected Emotions:** Happy, Sad, Angry, Fear, Neutral

**Additional Metrics:**
- Speech rate (words/minute)
- Pause count & duration
- Confidence score
- Human-readable interpretation

---

## 📦 Data Models

### User
```javascript
{
  name: String,
  email: String (unique),
  password: String (optional for OAuth),
  role: ['candidate', 'hr', 'admin'],
  profile: { resume, skills, experience, company, department },
  googleId: String,
  authProvider: ['local', 'google']
}
```

### InterviewSession
```javascript
{
  userId: ObjectId,
  interviewType: ['technical', 'behavioral'],
  questionCount: Number,
  questions: [{
    questionText: String,
    userResponse: String,
    timeSpent: Number,
    audioEmotion: { dominant, confidence, allScores },
    analysis: { objective, semantic, llm_feedback }
  }],
  overallScore: Number,
  overallAnalysis: { strengths, weaknesses, improvement_tips },
  aiAnalysis: { processed, processingTime, processedAt },
  status: ['in_progress', 'completed', 'ai_processing']
}
```

### JobPost
```javascript
{
  title: String,
  description: String,
  requirements: String,
  skills: [String],
  location: String,
  salary: String,
  deadline: Date,
  hrId: ObjectId,
  status: ['active', 'closed', 'draft']
}
```

### Application
```javascript
{
  candidateId: ObjectId,
  jobId: ObjectId,
  resumeFile: String,
  resumeFileBuffer: String (base64),
  coverLetter: String,
  matchScore: Number,
  status: ['pending', 'reviewed', 'shortlisted', 'rejected', 'test_sent']
}
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Python 3.10+
- MongoDB (local or Atlas)
- Tectonic LaTeX compiler (for PDF generation)

### Installation

#### 1. Clone Repository
```bash
git clone https://github.com/G-karthick0501/new2.git
cd new2
```

#### 2. Backend Setup
```bash
cd backend
npm install
```

Create `.env` file:
```env
PORT=5000
MONGO_URI=mongodb+srv://your_connection_string
JWT_SECRET=your_super_secret_key
GOOGLE_CLIENT_ID=your_google_client_id
JUDGE0_API_KEY=your_judge0_api_key
AI_SERVICE_URL=http://localhost:8001
AUDIO_EMOTION_URL=http://localhost:8002
WHISPER_URL=http://localhost:8003
```

Start backend:
```bash
node server.js
```

#### 3. Frontend Setup
```bash
cd frontend
npm install
```

Create `.env` file:
```env
VITE_API_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

Start frontend:
```bash
npm run dev
```

#### 4. AI Microservices Setup

**Resume Analyzer (Port 8000):**
```bash
cd ai_services4/resume-analyzer
pip install -r requirements.txt
echo "GEMINI_API_KEY=your_gemini_api_key" > .env
uvicorn app:app --reload --port 8000
```

**Interview Analyzer (Port 8001):**
```bash
cd ai_services4/interview-analyzer
pip install -r requirements.txt
echo "GEMINI_API_KEY=your_gemini_api_key" > .env
uvicorn app:app --reload --port 8001
```

**Audio Emotion (Port 8002):**
```bash
cd ai_services4/audio-emotion
pip install -r requirements.txt
uvicorn app:app --reload --port 8002
```

**Whisper Transcriber (Port 8003):**
```bash
cd ai_services4/whisper-transcriber
pip install -r requirements.txt
uvicorn app:app --reload --port 8003
```

---

## 🔧 Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18, Vite, TailwindCSS |
| **Backend** | Node.js, Express.js, MongoDB, Mongoose |
| **AI Services** | FastAPI, Google Gemini 2.0, NLTK, Sentence Transformers |
| **Speech** | faster-whisper, Librosa |
| **Code Execution** | Judge0 API |
| **Authentication** | JWT, Google OAuth 2.0 |
| **PDF Generation** | Tectonic LaTeX Compiler |

---

## 📁 Project Structure

```
new2/
├── backend/
│   ├── server.js                 # Express server entry
│   └── src/
│       ├── routes/
│       │   ├── auth.js           # Authentication routes
│       │   ├── interview.js      # Interview management
│       │   ├── resume.js         # Resume analysis
│       │   ├── jobs.js           # Job postings
│       │   ├── applications.js   # Job applications
│       │   ├── coding.js         # Code execution
│       │   ├── hr.js             # HR operations
│       │   └── notifications.js  # Notifications
│       ├── models/
│       │   ├── User.js
│       │   ├── InterviewSession.js
│       │   ├── JobPost.js
│       │   ├── Application.js
│       │   └── CodingProblem.js
│       ├── middleware/
│       │   ├── auth.js           # JWT verification
│       │   └── roleAuth.js       # Role-based access
│       └── services/
│           ├── judge0Service.js  # Code execution
│           ├── questionBank.js   # Interview questions
│           └── notificationService.js
│
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── candidate/        # Candidate dashboard components
│       │   ├── hr/               # HR dashboard components
│       │   ├── interview/        # Interview UI components
│       │   └── coding/           # Code editor components
│       ├── hooks/
│       │   ├── useAuth.jsx
│       │   ├── useInterview.js
│       │   └── useResumeAnalysis.js
│       └── pages/
│           ├── CandidateDashboard.jsx
│           ├── HRDashboard.jsx
│           └── Login.jsx
│
└── ai_services4/
    ├── resume-analyzer/          # Resume optimization service
    ├── interview-analyzer/       # Interview feedback service
    ├── audio-emotion/            # Emotion detection service
    └── whisper-transcriber/      # Speech-to-text service
```

---

## 🔐 Environment Variables

### Backend (.env)
| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default: 5000) |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret for JWT signing |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `JUDGE0_API_KEY` | Judge0 RapidAPI key |
| `AI_SERVICE_URL` | Interview analyzer URL |
| `AUDIO_EMOTION_URL` | Audio emotion service URL |
| `WHISPER_URL` | Whisper transcriber URL |

### Frontend (.env)
| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend API base URL |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth client ID |

### AI Services (.env)
| Variable | Description |
|----------|-------------|
| `GEMINI_API_KEY` | Google Gemini API key |

---

## 📄 License

This project is for educational purposes.

---

## 👨‍💻 Author

**G. Karthick**  
- GitHub: [@G-karthick0501](https://github.com/G-karthick0501)
- Email: 0105karthick@gmail.com

---

<p align="center">
  Built with ❤️ using React, Node.js, FastAPI & Google Gemini AI
</p>
