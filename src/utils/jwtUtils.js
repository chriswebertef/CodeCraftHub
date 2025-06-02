const jwt = require('jsonwebtoken');

/**
 * Generate JWT token
 * @param {Object} payload
 * @param {string} secret
 * @param {string} expiresIn
 * @returns {string} token
 */
const generateToken = (payload, secret, expiresIn = '1d') => {
  return jwt.sign(payload, secret, { expiresIn });
};

module.exports = {
  generateToken
};