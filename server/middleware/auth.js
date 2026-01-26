/**
 * Authentication Middleware - Protects Routes with JWT
 * 
 * These middleware functions check if a user is logged in and has permission
 * to access certain routes.
 * 
 * How JWT Authentication Works:
 * 1. User logs in and receives a JWT token
 * 2. Frontend stores the token (usually in localStorage)
 * 3. For each request, frontend sends token in Authorization header
 * 4. This middleware verifies the token is valid
 * 5. If valid, request continues; if not, returns 401 Unauthorized
 * 
 * Two middleware functions:
 * 
 * auth - Basic authentication check
 *   - Verifies JWT token is present and valid
 *   - Adds user info (id, role) to req.user
 *   - Use on routes that require any logged-in user
 * 
 * adminAuth - Admin role check
 *   - Checks if user has admin role
 *   - Must be used AFTER auth middleware
 *   - Use on routes that only admins can access
 * 
 * Usage examples:
 *   router.get('/profile', auth, handler)              // Any logged-in user
 *   router.get('/admin/users', auth, adminAuth, handler)  // Admin only
 */

import jwt from 'jsonwebtoken';  // JSON Web Token library

/**
 * Basic Authentication Middleware
 * Verifies JWT token and adds user info to request
 * 
 * Expected header format:
 *   Authorization: Bearer <token>
 * 
 * On success:
 *   - Sets req.user = { id, role } from token payload
 *   - Calls next() to continue to route handler
 * 
 * On failure:
 *   - Returns 401 Unauthorized
 *   - Does not call next()
 */
const auth = (req, res, next) => {
  try {
    // Step 1: Get the token from Authorization header
    // Header looks like: "Authorization: Bearer eyJhbGciOiJ..."
    // We need to extract just the token part (remove "Bearer ")
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    // Step 2: Check if token exists
    if (!token) {
      return res.status(401).json({ 
        message: 'No authentication token, access denied' 
      });
    }

    // Step 3: Verify token is valid and decode it
    // jwt.verify() will throw an error if token is invalid or expired
    const decoded = jwt.verify(
      token, 
      process.env.JWT_SECRET || 'your-secret-key'
    );
    
    // Step 4: Add user info to request object
    // Now other middleware/routes can access req.user.id and req.user.role
    req.user = decoded;  // Contains: { id, role }
    
    // Step 5: Continue to next middleware or route handler
    next();
    
  } catch (error) {
    // Token verification failed (invalid, expired, or tampered with)
    res.status(401).json({ message: 'Token is not valid' });
  }
};

/**
 * Admin Authorization Middleware
 * Checks if authenticated user has admin role
 * 
 * IMPORTANT: Must be used AFTER auth middleware
 * (auth middleware sets req.user, which this function checks)
 * 
 * On success:
 *   - User is admin, calls next() to continue
 * 
 * On failure:
 *   - Returns 403 Forbidden (user is logged in, but not admin)
 */
const adminAuth = (req, res, next) => {
  // Check if user has admin role
  // (req.user was set by auth middleware)
  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      message: 'Access denied. Admin privileges required.' 
    });
  }
  
  // User is admin, allow access
  next();
};

// Export both middleware functions
export { auth, adminAuth };
