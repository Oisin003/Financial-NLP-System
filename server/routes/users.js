/**
 * User Management Routes - Admin and User Operations
 * 
 * This file handles user-related operations.
 * 
 * Endpoints:
 * - GET    /api/users     - List all users (admin only)
 * - GET    /api/users/me  - Get current user info
 * - DELETE /api/users/:id - Delete a user (admin only)
 * 
 * All routes require JWT authentication.
 * Admin routes also verify admin role.
 */

import express from 'express';
import { auth, adminAuth } from '../middleware/auth.js';
import { User } from '../models/User.js';

const router = express.Router();

/**
 * GET /api/users
 * Get a list of all users in the system
 * 
 * Requires: Admin authentication
 * 
 * Response: Array of user objects (passwords excluded)
 */
router.get('/', auth, adminAuth, async (req, res) => {
  try {
    // Fetch all users from database, but don't include password field
    const users = await User.findAll({ 
      attributes: { exclude: ['password'] }  // Don't send passwords to frontend!
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
 * 
 * Requires: Authentication (any user)
 * 
 * Response: Current user's information (password excluded)
 */
router.get('/me', auth, async (req, res) => {
  try {
    // Find user by their ID (from JWT token, set by auth middleware)
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }  // Don't send password
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
 * 
 * Requires: Admin authentication
 * 
 * URL parameter:
 *   :id - The ID of the user to delete
 * 
 * Response: Success message
 * 
 * Note: This also deletes all documents uploaded by the user
 */
router.delete('/:id', auth, adminAuth, async (req, res) => {
  try {
    // Import Document model (we need it to delete user's documents)
    const Document = (await import('../models/Document.js')).default;
    
    // Step 1: Delete all documents belonging to this user
    await Document.destroy({ 
      where: { userId: req.params.id } 
    });
    
    // Step 2: Delete the user
    await User.destroy({ 
      where: { id: req.params.id } 
    });
    
    res.json({ message: 'User and their documents deleted successfully' });
    
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
