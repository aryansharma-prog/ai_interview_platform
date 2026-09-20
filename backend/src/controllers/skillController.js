const SkillProfile = require('../models/SkillProfile');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');

// GET /api/skills/profile — get user's comprehensive skill profile
const getSkillProfile = asyncHandler(async (req, res) => {
  let profile = await SkillProfile.findOne({ user: req.user._id });
  if (!profile) {
    profile = await SkillProfile.create({
      user: req.user._id,
      skills: [
        { skillName: 'REST APIs', category: 'Backend', mastery: 82, classification: 'Strong', attemptsCount: 3 },
        { skillName: 'Authentication & JWT', category: 'Backend', mastery: 78, classification: 'Strong', attemptsCount: 2 },
        { skillName: 'Redis Caching', category: 'Backend', mastery: 52, classification: 'Weak', attemptsCount: 2 },
        { skillName: 'Database Indexing', category: 'Database', mastery: 74, classification: 'Developing', attemptsCount: 1 },
        { skillName: 'Arrays & Two Pointers', category: 'DSA', mastery: 88, classification: 'Strong', attemptsCount: 4 },
        { skillName: 'Dynamic Programming', category: 'DSA', mastery: 46, classification: 'Weak', attemptsCount: 2 },
        { skillName: 'System Scalability', category: 'System Design', mastery: 58, classification: 'Weak', attemptsCount: 2 },
        { skillName: 'API Design', category: 'System Design', mastery: 80, classification: 'Strong', attemptsCount: 3 },
      ],
      overview: { technical: 76, dsa: 67, systemDesign: 69, communication: 82, backend: 72, fundamentals: 75 },
      topGaps: ['Redis Caching Invalidation', 'Dynamic Programming', 'System Scalability'],
      topStrengths: ['Arrays & Two Pointers', 'REST APIs', 'API Design'],
    });
  }

  sendSuccess(res, { message: 'Skill profile fetched.', data: { profile } });
});

module.exports = { getSkillProfile };
