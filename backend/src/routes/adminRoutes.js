const router = require('express').Router();
const ctrl = require('../controllers/adminController');
const { protect, restrictTo } = require('../middleware/auth');

router.use(protect, restrictTo('admin'));
router.get('/users', ctrl.listUsers);
router.delete('/users/:id', ctrl.deleteUser);
router.patch('/users/:id/toggle-active', ctrl.toggleUserActive);
router.get('/analytics', ctrl.platformAnalytics);
router.get('/categories', ctrl.listCategories);

module.exports = router;
