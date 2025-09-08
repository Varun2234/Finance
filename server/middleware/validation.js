// Middleware for validating request bodies using express-validator

const { body, validationResult } = require('express-validator');

// Validation rules for user registration
exports.validateRegister = [
  body('name', 'Name is required').not().isEmpty(),
  body('email', 'Please include a valid email').isEmail(),
  body('password', 'Password must be 6 or more characters').isLength({ min: 6 }),
];

// Validation rules for adding a transaction
exports.validateTransaction = [
  body('description', 'Description is required').not().isEmpty(),
  body('amount', 'Amount must be a number').isNumeric(),
  body('type', 'Type must be either "income" or "expense"').isIn(['income', 'expense']),
];


// Middleware to check for validation errors
exports.checkValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};
