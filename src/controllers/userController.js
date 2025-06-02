const UserService = require('../services/userService');
const jwt = require('jsonwebtoken');

// Helper function to generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, username: user.username, roles: user.roles },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );
};

/**
 * Register a new user
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
const registerUser = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    const user = await UserService.createUser({ username, email, password });
    const token = generateToken(user);
    res.status(201).json({
      message: 'User registered successfully',
      user: { id: user._id, username: user.username, email: user.email, roles: user.roles },
      token
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Login user and return JWT token
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await UserService.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(user);
    res.json({
      message: 'Login successful',
      user: { id: user._id, username: user.username, email: user.email, roles: user.roles },
      token
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get logged-in user profile
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
const getUserProfile = async (req, res, next) => {
  try {
    const userId = req.user.id; // Set by auth middleware
    const user = await UserService.getUserById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({
      id: user._id,
      username: user.username,
      email: user.email,
      roles: user.roles,
      createdAt: user.createdAt
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile
};
