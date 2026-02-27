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
    // Step 1: Define which fields to hide from response
    const safeFields = {
      exclude: ['password']
    };

    // Step 2: Fetch all users from database
    const users = await User.findAll({
      attributes: safeFields
    });
    
    // Step 3: Return user list
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
    // Step 1: Build safe response options
    const safeFields = {
      exclude: ['password']
    };

    // Step 2: Find user by ID from JWT token
    const userId = req.user.id;
    const user = await User.findByPk(userId, {
      attributes: safeFields
    });

    // Step 3: Handle missing user
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Step 4: Return current user profile
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
    // Step 1: Read target user id
    const userId = req.params.id;

    // Step 2: Check if user exists first
    const existingUser = await User.findByPk(userId);
    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Step 3: Delete all documents belonging to this user
    await Document.destroy({ 
      where: { userId } 
    });
    
    // Step 4: Delete the user
    await User.destroy({ 
      where: { id: userId } 
    });
    
    // Step 5: Return success message
    res.json({ message: 'The user and their documents have been deleted successfully' });
    
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
