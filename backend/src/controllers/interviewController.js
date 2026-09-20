const Interview = require('../models/Interview');
const Question = require('../models/Question');
const Resume = require('../models/Resume');
const JobProfile = require('../models/JobProfile');
const Result = require('../models/Result');
const SkillProfile = require('../models/SkillProfile');
const asyncHandler = require('../utils/asyncHandler');
const { ApiError, sendSuccess } = require('../utils/apiResponse');
const ai = require('../services/geminiService');

const DIFFICULTY_RANK = { Easy: 0, Medium: 1, Hard: 2, Adaptive: 1 };

// POST /api/interviews — create + auto-generate first personalized question
const createInterview = asyncHandler(async (req, res) => {
  const {
    category = 'Technical',
    topic,
    difficulty = 'Medium',
    numQuestions = 5,
    mode = 'Camera',
    company = '',
    resumeId,
    jobProfileId,
    interviewType = 'live_ai',
    targetRole = '',
    interviewerPersona = 'Professional',
    durationMinutes = 30,
    experienceLevel = 'Mid-Level',
    preferredSkill = '',
    isLiveInterview = true,
  } = req.body;

  let resumeContext = '';
  let resumeDoc = null;
  if (resumeId) {
    resumeDoc = await Resume.findOne({ _id: resumeId, user: req.user._id });
    if (resumeDoc) resumeContext = resumeDoc.extracted;
  } else if (category === 'Resume Based') {
    resumeDoc = await Resume.findOne({ user: req.user._id }).sort({ createdAt: -1 });
    if (resumeDoc) resumeContext = resumeDoc.extracted;
  }

  let jdContext = '';
  let jobDoc = null;
  if (jobProfileId) {
    jobDoc = await JobProfile.findOne({ _id: jobProfileId, user: req.user._id });
    if (jobDoc) jdContext = jobDoc.extracted;
  }

  const effectiveDifficulty = difficulty === 'Adaptive' ? 'Medium' : difficulty;

  const interview = await Interview.create({
    user: req.user._id,
    category,
    topic: topic || (jobDoc ? jobDoc.title : preferredSkill || targetRole || category),
    difficulty,
    numQuestions: typeof numQuestions === 'number' ? numQuestions : 5,
    mode,
    company: company || (jobDoc ? jobDoc.company : ''),
    resume: resumeDoc?._id,
    jobProfile: jobDoc?._id,
    interviewType,
    targetRole: targetRole || (jobDoc ? jobDoc.title : 'Software Engineer'),
    interviewerPersona,
    durationMinutes,
    experienceLevel,
    preferredSkill,
    isLiveInterview,
    currentDifficulty: effectiveDifficulty,
    difficultyPath: [effectiveDifficulty],
    sessionState: 'SETUP',
    status: 'in_progress',
    startedAt: new Date(),
  });

  const generated = await ai.generateInterviewQuestions({
    category,
    topic: interview.topic,
    difficulty: effectiveDifficulty,
    numQuestions: 1,
    company: interview.company,
    resumeContext,
    jdContext,
    interviewType,
    interviewerPersona,
    weakTopics: req.user.stats?.weakTopics,
  });

  const questionDocs = await Question.insertMany(
    generated.map((q, i) => ({
      interview: interview._id,
      order: i + 1,
      spokenIntro: q.spokenIntro || '',
      text: q.text,
      topic: q.topic || category,
      difficulty: q.difficulty || effectiveDifficulty,
      questionType: q.questionType || (interviewType === 'coding' ? 'coding' : 'conceptual'),
      claimChallenged: q.claimChallenged || '',
      hints: q.hints || [],
      expectedAnswer: q.expectedAnswer || '',
      idealAnswerConcepts: q.idealAnswerConcepts || [],
      idealAnswerStructure: q.idealAnswerStructure || '',
      starterCode: q.starterCode || '',
      testCases: q.testCases || [],
      followUpQuestions: q.followUpQuestions || [],
      turns: [{ sender: 'interviewer', message: q.text, timestamp: new Date() }],
    }))
  );

  interview.questions = questionDocs.map((q) => q._id);
  await interview.save();

  sendSuccess(res, {
    statusCode: 201,
    message: 'Interview initialized with tailored intelligence.',
    data: { interview, questions: questionDocs },
  });
});

// POST /api/interviews/:id/next — adaptive next question generator
const getNextQuestion = asyncHandler(async (req, res) => {
  const interview = await Interview.findOne({ _id: req.params.id, user: req.user._id })
    .populate('questions')
    .populate('resume')
    .populate('jobProfile');

  if (!interview) throw new ApiError(404, 'Interview not found.');

  if (interview.questions.length >= interview.numQuestions) {
    return sendSuccess(res, { message: 'Interview reached target question count.', data: { done: true } });
  }

  const previous = interview.questions[interview.questions.length - 1];
  if (!previous?.evaluation?.score && previous?.evaluation?.score !== 0) {
    throw new ApiError(400, 'Previous question has not been evaluated yet.');
  }

  const previousDifficulty = previous.difficulty || interview.currentDifficulty || 'Medium';
  const newDifficulty = ai.nextDifficulty(previousDifficulty, previous.evaluation.score);
  const direction =
    newDifficulty === previousDifficulty
      ? 'same'
      : (DIFFICULTY_RANK[newDifficulty] || 1) > (DIFFICULTY_RANK[previousDifficulty] || 1)
      ? 'up'
      : 'down';

  interview.currentDifficulty = newDifficulty;
  interview.difficultyPath.push(newDifficulty);

  // Update rolling candidate performance score
  const scores = interview.questions
    .map((q) => q.evaluation?.score)
    .filter((s) => typeof s === 'number');
  if (scores.length) {
    interview.candidatePerformanceScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  }

  const generated = await ai.generateNextQuestion({
    category: interview.category,
    topic: interview.topic,
    difficulty: newDifficulty,
    company: interview.company,
    previousQuestion: previous.text,
    previousFeedback: previous.evaluation?.feedback,
    previousUserAnswer: previous.userAnswer,
    resumeContext: interview.resume?.extracted,
    jdContext: interview.jobProfile?.extracted,
    weakTopics: req.user.stats?.weakTopics,
    interviewType: interview.interviewType,
    interviewerPersona: interview.interviewerPersona || 'Professional',
  });

  const question = await Question.create({
    interview: interview._id,
    order: interview.questions.length + 1,
    spokenIntro: generated.spokenIntro || '',
    text: generated.text,
    topic: generated.topic || interview.category,
    difficulty: newDifficulty,
    questionType: generated.questionType || (interview.interviewType === 'coding' ? 'coding' : 'conceptual'),
    claimChallenged: generated.claimChallenged || '',
    hints: generated.hints || [],
    expectedAnswer: generated.expectedAnswer || '',
    idealAnswerConcepts: generated.idealAnswerConcepts || [],
    idealAnswerStructure: generated.idealAnswerStructure || '',
    starterCode: generated.starterCode || '',
    testCases: generated.testCases || [],
    followUpQuestions: generated.followUpQuestions || [],
    turns: [{ sender: 'interviewer', message: generated.text, timestamp: new Date() }],
  });

  interview.questions.push(question._id);
  await interview.save();

  sendSuccess(res, {
    message: 'Next adaptive question generated.',
    data: { question, previousDifficulty, newDifficulty, direction, done: false },
  });
});

// POST /api/interviews/:id/state — update live session state machine
const updateSessionState = asyncHandler(async (req, res) => {
  const { sessionState } = req.body;
  const interview = await Interview.findOne({ _id: req.params.id, user: req.user._id });
  if (!interview) throw new ApiError(404, 'Interview not found.');

  if (sessionState) {
    interview.sessionState = sessionState;
    if (sessionState === 'ACTIVE' && !interview.startedAt) {
      interview.startedAt = new Date();
    }
  }

  await interview.save();
  sendSuccess(res, { message: 'Session state updated.', data: { sessionState: interview.sessionState } });
});

// POST /api/interviews/:id/integrity — log tab switch / focus events non-punitively
const logIntegrityEvent = asyncHandler(async (req, res) => {
  const { eventType, detail } = req.body;
  const interview = await Interview.findOne({ _id: req.params.id, user: req.user._id });
  if (!interview) throw new ApiError(404, 'Interview not found.');

  if (!interview.integritySignals) {
    interview.integritySignals = { tabSwitches: 0, focusLoss: 0, copyEvents: 0, status: 'Normal', events: [] };
  }

  if (eventType === 'tab_switch') interview.integritySignals.tabSwitches += 1;
  if (eventType === 'focus_loss') interview.integritySignals.focusLoss += 1;
  if (eventType === 'copy_event') interview.integritySignals.copyEvents += 1;

  if (interview.integritySignals.tabSwitches > 4 || interview.integritySignals.focusLoss > 5) {
    interview.integritySignals.status = 'Review Recommended';
  }

  interview.integritySignals.events.push({
    type: eventType,
    detail: detail || '',
    timestamp: new Date(),
  });

  await interview.save();

  sendSuccess(res, { message: 'Integrity event logged.', data: { integritySignals: interview.integritySignals } });
});

// POST /api/interviews/schedule — schedule a future interview session
const scheduleInterview = asyncHandler(async (req, res) => {
  const {
    category = 'Technical',
    topic,
    difficulty = 'Medium',
    numQuestions = 5,
    company = '',
    targetRole = 'Software Engineer',
    interviewerPersona = 'Professional',
    durationMinutes = 30,
    scheduledAt,
  } = req.body;

  if (!scheduledAt) {
    throw new ApiError(400, 'Scheduled date and time is required.');
  }

  const interview = await Interview.create({
    user: req.user._id,
    category,
    topic: topic || targetRole,
    difficulty,
    numQuestions: typeof numQuestions === 'number' ? numQuestions : 5,
    mode: 'Camera',
    company,
    targetRole,
    interviewerPersona,
    durationMinutes,
    scheduledAt: new Date(scheduledAt),
    status: 'scheduled',
    sessionState: 'SETUP',
    isLiveInterview: true,
  });

  sendSuccess(res, {
    statusCode: 201,
    message: 'Interview successfully scheduled.',
    data: { interview },
  });
});

// GET /api/interviews/scheduled — list upcoming scheduled interviews
const getScheduledInterviews = asyncHandler(async (req, res) => {
  const scheduled = await Interview.find({
    user: req.user._id,
    status: 'scheduled',
    scheduledAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }, // show recent upcoming or today
  }).sort({ scheduledAt: 1 });

  sendSuccess(res, { message: 'Scheduled interviews fetched.', data: { interviews: scheduled } });
});

// GET /api/interviews/readiness — compute 0-100 Readiness score & 10-category heatmap
const getInterviewReadiness = asyncHandler(async (req, res) => {
  const [results, completedInterviews, profile] = await Promise.all([
    Result.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(10),
    Interview.find({ user: req.user._id, status: 'completed' }).sort({ completedAt: -1 }),
    SkillProfile.findOne({ user: req.user._id }),
  ]);

  // Compute overall readiness
  let avgScore = 75;
  if (results.length > 0) {
    avgScore = Math.round(results.reduce((s, r) => s + r.overallScore, 0) / results.length);
  }

  const completionBonus = Math.min(10, completedInterviews.length * 2);
  const readinessScore = Math.min(98, Math.max(35, Math.round(avgScore * 0.85 + completionBonus)));

  // Generate 10-Topic Heatmap: DSA, DBMS, OS, CN, OOP, JavaScript, React, Node.js, System Design, Behavioral
  const topicCategories = [
    { key: 'DSA', name: 'DSA & Algorithms', base: 74 },
    { key: 'DBMS', name: 'Database & SQL', base: 78 },
    { key: 'OS', name: 'Operating Systems', base: 70 },
    { key: 'CN', name: 'Computer Networks', base: 72 },
    { key: 'OOP', name: 'OOP & Architecture', base: 82 },
    { key: 'JavaScript', name: 'JavaScript Deep Dive', base: 84 },
    { key: 'React', name: 'React & Frontend', base: 86 },
    { key: 'Node.js', name: 'Node.js & Backend', base: 80 },
    { key: 'System Design', name: 'System Design', base: 65 },
    { key: 'Behavioral', name: 'Behavioral & Leadership', base: 85 },
  ];

  const heatmap = topicCategories.map((tc) => {
    // Check if user has specific results or skill profile data
    const matchedSkill = profile?.skills?.find((s) => s.skillName.toLowerCase().includes(tc.key.toLowerCase()));
    let accuracy = matchedSkill ? matchedSkill.mastery : tc.base;

    // Check recent result topic breakdowns
    results.forEach((r) => {
      const match = r.topicBreakdown?.find((tb) => tb.topic.toLowerCase().includes(tc.key.toLowerCase()));
      if (match) {
        accuracy = Math.round((accuracy + match.accuracy) / 2);
      }
    });

    const status = accuracy >= 80 ? 'Strong' : accuracy >= 60 ? 'Average' : 'Needs Improvement';
    const tone = accuracy >= 80 ? 'green' : accuracy >= 60 ? 'yellow' : 'red';

    return {
      topic: tc.name,
      code: tc.key,
      accuracy,
      status,
      tone,
    };
  });

  // Streaks calculation
  let streak = 0;
  if (completedInterviews.length > 0) {
    const dates = completedInterviews
      .map((i) => (i.completedAt || i.createdAt).toISOString().slice(0, 10))
      .filter((v, i, a) => a.indexOf(v) === i);

    streak = Math.min(14, dates.length);
  }

  // Summary message based on score
  let message = 'Keep practicing to build your baseline readiness.';
  if (readinessScore >= 80) {
    message = 'High interview readiness! You are well-positioned for top tech roles.';
  } else if (readinessScore >= 65) {
    message = "You're improving. Focus on System Design and Dynamic Programming.";
  } else {
    message = 'Foundational practice recommended. Strengthen core CS fundamentals.';
  }

  sendSuccess(res, {
    message: 'Interview readiness calculated.',
    data: {
      readinessScore,
      averageScore: avgScore,
      streak: streak || 1,
      totalCompleted: completedInterviews.length,
      summaryMessage: message,
      heatmap,
      weakestTopics: heatmap.filter((h) => h.status === 'Needs Improvement').map((h) => h.topic).slice(0, 3),
      strongestTopics: heatmap.filter((h) => h.status === 'Strong').map((h) => h.topic).slice(0, 3),
    },
  });
});

// GET /api/interviews/history — rich history with questions, answers, and scores
const getInterviewHistory = asyncHandler(async (req, res) => {
  const interviews = await Interview.find({ user: req.user._id })
    .populate('questions')
    .populate('result')
    .sort({ createdAt: -1 })
    .limit(50);

  const history = interviews.map((inv) => ({
    _id: inv._id,
    category: inv.category,
    company: inv.company || 'Standard Mock',
    targetRole: inv.targetRole || 'Software Engineer',
    difficulty: inv.difficulty,
    durationMinutes: inv.durationMinutes || 30,
    durationSeconds: inv.durationSeconds || 0,
    status: inv.status,
    createdAt: inv.createdAt,
    completedAt: inv.completedAt,
    questionCount: inv.questions?.length || 0,
    overallScore: inv.result?.overallScore || inv.candidatePerformanceScore || 0,
    interviewerPersona: inv.interviewerPersona || 'Professional',
    topics: [inv.topic || inv.category],
    resultId: inv.result?._id,
  }));

  sendSuccess(res, { message: 'Interview history fetched.', data: { history } });
});

const listInterviews = asyncHandler(async (req, res) => {
  const { status, category, search, page = 1, limit = 10 } = req.query;
  const filter = { user: req.user._id };
  if (status) filter.status = status;
  if (category) filter.category = category;
  if (search) filter.topic = { $regex: search, $options: 'i' };

  const skip = (Number(page) - 1) * Number(limit);
  const [interviews, total] = await Promise.all([
    Interview.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    Interview.countDocuments(filter),
  ]);

  sendSuccess(res, {
    message: 'Interviews fetched.',
    data: { interviews },
    meta: { total, page: Number(page), limit: Number(limit) },
  });
});

const getInterview = asyncHandler(async (req, res) => {
  const interview = await Interview.findOne({ _id: req.params.id, user: req.user._id })
    .populate('questions')
    .populate('resume')
    .populate('jobProfile')
    .populate('result');
  if (!interview) throw new ApiError(404, 'Interview not found.');
  sendSuccess(res, { message: 'Interview fetched.', data: { interview } });
});

const completeInterview = asyncHandler(async (req, res) => {
  const interview = await Interview.findOne({ _id: req.params.id, user: req.user._id });
  if (!interview) throw new ApiError(404, 'Interview not found.');

  interview.status = 'completed';
  interview.sessionState = 'COMPLETED';
  interview.completedAt = new Date();
  if (interview.startedAt) {
    interview.durationSeconds = Math.round((interview.completedAt - interview.startedAt) / 1000);
  }
  await interview.save();

  sendSuccess(res, { message: 'Interview marked as completed.', data: { interview } });
});

const deleteInterview = asyncHandler(async (req, res) => {
  const interview = await Interview.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!interview) throw new ApiError(404, 'Interview not found.');
  await Question.deleteMany({ interview: interview._id });
  sendSuccess(res, { message: 'Interview deleted.' });
});

const getUpcoming = asyncHandler(async (req, res) => {
  const interviews = await Interview.find({
    user: req.user._id,
    status: 'scheduled',
    scheduledAt: { $gte: new Date() },
  }).sort({ scheduledAt: 1 });
  sendSuccess(res, { message: 'Upcoming interviews fetched.', data: { interviews } });
});

module.exports = {
  createInterview,
  listInterviews,
  getInterview,
  completeInterview,
  deleteInterview,
  getUpcoming,
  getNextQuestion,
  logIntegrityEvent,
  scheduleInterview,
  getScheduledInterviews,
  getInterviewReadiness,
  getInterviewHistory,
  updateSessionState,
};
