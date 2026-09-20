const mongoose = require('mongoose');

const INTERVIEW_CATEGORIES = [
  'HR',
  'Technical',
  'DSA',
  'Behavioral',
  'System Design',
  'Mixed',
  'Company-specific',
  'OOP',
  'DBMS',
  'OS',
  'CN',
  'Resume Based',
];

const INTERVIEWER_PERSONAS = ['Professional', 'Conversational', 'Technical', 'Strict', 'HR'];

const interviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    category: { type: String, enum: INTERVIEW_CATEGORIES, required: true },
    topic: { type: String, default: '' }, // e.g. "Graphs", "Design Instagram", "React & Node"
    difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard', 'Adaptive'], default: 'Medium' },
    numQuestions: { type: Number, default: 5 },
    mode: { type: String, enum: ['Voice', 'Text', 'Camera'], default: 'Camera' },
    interviewType: {
      type: String,
      enum: ['standard', 'coding', 'system_design', 'behavioral', 'comprehensive', 'live_ai'],
      default: 'live_ai',
    },
    interviewerPersona: {
      type: String,
      enum: INTERVIEWER_PERSONAS,
      default: 'Professional',
    },
    durationMinutes: { type: Number, default: 30 },
    experienceLevel: {
      type: String,
      enum: ['Junior', 'Mid-Level', 'Senior', 'Staff / Lead'],
      default: 'Mid-Level',
    },
    preferredSkill: { type: String, default: '' },
    isLiveInterview: { type: Boolean, default: true },
    targetRole: { type: String, default: '' },
    company: { type: String, default: '' },
    resume: { type: mongoose.Schema.Types.ObjectId, ref: 'Resume' },
    jobProfile: { type: mongoose.Schema.Types.ObjectId, ref: 'JobProfile' },
    sessionState: {
      type: String,
      enum: [
        'SETUP',
        'LOBBY',
        'ACTIVE',
        'LISTENING',
        'PROCESSING',
        'ASKING_NEXT',
        'SUBMITTING',
        'EVALUATING',
        'COMPLETED',
        'ABANDONED',
      ],
      default: 'SETUP',
    },
    candidatePerformanceScore: { type: Number, default: 75, min: 0, max: 100 },
    integritySignals: {
      tabSwitches: { type: Number, default: 0 },
      focusLoss: { type: Number, default: 0 },
      copyEvents: { type: Number, default: 0 },
      status: { type: String, enum: ['Normal', 'Review Recommended', 'Irregular'], default: 'Normal' },
      events: [
        {
          type: { type: String },
          timestamp: { type: Date, default: Date.now },
          detail: { type: String },
        },
      ],
    },
    status: {
      type: String,
      enum: ['scheduled', 'in_progress', 'completed', 'abandoned'],
      default: 'scheduled',
    },
    currentDifficulty: { type: String, enum: ['Easy', 'Medium', 'Hard', 'Adaptive'], default: 'Medium' },
    difficultyPath: [{ type: String }],
    scheduledAt: { type: Date },
    startedAt: { type: Date },
    completedAt: { type: Date },
    durationSeconds: { type: Number, default: 0 },
    questions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
    result: { type: mongoose.Schema.Types.ObjectId, ref: 'Result' },
  },
  { timestamps: true }
);

interviewSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Interview', interviewSchema);
module.exports.INTERVIEW_CATEGORIES = INTERVIEW_CATEGORIES;
module.exports.INTERVIEWER_PERSONAS = INTERVIEWER_PERSONAS;

