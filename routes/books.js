const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');
const auth = require('../middleware/auth');

// Route to create a new book (protected)
router.post('/', auth, bookController.createBook);

// Route to get a paginated list of books (public)
router.get('/', bookController.getBooks);

// Route to get a single book by ID, including reviews (public)
router.get('/:id', bookController.getBookById);

// Route to add a review to a book (protected)
router.post('/:id/reviews', auth, bookController.addReview);

// Route to update a review (protected, only review author)
router.put('/reviews/:id', auth, bookController.updateReview);

// Route to delete a review (protected, only review author)
router.delete('/reviews/:id', auth, bookController.deleteReview);

module.exports = router;