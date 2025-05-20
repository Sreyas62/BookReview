
const Book = require('../models/Book');

const removeVersion = (doc) => {
  const obj = doc.toObject();
  delete obj.__v;
  return obj;
};

exports.createBook = async (req, res) => {
  try {
    const book = new Book(req.body);
    const savedBook = await book.save();
    res.status(201).json(removeVersion(savedBook));
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getBooks = async (req, res) => {
  try {
    const { page = 1, limit = 10, author, genre } = req.query;
    const query = {};
    if (author) query.author = new RegExp(author, 'i');
    if (genre) query.genre = new RegExp(genre, 'i');

    const books = await Book.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit);
    res.json(books.map(book => removeVersion(book)));
  } catch (err) {
    res.status(500).send('Server error');
  }
};

exports.getBookById = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    
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

exports.addReview = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
  
    const hasReviewed = book.reviews.some(review => review.user.toString() === req.user.id);
    if (hasReviewed) {
      return res.status(400).json({ message: 'You have already reviewed this book' });
    }

    const review = { user: req.user.id, ...req.body };
    book.reviews.push(review);
    await book.save();
    res.json(removeVersion(book));
  } catch (err) {
    res.status(500).send('Server error');
  }
};

exports.updateReview = async (req, res) => {
  try {
    const book = await Book.findOne({ 'reviews._id': req.params.id });
    if (!book) {
      return res.status(404).json({ message: 'Review not found' });
    }

    const review = book.reviews.id(req.params.id);
    if (review.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    review.rating = req.body.rating;
    review.comment = req.body.comment;
    await book.save();
    res.json(removeVersion(book));
  } catch (err) {
    res.status(500).send('Server error');
  }
};

exports.deleteReview = async (req, res) => {
  try {
    const book = await Book.findOne({ 'reviews._id': req.params.id });
    if (!book) {
      return res.status(404).json({ message: 'Review not found' });
    }
    
    const review = book.reviews.id(req.params.id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    
    if (review.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    book.reviews = book.reviews.filter(r => r._id.toString() !== req.params.id);
    await book.save();
    res.json({ message: 'Review removed' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

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
