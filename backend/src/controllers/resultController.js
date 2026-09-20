const Interview = require('../models/Interview');
const Question = require('../models/Question');
const Result = require('../models/Result');
const User = require('../models/User');
const Analytics = require('../models/Analytics');
const asyncHandler = require('../utils/asyncHandler');
const { ApiError, sendSuccess } = require('../utils/apiResponse');
const gemini = require('../services/geminiService');
const pdfService = require('../services/pdfService');

const SkillProfile = require('../models/SkillProfile');
const LearningPath = require('../models/LearningPath');

// POST /api/results/:interviewId/generate
const generateResult = asyncHandler(async (req, res) => {
  const interview = await Interview.findOne({ _id: req.params.interviewId, user: req.user._id })
    .populate('questions')
    .populate('resume')
    .populate('jobProfile');

  if (!interview) throw new ApiError(404, 'Interview not found.');

  const analysis = await gemini.generateOverallAnalysis({
    category: interview.category,
    questionsWithEvaluations: interview.questions.map((q) => ({
      text: q.text,
      userAnswer: q.userAnswer,
      evaluation: q.evaluation,
    })),
    resumeContext: interview.resume?.extracted,
    jdContext: interview.jobProfile?.extracted,
  });

  const timeTakenSeconds = interview.questions.reduce((sum, q) => sum + (q.timeTakenSeconds || 0), 0);

  // Integrity calculation
  const signals = interview.integritySignals || { tabSwitches: 0, focusLoss: 0, copyEvents: 0, status: 'Normal' };
  const integrityScore = Math.max(0, 100 - (signals.tabSwitches * 10 + signals.focusLoss * 8 + signals.copyEvents * 5));

  const result = await Result.findOneAndUpdate(
    { interview: interview._id },
    {
      interview: interview._id,
      user: req.user._id,
      overallScore: analysis.overallScore,
      confidence: analysis.confidence,
      communication: analysis.communication,
      technicalAccuracy: analysis.technicalAccuracy,
      problemSolving: analysis.problemSolving,
      dsaScore: analysis.dsaScore || analysis.overallScore,
      codeQualityScore: analysis.codeQualityScore || analysis.overallScore,
      systemDesignScore: analysis.systemDesignScore || Math.max(50, analysis.overallScore - 6),
      fundamentalsScore: analysis.fundamentalsScore || analysis.overallScore,
      claimDefenseScore: analysis.claimDefenseScore || analysis.overallScore,
      categoryScores: analysis.categoryScores || {
        technicalKnowledge: analysis.technicalAccuracy || 80,
        problemSolving: analysis.problemSolving || 80,
        communication: analysis.communication || 80,
        answerAccuracy: analysis.overallScore || 80,
        depthOfKnowledge: Math.max(50, analysis.overallScore - 5),
        confidence: analysis.confidence || 80,
        behavioralSkills: 85,
        timeManagement: 85,
      },
      keyInsight: analysis.keyInsight || {
        mainImprovement: 'Continue refining architectural trade-off descriptions.',
        recommendations: [
          'State edge cases explicitly before proposing solutions.',
          'Discuss distributed scaling bottlenecks.',
          'Incorporate concrete metrics into technical answers.',
        ],
      },
      topicsToRevise: analysis.topicsToRevise || analysis.weakAreas || [],
      recommendedQuestions: analysis.recommendedQuestions || [],
      personalizedPlan: analysis.personalizedPlan || [],
      interviewSummary: analysis.interviewSummary || '',
      strongAreas: analysis.strongAreas,
      weakAreas: analysis.weakAreas,
      suggestions: analysis.suggestions,
      topicBreakdown: analysis.topicBreakdown,
      evidenceQuotes: analysis.evidenceQuotes || [],
      skillGaps: analysis.skillGaps || [],
      integrityReport: {
        score: integrityScore,
        status: signals.status || (integrityScore < 70 ? 'Review Recommended' : 'Normal'),
        tabSwitches: signals.tabSwitches || 0,
        focusLoss: signals.focusLoss || 0,
        copyEvents: signals.copyEvents || 0,
        reviewRecommended: integrityScore < 70,
      },
      timeTakenSeconds,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  interview.result = result._id;
  interview.status = 'completed';
  interview.completedAt = interview.completedAt || new Date();
  await interview.save();

  // Update user's rolling stats
  const user = await User.findById(req.user._id);
  const allResults = await Result.find({ user: req.user._id });
  user.stats.totalInterviews = allResults.length;
  user.stats.averageScore = Math.round(
    allResults.reduce((s, r) => s + r.overallScore, 0) / allResults.length
  );
  const completedCount = await Interview.countDocuments({ user: req.user._id, status: 'completed' });
  const totalCount = await Interview.countDocuments({ user: req.user._id });
  user.stats.completionRate = totalCount ? Math.round((completedCount / totalCount) * 100) : 0;
  user.stats.weakTopics = [...new Set(allResults.flatMap((r) => r.weakAreas))].slice(0, 5);
  user.stats.strongTopics = [...new Set(allResults.flatMap((r) => r.strongAreas))].slice(0, 5);
  await user.save({ validateBeforeSave: false });

  // Update or initialize SkillProfile
  let profile = await SkillProfile.findOne({ user: req.user._id });
  if (!profile) {
    profile = await SkillProfile.create({
      user: req.user._id,
      skills: [],
      overview: {
        technical: analysis.technicalAccuracy,
        dsa: analysis.dsaScore || 70,
        systemDesign: analysis.systemDesignScore || 65,
        communication: analysis.communication,
        backend: analysis.technicalAccuracy,
        fundamentals: analysis.fundamentalsScore || 75,
      },
      topGaps: analysis.weakAreas,
      topStrengths: analysis.strongAreas,
    });
  } else {
    profile.overview.technical = Math.round((profile.overview.technical + analysis.technicalAccuracy) / 2);
    profile.overview.communication = Math.round((profile.overview.communication + analysis.communication) / 2);
    profile.overview.dsa = Math.round((profile.overview.dsa + (analysis.dsaScore || analysis.overallScore)) / 2);
    profile.overview.systemDesign = Math.round((profile.overview.systemDesign + (analysis.systemDesignScore || analysis.overallScore)) / 2);
    profile.topGaps = analysis.weakAreas;
    profile.topStrengths = analysis.strongAreas;
  }

  // Update specific topic nodes in SkillProfile
  (analysis.topicBreakdown || []).forEach((tb) => {
    let node = profile.skills.find((s) => s.skillName.toLowerCase() === tb.topic.toLowerCase());
    if (!node) {
      profile.skills.push({
        skillName: tb.topic,
        category: interview.category === 'DSA' ? 'DSA' : 'Backend',
        mastery: tb.accuracy,
        classification: tb.accuracy >= 80 ? 'Strong' : tb.accuracy >= 60 ? 'Developing' : tb.accuracy >= 40 ? 'Weak' : 'Critical Gap',
        attemptsCount: 1,
        history: [{ score: tb.accuracy, source: 'interview', interviewId: interview._id }],
      });
    } else {
      node.mastery = Math.round((node.mastery + tb.accuracy) / 2);
      node.classification = node.mastery >= 80 ? 'Strong' : node.mastery >= 60 ? 'Developing' : node.mastery >= 40 ? 'Weak' : 'Critical Gap';
      node.attemptsCount += 1;
      node.history.push({ score: tb.accuracy, source: 'interview', interviewId: interview._id });
    }
  });

  await profile.save();

  // Upsert today's analytics rollup
  const today = new Date().toISOString().slice(0, 10);
  await Analytics.findOneAndUpdate(
    { user: req.user._id, date: today },
    {
      $inc: { interviewsCompleted: 1 },
      $set: { averageScore: user.stats.averageScore },
      $push: { topicAccuracy: { $each: analysis.topicBreakdown } },
    },
    { upsert: true }
  );

  sendSuccess(res, { message: 'Comprehensive evaluation generated.', data: { result } });
});

const getResult = asyncHandler(async (req, res) => {
  const result = await Result.findOne({ interview: req.params.interviewId, user: req.user._id });
  if (!result) throw new ApiError(404, 'Result not found.');
  sendSuccess(res, { message: 'Result fetched.', data: { result } });
});

const listResults = asyncHandler(async (req, res) => {
  const results = await Result.find({ user: req.user._id }).populate('interview').sort({ createdAt: -1 });
  sendSuccess(res, { message: 'Results fetched.', data: { results } });
});

const downloadResultPdf = asyncHandler(async (req, res) => {
  const result = await Result.findOne({ interview: req.params.interviewId, user: req.user._id });
  if (!result) throw new ApiError(404, 'Result not found.');
  const interview = await Interview.findById(result.interview);

  const pdfUrl = await pdfService.generateResultPdf(result, interview, req.user);
  result.pdfUrl = pdfUrl;
  await result.save();

  sendSuccess(res, { message: 'PDF generated.', data: { pdfUrl } });
});

module.exports = { generateResult, getResult, listResults, downloadResultPdf };
