const Analytics = require('../models/Analytics');
const Result = require('../models/Result');
const Interview = require('../models/Interview');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');

const getDailyProgress = asyncHandler(async (req, res) => {
  const { days = 30 } = req.query;
  const since = new Date();
  since.setDate(since.getDate() - Number(days));

  const records = await Analytics.find({
    user: req.user._id,
    date: { $gte: since.toISOString().slice(0, 10) },
  }).sort({ date: 1 });

  sendSuccess(res, { message: 'Daily progress fetched.', data: { records } });
});

const getTopicAccuracy = asyncHandler(async (req, res) => {
  const results = await Result.find({ user: req.user._id });
  const topicMap = {};
  results.forEach((r) => {
    r.topicBreakdown.forEach(({ topic, accuracy }) => {
      if (!topicMap[topic]) topicMap[topic] = { total: 0, count: 0 };
      topicMap[topic].total += accuracy;
      topicMap[topic].count += 1;
    });
  });
  const topicAccuracy = Object.entries(topicMap).map(([topic, { total, count }]) => ({
    topic,
    accuracy: Math.round(total / count),
  }));

  sendSuccess(res, { message: 'Topic accuracy fetched.', data: { topicAccuracy } });
});

const getOverview = asyncHandler(async (req, res) => {
  const [totalInterviews, completed, results] = await Promise.all([
    Interview.countDocuments({ user: req.user._id }),
    Interview.countDocuments({ user: req.user._id, status: 'completed' }),
    Result.find({ user: req.user._id }),
  ]);

  const averageScore = results.length
    ? Math.round(results.reduce((s, r) => s + r.overallScore, 0) / results.length)
    : 0;

  sendSuccess(res, {
    message: 'Analytics overview fetched.',
    data: {
      totalInterviews,
      completionRate: totalInterviews ? Math.round((completed / totalInterviews) * 100) : 0,
      averageScore,
    },
  });
});

module.exports = { getDailyProgress, getTopicAccuracy, getOverview };
