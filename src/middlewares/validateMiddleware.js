const { validationResult } = require('express-validator');

/**
 * Middleware to check validation results from express-validator
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

module.exports = {
  validateRequest
};