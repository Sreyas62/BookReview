const mongoose = require('mongoose');

// Function to connect to MongoDB using Mongoose
const connectDB = async () => {
  try {
    // Connect to the database using the URI from environment variables
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');
  } catch (err) {
    // Log connection errors and exit the process
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
