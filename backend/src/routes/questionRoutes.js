const router = require('express').Router();
const ctrl = require('../controllers/questionController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/bookmarked', ctrl.listBookmarked);
router.post('/:id/answer', ctrl.submitAnswer);
router.post('/:id/cross-question', ctrl.requestCrossQuestion);
router.patch('/:id/bookmark', ctrl.toggleBookmark);
router.patch('/:id/favorite', ctrl.toggleFavorite);

module.exports = router;
