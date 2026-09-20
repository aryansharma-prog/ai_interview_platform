const mongoose = require('mongoose');

const moduleItemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  concepts: [{ type: String }],
  learningObjectives: [{ type: String }],
  scenarioQuestions: [
    {
      question: { type: String, required: true },
      explanation: { type: String, default: '' },
      keyTakeaway: { type: String, default: '' },
    },
  ],
  isCompleted: { type: Boolean, default: false },
  completedAt: { type: Date },
});

const learningPathSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    targetSkill: { type: String, required: true },
    category: { type: String, default: 'Backend' },
    originInterview: { type: mongoose.Schema.Types.ObjectId, ref: 'Interview' },
    summary: { type: String, default: '' },
    estimatedHours: { type: Number, default: 4 },
    difficulty: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Intermediate' },
    modules: [moduleItemSchema],
    progress: { type: Number, min: 0, max: 100, default: 0 },
    isCompleted: { type: Boolean, default: false },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

learningPathSchema.index({ user: 1, targetSkill: 1 });

module.exports = mongoose.model('LearningPath', learningPathSchema);
