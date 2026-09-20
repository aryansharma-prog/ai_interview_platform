const LearningPath = require('../models/LearningPath');
const PracticeSession = require('../models/PracticeSession');
const SkillProfile = require('../models/SkillProfile');
const Interview = require('../models/Interview');
const asyncHandler = require('../utils/asyncHandler');
const { ApiError, sendSuccess } = require('../utils/apiResponse');
const ai = require('../services/geminiService');

// POST /api/learning/generate — creates personalized learning path for weak skill
const generatePathForSkill = asyncHandler(async (req, res) => {
  const { targetSkill, category = 'Backend', originInterviewId } = req.body;
  if (!targetSkill) throw new ApiError(400, 'targetSkill is required.');

  // Check if an active path already exists
  let existing = await LearningPath.findOne({ user: req.user._id, targetSkill });
  if (existing) {
    return sendSuccess(res, {
      message: 'Existing learning path retrieved.',
      data: { learningPath: existing },
    });
  }

  let performanceSummary = '';
  if (originInterviewId) {
    const interview = await Interview.findById(originInterviewId);
    if (interview) {
      performanceSummary = `Candidate had interview in ${interview.category} for role ${interview.targetRole || interview.topic}.`;
    }
  }

  const generated = await ai.generateLearningRoadmap({
    targetSkill,
    category,
    candidatePerformanceSummary: performanceSummary,
  });

  const learningPath = await LearningPath.create({
    user: req.user._id,
    targetSkill,
    category,
    originInterview: originInterviewId,
    summary: generated.summary,
    difficulty: generated.difficulty || 'Intermediate',
    estimatedHours: generated.estimatedHours || 4,
    modules: generated.modules.map((m) => ({
      title: m.title,
      description: m.description,
      concepts: m.concepts || [],
      learningObjectives: m.learningObjectives || [],
      scenarioQuestions: m.scenarioQuestions || [],
      isCompleted: false,
    })),
    progress: 0,
  });

  sendSuccess(res, {
    statusCode: 201,
    message: 'Personalized learning path created.',
    data: { learningPath },
  });
});

const listLearningPaths = asyncHandler(async (req, res) => {
  const learningPaths = await LearningPath.find({ user: req.user._id }).sort({ createdAt: -1 });
  sendSuccess(res, { message: 'Learning paths fetched.', data: { learningPaths } });
});

const getLearningPath = asyncHandler(async (req, res) => {
  const learningPath = await LearningPath.findOne({ _id: req.params.id, user: req.user._id });
  if (!learningPath) throw new ApiError(404, 'Learning path not found.');
  sendSuccess(res, { message: 'Learning path fetched.', data: { learningPath } });
});

const toggleModule = asyncHandler(async (req, res) => {
  const { id, moduleIndex } = req.params;
  const learningPath = await LearningPath.findOne({ _id: id, user: req.user._id });
  if (!learningPath) throw new ApiError(404, 'Learning path not found.');

  const idx = Number(moduleIndex);
  if (idx < 0 || idx >= learningPath.modules.length) {
    throw new ApiError(400, 'Invalid module index.');
  }

  const mod = learningPath.modules[idx];
  mod.isCompleted = !mod.isCompleted;
  mod.completedAt = mod.isCompleted ? new Date() : null;

  const completedCount = learningPath.modules.filter((m) => m.isCompleted).length;
  learningPath.progress = Math.round((completedCount / learningPath.modules.length) * 100);
  learningPath.isCompleted = learningPath.progress === 100;
  if (learningPath.isCompleted && !learningPath.completedAt) {
    learningPath.completedAt = new Date();
  }

  await learningPath.save();

  // If completed, update user skill profile
  if (learningPath.isCompleted) {
    const profile = await SkillProfile.findOne({ user: req.user._id });
    if (profile) {
      const node = profile.skills.find(
        (s) => s.skillName.toLowerCase() === learningPath.targetSkill.toLowerCase()
      );
      if (node) {
        node.mastery = Math.min(100, node.mastery + 12);
        node.classification = node.mastery >= 75 ? 'Strong' : 'Developing';
        await profile.save();
      }
    }
  }

  sendSuccess(res, { message: 'Module status updated.', data: { learningPath } });
});

// Targeted Practice Sessions
const startPracticeSession = asyncHandler(async (req, res) => {
  const { skillName, category = 'Backend', difficulty = 'Medium' } = req.body;
  if (!skillName) throw new ApiError(400, 'skillName is required.');

  const generatedQuestions = await ai.generatePracticeDrill({
    skillName,
    category,
    difficulty,
  });

  const session = await PracticeSession.create({
    user: req.user._id,
    skillName,
    category,
    difficulty,
    status: 'in_progress',
    questions: generatedQuestions.map((q) => ({
      questionType: q.questionType || 'quiz',
      prompt: q.prompt,
      options: q.options || [],
      correctOptionIndex: q.correctOptionIndex ?? 0,
      modelExplanation: q.modelExplanation || '',
    })),
  });

  sendSuccess(res, {
    statusCode: 201,
    message: 'Practice drill session initialized.',
    data: { session },
  });
});

const submitPracticeAnswers = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  const { answers } = req.body; // Array of { questionIndex, selectedOptionIndex, textAnswer }

  const session = await PracticeSession.findOne({ _id: sessionId, user: req.user._id });
  if (!session) throw new ApiError(404, 'Practice session not found.');

  let correctCount = 0;
  session.questions.forEach((q, idx) => {
    const userSub = (answers || []).find((a) => a.questionIndex === idx);
    if (userSub) {
      const isCorrect = userSub.selectedOptionIndex === q.correctOptionIndex;
      q.userAnswer = userSub.textAnswer || String(userSub.selectedOptionIndex);
      q.isCorrect = isCorrect;
      q.score = isCorrect ? 100 : 0;
      if (isCorrect) correctCount++;
    }
  });

  const sessionScore = session.questions.length ? Math.round((correctCount / session.questions.length) * 100) : 0;
  const masteryGain = Math.round(sessionScore * 0.15); // Authentic boost based on drill accuracy

  session.score = sessionScore;
  session.masteryGain = masteryGain;
  session.status = 'completed';
  session.completedAt = new Date();
  await session.save();

  // Update user's persistent SkillProfile
  let profile = await SkillProfile.findOne({ user: req.user._id });
  if (!profile) {
    profile = await SkillProfile.create({
      user: req.user._id,
      skills: [],
      overview: { technical: 70, dsa: 65, systemDesign: 60, communication: 75, backend: 70, fundamentals: 68 },
    });
  }

  let skillNode = profile.skills.find(
    (s) => s.skillName.toLowerCase() === session.skillName.toLowerCase()
  );

  if (!skillNode) {
    profile.skills.push({
      skillName: session.skillName,
      category: session.category || 'Backend',
      mastery: Math.min(100, 50 + masteryGain),
      classification: 50 + masteryGain >= 75 ? 'Strong' : 'Developing',
      attemptsCount: 1,
      history: [{ score: sessionScore, source: 'practice' }],
    });
  } else {
    skillNode.mastery = Math.min(100, Math.max(30, Math.round((skillNode.mastery * 0.7) + (sessionScore * 0.3))));
    skillNode.classification =
      skillNode.mastery >= 80
        ? 'Strong'
        : skillNode.mastery >= 60
        ? 'Developing'
        : skillNode.mastery >= 40
        ? 'Weak'
        : 'Critical Gap';
    skillNode.attemptsCount += 1;
    skillNode.history.push({ score: sessionScore, source: 'practice' });
  }

  await profile.save();

  sendSuccess(res, {
    message: 'Practice drill submitted and skill mastery updated.',
    data: { session, masteryGain, newMastery: skillNode?.mastery || 65 },
  });
});

const getPracticeSession = asyncHandler(async (req, res) => {
  const session = await PracticeSession.findOne({ _id: req.params.sessionId, user: req.user._id });
  if (!session) throw new ApiError(404, 'Practice session not found.');
  sendSuccess(res, { message: 'Practice session fetched.', data: { session } });
});

module.exports = {
  generatePathForSkill,
  listLearningPaths,
  getLearningPath,
  toggleModule,
  startPracticeSession,
  submitPracticeAnswers,
  getPracticeSession,
};
