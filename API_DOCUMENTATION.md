# API Documentation — AI Interview & Career Learning Platform

Base URL: `/api`. All authenticated routes require `Authorization: Bearer <accessToken>`.
All responses follow the shape: `{ success, message, data, meta? }`.

---

## Auth — `/api/auth`

| Method | Path | Auth | Body | Description |
|---|---|---|---|---|
| POST | `/register` | – | `{ name, email, password }` | Create account, sends verification email |
| POST | `/login` | – | `{ email, password }` | Returns `accessToken` + `refreshToken` |
| POST | `/refresh` | – | `{ refreshToken }` | Issues a new access token |
| POST | `/logout` | ✓ | – | Invalidates the stored refresh token |
| POST | `/verify-email` | – | `{ token }` | Verifies email from emailed link |
| POST | `/forgot-password` | – | `{ email }` | Sends password reset email (always 200) |
| POST | `/reset-password` | – | `{ token, newPassword }` | Sets a new password |
| GET | `/me` | ✓ | – | Current user profile |

---

## Users — `/api/users`

| Method | Path | Body | Description |
|---|---|---|---|
| GET | `/profile` | – | Get profile |
| PUT | `/profile` | `{ name?, bio?, targetRole? }` | Update profile |
| POST | `/profile/avatar` | multipart `avatar` | Upload profile picture |
| PUT | `/change-password` | `{ currentPassword, newPassword }` | Change password |

---

## Resumes & Job Intelligence — `/api/resumes` & `/api/jd`

| Method | Path | Body | Description |
|---|---|---|---|
| POST | `/resumes` | multipart `resume` | Upload & parse PDF resume with `pdf-parse` + AI claim extraction |
| GET | `/resumes` | – | List user's uploaded resumes |
| POST | `/jd/analyze` | `{ rawText, title?, company?, resumeId? }` | Parse JD requirements and compute candidate vs JD match gap matrix |
| GET | `/jd` | – | List user's analyzed Job Profiles |
| GET | `/jd/:id` | – | Get single Job Profile with match analysis |

---

## Interviews & Adaptive Engine — `/api/interviews`

| Method | Path | Body / Query | Description |
|---|---|---|---|
| POST | `/` | `{ category, topic?, difficulty, numQuestions, mode, company?, resumeId?, jobProfileId?, interviewType?, targetRole? }` | Initialize interview + generate first question tailored to claims & JD |
| GET | `/` | `?status&category&search&page&limit` | List user's interviews |
| GET | `/upcoming` | – | Scheduled future interviews |
| GET | `/:id` | – | Get one interview with populated questions and turns |
| POST | `/:id/next` | – | **Adaptive engine.** Generates next question just-in-time with difficulty calibrated to rolling accuracy |
| POST | `/:id/integrity` | `{ eventType, detail? }` | Log non-punitive tab switch and window blur signals |
| PATCH | `/:id/complete` | – | Mark interview completed |
| DELETE | `/:id` | – | Delete interview + its questions |

---

## Questions & Cross-Questioning — `/api/questions`

| Method | Path | Body | Description |
|---|---|---|---|
| POST | `/:id/answer` | `{ answer, timeTakenSeconds, testResults?, codeLanguage? }` | Submit answer/code for 8-dimension AI evaluation |
| POST | `/:id/cross-question` | `{ candidateAnswer }` | **Intelligent Cross-Questioning.** Challenges specific candidate claims and trade-offs |
| PATCH | `/:id/bookmark` | – | Toggle bookmark |
| PATCH | `/:id/favorite` | – | Toggle favorite |
| GET | `/bookmarked` | – | List bookmarked questions |

---

## Coding Sandbox & Complexity Studio — `/api/code`

| Method | Path | Body | Description |
|---|---|---|---|
| POST | `/run` | `{ questionId?, candidateCode, language, testCases? }` | Execute candidate code in isolated sandbox against test suites, measure runtime ms, and compute Big-O Time/Space complexity |

---

## Results & 8-Dimension Evaluation — `/api/results`

| Method | Path | Description |
|---|---|---|
| POST | `/:interviewId/generate` | Aggregate answers into 8 dimensions (Technical, DSA, System Design, Communication, Problem Solving, Code Quality, CS Fundamentals, Claim Defense) + extract evidence quotes |
| GET | `/:interviewId` | Get result with radar breakdown, quotes, and integrity standing |
| GET | `/` | List all results for the user |
| POST | `/:interviewId/pdf` | Render and return downloadable official PDF report |

---

## Personalized Skill Map — `/api/skills`

| Method | Path | Description |
|---|---|---|
| GET | `/profile` | Get comprehensive Skill Profile with radar dimensions, granular topic masteries, classifications (Strong/Developing/Weak/Critical Gap), and gap matrix |

---

## Learning Paths & Targeted Practice — `/api/learning`

| Method | Path | Body | Description |
|---|---|---|---|
| POST | `/generate` | `{ targetSkill, category?, originInterviewId? }` | Generate personalized 4-module curriculum for identified weak skill |
| GET | `/paths` | – | List all active learning paths |
| GET | `/paths/:id` | – | Get single learning path with modules & scenario questions |
| PATCH | `/paths/:id/modules/:moduleIndex` | – | Toggle module completion status & update user skill mastery |
| POST | `/practice/start` | `{ skillName, category?, difficulty? }` | Initialize 4-question targeted practice drill session |
| POST | `/practice/:sessionId/submit` | `{ answers: [{ questionIndex, selectedOptionIndex }] }` | Grade practice drill, return model explanations, and award verified mastery boost to SkillProfile |
| GET | `/practice/:sessionId` | – | Fetch practice session details |

---

## Analytics — `/api/analytics`

| Method | Path | Query | Description |
|---|---|---|---|
| GET | `/overview` | – | totalInterviews, completionRate, averageScore |
| GET | `/daily-progress` | `?days=30` | Daily rollups for charting |
| GET | `/topic-accuracy` | – | Aggregated accuracy per topic |

---

## Admin — `/api/admin` (role: admin only)

| Method | Path | Description |
|---|---|---|
| GET | `/users` | List/search all users |
| DELETE | `/users/:id` | Delete a user |
| PATCH | `/users/:id/toggle-active` | Activate/deactivate a user |
| GET | `/analytics` | Platform-wide analytics |
| GET | `/categories` | List interview categories |

---

## Health Check

`GET /api/health` → `{ success: true, message: "API is healthy" }`
