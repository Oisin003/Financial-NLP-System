/**
 * User Management Tests
 * 
 * Tests the user management endpoints:
 * - Get all users (admin only)
 * - Delete user (admin only)
 * - Access control (non-admin restrictions)
 * 
 * Run with: npm test
 */

import request from 'supertest';
import express from 'express';
import jwt from 'jsonwebtoken';
import { sequelize, User } from '../models/User.js';
import userRoutes from '../routes/users.js';

// Create a test Express app
const app = express();
app.use(express.json());
app.use('/api/users', userRoutes);

let adminToken;
let regularUserToken;
let regularUserId;

// Setup test data before running tests
beforeAll(async () => {
  // Connect and clear database
  await sequelize.sync({ force: true });
  
  // Create an admin user
  const admin = await User.create({
    username: 'admin',
    email: 'admin@test.com',
    password: 'Admin@123',
    role: 'admin'
  });
  
  // Create a regular user
  const regularUser = await User.create({
    username: 'regular',
    email: 'regular@test.com',
    password: 'User@123',
    role: 'user'
  });
  
  regularUserId = regularUser.id;
  
  // Generate JWT tokens for testing
  adminToken = jwt.sign(
    { id: admin.id, role: 'admin' },
    process.env.JWT_SECRET || 'your-secret-key'
  );
  
  regularUserToken = jwt.sign(
    { id: regularUser.id, role: 'user' },
    process.env.JWT_SECRET || 'your-secret-key'
  );
});

afterAll(async () => {
  await sequelize.close();
});

describe('User Management Tests', () => {
  
  // Test 1: Admin can get all users
  test('Admin should be able to get all users', async () => {
    const response = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${adminToken}`); // Send admin token
    
    // Should return list of users
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
    
    // Users should not have password field
    expect(response.body[0]).not.toHaveProperty('password');
  });

  // Test 2: Regular user cannot get all users
  test('Regular user should NOT be able to get all users', async () => {
    const response = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${regularUserToken}`); // Send regular user token
    
    // Should be denied with 403 Forbidden
    expect(response.status).toBe(403);
    expect(response.body.message).toContain('Admin only');
  });

  // Test 3: Unauthenticated request should be denied
  test('Should deny access without authentication token', async () => {
    const response = await request(app)
      .get('/api/users');
      // No Authorization header
    
    // Should return 401 Unauthorized
    expect(response.status).toBe(401);
  });

  // Test 4: Admin can delete a user
  test('Admin should be able to delete a user', async () => {
    const response = await request(app)
      .delete(`/api/users/${regularUserId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    
    // Should successfully delete
    expect(response.status).toBe(200);
    expect(response.body.message).toContain('deleted');
    
    // Verify user is actually deleted
    const deletedUser = await User.findByPk(regularUserId);
    expect(deletedUser).toBeNull();
  });

  // Test 5: Regular user cannot delete users
  test('Regular user should NOT be able to delete users', async () => {
    // Create another user to try deleting
    const testUser = await User.create({
      username: 'todelete',
      email: 'delete@test.com',
      password: 'Test@123',
      role: 'user'
    });
    
    const response = await request(app)
      .delete(`/api/users/${testUser.id}`)
      .set('Authorization', `Bearer ${regularUserToken}`);
    
    // Should be denied
    expect(response.status).toBe(403);
    
    // User should still exist
    const stillExists = await User.findByPk(testUser.id);
    expect(stillExists).not.toBeNull();
  });

});
