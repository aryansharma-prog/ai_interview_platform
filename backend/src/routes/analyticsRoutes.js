const router = require('express').Router();
const ctrl = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/overview', ctrl.getOverview);
router.get('/daily-progress', ctrl.getDailyProgress);
router.get('/topic-accuracy', ctrl.getTopicAccuracy);

module.exports = router;
