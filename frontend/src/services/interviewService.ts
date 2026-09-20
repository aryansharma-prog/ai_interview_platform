import api from './api';

export const interviewService = {
  create: (payload: {
    category: string;
    topic?: string;
    difficulty: string;
    numQuestions: number;
    mode: string;
    company?: string;
    resumeId?: string;
    jobProfileId?: string;
    interviewType?: string;
    targetRole?: string;
    interviewerPersona?: string;
    durationMinutes?: number;
    experienceLevel?: string;
    preferredSkill?: string;
    isLiveInterview?: boolean;
  }) => api.post('/interviews', payload),
  list: (params?: Record<string, string | number>) => api.get('/interviews', { params }),
  get: (id: string) => api.get(`/interviews/${id}`),
  complete: (id: string) => api.patch(`/interviews/${id}/complete`),
  remove: (id: string) => api.delete(`/interviews/${id}`),
  upcoming: () => api.get('/interviews/upcoming'),
  next: (id: string) => api.post(`/interviews/${id}/next`),
  schedule: (payload: {
    category: string;
    topic?: string;
    difficulty: string;
    numQuestions?: number;
    company?: string;
    targetRole?: string;
    interviewerPersona?: string;
    durationMinutes?: number;
    scheduledAt: string;
  }) => api.post('/interviews/schedule', payload),
  scheduled: () => api.get('/interviews/scheduled'),
  readiness: () => api.get('/interviews/readiness'),
  history: () => api.get('/interviews/history'),
  updateState: (id: string, sessionState: string) => api.post(`/interviews/${id}/state`, { sessionState }),
  logIntegrity: (id: string, payload: { eventType: string; detail?: string }) =>
    api.post(`/interviews/${id}/integrity`, payload),
};

export const questionService = {
  submitAnswer: (
    id: string,
    payload: {
      answer: string;
      timeTakenSeconds: number;
      testResults?: any;
      codeLanguage?: string;
    }
  ) => api.post(`/questions/${id}/answer`, payload),
  crossQuestion: (id: string, candidateAnswer: string) =>
    api.post(`/questions/${id}/cross-question`, { candidateAnswer }),
  toggleBookmark: (id: string) => api.patch(`/questions/${id}/bookmark`),
  toggleFavorite: (id: string) => api.patch(`/questions/${id}/favorite`),
  bookmarked: () => api.get('/questions/bookmarked'),
};

export const resultService = {
  generate: (interviewId: string) => api.post(`/results/${interviewId}/generate`),
  get: (interviewId: string) => api.get(`/results/${interviewId}`),
  list: () => api.get('/results'),
  downloadPdf: (interviewId: string) => api.post(`/results/${interviewId}/pdf`),
};

export const jdService = {
  analyze: (payload: { rawText: string; title?: string; company?: string; resumeId?: string }) =>
    api.post('/jd/analyze', payload),
  list: () => api.get('/jd'),
  get: (id: string) => api.get(`/jd/${id}`),
};

export const codeService = {
  run: (payload: {
    questionId?: string;
    candidateCode: string;
    language: string;
    testCases?: any[];
  }) => api.post('/code/run', payload),
};

export const skillService = {
  profile: () => api.get('/skills/profile'),
};

export const learningService = {
  generate: (payload: { targetSkill: string; category?: string; originInterviewId?: string }) =>
    api.post('/learning/generate', payload),
  listPaths: () => api.get('/learning/paths'),
  getPath: (id: string) => api.get(`/learning/paths/${id}`),
  toggleModule: (pathId: string, moduleIndex: number) =>
    api.patch(`/learning/paths/${pathId}/modules/${moduleIndex}`),
  startPractice: (payload: { skillName: string; category?: string; difficulty?: string }) =>
    api.post('/learning/practice/start', payload),
  submitPractice: (
    sessionId: string,
    answers: { questionIndex: number; selectedOptionIndex?: number; textAnswer?: string }[]
  ) => api.post(`/learning/practice/${sessionId}/submit`, { answers }),
  getPractice: (sessionId: string) => api.get(`/learning/practice/${sessionId}`),
};

export const analyticsService = {
  overview: () => api.get('/analytics/overview'),
  dailyProgress: (days = 30) => api.get('/analytics/daily-progress', { params: { days } }),
  topicAccuracy: () => api.get('/analytics/topic-accuracy'),
};

export const userService = {
  profile: () => api.get('/users/profile'),
  updateProfile: (payload: { name?: string; bio?: string; targetRole?: string }) =>
    api.put('/users/profile', payload),
  uploadAvatar: (formData: FormData) =>
    api.post('/users/profile/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  changePassword: (payload: { currentPassword: string; newPassword: string }) =>
    api.put('/users/change-password', payload),
};

export const resumeService = {
  upload: (formData: FormData) =>
    api.post('/resumes', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  list: () => api.get('/resumes'),
};

export const adminService = {
  listUsers: (params?: Record<string, string | number>) => api.get('/admin/users', { params }),
  deleteUser: (id: string) => api.delete(`/admin/users/${id}`),
  toggleActive: (id: string) => api.patch(`/admin/users/${id}/toggle-active`),
  analytics: () => api.get('/admin/analytics'),
  categories: () => api.get('/admin/categories'),
};
