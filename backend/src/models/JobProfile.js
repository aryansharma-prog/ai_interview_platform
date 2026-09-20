const mongoose = require('mongoose');

const jobProfileSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true },
    company: { type: String, default: '', trim: true },
    experienceLevel: { type: String, enum: ['Entry', 'Junior', 'Mid', 'Senior', 'Lead', 'Principal'], default: 'Mid' },
    rawText: { type: String, required: true },
    extracted: {
      requiredSkills: [{ type: String }],
      preferredSkills: [{ type: String }],
      responsibilities: [{ type: String }],
      technologies: [{ type: String }],
      domain: { type: String, default: '' },
      roleExpectations: [{ type: String }],
    },
    // Match against user's active resume (if available)
    matchAnalysis: {
      matchedSkills: [{ type: String }],
      missingSkills: [{ type: String }],
      matchScore: { type: Number, min: 0, max: 100, default: 0 },
      recommendations: [{ type: String }],
    },
  },
  { timestamps: true }
);

jobProfileSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('JobProfile', jobProfileSchema);
