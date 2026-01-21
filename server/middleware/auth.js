/**
 * Authentication Middleware
 * 
 * Two middleware functions for protecting routes:
 * 
 * 1. auth - Verifies JWT token in request header
 *    - Extracts token from "Authorization: Bearer <token>" header
 *    - Verifies token signature using JWT_SECRET
 *    - Attaches decoded user data (id, role) to req.user
 *    - Returns 401 if token is missing or invalid
 * 
 * 2. adminAuth - Checks if user has admin role
 *    - Must be used AFTER auth middleware
 *    - Verifies req.user.role === 'admin'
 *    - Returns 403 if user is not an admin
 * 
 * Usage example:
 *   router.get('/admin-route', auth, adminAuth, handler)
 */

import jwt from 'jsonwebtoken';

/**
 * Middleware to verify JWT token
 * Adds user info to request if valid
 */
const auth = (req, res, next) => {
  try {
    // Extract token from Authorization header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No authentication token, access denied' });
    }

    // Verify token and decode payload
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.user = decoded; // Attach user info (id, role) to request
    next(); // Continue to next middleware/route handler
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

/**
 * Middleware to check if user is an admin
 * Must be used after auth middleware
 */
const adminAuth = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admin only. :)' });
  }
  next(); // User is admin, continue
};

export { auth, adminAuth };
