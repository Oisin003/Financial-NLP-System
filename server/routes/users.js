/**
 * User Management Routes - Admin and User Operations
 * 
 * This file handles user-related operations.
 */

import express from 'express';
import { auth, adminAuth } from '../middleware/auth.js';
import { User } from '../models/User.js';
import Document from '../models/Document.js';

const router = express.Router();

/**
 * GET /api/users
 * Get a list of all users in the system
 */
router.get('/', auth, adminAuth, async (req, res) => {
  try {
    // Fetch all users from database, but don't include password field
    const safeFields = { exclude: ['password'] }; // Don't send passwords to frontend!
    const users = await User.findAll({
      attributes: safeFields
    });
    
    res.json(users);
    
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * GET /api/users/me
 * Get information about the currently logged-in user
 */
router.get('/me', auth, async (req, res) => {
  try {
    // Find user by their ID (from JWT token, set by auth middleware)
    const safeFields = { exclude: ['password'] }; // Don't send password
    const userId = req.user.id;
    const user = await User.findByPk(userId, {
      attributes: safeFields
    });
    
    res.json(user);
    
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * DELETE /api/users/:id
 * Delete a user and all their documents
 */
router.delete('/:id', auth, adminAuth, async (req, res) => {
  try {
    const userId = req.params.id;

    // Step 1: Delete all documents belonging to this user
    await Document.destroy({ 
      where: { userId } 
    });
    
    // Step 2: Delete the user
    await User.destroy({ 
      where: { id: userId } 
    });
    
    res.json({ message: 'The user and their documents have been deleted successfully' });
    
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
