const router = require('express').Router();
const ctrl = require('../controllers/skillController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/profile', ctrl.getSkillProfile);

module.exports = router;
