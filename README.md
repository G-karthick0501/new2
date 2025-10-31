

How to Run Locally: 

Backend:
```
cd backend
npm install
```

Create a .env in backend/ with:
```
PORT=5000
MONGO_URI=mongodb+srv://****************# or your Atlas URI
JWT_SECRET=supersecretchangeit
GOOGLE_CLIENT_ID=**********
JUDGE0_API_KEY=your_api_key_here
```

Start backend:
```
node server.js
```

Frontend:
```
cd frontend
npm install
```

Create a .env in frontend/ with:
```

VITE_API_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=***********

```

Resume Analyzer Microservice:
```
cd ai_services4/resume-analyzer
uvicorn app:app --reload --port 8000
```

Interview Analyzer Microservice:
```
cd ai_services4/interview-analyzer
uvicorn app:app --reload --port 8001
```
Whisper Transcriberr Microservice:
```
cd ai_services4/whisper-transcriber
uvicorn app:app --reload --port 8003
```

audio-emotion Microservice:
```
cd ai_services4/audio-emotion
uvicorn app:app --reload --port 8002
```

Create a .env in ai_services4/resume-analyzer/ with:
```
GEMINI_API_KEY=******************
