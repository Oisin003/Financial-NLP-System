/**
 * Authentication Tests
 * 
 * Tests the core authentication functionality:
 * - User registration with valid data
 * - User registration with weak password
 * - User login with correct credentials
 * - User login with incorrect credentials
 * 
 * Run with: npm test
 */

import request from 'supertest';
import express from 'express';
import { sequelize } from '../models/User.js';
import authRoutes from '../routes/auth.js';

// Create a test Express app
const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

// Clean up database before and after tests
beforeAll(async () => {
  // Connect to test database
  await sequelize.sync({ force: true }); // Clear database
});

afterAll(async () => {
  // Close database connection
  await sequelize.close();
});

describe('Authentication Tests', () => {
  
  // Test 1: Register a new user with valid data
  test('Should register a new user successfully', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'testuser',
        email: 'test@example.com',
        password: 'Test@123' // Strong password
      });
    
    // Check response status and structure
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('token');
    expect(response.body.user).toHaveProperty('username', 'testuser');
    expect(response.body.user).toHaveProperty('role', 'user');
    expect(response.body.user).not.toHaveProperty('password'); // Password should not be returned
  });

  // Test 2: Reject registration with weak password
  test('Should reject registration with weak password', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'weakuser',
        email: 'weak@example.com',
        password: 'weak' // Too short, no uppercase, no special char
      });
    
    // Should return 400 error with validation messages
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('errors');
  });

  // Test 3: Reject duplicate username/email
  test('Should reject duplicate username', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'testuser', // Already registered in Test 1
        email: 'another@example.com',
        password: 'Test@123'
      });
    
    expect(response.status).toBe(400);
    expect(response.body.message).toContain('already exists');
  });

  // Test 4: Login with correct credentials
  test('Should login successfully with correct credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'Test@123'
      });
    
    // Should return token and user info
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
    expect(response.body.user).toHaveProperty('email', 'test@example.com');
  });

  // Test 5: Reject login with wrong password
  test('Should reject login with incorrect password', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'WrongPassword123!'
      });
    
    // Should return 400 error
    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Invalid credentials');
  });

  // Test 6: Reject login with non-existent email
  test('Should reject login with non-existent email', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'nonexistent@example.com',
        password: 'Test@123'
      });
    
    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Invalid credentials');
  });

});
