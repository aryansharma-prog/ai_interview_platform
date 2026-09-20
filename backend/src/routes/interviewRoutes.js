const router = require('express').Router();
const ctrl = require('../controllers/interviewController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createInterviewValidator } = require('../validators/interviewValidators');

router.use(protect);

router.post('/', createInterviewValidator, validate, ctrl.createInterview);
router.get('/', ctrl.listInterviews);
router.post('/schedule', ctrl.scheduleInterview);
router.get('/scheduled', ctrl.getScheduledInterviews);
router.get('/readiness', ctrl.getInterviewReadiness);
router.get('/history', ctrl.getInterviewHistory);
router.get('/upcoming', ctrl.getUpcoming);
router.get('/:id', ctrl.getInterview);
router.post('/:id/next', ctrl.getNextQuestion);
router.post('/:id/state', ctrl.updateSessionState);
router.post('/:id/integrity', ctrl.logIntegrityEvent);
router.patch('/:id/complete', ctrl.completeInterview);
router.delete('/:id', ctrl.deleteInterview);

module.exports = router;

