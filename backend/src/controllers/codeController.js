const Question = require('../models/Question');
const asyncHandler = require('../utils/asyncHandler');
const { ApiError, sendSuccess } = require('../utils/apiResponse');
const codeSandbox = require('../services/codeExecutionService');

// POST /api/code/run — run code in sandbox against question test cases
const runCode = asyncHandler(async (req, res) => {
  const { questionId, candidateCode, language = 'javascript' } = req.body;

  let testCases = [];
  let problemStatement = 'Algorithmic Problem';

  if (questionId) {
    const question = await Question.findById(questionId);
    if (question) {
      testCases = question.testCases || [];
      problemStatement = question.text;
    }
  }

  // If custom test cases provided in body, use those
  if (req.body.testCases && Array.isArray(req.body.testCases)) {
    testCases = req.body.testCases;
  }

  const { executionResults, complexityAnalysis } = await codeSandbox.evaluateCodeRun({
    problemStatement,
    candidateCode,
    language,
    testCases,
  });

  if (questionId) {
    await Question.findByIdAndUpdate(questionId, {
      candidateCode,
      codeLanguage: language,
      executionResults,
      complexityAnalysis,
    });
  }

  sendSuccess(res, {
    message: 'Code executed in sandbox.',
    data: {
      executionResults,
      complexityAnalysis,
    },
  });
});

module.exports = { runCode };
