const jwt = require('jsonwebtoken');

// Middleware to authenticate requests using JWT
module.exports = (req, res, next) => {
  // Get the Authorization header value
  const authHeader = req.header('Authorization');
  // Check if the header exists and starts with 'Bearer '
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }
  // Extract the token from the header
  const token = authHeader.split(' ')[1];

  try {
    // Verify the token using the secret key
    console.log('Token:', token)
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded:', decoded)
    // Attach the decoded user object to the request
    req.user = decoded.user;
    next();
  } catch (err) {
    // Handle invalid or expired token
    res.status(401).json({ message: 'Token is not valid' });
  }
};