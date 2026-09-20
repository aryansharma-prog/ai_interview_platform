const { validationResult } = require('express-validator');
const { ApiError } = require('../utils/apiResponse');

// Run after express-validator chains to collect and forward errors uniformly.
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors.array().map((e) => e.msg);
    return next(new ApiError(400, messages[0] || 'Validation failed', messages));
  }
  next();
};

module.exports = validate;

