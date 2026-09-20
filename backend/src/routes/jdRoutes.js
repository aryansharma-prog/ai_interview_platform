const router = require('express').Router();
const ctrl = require('../controllers/jdController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.post('/analyze', ctrl.analyzeJobDescription);
router.get('/', ctrl.listJobProfiles);
router.get('/:id', ctrl.getJobProfile);

module.exports = router;
