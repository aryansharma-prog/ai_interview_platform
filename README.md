# AI Interview & Personalized Career Learning Platform

A production-grade, full-stack AI interview preparation and career learning platform built with **React (TypeScript) + Node.js (Express) + MongoDB + Groq & Gemini Multi-Provider AI Architecture**.

The platform is designed around an interconnected learning loop:
```
Resume PDF + Job Description
          ↓
Candidate Skill Analysis & Gap Matrix
          ↓
Personalized Adaptive Interview (Technical / Coding / System Design / Behavioral)
          ↓
Real-Time Dynamic Cross-Questioning & Code Sandbox Evaluation
          ↓
Multi-Dimensional Assessment (8+ Dimensions with Answer Evidence Quotes)
          ↓
Dynamic Skill Map & Gap Detection (Strong / Developing / Weak / Critical Gap)
          ↓
Actionable Learning Paths & Targeted Practice Drills
          ↓
Progress Tracking & Continuous Re-Evaluation
```

---

## Key Differentiating Features

### 1. Dual AI Engine (Groq + Google Gemini with Auto-Routing)
- Centralized `aiProvider.js` service supporting **Groq API** (ultra-fast Llama-3.3-70b-versatile, Llama-3.1-8b) and **Google Gemini API** (`gemini-1.5-pro` / `gemini-1.5-flash`).
- Automatic fallback resilience and deterministic offline mocks for 100% testable local demonstrations without required API keys.

### 2. Resume & Job Description (JD) Intelligence
- Genuine PDF parsing (`pdf-parse`) extracting categorized skills, projects, architectural claims, and performance metrics.
- JD extraction with real-time **Candidate-JD Fit & Skill Gap Matrix** (Matched Skills vs Missing Skills vs Match Score %).

### 3. Adaptive Interview Engine & Dynamic Cross-Questioning
- Deterministic CAT-adaptive difficulty ladder (Easy $\leftrightarrow$ Medium $\leftrightarrow$ Hard) reacting live to candidate accuracy.
- **Intelligent Cross-Questioning**: Senior tech lead AI persona detects technical claims in answers (e.g. *"I used Redis with TTL for caching"*) and actively challenges edge cases, invalidation policies, and failure modes in a multi-turn conversation thread.
- Full voice support with browser Speech-to-Text (STT) and Text-to-Speech (TTS) read-aloud.

### 4. AI Coding Studio & Big-O Complexity Engine
- Integrated Monaco-powered code editor with multi-language selection (JavaScript, TypeScript, Python, C++, Java, Go).
- Isolated Node VM sandbox test runner validating against visible & hidden test cases with execution time measurement in milliseconds.
- Multi-dimensional Code Evaluation for correctness, $O(N)$ Big-O Time & Space complexity, and AI optimization follow-up questions.

### 5. Multi-Dimensional Evidence Assessment
- 8-dimension evaluation model:
  - Technical Depth
  - DSA & Algorithmic Thinking
  - System Design & Scalability
  - Problem Solving & Approach
  - Code Quality & Engineering Standards
  - Communication Clarity
  - CS Fundamentals
  - Claim Defense
- Direct cited evidence quotes from candidate answers linked to evaluation scores.

### 6. Personalized Skill Map & Gap Explorer
- Interactive competency radar chart and hierarchical skill matrix.
- Categorized by Backend, Frontend, DSA, System Design, DevOps, and CS Fundamentals.
- Classification tiers: **Strong** (80-100%), **Developing** (60-79%), **Weak** (40-59%), and **Critical Gap** (<40%).

### 7. Personalized Learning Engine & Targeted Practice
- Converts identified interview weaknesses into structured 4-module personalized curricula with core concepts and scenario questions.
- Interactive targeted practice room with mini-quizzes, scenario trade-offs, instant model explanations, and celebratory mastery updates.

### 8. Privacy-Conscious Integrity Monitoring
- Non-punitive proctoring signals tracking tab switches, window blur events, and copy shortcuts with an integrity standing report.

---

## Tech Stack

- **Frontend:** React 18, TypeScript, Tailwind CSS, Vite, Framer Motion, Chart.js / React-Chartjs-2, Monaco Editor, React Query, Lucide Icons, React Hook Form, Canvas-Confetti.
- **Backend:** Node.js, Express, MongoDB (Mongoose), Groq SDK (`groq-sdk`), Google Generative AI (`@google/generative-ai`), PDF Parse (`pdf-parse`), PDFKit, JWT, Bcrypt, Multer.
- **Architecture:** Modular MVC + dedicated AI Service layer with deterministic offline fallbacks.

---

## Monorepo Layout

```
ai-interview-platform/
├── backend/
│   ├── src/
│   │   ├── config/          env.js, db.js
│   │   ├── controllers/     auth, interview, question, result, jd, code, learning, skill, user, admin
│   │   ├── middleware/      auth, errorHandler, rateLimiter, upload, validate
│   │   ├── models/          User, Interview, Question, Result, Resume, JobProfile, SkillProfile, LearningPath, PracticeSession, Analytics, Feedback
│   │   ├── routes/          /auth /interviews /questions /results /jd /code /learning /skills /resumes /users /analytics /admin
│   │   ├── services/        aiProvider, geminiService, codeExecutionService, resumeService, pdfService, emailService
│   │   ├── utils/           logger, asyncHandler, apiResponse, tokens, seed
│   │   └── validators/      authValidators, interviewValidators
│   ├── uploads/
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/      coding (CodeEditor, TestResultsPanel), skills (SkillRadarChart), interview (VoiceSpeechControls), layout, ui
│   │   ├── pages/           dashboard, interview, skills, learning, analytics, profile, auth, landing
│   │   ├── hooks/           useInterviewIntegrity
│   │   ├── services/        typed API client modules
│   │   ├── context/         AuthContext, ThemeContext
│   │   └── types/           shared TypeScript schemas
│   ├── package.json
│   └── vite.config.ts
├── API_DOCUMENTATION.md
├── docker-compose.yml
└── README.md
```

---

## Quick Start (Local Setup)

### 1. Backend Setup

```bash
cd backend
cp .env.example .env

# Optional: Add your live AI keys (works automatically with deterministic fallback if left blank):
# GEMINI_API_KEY=your_gemini_api_key
# GROQ_API_KEY=your_groq_api_key
# AI_PROVIDER=auto

npm install
npm run seed       # Seeds demo admin user: admin@aiinterview.com / Admin@12345
npm run dev        # Backend running at http://localhost:5000
```

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev        # Frontend running at http://localhost:5173
```

### 3. Docker Deployment (Optional)

```bash
docker compose up --build
```
- Frontend: `http://localhost`
- Backend API: `http://localhost:5000/api`

---

## Environment Variables

| Variable | Description | Default |
|---|---|---|
| `PORT` | Backend server port | `5000` |
| `CLIENT_URL` | Frontend URL for CORS | `http://localhost:5173` |
| `MONGO_URI` | MongoDB connection string | `mongodb://localhost:27017/ai-interview-platform` |
| `JWT_SECRET` | Access token secret | Required in production |
| `JWT_REFRESH_SECRET` | Refresh token secret | Required in production |
| `AI_PROVIDER` | AI provider selector (`auto`, `groq`, `gemini`) | `auto` |
| `GROQ_API_KEY` | Groq API Key | Optional (enables Llama 3.3) |
| `GROQ_MODEL` | Groq model identifier | `llama-3.3-70b-versatile` |
| `GEMINI_API_KEY` | Google Gemini API Key | Optional (enables Gemini 1.5) |
| `GEMINI_MODEL` | Gemini model identifier | `gemini-1.5-pro` |
# ai_interview_platform
