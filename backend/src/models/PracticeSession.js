const mongoose = require('mongoose');

const practiceQuestionSchema = new mongoose.Schema({
  questionType: { type: String, enum: ['quiz', 'scenario', 'code_challenge', 'conceptual'], default: 'quiz' },
  prompt: { type: String, required: true },
  options: [{ type: String }], // For quiz
  correctOptionIndex: { type: Number }, // 0-indexed for quiz
  modelExplanation: { type: String, default: '' },
  userAnswer: { type: String, default: '' },
  isCorrect: { type: Boolean },
  score: { type: Number, min: 0, max: 100 },
  aiFeedback: { type: String, default: '' },
});

const practiceSessionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    skillName: { type: String, required: true },
    category: { type: String, default: 'Backend' },
    difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium' },
    status: { type: String, enum: ['in_progress', 'completed'], default: 'in_progress' },
    questions: [practiceQuestionSchema],
    score: { type: Number, min: 0, max: 100, default: 0 },
    masteryGain: { type: Number, default: 0 },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('PracticeSession', practiceSessionSchema);
