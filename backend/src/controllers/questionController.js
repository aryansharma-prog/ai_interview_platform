const Question = require('../models/Question');
const Interview = require('../models/Interview');
const asyncHandler = require('../utils/asyncHandler');
const { ApiError, sendSuccess } = require('../utils/apiResponse');
const gemini = require('../services/geminiService');

// POST /api/questions/:id/answer — submit answer, get AI evaluation
const submitAnswer = asyncHandler(async (req, res) => {
  const { answer, timeTakenSeconds, testResults, codeLanguage } = req.body;
  const question = await Question.findById(req.params.id).populate('interview');
  if (!question) throw new ApiError(404, 'Question not found.');
  if (question.interview.user.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Not authorized to answer this question.');
  }

  const evaluation = await gemini.evaluateAnswer({
    question: question.text,
    expectedAnswer: question.expectedAnswer,
    userAnswer: answer,
    category: question.interview.category,
    codeLanguage: codeLanguage || question.codeLanguage,
    testResults: testResults || question.executionResults,
  });

  question.userAnswer = answer;
  question.answeredAt = new Date();
  question.timeTakenSeconds = timeTakenSeconds || 0;
  question.evaluation = evaluation;

  // Append candidate response turn
  question.turns.push({
    sender: 'candidate',
    message: answer,
    timestamp: new Date(),
  });

  await question.save();

  sendSuccess(res, { message: 'Answer submitted and evaluated.', data: { question } });
});

// POST /api/questions/:id/cross-question — generate intelligent follow-up cross question
const requestCrossQuestion = asyncHandler(async (req, res) => {
  const { candidateAnswer } = req.body;
  const question = await Question.findById(req.params.id).populate('interview');
  if (!question) throw new ApiError(404, 'Question not found.');
  if (question.interview.user.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Not authorized.');
  }

  const cross = await gemini.generateCrossQuestion({
    currentQuestion: question.text,
    candidateAnswer: candidateAnswer || question.userAnswer || '',
    resumeContext: null,
  });

  question.turns.push({
    sender: 'interviewer',
    message: cross.crossQuestion,
    timestamp: new Date(),
  });
  await question.save();

  sendSuccess(res, {
    message: 'Cross-question generated.',
    data: {
      crossQuestion: cross.crossQuestion,
      detectedClaim: cross.detectedClaim,
      focusArea: cross.focusArea,
      turns: question.turns,
    },
  });
});


const toggleBookmark = asyncHandler(async (req, res) => {
  const question = await Question.findById(req.params.id).populate('interview');
  if (!question) throw new ApiError(404, 'Question not found.');
  if (question.interview.user.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Not authorized.');
  }
  question.isBookmarked = !question.isBookmarked;
  await question.save();
  sendSuccess(res, { message: 'Bookmark toggled.', data: { question } });
});

const toggleFavorite = asyncHandler(async (req, res) => {
  const question = await Question.findById(req.params.id).populate('interview');
  if (!question) throw new ApiError(404, 'Question not found.');
  if (question.interview.user.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Not authorized.');
  }
  question.isFavorite = !question.isFavorite;
  await question.save();
  sendSuccess(res, { message: 'Favorite toggled.', data: { question } });
});

const listBookmarked = asyncHandler(async (req, res) => {
  const interviews = await Interview.find({ user: req.user._id }).select('_id');
  const interviewIds = interviews.map((i) => i._id);
  const questions = await Question.find({ interview: { $in: interviewIds }, isBookmarked: true });
  sendSuccess(res, { message: 'Bookmarked questions fetched.', data: { questions } });
});

module.exports = { submitAnswer, requestCrossQuestion, toggleBookmark, toggleFavorite, listBookmarked };
