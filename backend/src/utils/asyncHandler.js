/**
 * Wraps async route handlers/controllers so rejected promises
 * are forwarded to Express's error-handling middleware.
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
