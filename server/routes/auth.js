/**
 * Authentication Routes - Login and Registration
 * 
 * This file handles user sign-up and login.
 * 
 * Endpoints:
 * - POST /api/auth/register - Create a new user account
 * - POST /api/auth/login    - Log in with email and password
 * 
 * Both endpoints return a JWT token that the frontend uses
 * for authentication on subsequent requests.
 */

import express from 'express';
import { body, validationResult } from 'express-validator';  // Input validation
import jwt from 'jsonwebtoken';  // Create authentication tokens
import { User } from '../models/User.js';
import { Op } from 'sequelize';  // Database operators (OR, AND, etc.)

const router = express.Router();

// --- PASSWORD VALIDATION RULES ---
// These rules are checked before creating/updating a user
const passwordValidation = [
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/).withMessage('Password must contain uppercase letter')
    .matches(/[a-z]/).withMessage('Password must contain lowercase letter')
    .matches(/[0-9]/).withMessage('Password must contain number')
    .matches(/[@$!%*?&#]/).withMessage('Password must contain special character')
];

/**
 * POST /api/auth/register
 * Create a new user account
 * 
 * Request body:
 *   { username, email, password }
 * 
 * Response:
 *   { token, user: { id, username, email, role } }
 */
router.post('/register', [
  // Validation rules for registration
  body('username').trim().isLength({ min: 4 }).withMessage('Username must be at least 4 characters'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  ...passwordValidation  // Include all password rules
], async (req, res) => {
  try {
    // Step 1: Check if inputs are valid
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password } = req.body;

    // Step 2: Check if user already exists (by email OR username)
    let user = await User.findOne({ 
      where: { 
        [Op.or]: [{ email }, { username }] 
      } 
    });
    
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Step 3: Create new user (password is automatically hashed by User model)
    user = await User.create({ username, email, password });

    // Step 4: Generate JWT token (expires in 7 days)
    const token = jwt.sign(
      { id: user.id, role: user.role },  // Payload: user id and role
      process.env.JWT_SECRET || 'your-secret-key',  // Secret key for signing
      { expiresIn: '7d' }  // Token valid for 7 days
    );

    // Step 5: Send back token and user info (no password!)
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
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * POST /api/auth/login
 * Log in to an existing account
 * 
 * Request body:
 *   { email, password }
 * 
 * Response:
 *   { token, user: { id, username, email, role } }
 */
router.post('/login', [
  // Validation rules for login
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    // Step 1: Check if inputs are valid
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Step 2: Find user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Step 3: Check if password is correct (using bcrypt comparison)
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Step 4: Generate JWT token (same as registration)
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    // Step 5: Send back token and user info
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
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
