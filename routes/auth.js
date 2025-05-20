const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');

// Route for user signup (public)
router.post('/signup', authController.signup);

// Route for user login (public)
router.post('/login', authController.login);

module.exports = router;
