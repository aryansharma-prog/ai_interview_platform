const router = require('express').Router();
const ctrl = require('../controllers/authController');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');
const {
  registerValidator,
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
} = require('../validators/authValidators');

router.post('/register', authLimiter, registerValidator, validate, ctrl.register);
router.post('/login', authLimiter, loginValidator, validate, ctrl.login);
router.post('/refresh', ctrl.refresh);
router.post('/logout', protect, ctrl.logout);
router.post('/verify-email', ctrl.verifyEmail);
router.post('/forgot-password', authLimiter, forgotPasswordValidator, validate, ctrl.forgotPassword);
router.post('/reset-password', authLimiter, resetPasswordValidator, validate, ctrl.resetPassword);
router.get('/me', protect, ctrl.me);

module.exports = router;
