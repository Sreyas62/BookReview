
const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');
const auth = require('../middleware/auth');

router.post('/', auth, bookController.createBook);
router.get('/', bookController.getBooks);
router.get('/:id', bookController.getBookById);
router.post('/:id/reviews', auth, bookController.addReview);
router.put('/reviews/:id', auth, bookController.updateReview);
router.delete('/reviews/:id', auth, bookController.deleteReview);

module.exports = router;
