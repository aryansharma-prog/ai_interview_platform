const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema(
  {
    interview: { type: mongoose.Schema.Types.ObjectId, ref: 'Interview', required: true, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    overallScore: { type: Number, min: 0, max: 100, default: 0 },
    confidence: { type: Number, min: 0, max: 100, default: 0 },
    communication: { type: Number, min: 0, max: 100, default: 0 },
    technicalAccuracy: { type: Number, min: 0, max: 100, default: 0 },
    problemSolving: { type: Number, min: 0, max: 100, default: 0 },
    dsaScore: { type: Number, min: 0, max: 100, default: 0 },
    codeQualityScore: { type: Number, min: 0, max: 100, default: 0 },
    systemDesignScore: { type: Number, min: 0, max: 100, default: 0 },
    fundamentalsScore: { type: Number, min: 0, max: 100, default: 0 },
    claimDefenseScore: { type: Number, min: 0, max: 100, default: 0 },
    categoryScores: {
      technicalKnowledge: { type: Number, default: 80 },
      problemSolving: { type: Number, default: 80 },
      communication: { type: Number, default: 80 },
      answerAccuracy: { type: Number, default: 80 },
      depthOfKnowledge: { type: Number, default: 75 },
      confidence: { type: Number, default: 80 },
      behavioralSkills: { type: Number, default: 80 },
      timeManagement: { type: Number, default: 85 },
    },
    keyInsight: {
      mainImprovement: { type: String, default: '' },
      recommendations: [{ type: String }],
    },
    topicsToRevise: [{ type: String }],
    recommendedQuestions: [{ type: String }],
    personalizedPlan: [{ type: String }],
    interviewSummary: { type: String, default: '' },
    strongAreas: [{ type: String }],
    weakAreas: [{ type: String }],
    suggestions: [{ type: String }],
    timeTakenSeconds: { type: Number, default: 0 },
    topicBreakdown: [
      {
        topic: String,
        accuracy: Number,
        classification: { type: String, enum: ['Strong', 'Developing', 'Weak', 'Critical Gap'], default: 'Developing' },
      },
    ],
    // Direct candidate quotes with AI assessment
    evidenceQuotes: [
      {
        dimension: String,
        quote: String,
        analysis: String,
        isPositive: Boolean,
      },
    ],
    skillGaps: [
      {
        skill: String,
        category: String,
        currentScore: Number,
        priority: { type: String, enum: ['High', 'Medium', 'Low'], default: 'Medium' },
        learningPathId: { type: mongoose.Schema.Types.ObjectId, ref: 'LearningPath' },
      },
    ],
    integrityReport: {
      score: { type: Number, default: 100 },
      status: { type: String, default: 'Normal' },
      tabSwitches: { type: Number, default: 0 },
      focusLoss: { type: Number, default: 0 },
      copyEvents: { type: Number, default: 0 },
      reviewRecommended: { type: Boolean, default: false },
    },
    pdfUrl: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Result', resultSchema);
