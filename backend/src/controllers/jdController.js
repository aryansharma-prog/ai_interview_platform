const JobProfile = require('../models/JobProfile');
const Resume = require('../models/Resume');
const asyncHandler = require('../utils/asyncHandler');
const { ApiError, sendSuccess } = require('../utils/apiResponse');
const ai = require('../services/geminiService');

// POST /api/jd/analyze — parse JD text and compute fit against active resume
const analyzeJobDescription = asyncHandler(async (req, res) => {
  const { rawText, title, company, resumeId } = req.body;
  if (!rawText || rawText.trim().length < 20) {
    throw new ApiError(400, 'Please provide a valid Job Description text (minimum 20 characters).');
  }

  const extracted = await ai.extractJobDescription(rawText);

  let matchAnalysis = {
    matchedSkills: extracted.requiredSkills?.slice(0, 3) || [],
    missingSkills: extracted.requiredSkills?.slice(3) || [],
    matchScore: 70,
    recommendations: ['Highlight relevant project experience and caching mechanics in the interview.'],
  };

  // If a resumeId is provided (or user's latest resume), compute real match matrix
  let resumeDoc = null;
  if (resumeId) {
    resumeDoc = await Resume.findOne({ _id: resumeId, user: req.user._id });
  } else {
    resumeDoc = await Resume.findOne({ user: req.user._id }).sort({ createdAt: -1 });
  }

  if (resumeDoc?.extracted) {
    matchAnalysis = await ai.analyzeResumeJDFit(resumeDoc.extracted, extracted);
  }

  const jobProfile = await JobProfile.create({
    user: req.user._id,
    title: title || extracted.title || 'Software Engineer',
    company: company || extracted.company || '',
    experienceLevel: extracted.experienceLevel || 'Mid',
    rawText,
    extracted,
    matchAnalysis,
  });

  sendSuccess(res, {
    statusCode: 201,
    message: 'Job description parsed and candidate fit analyzed.',
    data: { jobProfile, resumeUsed: resumeDoc ? resumeDoc.fileName : null },
  });
});

const listJobProfiles = asyncHandler(async (req, res) => {
  const jobProfiles = await JobProfile.find({ user: req.user._id }).sort({ createdAt: -1 });
  sendSuccess(res, { message: 'Job profiles fetched.', data: { jobProfiles } });
});

const getJobProfile = asyncHandler(async (req, res) => {
  const jobProfile = await JobProfile.findOne({ _id: req.params.id, user: req.user._id });
  if (!jobProfile) throw new ApiError(404, 'Job profile not found.');
  sendSuccess(res, { message: 'Job profile fetched.', data: { jobProfile } });
});

module.exports = { analyzeJobDescription, listJobProfiles, getJobProfile };
