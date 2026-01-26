/**
 * Main Server File - Entry Point for the Backend
 * 
 * This file sets up the Express server and connects all the pieces together.
 * It handles:
 * - Loading environment variables (API keys, passwords, etc.)
 * - Setting up Express middleware (CORS, JSON parsing)
 * - Connecting to the database
 * - Routing incoming requests to the right handlers
 * - Starting the server on a specific port
 */

// Import required packages
import dotenv from 'dotenv';           // Loads environment variables from .env file
import express from 'express';         // Web server framework
import cors from 'cors';               // Allows requests from React frontend
import { sequelize } from './models/User.js';  // Database connection
import './models/Document.js';         // Load Document model (needed for database relationships)
import authRoutes from './routes/auth.js';     // Login/register routes
import userRoutes from './routes/users.js';    // User management routes
import documentRoutes from './routes/documents.js';  // Document upload/download routes

// Load environment variables from .env file
dotenv.config();

// Create Express application
const app = express();

// --- MIDDLEWARE SETUP ---
// Middleware are functions that process requests before they reach your routes

// Enable CORS: allows the React app (on port 3000) to talk to this server (on port 5000/8080)
app.use(cors());

// Parse JSON in request bodies: converts JSON strings to JavaScript objects
app.use(express.json());

// --- DATABASE CONNECTION ---
// Connect to SQLite database and create tables if they don't exist
sequelize.sync()
  .then(() => console.log('Database connected and synced'))
  .catch((err) => console.error('Database connection error:', err));

// --- ROUTE SETUP ---
// Tell Express where to send different types of requests
// All authentication routes (login, register) go to authRoutes
app.use('/api/auth', authRoutes);

// All user management routes (list users, delete users) go to userRoutes
app.use('/api/users', userRoutes);

// All document routes (upload, download, list) go to documentRoutes
app.use('/api/documents', documentRoutes);

// Simple health check endpoint - returns 200 OK if server is running
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

// --- START SERVER ---
// Use PORT from environment variables, or default to 8080
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}`);
});
