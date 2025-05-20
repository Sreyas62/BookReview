
require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require('./middleware/auth');
const User = require('./models/User');
const Book = require('./models/Book');

const app = express();
connectDB();

app.use(express.json());

// Auth routes
app.post('/signup', async (req, res) => {
  try {
    const { username, password } = req.body;
    let user = await User.findOne({ username });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    user = new User({ username, password });
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();

    const payload = { user: { id: user.id } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (err) {
    res.status(500).send('Server error');
  }
});

app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const payload = { user: { id: user.id } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// Book routes
app.post('/books', auth, async (req, res) => {
  try {
    const book = new Book(req.body);
    console.log('Creating book:', req.body);
    const savedBook = await book.save();
    console.log('Saved book:', savedBook);
    res.status(201).json(savedBook);
  } catch (err) {
    console.error('Error saving book:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

app.get('/books', async (req, res) => {
  try {
    const { page = 1, limit = 10, author, genre } = req.query;
    const query = {};
    if (author) query.author = new RegExp(author, 'i');
    if (genre) query.genre = new RegExp(genre, 'i');

    const books = await Book.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit);
    res.json(books);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

app.get('/books/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    const avgRating = book.reviews.reduce((acc, rev) => acc + rev.rating, 0) / book.reviews.length || 0;
    res.json({ ...book.toObject(), avgRating });
  } catch (err) {
    res.status(500).send('Server error');
  }
});

app.post('/books/:id/reviews', auth, async (req, res) => {
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
    res.json(book);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

app.put('/reviews/:id', auth, async (req, res) => {
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
    res.json(book);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

app.delete('/reviews/:id', auth, async (req, res) => {
  try {
    const book = await Book.findOne({ 'reviews._id': req.params.id });
    if (!book) {
      return res.status(404).json({ message: 'Review not found' });
    }

    const review = book.reviews.id(req.params.id);
    if (review.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    review.remove();
    await book.save();
    res.json({ message: 'Review removed' });
  } catch (err) {
    res.status(500).send('Server error');
  }
});

app.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    const books = await Book.find({
      $or: [
        { title: new RegExp(q, 'i') },
        { author: new RegExp(q, 'i') }
      ]
    });
    res.json(books);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
