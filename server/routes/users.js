/**
 * User Management Routes
 * 
 * Endpoints:
 * - GET /api/users - Get all users (admin only)
 * - GET /api/users/me - Get current user info
 * - DELETE /api/users/:id - Delete a user (admin only)
 * 
 * All routes require authentication via JWT token
 * Admin routes also check for admin role
 */

import express from 'express';
import { auth, adminAuth } from '../middleware/auth.js';
import { User } from '../models/User.js';

const router = express.Router();

/**
 * GET /api/users
 * Returns all users (excluding passwords)
 * Requires: Admin authentication
 */
router.get('/', auth, adminAuth, async (req, res) => {
  try {
    // Fetch all users but exclude password field
    const users = await User.findAll({ 
      attributes: { exclude: ['password'] }
    });
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * GET /api/users/me
 * Returns current logged-in user's information
 * Requires: Authentication
 */
router.get('/me', auth, async (req, res) => {
  try {
    // Find user by ID from JWT token
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * DELETE /api/users/:id
 * Deletes a user by ID along with all their documents
 * Requires: Admin authentication
 */
router.delete('/:id', auth, adminAuth, async (req, res) => {
  try {
    // Import Document model
    const Document = (await import('../models/Document.js')).default;
    
    // First delete all documents belonging to this user
    await Document.destroy({ where: { userId: req.params.id } });
    
    // Then delete the user
    await User.destroy({ where: { id: req.params.id } });
    
    res.json({ message: 'User and their documents deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
