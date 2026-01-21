/**
 * Authentication Routes - Login and Registration
 * 
 * Endpoints:
 * - POST /api/auth/register - Create new user account
 * - POST /api/auth/login - Authenticate existing user
 * 
 * Features:
 * - Strong password validation (8+ chars, upper, lower, number, special char)
 * - Email and username uniqueness checks
 * - JWT token generation (7 day expiry)
 * - Automatic password hashing via User model hooks
 * - Input validation using express-validator
 */

import express from 'express';
import { body, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { Op } from 'sequelize';

const router = express.Router();

// Password validation rules - enforces strong passwords
const passwordValidation = [
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
    .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
    .matches(/[0-9]/).withMessage('Password must contain at least one number')
    .matches(/[@$!%*?&#]/).withMessage('Password must contain at least one special character (@$!%*?&#)')
];

/**
 * POST /api/auth/register
 * Creates a new user account and returns JWT token
 */
router.post('/register', [
  body('username').trim().isLength({ min: 4 }).withMessage('Username must be at least 4 characters'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  ...passwordValidation
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password } = req.body;

    // Check if user already exists with this email or username
    let user = await User.findOne({ 
      where: { 
        [Op.or]: [{ email }, { username }] 
      } 
    });
    if (user) {
      return res.status(400).json({ message: 'User already exists with that email or username' });
    }

    // Create new user (password will be automatically hashed by model hook)
    user = await User.create({
      username,
      email,
      password
    });

    // Generate JWT token with user ID and role
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' } // Token valid for 7 days
    );

    // Return token and user info (excluding password)
    res.status(201).json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * POST /api/auth/login
 * Authenticates user and returns JWT token
 */
router.post('/login', [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Verify password using bcrypt comparison
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token with user ID and role
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
