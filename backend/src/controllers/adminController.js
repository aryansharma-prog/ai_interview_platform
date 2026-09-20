const User = require('../models/User');
const Interview = require('../models/Interview');
const Result = require('../models/Result');
const asyncHandler = require('../utils/asyncHandler');
const { ApiError, sendSuccess } = require('../utils/apiResponse');
const { INTERVIEW_CATEGORIES } = require('../models/Interview');

const listUsers = asyncHandler(async (req, res) => {
  const { search, page = 1, limit = 20 } = req.query;
  const filter = search ? { $or: [{ name: new RegExp(search, 'i') }, { email: new RegExp(search, 'i') }] } : {};
  const skip = (Number(page) - 1) * Number(limit);

  const [users, total] = await Promise.all([
    User.find(filter).skip(skip).limit(Number(limit)).sort({ createdAt: -1 }),
    User.countDocuments(filter),
  ]);

  sendSuccess(res, { message: 'Users fetched.', data: { users }, meta: { total, page: Number(page), limit: Number(limit) } });
});

const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) throw new ApiError(404, 'User not found.');
  sendSuccess(res, { message: 'User deleted.' });
});

const toggleUserActive = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, 'User not found.');
  user.isActive = !user.isActive;
  await user.save({ validateBeforeSave: false });
  sendSuccess(res, { message: `User ${user.isActive ? 'activated' : 'deactivated'}.`, data: { user: user.toSafeObject() } });
});

const platformAnalytics = asyncHandler(async (req, res) => {
  const [totalUsers, totalInterviews, results] = await Promise.all([
    User.countDocuments(),
    Interview.countDocuments(),
    Result.find(),
  ]);
  const averageScore = results.length
    ? Math.round(results.reduce((s, r) => s + r.overallScore, 0) / results.length)
    : 0;

  sendSuccess(res, {
    message: 'Platform analytics fetched.',
    data: { totalUsers, totalInterviews, averageScore },
  });
});

const listCategories = asyncHandler(async (req, res) => {
  sendSuccess(res, { message: 'Categories fetched.', data: { categories: INTERVIEW_CATEGORIES } });
});

module.exports = { listUsers, deleteUser, toggleUserActive, platformAnalytics, listCategories };
