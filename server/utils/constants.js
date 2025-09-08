// A place to store any constant values used throughout the application

const HTTP_STATUS_CODES = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
};

const ROLES = {
  USER: 'user',
  ADMIN: 'admin',
};

const TRANSACTION_TYPES = {
    INCOME: 'income',
    EXPENSE: 'expense'
};

module.exports = {
  HTTP_STATUS_CODES,
  ROLES,
  TRANSACTION_TYPES
};

