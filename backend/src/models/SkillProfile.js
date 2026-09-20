const mongoose = require('mongoose');

const skillNodeSchema = new mongoose.Schema({
  skillName: { type: String, required: true },
  category: {
    type: String,
    enum: ['Backend', 'Frontend', 'DSA', 'System Design', 'DevOps', 'Database', 'CS Fundamentals', 'Behavioral'],
    required: true,
  },
  mastery: { type: Number, min: 0, max: 100, default: 50 },
  classification: {
    type: String,
    enum: ['Strong', 'Developing', 'Weak', 'Critical Gap'],
    default: 'Developing',
  },
  attemptsCount: { type: Number, default: 0 },
  lastAssessedAt: { type: Date, default: Date.now },
  history: [
    {
      score: { type: Number, min: 0, max: 100 },
      assessedAt: { type: Date, default: Date.now },
      source: { type: String, enum: ['interview', 'practice', 'coding'], default: 'interview' },
      interviewId: { type: mongoose.Schema.Types.ObjectId, ref: 'Interview' },
    },
  ],
});

const skillProfileSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    skills: [skillNodeSchema],
    overview: {
      technical: { type: Number, default: 70 },
      dsa: { type: Number, default: 65 },
      systemDesign: { type: Number, default: 60 },
      communication: { type: Number, default: 75 },
      backend: { type: Number, default: 70 },
      fundamentals: { type: Number, default: 68 },
    },
    topGaps: [{ type: String }],
    topStrengths: [{ type: String }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('SkillProfile', skillProfileSchema);
