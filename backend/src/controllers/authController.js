const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const { ApiError, sendSuccess } = require('../utils/apiResponse');
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  generateRandomToken,
  hashToken,
} = require('../utils/tokens');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../services/emailService');

const issueTokens = async (user) => {
  const accessToken = signAccessToken({ sub: user._id.toString(), role: user.role });
  const refreshToken = signRefreshToken({ sub: user._id.toString() });
  user.refreshTokenHash = hashToken(refreshToken);
  await user.save({ validateBeforeSave: false });
  return { accessToken, refreshToken };
};

const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const existing = await User.findOne({ email });
  if (existing) throw new ApiError(409, 'An account with this email already exists.');

  const verificationToken = generateRandomToken();
  const user = await User.create({
    name,
    email,
    password,
    emailVerificationTokenHash: hashToken(verificationToken),
    emailVerificationExpires: Date.now() + 24 * 60 * 60 * 1000,
  });

  sendVerificationEmail(user.email, verificationToken).catch(() => {});
  const { accessToken, refreshToken } = await issueTokens(user);

  sendSuccess(res, {
    statusCode: 201,
    message: 'Registration successful. Please check your email to verify your account.',
    data: { user: user.toSafeObject(), accessToken, refreshToken },
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, 'Invalid email or password.');
  }
  if (!user.isActive) throw new ApiError(403, 'This account has been deactivated.');

  user.lastLoginAt = new Date();
  const { accessToken, refreshToken } = await issueTokens(user);

  sendSuccess(res, {
    message: 'Login successful.',
    data: { user: user.toSafeObject(), accessToken, refreshToken },
  });
});

const refresh = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) throw new ApiError(400, 'Refresh token is required.');

  let decoded;
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch (err) {
    throw new ApiError(401, 'Invalid or expired refresh token.');
  }

  const user = await User.findById(decoded.sub).select('+refreshTokenHash');
  if (!user || user.refreshTokenHash !== hashToken(refreshToken)) {
    throw new ApiError(401, 'Refresh token is no longer valid.');
  }

  const accessToken = signAccessToken({ sub: user._id.toString(), role: user.role });
  sendSuccess(res, { message: 'Token refreshed.', data: { accessToken } });
});

const logout = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, { $unset: { refreshTokenHash: 1 } });
  sendSuccess(res, { message: 'Logged out successfully.' });
});

const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.body;
  const tokenHash = hashToken(token);
  const user = await User.findOne({
    emailVerificationTokenHash: tokenHash,
    emailVerificationExpires: { $gt: Date.now() },
  }).select('+emailVerificationTokenHash +emailVerificationExpires');

  if (!user) throw new ApiError(400, 'Verification link is invalid or has expired.');

  user.isEmailVerified = true;
  user.emailVerificationTokenHash = undefined;
  user.emailVerificationExpires = undefined;
  await user.save({ validateBeforeSave: false });

  sendSuccess(res, { message: 'Email verified successfully.' });
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  // Respond identically whether or not the user exists, to avoid account enumeration.
  if (user) {
    const resetToken = generateRandomToken();
    user.passwordResetTokenHash = hashToken(resetToken);
    user.passwordResetExpires = Date.now() + 60 * 60 * 1000;
    await user.save({ validateBeforeSave: false });
    sendPasswordResetEmail(user.email, resetToken).catch(() => {});
  }
  sendSuccess(res, { message: 'If that email exists, a password reset link has been sent.' });
});

const resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;
  const tokenHash = hashToken(token);
  const user = await User.findOne({
    passwordResetTokenHash: tokenHash,
    passwordResetExpires: { $gt: Date.now() },
  }).select('+passwordResetTokenHash +passwordResetExpires');

  if (!user) throw new ApiError(400, 'Reset link is invalid or has expired.');

  user.password = newPassword;
  user.passwordResetTokenHash = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  sendSuccess(res, { message: 'Password has been reset. You can now log in.' });
});

const me = asyncHandler(async (req, res) => {
  sendSuccess(res, { message: 'Current user fetched.', data: { user: req.user.toSafeObject() } });
});

module.exports = {
  register,
  login,
  refresh,
  logout,
  verifyEmail,
  forgotPassword,
  resetPassword,
  me,
};
