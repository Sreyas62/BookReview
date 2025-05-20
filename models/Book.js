const mongoose = require('mongoose');

// Define the schema for a Book document
const bookSchema = new mongoose.Schema({
  // Book title (required)
  title: { type: String, required: true },
  // Book author (required)
  author: { type: String, required: true },
  // Book genre (required)
  genre: { type: String, required: true },
  // Array of reviews for the book
  reviews: [{
    // Reference to the User who wrote the review
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    // Rating given by the user (1 to 5)
    rating: { type: Number, required: true, min: 1, max: 5 },
    // Review comment (required)
    comment: { type: String, required: true },
    // Date when the review was created (defaults to now)
    createdAt: { type: Date, default: Date.now }
  }]
}, { 
  // Automatically add createdAt and updatedAt timestamps
  timestamps: true,
  // Disable the __v version key in documents
  versionKey: false 
});

module.exports = mongoose.model('Book', bookSchema);
