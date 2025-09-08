// Defines the API routes for authentication

const express = require('express');
const { register, login, getMe } = require('../controllers/authController');
const { validateRegister, checkValidation } = require('../middleware/validation');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.post('/register', validateRegister, checkValidation, register);
router.post('/login', login);

// Private route
router.get('/me', protect, getMe);

module.exports = router;
