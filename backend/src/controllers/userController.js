const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const { ApiError, sendSuccess } = require('../utils/apiResponse');

const getProfile = asyncHandler(async (req, res) => {
  sendSuccess(res, { message: 'Profile fetched.', data: { user: req.user.toSafeObject() } });
});

const updateProfile = asyncHandler(async (req, res) => {
  const allowedFields = ['name', 'bio', 'targetRole'];
  const updates = {};
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });

  const user = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true,
  });
  sendSuccess(res, { message: 'Profile updated.', data: { user: user.toSafeObject() } });
});

const uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, 'No file uploaded.');
  const avatarUrl = `/uploads/${req.file.filename}`;
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { avatarUrl },
    { new: true }
  );
  sendSuccess(res, { message: 'Avatar updated.', data: { user: user.toSafeObject() } });
});

const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select('+password');
  if (!(await user.comparePassword(currentPassword))) {
    throw new ApiError(401, 'Current password is incorrect.');
  }
  user.password = newPassword;
  await user.save();
  sendSuccess(res, { message: 'Password changed successfully.' });
});

module.exports = { getProfile, updateProfile, uploadAvatar, changePassword };
