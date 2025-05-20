const mongoose = require('mongoose');

// Define the schema for a User document
const userSchema = new mongoose.Schema({
  // Unique username for the user (required)
  username: { type: String, required: true, unique: true },
  // Hashed password for the user (required)
  password: { type: String, required: true },
}, { 
  // Automatically add createdAt and updatedAt timestamps
  timestamps: true,
  // Disable the __v version key in documents
  versionKey: false 
});

module.exports = mongoose.model('User', userSchema);
