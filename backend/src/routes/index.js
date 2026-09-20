const router = require('express').Router();

router.use('/auth', require('./authRoutes'));
router.use('/users', require('./userRoutes'));
router.use('/interviews', require('./interviewRoutes'));
router.use('/questions', require('./questionRoutes'));
router.use('/results', require('./resultRoutes'));
router.use('/analytics', require('./analyticsRoutes'));
router.use('/admin', require('./adminRoutes'));
router.use('/resumes', require('./resumeRoutes'));
router.use('/jd', require('./jdRoutes'));
router.use('/code', require('./codeRoutes'));
router.use('/learning', require('./learningRoutes'));
router.use('/skills', require('./skillRoutes'));

router.get('/health', (req, res) => res.json({ success: true, message: 'API is healthy' }));

module.exports = router;
