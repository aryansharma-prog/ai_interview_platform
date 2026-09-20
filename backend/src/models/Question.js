const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema(
  {
    interview: { type: mongoose.Schema.Types.ObjectId, ref: 'Interview', required: true, index: true },
    order: { type: Number, required: true },
    text: { type: String, required: true },
    topic: { type: String, default: '' },
    difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium' },
    questionType: {
      type: String,
      enum: ['conceptual', 'cross_question', 'deep_dive', 'coding', 'scenario', 'system_design'],
      default: 'conceptual',
    },
    claimChallenged: { type: String, default: '' },
    hints: [{ type: String }],
    expectedAnswer: { type: String, default: '' },
    followUpQuestions: [{ type: String }],
    // Coding Interview specific fields
    starterCode: { type: String, default: '' },
    codeLanguage: { type: String, default: 'javascript' },
    testCases: [
      {
        input: { type: String },
        expectedOutput: { type: String },
        isHidden: { type: Boolean, default: false },
        explanation: { type: String, default: '' },
      },
    ],
    candidateCode: { type: String, default: '' },
    executionResults: {
      passed: { type: Boolean },
      testsPassed: { type: Number, default: 0 },
      totalTests: { type: Number, default: 0 },
      runtimeMs: { type: Number, default: 0 },
      stdout: { type: String, default: '' },
      stderr: { type: String, default: '' },
    },
    complexityAnalysis: {
      timeComplexity: { type: String, default: '' },
      spaceComplexity: { type: String, default: '' },
      isOptimal: { type: Boolean, default: true },
      suggestions: [{ type: String }],
    },
    // Multi-turn conversation for cross-questioning & follow-ups
    turns: [
      {
        sender: { type: String, enum: ['interviewer', 'candidate'], required: true },
        message: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
      },
    ],
    userAnswer: { type: String, default: '' },
    answeredAt: { type: Date },
    timeTakenSeconds: { type: Number, default: 0 },
    evaluation: {
      score: { type: Number, min: 0, max: 100 },
      correctnessScore: { type: Number, min: 0, max: 10 },
      depthScore: { type: Number, min: 0, max: 10 },
      communicationScore: { type: Number, min: 0, max: 10 },
      confidence: { type: Number, min: 0, max: 100 },
      communication: { type: Number, min: 0, max: 100 },
      technicalAccuracy: { type: Number, min: 0, max: 100 },
      problemSolving: { type: Number, min: 0, max: 100 },
      dsaScore: { type: Number, min: 0, max: 100 },
      codeQualityScore: { type: Number, min: 0, max: 100 },
      feedback: { type: String, default: '' },
      strengths: [{ type: String }],
      weaknesses: [{ type: String }],
      improvementSuggestions: [{ type: String }],
    },
    spokenIntro: { type: String, default: '' }, // conversational transition e.g. "Great. Now let's explore..."
    idealAnswerConcepts: [{ type: String }], // key concepts candidate should touch
    idealAnswerStructure: { type: String, default: '' },
    isBookmarked: { type: Boolean, default: false },
    isFavorite: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Question', questionSchema);
