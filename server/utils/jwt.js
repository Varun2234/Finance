// Utility functions for JSON Web Tokens (JWT)

const jwt = require('jsonwebtoken');

/**
 * Signs a JWT, creates a cookie, and sends the response.
 * This centralizes the token response logic.
 * @param {object} user - The user object from the database.
 * @param {number} statusCode - The HTTP status code for the response.
 * @param {object} res - The Express response object.
 */
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });

  const options = {
    expires: new Date(
      // Convert cookie expiration from days to milliseconds
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true, // Makes the cookie inaccessible to client-side JS
  };

  // In production, the cookie should only be sent over HTTPS
  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }

  res
    .status(statusCode)
    .cookie('token', token, options) // Set the cookie
    .json({
      success: true,
      token,
    });
};

module.exports = sendTokenResponse;
