/**
 * Main Server File - Achilles Ltd Backend
 * 
 * This Express server provides:
 * - User authentication (login/register)
 * - User management (admin functions)
 * - SQLite database connection
 * - JWT token-based authentication
 * - Password hashing with bcrypt
 * 
 * API Endpoints:
 * - POST /api/auth/register - Create new user account
 * - POST /api/auth/login - Login existing user
 * - GET /api/users - Get all users (admin only)
 * - GET /api/users/me - Get current user info
 * - DELETE /api/users/:id - Delete user (admin only)
 * - GET /api/health - Server health check
 */

import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import { sequelize } from './models/User.js';
import './models/Document.js'; // Import Document model to register it with Sequelize
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import documentRoutes from './routes/documents.js';

// Load environment variables from .env file
dotenv.config();

const app = express();

// Middleware
app.use(cors()); // Enable Cross-Origin Resource Sharing for React frontend
app.use(express.json()); // Parse JSON request bodies

// Connect to SQLite database and create tables if they don't exist
sequelize.sync()
  .then(() => console.log('✓ SQLite database connected and synced successfully'))
  .catch((err) => console.error('Database connection error:', err));

// API Routes
app.use('/api/auth', authRoutes); // Authentication routes (login, register)
app.use('/api/users', userRoutes); // User management routes
app.use('/api/documents', documentRoutes); // Document upload and management routes

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

// Start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
