const User = require('../models/userModel');

/**
 * Create a new user
 * @param {Object} userData
 * @returns {Promise<User>}
 */
const createUser = async (userData) => {
  const existingUser = await User.findOne({ $or: [{ email: userData.email }, { username: userData.username }] });
  if (existingUser) {
    const error = new Error('Email or username already exists');
    error.statusCode = 400;
    throw error;
  }
  const user = new User(userData);
  return user.save();
};

/**
 * Get user by email
 * @param {string} email
 * @returns {Promise<User|null>}
 */
const getUserByEmail = async (email) => {
  return User.findOne({ email });
};

/**
 * Get user by ID
 * @param {string} id
 * @returns {Promise<User|null>}
 */
const getUserById = async (id) => {
  return User.findById(id);
};

module.exports = {
  createUser,
  getUserByEmail,
  getUserById
};