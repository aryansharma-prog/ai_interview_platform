const router = require('express').Router();
const ctrl = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { uploadAvatar } = require('../middleware/upload');

router.use(protect);
router.get('/profile', ctrl.getProfile);
router.put('/profile', ctrl.updateProfile);
router.post('/profile/avatar', uploadAvatar.single('avatar'), ctrl.uploadAvatar);
router.put('/change-password', ctrl.changePassword);

module.exports = router;
