import request from 'supertest';
import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { sequelize, User } from '../models/User.js';
import Document from '../models/Document.js';
import documentRoutes from '../routes/documents.js';
import jwt from 'jsonwebtoken';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create test Express app
const app = express();
app.use(express.json());
app.use('/api/documents', documentRoutes);

// Test user credentials and tokens
let testToken;
let testUserId;
let adminToken;
let testDocumentId;

beforeAll(async () => {
  // Sync database and clear data
  await sequelize.sync({ force: true });

  // Create test user
  const testUser = await User.create({
    username: 'testuser',
    email: 'test@example.com',
    password: 'Test@123'
  });
  testUserId = testUser.id;

  // Create test admin
  const adminUser = await User.create({
    username: 'admin',
    email: 'admin@example.com',
    password: 'Admin@123',
    role: 'admin'
  });

  // Generate tokens
  testToken = jwt.sign(
    { id: testUser.id, role: testUser.role },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '7d' }
  );

  adminToken = jwt.sign(
    { id: adminUser.id, role: adminUser.role },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '7d' }
  );

  // Ensure test uploads directory exists
  const uploadDir = path.join(__dirname, '../uploads/documents');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
});

afterAll(async () => {
  // Clean up test files
  const uploadDir = path.join(__dirname, '../uploads/documents');
  if (fs.existsSync(uploadDir)) {
    const files = fs.readdirSync(uploadDir);
    files.forEach(file => {
      fs.unlinkSync(path.join(uploadDir, file));
    });
  }
  
  await sequelize.close();
});

describe('Document Upload Tests', () => {

  test('Should reject upload without authentication', async () => {
    const response = await request(app)
      .post('/api/documents/upload')
      .attach('document', Buffer.from('fake pdf content'), 'test.pdf');

    expect(response.status).toBe(401);
    expect(response.body.message).toContain('authentication');
  });

  test('Should reject upload without file', async () => {
    const response = await request(app)
      .post('/api/documents/upload')
      .set('Authorization', `Bearer ${testToken}`);

    expect(response.status).toBe(400);
    expect(response.body.error).toContain('No file uploaded');
  });

  test('Should reject non-PDF file', async () => {
    const response = await request(app)
      .post('/api/documents/upload')
      .set('Authorization', `Bearer ${testToken}`)
      .attach('document', Buffer.from('not a pdf'), 'test.txt');

    expect(response.status).toBe(500);
  });

  test('Should upload PDF successfully', async () => {
    // Create a simple PDF-like buffer (not a real PDF, but good enough for testing)
    const pdfBuffer = Buffer.from('%PDF-1.4 fake pdf content');
    
    const response = await request(app)
      .post('/api/documents/upload')
      .set('Authorization', `Bearer ${testToken}`)
      .set('Content-Type', 'multipart/form-data')
      .attach('document', pdfBuffer, { filename: 'test-report.pdf', contentType: 'application/pdf' });

    expect(response.status).toBe(201);
    expect(response.body.message).toContain('uploaded successfully');
    expect(response.body.document).toHaveProperty('id');
    expect(response.body.document).toHaveProperty('originalName', 'test-report.pdf');
    expect(response.body.document).toHaveProperty('fileSize');
    
    // Store document ID for later tests
    testDocumentId = response.body.document.id;
  });
});

describe('Document Retrieval Tests', () => {

  test('Should get user documents', async () => {
    const response = await request(app)
      .get('/api/documents')
      .set('Authorization', `Bearer ${testToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('documents');
    expect(Array.isArray(response.body.documents)).toBe(true);
    expect(response.body.documents.length).toBeGreaterThan(0);
  });

  test('Should reject document retrieval without auth', async () => {
    const response = await request(app)
      .get('/api/documents');

    expect(response.status).toBe(401);
  });

  test('Admin should see all documents', async () => {
    const response = await request(app)
      .get('/api/documents')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body.documents.length).toBeGreaterThan(0);
  });
});

describe('Document Deletion Tests', () => {

  test('Should delete own document', async () => {
    if (!testDocumentId) {
      console.warn('Skipping: No test document ID available');
      return;
    }

    const response = await request(app)
      .delete(`/api/documents/${testDocumentId}`)
      .set('Authorization', `Bearer ${testToken}`);

    expect(response.status).toBe(200);
    expect(response.body.message).toContain('deleted');
  });

  test('Should reject deletion without auth', async () => {
    const response = await request(app)
      .delete('/api/documents/999');

    expect(response.status).toBe(401);
  });

  test('Should reject deletion of non-existent document', async () => {
    const response = await request(app)
      .delete('/api/documents/99999')
      .set('Authorization', `Bearer ${testToken}`);

    expect(response.status).toBe(404);
  });
});

describe('File Size Validation', () => {

  test('Should reject files larger than 10MB', async () => {
    // Create a buffer larger than 10MB
    const largePdfBuffer = Buffer.alloc(11 * 1024 * 1024); // 11MB
    
    const response = await request(app)
      .post('/api/documents/upload')
      .set('Authorization', `Bearer ${testToken}`)
      .attach('document', largePdfBuffer, { 
        filename: 'large-file.pdf', 
        contentType: 'application/pdf' 
      });

    expect(response.status).toBe(500);
  });
});
