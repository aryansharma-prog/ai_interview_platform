const router = require('express').Router();
const ctrl = require('../controllers/resumeController');
const { protect } = require('../middleware/auth');
const { uploadResume } = require('../middleware/upload');

router.use(protect);
router.post('/', uploadResume.single('resume'), ctrl.uploadResume);
router.get('/', ctrl.listResumes);

module.exports = router;
