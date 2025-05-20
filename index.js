require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const connectDB = require('./config/db');

const app = express();

// Connect to MongoDB database
connectDB();

// Middleware to parse incoming JSON requests
app.use(express.json());

// Authentication routes (signup, login)
app.use('/', require('./routes/auth'));

// Book-related routes (CRUD books, reviews)
app.use('/books', require('./routes/books'));

// Book search endpoint (public)
app.get('/search', require('./controllers/bookController').searchBooks);

// Start the server on the specified port (default: 5000)
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));