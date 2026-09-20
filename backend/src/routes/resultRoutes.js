const router = require('express').Router();
const ctrl = require('../controllers/resultController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.post('/:interviewId/generate', ctrl.generateResult);
router.get('/:interviewId', ctrl.getResult);
router.get('/', ctrl.listResults);
router.post('/:interviewId/pdf', ctrl.downloadResultPdf);

module.exports = router;
