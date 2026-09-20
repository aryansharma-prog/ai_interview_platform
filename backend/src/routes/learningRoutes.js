const router = require('express').Router();
const ctrl = require('../controllers/learningController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.post('/generate', ctrl.generatePathForSkill);
router.get('/paths', ctrl.listLearningPaths);
router.get('/paths/:id', ctrl.getLearningPath);
router.patch('/paths/:id/modules/:moduleIndex', ctrl.toggleModule);

router.post('/practice/start', ctrl.startPracticeSession);
router.post('/practice/:sessionId/submit', ctrl.submitPracticeAnswers);
router.get('/practice/:sessionId', ctrl.getPracticeSession);

module.exports = router;
