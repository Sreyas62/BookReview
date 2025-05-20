const Book = require('../models/Book');

// Helper function to remove the __v field from Mongoose documents
const removeVersion = (doc) => {
  const obj = doc.toObject();
  delete obj.__v;
  return obj;
};

// Create a new book
exports.createBook = async (req, res) => {
  try {
    const book = new Book(req.body);
    const savedBook = await book.save();
    res.status(201).json(removeVersion(savedBook));
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get a paginated list of books, with optional filtering by author and genre
exports.getBooks = async (req, res) => {
  try {
    const { page = 1, limit = 10, author, genre } = req.query;
    const query = {};
    // Filter by author if provided
    if (author) query.author = new RegExp(author, 'i');
    // Filter by genre if provided
    if (genre) query.genre = new RegExp(genre, 'i');

    const books = await Book.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit);
    res.json(books.map(book => removeVersion(book)));
  } catch (err) {
    res.status(500).send('Server error');
  }
};

// Get a single book by ID, including paginated reviews and average rating
exports.getBookById = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    // Calculate pagination for reviews
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    
    // Calculate average rating for the book
    const avgRating = book.reviews.reduce((acc, rev) => acc + rev.rating, 0) / book.reviews.length || 0;
    const paginatedReviews = book.reviews.slice(startIndex, endIndex);
    
    const bookObj = book.toObject();
    delete bookObj.__v;
    
    res.json({
      ...bookObj,
      avgRating,
      reviews: paginatedReviews,
      totalReviews: book.reviews.length,
      currentPage: page,
      totalPages: Math.ceil(book.reviews.length / limit)
    });
  } catch (err) {
    res.status(500).send('Server error');
  }
};

// Add a review to a book (user can only review once)
exports.addReview = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
  
    // Prevent user from reviewing the same book more than once
    const hasReviewed = book.reviews.some(review => review.user.toString() === req.user.id);
    if (hasReviewed) {
      return res.status(400).json({ message: 'You have already reviewed this book' });
    }

    // Add new review to the book
    const review = { user: req.user.id, ...req.body };
    book.reviews.push(review);
    await book.save();
    res.json(removeVersion(book));
  } catch (err) {
    res.status(500).send('Server error');
  }
};

// Update a review (only the review's author can update)
exports.updateReview = async (req, res) => {
  try {
    // Find the book containing the review
    const book = await Book.findOne({ 'reviews._id': req.params.id });
    if (!book) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Find the review by ID
    const review = book.reviews.id(req.params.id);
    // Check if the current user is the author of the review
    if (review.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Update review fields
    review.rating = req.body.rating;
    review.comment = req.body.comment;
    await book.save();
    res.json(removeVersion(book));
  } catch (err) {
    res.status(500).send('Server error');
  }
};

// Delete a review (only the review's author can delete)
exports.deleteReview = async (req, res) => {
  try {
    // Find the book containing the review
    const book = await Book.findOne({ 'reviews._id': req.params.id });
    if (!book) {
      return res.status(404).json({ message: 'Review not found' });
    }
    
    // Find the review by ID
    const review = book.reviews.id(req.params.id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    
    // Check if the current user is the author of the review
    if (review.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Remove the review from the book's reviews array
    book.reviews = book.reviews.filter(r => r._id.toString() !== req.params.id);
    await book.save();
    res.json({ message: 'Review removed' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Search for books by title or author (case-insensitive)
exports.searchBooks = async (req, res) => {
  try {
    const { q } = req.query;
    const books = await Book.find({
      $or: [
        { title: new RegExp(q, 'i') },
        { author: new RegExp(q, 'i') }
      ]
    });
    res.json(books.map(book => removeVersion(book)));
  } catch (err) {
    res.status(500).send('Server error');
  }
};
