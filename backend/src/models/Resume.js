const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    fileName: { type: String, required: true },
    fileUrl: { type: String, required: true },
    rawText: { type: String, default: '' },
    extracted: {
      skills: [{ type: String }],
      categorizedSkills: {
        languages: [{ type: String }],
        frameworks: [{ type: String }],
        databases: [{ type: String }],
        tools: [{ type: String }],
        cloud: [{ type: String }],
      },
      projects: [
        {
          name: { type: String },
          description: { type: String },
          technologies: [{ type: String }],
          claims: [{ type: String }],
          metrics: [{ type: String }],
        },
      ],
      workExperience: [
        {
          company: { type: String },
          role: { type: String },
          duration: { type: String },
          achievements: [{ type: String }],
          technologies: [{ type: String }],
        },
      ],
      education: [{ type: String }],
      certifications: [{ type: String }],
      importantClaims: [{ type: String }],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Resume', resumeSchema);
