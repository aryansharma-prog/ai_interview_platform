const router = require('express').Router();
const ctrl = require('../controllers/codeController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.post('/run', ctrl.runCode);

module.exports = router;
