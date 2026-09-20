const Resume = require('../models/Resume');
const asyncHandler = require('../utils/asyncHandler');
const { ApiError, sendSuccess } = require('../utils/apiResponse');
const resumeService = require('../services/resumeService');
const gemini = require('../services/geminiService');

const uploadResume = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, 'No resume file uploaded.');

  const rawText = await resumeService.extractRawText(req.file.path);
  const extracted = await gemini.extractResumeData(rawText);

  const resume = await Resume.create({
    user: req.user._id,
    fileName: req.file.originalname,
    fileUrl: `/uploads/${req.file.filename}`,
    rawText,
    extracted,
  });

  sendSuccess(res, { statusCode: 201, message: 'Resume uploaded and parsed.', data: { resume } });
});

const listResumes = asyncHandler(async (req, res) => {
  const resumes = await Resume.find({ user: req.user._id }).sort({ createdAt: -1 });
  sendSuccess(res, { message: 'Resumes fetched.', data: { resumes } });
});

module.exports = { uploadResume, listResumes };
